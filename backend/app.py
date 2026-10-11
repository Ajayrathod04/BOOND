"""
BOOND â€” Backend Lambda Application
API Gateway HTTP API v2 Compatible Handler for Water-Leak Reporting & Triage.

Endpoints:
- GET  /tickets           - Ranked open repair queue with leakage estimates
- POST /reports           - Resident report submission (merges within 30m)
- POST /photo-url         - S3 presigned PUT URL for before/after photos
- POST /tickets/{id}/close   - Cedar-authorized ticket closure
- POST /tickets/{id}/dispute - Resident dispute and Cedar-authorized reopening
- POST /seed              - Engineer-only demo ticket generator
"""

from __future__ import annotations

import base64
import json
import logging
import math
import os
import re
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

import boto3
from botocore.exceptions import ClientError

try:
    from policy import (
        authorize_close_ticket,
        authorize_reopen_ticket,
        evaluate_authorization,
    )
except ModuleNotFoundError:
    from backend.policy import (
        authorize_close_ticket,
        authorize_reopen_ticket,
        evaluate_authorization,
    )

logger = logging.getLogger("boond.app")
logger.setLevel(logging.INFO)

# ==============================================================================
# CONFIGURATION & CONSTANTS
# ==============================================================================
TABLE_NAME = os.environ.get("TABLE_NAME", "BoondTickets")
PHOTOS_BUCKET = os.environ.get("PHOTOS_BUCKET", "boond-photos")
ENGINEER_PIN = os.environ.get("ENGINEER_PIN", "8472")
DEMO_LAT = float(os.environ.get("DEMO_LAT", "28.6139"))
DEMO_LNG = float(os.environ.get("DEMO_LNG", "77.2090"))
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

MERGE_DISTANCE_METERS = 30.0

FLOW_RANGES = {
    "drip": {"min": 50.0, "max": 200.0, "midpoint": 125.0, "severity": 1},
    "steady": {"min": 500.0, "max": 2000.0, "midpoint": 1250.0, "severity": 2},
    "gush": {"min": 4000.0, "max": 15000.0, "midpoint": 9500.0, "severity": 3},
}

FLOW_SEVERITY_ORDER = ["drip", "steady", "gush"]

LEAKAGE_ESTIMATE_DISCLAIMER = (
    "Estimated leakage ranges and priority scores are heuristic triage models based "
    "on reported flow rates and reporter counts. They do not constitute verified water volume saved."
)


# ==============================================================================
# HELPERS: JSON SERIALIZATION & CORS
# ==============================================================================
class DecimalEncoder(json.JSONEncoder):
    """Custom JSON encoder converting DynamoDB Decimal to int or float."""

    def default(self, o):
        if isinstance(o, Decimal):
            if o % 1 == 0:
                return int(o)
            return float(o)
        return super().default(o)


def cors_response(
    status_code: int,
    body: Any,
    extra_headers: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Formats an HTTP API v2 response with full CORS headers and JSON payload."""
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Boond-Pin,Authorization",
    }
    if extra_headers:
        headers.update(extra_headers)

    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def parse_request_body(event: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts and parses JSON body from an API Gateway HTTP API v2 event."""
    body_raw = event.get("body")
    if not body_raw:
        return {}

    if event.get("isBase64Encoded", False):
        try:
            body_raw = base64.b64decode(body_raw).decode("utf-8")
        except Exception as e:
            raise ValueError(f"Failed to decode base64 body: {e}")

    try:
        return json.loads(body_raw)
    except json.JSONDecodeError as jde:
        raise ValueError(f"Invalid JSON request body: {jde.msg}")


def get_header(event: Dict[str, Any], header_name: str) -> Optional[str]:
    """Case-insensitive lookup for headers in HTTP API v2 events."""
    headers = event.get("headers") or {}
    lower_target = header_name.lower()
    for k, v in headers.items():
        if k.lower() == lower_target:
            return v
    return None


def is_authenticated_engineer(event: Dict[str, Any]) -> bool:
    """
    Verifies prototype X-Boond-Pin against the ENGINEER_PIN environment variable.
    NOTE: PIN authentication is for prototype demonstration only.
    In production, this must be replaced with Amazon Cognito or an OAuth2 IdP.
    """
    provided_pin = get_header(event, "X-Boond-Pin")
    if not provided_pin:
        return False
    return provided_pin.strip() == ENGINEER_PIN.strip()


# ==============================================================================
# AWS CLIENTS & DYNAMODB SERIALIZATION
# ==============================================================================
_dynamodb_resource = None
_s3_client = None


def get_dynamo_table():
    global _dynamodb_resource
    if _dynamodb_resource is None:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=AWS_REGION)
    return _dynamodb_resource.Table(TABLE_NAME)


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3", region_name=AWS_REGION)
    return _s3_client


def python_to_dynamo(item: Any) -> Any:
    """Converts Python floats to Decimals for DynamoDB storage."""
    if isinstance(item, float):
        return Decimal(str(item))
    if isinstance(item, dict):
        return {k: python_to_dynamo(v) for k, v in item.items()}
    if isinstance(item, list):
        return [python_to_dynamo(v) for v in item]
    return item


def dynamo_to_python(item: Any) -> Any:
    """Converts DynamoDB Decimals to Python float/int."""
    if isinstance(item, Decimal):
        if item % 1 == 0:
            return int(item)
        return float(item)
    if isinstance(item, dict):
        return {k: dynamo_to_python(v) for k, v in item.items()}
    if isinstance(item, list):
        return [dynamo_to_python(v) for v in item]
    return item


# ==============================================================================
# HAVERSINE DISTANCE & PRIORITY CALCULATION
# ==============================================================================
def haversine_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Calculates great-circle distance between two coordinates in metres
    using the Haversine formula.
    """
    r_earth = 6371000.0  # Earth radius in metres
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r_earth * c


def calculate_priority(
    flow: str,
    drinking: bool,
    reporters: int,
) -> Tuple[float, Dict[str, Any]]:
    """
    Computes priority triage score and estimated leakage range.

    Leakage Rate Ranges (Litres / Day):
    - Drip: 50 â€“ 200 L/d (Midpoint: 125)
    - Steady: 500 â€“ 2,000 L/d (Midpoint: 1,250)
    - Gush: 4,000 â€“ 15,000 L/d (Midpoint: 9,500)

    Score formula:
    score = midpoint * (1.5 if drinking else 1.0) * (1.0 + 0.25 * (reporters - 1))
    """
    flow_lower = flow.lower().strip()
    if flow_lower not in FLOW_RANGES:
        raise ValueError(
            f"Invalid flow '{flow}'. Must be one of: {list(FLOW_RANGES.keys())}"
        )

    spec = FLOW_RANGES[flow_lower]
    midpoint = spec["midpoint"]
    drinking_multiplier = 1.5 if bool(drinking) else 1.0
    reporter_count = max(1, int(reporters))
    reporter_multiplier = 1.0 + 0.25 * (reporter_count - 1)

    score = round(midpoint * drinking_multiplier * reporter_multiplier, 2)

    leakage_estimate = {
        "flow_category": flow_lower,
        "min_litres_per_day": spec["min"],
        "max_litres_per_day": spec["max"],
        "midpoint_litres_per_day": midpoint,
        "drinking_multiplier": drinking_multiplier,
        "reporter_multiplier": reporter_multiplier,
        "disclaimer": LEAKAGE_ESTIMATE_DISCLAIMER,
    }
    return score, leakage_estimate


def generate_presigned_get_url(photo_key: Optional[str]) -> Optional[str]:
    """Generates a presigned GET URL for viewing photos in the queue."""
    if not photo_key:
        return None
    try:
        s3 = get_s3_client()
        return s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": PHOTOS_BUCKET, "Key": photo_key},
            ExpiresIn=3600,
        )
    except Exception as e:
        logger.warning("Could not generate presigned GET URL for %s: %s", photo_key, e)
        return None


# ==============================================================================
# ENDPOINT IMPLEMENTATIONS
# ==============================================================================
def handle_get_tickets(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    GET /tickets
    Retrieves tickets from DynamoDB, filters open tickets, ranks by priority score,
    and enriches with photo URLs, reporter count, and simulated flags.
    """
    table = get_dynamo_table()
    try:
        response = table.scan()
        items = response.get("Items", [])
    except Exception as e:
        logger.error("DynamoDB scan error: %s", e)
        return cors_response(500, {"error": "DatabaseError", "message": str(e)})

    tickets = [dynamo_to_python(item) for item in items]

    # Filter for OPEN tickets only
    open_tickets = [t for t in tickets if t.get("status") == "OPEN"]

    # Rank tickets by priority_score descending
    open_tickets.sort(key=lambda t: float(t.get("priority_score", 0.0)), reverse=True)

    # Enrich with photo URLs where available
    for t in open_tickets:
        if t.get("before_photo_key"):
            t["before_photo_url"] = generate_presigned_get_url(t["before_photo_key"])
        if t.get("after_photo_key"):
            t["after_photo_url"] = generate_presigned_get_url(t["after_photo_key"])

    return cors_response(
        200,
        {
            "count": len(open_tickets),
            "tickets": open_tickets,
            "disclaimer": LEAKAGE_ESTIMATE_DISCLAIMER,
        },
    )


def handle_post_reports(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    POST /reports
    Accepts resident leak report. Merges with an existing OPEN ticket within 30 metres;
    otherwise creates a new ticket.
    """
    body = parse_request_body(event)

    for req_field in ["lat", "lng", "flow", "drinking"]:
        if req_field not in body:
            return cors_response(
                400,
                {
                    "error": "BadRequest",
                    "message": f"Missing required field: '{req_field}'",
                },
            )

    try:
        lat = float(body["lat"])
        lng = float(body["lng"])
    except (ValueError, TypeError):
        return cors_response(
            400,
            {"error": "BadRequest", "message": "lat and lng must be valid numbers"},
        )

    flow = str(body["flow"]).lower().strip()
    if flow not in FLOW_RANGES:
        return cors_response(
            400,
            {
                "error": "BadRequest",
                "message": f"Invalid flow '{flow}'. Allowed values: {list(FLOW_RANGES.keys())}",
            },
        )

    drinking = bool(body["drinking"])
    photo_key = body.get("photo_key") or body.get("photoKey")

    table = get_dynamo_table()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Scan open tickets to check for proximity merge (within 30m)
    try:
        scan_res = table.scan()
        all_items = [dynamo_to_python(i) for i in scan_res.get("Items", [])]
        open_items = [i for i in all_items if i.get("status") == "OPEN"]
    except Exception as e:
        logger.error("Failed to query open tickets for proximity merge: %s", e)
        return cors_response(500, {"error": "DatabaseError", "message": str(e)})

    closest_ticket = None
    min_dist = float("inf")

    for item in open_items:
        try:
            t_lat = float(item["lat"])
            t_lng = float(item["lng"])
            dist = haversine_distance_meters(lat, lng, t_lat, t_lng)
            if dist <= MERGE_DISTANCE_METERS and dist < min_dist:
                min_dist = dist
                closest_ticket = item
        except (KeyError, ValueError, TypeError):
            continue

    if closest_ticket:
        # Merge into existing ticket
        ticket_id = closest_ticket["id"]
        reporters = int(closest_ticket.get("reporters", 1)) + 1

        # Upgrade flow to more severe value if appropriate
        curr_flow = closest_ticket.get("flow", "drip")
        curr_sev = FLOW_RANGES.get(curr_flow, {}).get("severity", 1)
        new_sev = FLOW_RANGES.get(flow, {}).get("severity", 1)
        effective_flow = flow if new_sev > curr_sev else curr_flow

        # Upgrade drinking water priority if reported
        effective_drinking = bool(closest_ticket.get("drinking", False) or drinking)

        # Attach before_photo_key if missing on ticket
        effective_photo = closest_ticket.get("before_photo_key") or photo_key

        score, leakage_est = calculate_priority(
            effective_flow, effective_drinking, reporters
        )

        closest_ticket["reporters"] = reporters
        closest_ticket["flow"] = effective_flow
        closest_ticket["drinking"] = effective_drinking
        closest_ticket["before_photo_key"] = effective_photo
        closest_ticket["priority_score"] = score
        closest_ticket["leakage_estimate"] = leakage_est
        closest_ticket["updated_at"] = now_iso

        try:
            table.put_item(Item=python_to_dynamo(closest_ticket))
        except Exception as e:
            logger.error("DynamoDB update error on merge: %s", e)
            return cors_response(500, {"error": "DatabaseError", "message": str(e)})

        return cors_response(
            200,
            {
                "merged": True,
                "message": f"Report merged into existing ticket within {round(min_dist, 1)}m",
                "ticket": closest_ticket,
            },
        )
    else:
        # Create brand-new ticket
        ticket_id = f"ticket-{uuid.uuid4()}"
        score, leakage_est = calculate_priority(flow, drinking, 1)

        new_ticket = {
            "id": ticket_id,
            "lat": lat,
            "lng": lng,
            "flow": flow,
            "drinking": drinking,
            "reporters": 1,
            "status": "OPEN",
            "priority_score": score,
            "leakage_estimate": leakage_est,
            "dispute_count": 0,
            "has_after_photo": False,
            "before_photo_key": photo_key,
            "after_photo_key": None,
            "is_simulated": False,
            "created_at": now_iso,
            "updated_at": now_iso,
            "closed_at": None,
        }

        try:
            table.put_item(Item=python_to_dynamo(new_ticket))
        except Exception as e:
            logger.error("DynamoDB put_item error: %s", e)
            return cors_response(500, {"error": "DatabaseError", "message": str(e)})

        return cors_response(
            201,
            {
                "merged": False,
                "message": "New leak ticket created",
                "ticket": new_ticket,
            },
        )


def handle_post_photo_url(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    POST /photo-url
    Accepts kind 'before' or 'after'.
    Returns presigned S3 PUT URL and object key with a 10-minute expiry (600s).
    """
    body = parse_request_body(event)
    kind = str(body.get("kind", "")).lower().strip()

    if kind not in ["before", "after"]:
        return cors_response(
            400,
            {
                "error": "BadRequest",
                "message": "Invalid kind. Must be either 'before' or 'after'.",
            },
        )

    file_id = uuid.uuid4()
    object_key = f"photos/{kind}/{file_id}.jpg"
    content_type = body.get("content_type", "image/jpeg")

    try:
        s3 = get_s3_client()
        upload_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": PHOTOS_BUCKET,
                "Key": object_key,
                "ContentType": content_type,
            },
            ExpiresIn=600,  # 10 minutes
        )
    except Exception as e:
        logger.error("Presigned URL generation error: %s", e)
        return cors_response(
            500,
            {"error": "StorageError", "message": f"Failed to generate upload URL: {e}"},
        )

    return cors_response(
        200,
        {
            "upload_url": upload_url,
            "key": object_key,
            "kind": kind,
            "expires_in_seconds": 600,
        },
    )


def handle_post_close_ticket(
    event: Dict[str, Any], ticket_id: str
) -> Dict[str, Any]:
    """
    POST /tickets/{id}/close
    Evaluates Cedar authorization before changing status.
    Requires role 'engineer' and an after-repair photo.
    Records closure timestamp only when closure is allowed.
    """
    table = get_dynamo_table()
    try:
        res = table.get_item(Key={"id": ticket_id})
        item = res.get("Item")
    except Exception as e:
        logger.error("DynamoDB get_item error: %s", e)
        return cors_response(500, {"error": "DatabaseError", "message": str(e)})

    if not item:
        return cors_response(
            404,
            {"error": "NotFound", "message": f"Ticket '{ticket_id}' not found"},
        )

    ticket = dynamo_to_python(item)

    # Determine caller role via prototype PIN check
    role = "engineer" if is_authenticated_engineer(event) else "resident"

    # Optional after-photo key in request body
    body = parse_request_body(event)
    after_photo_key = body.get("after_photo_key") or body.get("afterPhotoKey")
    if after_photo_key:
        ticket["after_photo_key"] = after_photo_key
        ticket["has_after_photo"] = True

    # Real Cedar policy evaluation
    auth_result = authorize_close_ticket(principal_role=role, ticket=ticket)

    if not auth_result["allowed"]:
        return cors_response(
            403,
            {
                "error": "Forbidden",
                "message": (
                    "Ticket closure denied by Cedar policy. "
                    "Engineers must provide after-repair photo proof; residents cannot close tickets."
                ),
                "authorization": auth_result,
            },
        )

    # Closure is authorized! Record closure time and update status
    now_iso = datetime.now(timezone.utc).isoformat()
    ticket["status"] = "CLOSED"
    ticket["closed_at"] = now_iso
    ticket["updated_at"] = now_iso

    try:
        table.put_item(Item=python_to_dynamo(ticket))
    except Exception as e:
        logger.error("DynamoDB put_item error on close: %s", e)
        return cors_response(500, {"error": "DatabaseError", "message": str(e)})

    return cors_response(
        200,
        {
            "status": "closed",
            "message": "Ticket successfully closed following Cedar authorization.",
            "ticket": ticket,
            "authorization": auth_result,
        },
    )


def handle_post_dispute_ticket(
    event: Dict[str, Any], ticket_id: str
) -> Dict[str, Any]:
    """
    POST /tickets/{id}/dispute
    Increments dispute count. For closed tickets, evaluates reopen_ticket Cedar action.
    Reopens only when policy allows (dispute_count >= 2) and resets after-photo proof.
    """
    table = get_dynamo_table()
    try:
        res = table.get_item(Key={"id": ticket_id})
        item = res.get("Item")
    except Exception as e:
        logger.error("DynamoDB get_item error: %s", e)
        return cors_response(500, {"error": "DatabaseError", "message": str(e)})

    if not item:
        return cors_response(
            404,
            {"error": "NotFound", "message": f"Ticket '{ticket_id}' not found"},
        )

    ticket = dynamo_to_python(item)
    now_iso = datetime.now(timezone.utc).isoformat()

    # Increment dispute count
    ticket["dispute_count"] = int(ticket.get("dispute_count", 0)) + 1
    ticket["updated_at"] = now_iso

    if ticket.get("status") == "CLOSED":
        # Evaluate Cedar reopening policy for resident
        auth_result = authorize_reopen_ticket(
            principal_role="resident", ticket=ticket
        )

        if auth_result["allowed"]:
            # Policy authorizes reopening: reset after-photo proof
            ticket["status"] = "OPEN"
            ticket["has_after_photo"] = False
            ticket["after_photo_key"] = None
            ticket["closed_at"] = None

            try:
                table.put_item(Item=python_to_dynamo(ticket))
            except Exception as e:
                logger.error("DynamoDB put_item error on reopen: %s", e)
                return cors_response(500, {"error": "DatabaseError", "message": str(e)})

            return cors_response(
                200,
                {
                    "status": "reopened",
                    "message": "Ticket reopened following resident dispute threshold.",
                    "ticket": ticket,
                    "authorization": auth_result,
                },
            )
        else:
            # Policy does not permit reopening yet (need 2 disputes)
            try:
                table.put_item(Item=python_to_dynamo(ticket))
            except Exception as e:
                logger.error("DynamoDB put_item error on dispute: %s", e)
                return cors_response(500, {"error": "DatabaseError", "message": str(e)})

            return cors_response(
                200,
                {
                    "status": "disputed",
                    "message": (
                        f"Dispute recorded (total: {ticket['dispute_count']}). "
                        "Cedar policy requires at least two disputes to reopen a closed ticket."
                    ),
                    "ticket": ticket,
                    "authorization": auth_result,
                },
            )
    else:
        # Ticket is already open, simply record dispute count
        try:
            table.put_item(Item=python_to_dynamo(ticket))
        except Exception as e:
            logger.error("DynamoDB put_item error: %s", e)
            return cors_response(500, {"error": "DatabaseError", "message": str(e)})

        return cors_response(
            200,
            {
                "status": "disputed",
                "message": f"Dispute recorded for open ticket (total: {ticket['dispute_count']}).",
                "ticket": ticket,
            },
        )


def handle_post_seed(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    POST /seed
    Engineer-only demo endpoint. Generates 12 clearly labelled simulated tickets
    around DEMO_LAT and DEMO_LNG. Simulated tickets are never presented as real reports.
    """
    if not is_authenticated_engineer(event):
        return cors_response(
            401,
            {
                "error": "Unauthorized",
                "message": "Engineer PIN authentication required for demo seed endpoint.",
            },
        )

    table = get_dynamo_table()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Pre-defined mock scenarios distributed around DEMO coordinates
    scenarios = [
        # (lat_offset, lng_offset, flow, drinking, reporters, status, has_photo, dispute_count)
        (0.0012, 0.0015, "gush", True, 4, "OPEN", False, 0),
        (0.0025, -0.0010, "gush", True, 2, "OPEN", True, 0),
        (-0.0018, 0.0022, "gush", False, 1, "OPEN", False, 0),
        (0.0031, 0.0005, "gush", False, 3, "OPEN", False, 0),
        (-0.0008, -0.0025, "steady", True, 3, "OPEN", True, 0),
        (0.0019, -0.0031, "steady", True, 1, "OPEN", False, 0),
        (-0.0024, -0.0012, "steady", False, 2, "OPEN", False, 0),
        (0.0005, 0.0028, "steady", False, 1, "OPEN", False, 0),
        (-0.0030, 0.0018, "drip", True, 2, "OPEN", False, 0),
        (0.0022, 0.0035, "drip", False, 1, "OPEN", False, 0),
        (-0.0011, -0.0038, "drip", True, 1, "CLOSED", True, 1),
        (0.0035, -0.0022, "steady", False, 1, "CLOSED", True, 0),
    ]

    created_tickets = []
    for idx, (d_lat, d_lng, flow, drinking, reporters, status, has_photo, disputes) in enumerate(scenarios, start=1):
        score, leakage_est = calculate_priority(flow, drinking, reporters)
        t_id = f"sim-{idx:02d}-{uuid.uuid4().hex[:8]}"
        ticket_lat = round(DEMO_LAT + d_lat, 6)
        ticket_lng = round(DEMO_LNG + d_lng, 6)

        sim_ticket = {
            "id": t_id,
            "lat": ticket_lat,
            "lng": ticket_lng,
            "flow": flow,
            "drinking": drinking,
            "reporters": reporters,
            "status": status,
            "priority_score": score,
            "leakage_estimate": leakage_est,
            "dispute_count": disputes,
            "has_after_photo": has_photo,
            "before_photo_key": f"photos/before/sim_{idx}.jpg" if idx % 2 == 0 else None,
            "after_photo_key": f"photos/after/sim_{idx}.jpg" if has_photo else None,
            "is_simulated": True,
            "simulation_label": "SIMULATED_DEMO_LEAK_DO_NOT_DISPATCH",
            "notes": f"Simulated municipal leak triage scenario #{idx} (NOT real data).",
            "created_at": now_iso,
            "updated_at": now_iso,
            "closed_at": now_iso if status == "CLOSED" else None,
        }

        try:
            table.put_item(Item=python_to_dynamo(sim_ticket))
            created_tickets.append(sim_ticket)
        except Exception as e:
            logger.error("Error inserting seed ticket %s: %s", t_id, e)

    return cors_response(
        201,
        {
            "status": "success",
            "message": "Successfully generated 12 simulated demonstration tickets.",
            "count": len(created_tickets),
            "tickets": created_tickets,
            "disclaimer": LEAKAGE_ESTIMATE_DISCLAIMER,
        },
    )


# ==============================================================================
# MAIN LAMBDA HANDLER (API Gateway HTTP API v2)
# ==============================================================================
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda entry point for API Gateway HTTP API v2 events.
    Routes incoming requests to the appropriate handler with CORS support.
    """
    # Extract HTTP method and route path
    req_context = event.get("requestContext", {})
    http_info = req_context.get("http", {})
    method = (http_info.get("method") or event.get("httpMethod") or "GET").upper()

    raw_path = (
        http_info.get("path")
        or event.get("rawPath")
        or event.get("path")
        or "/"
    )

    # Normalize trailing slashes (except root)
    if len(raw_path) > 1 and raw_path.endswith("/"):
        raw_path = raw_path[:-1]

    # Handle CORS preflight
    if method == "OPTIONS":
        return cors_response(200, {"message": "CORS preflight OK"})

    try:
        # Route dispatch
        if method == "GET" and raw_path == "/tickets":
            return handle_get_tickets(event)

        if method == "POST" and raw_path == "/reports":
            return handle_post_reports(event)

        if method == "POST" and raw_path == "/photo-url":
            return handle_post_photo_url(event)

        if method == "POST" and raw_path == "/seed":
            return handle_post_seed(event)

        # Dynamic match: POST /tickets/{id}/close
        close_match = re.match(r"^/tickets/([^/]+)/close$", raw_path)
        if method == "POST" and close_match:
            ticket_id = close_match.group(1)
            return handle_post_close_ticket(event, ticket_id)

        # Dynamic match: POST /tickets/{id}/dispute
        dispute_match = re.match(r"^/tickets/([^/]+)/dispute$", raw_path)
        if method == "POST" and dispute_match:
            ticket_id = dispute_match.group(1)
            return handle_post_dispute_ticket(event, ticket_id)

        # Unknown route
        return cors_response(
            404,
            {
                "error": "NotFound",
                "message": f"Resource not found: {method} {raw_path}",
            },
        )

    except ValueError as ve:
        logger.warning("Validation error on %s %s: %s", method, raw_path, ve)
        return cors_response(400, {"error": "BadRequest", "message": str(ve)})
    except Exception as exc:
        logger.exception("Unhandled error processing %s %s", method, raw_path)
        return cors_response(
            500,
            {"error": "InternalServerError", "message": str(exc)},
        )


