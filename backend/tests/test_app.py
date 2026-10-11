"""
BOOND — Backend API Test Suite
Tests API Gateway HTTP API v2 endpoints, CORS headers, Haversine merging,
Priority triage calculations, Presigned URL generation, and Seed generator.
"""

import json
from unittest.mock import MagicMock, patch
import pytest

from backend.app import (
    lambda_handler,
    haversine_distance_meters,
    calculate_priority,
    FLOW_RANGES,
)


class MockDynamoTable:
    """In-memory mock for DynamoDB table operations in tests."""

    def __init__(self, items=None):
        self.items = {item["id"]: dict(item) for item in (items or [])}

    def scan(self):
        return {"Items": [dict(v) for v in self.items.values()]}

    def get_item(self, Key):
        item_id = Key.get("id")
        if item_id in self.items:
            return {"Item": dict(self.items[item_id])}
        return {}

    def put_item(self, Item):
        self.items[Item["id"]] = dict(Item)
        return {"ResponseMetadata": {"HTTPStatusCode": 200}}


@pytest.fixture
def mock_table():
    return MockDynamoTable()


@pytest.fixture
def mock_s3():
    s3 = MagicMock()
    s3.generate_presigned_url.return_value = "https://mock-s3-upload-url.local/test"
    return s3


def make_event(method: str, path: str, body: dict = None, headers: dict = None):
    """Constructs an API Gateway HTTP API v2 event."""
    return {
        "version": "2.0",
        "routeKey": f"{method} {path}",
        "rawPath": path,
        "requestContext": {
            "http": {
                "method": method,
                "path": path,
            }
        },
        "headers": headers or {},
        "body": json.dumps(body) if body is not None else None,
        "isBase64Encoded": False,
    }


# ==============================================================================
# HAVERSINE & PRIORITY CALCULATION TESTS
# ==============================================================================
def test_haversine_formula_distance():
    # Same point -> 0 meters
    assert haversine_distance_meters(28.6139, 77.2090, 28.6139, 77.2090) == 0.0

    # Approx 15 meters apart in New Delhi
    dist_15m = haversine_distance_meters(28.6139, 77.2090, 28.614035, 77.2090)
    assert 10.0 <= dist_15m <= 20.0

    # Approx 100 meters apart
    dist_100m = haversine_distance_meters(28.6139, 77.2090, 28.6148, 77.2090)
    assert 90.0 <= dist_100m <= 110.0


def test_calculate_priority_midpoints_and_multipliers():
    # Drip, non-drinking, 1 reporter -> midpoint 125 * 1.0 * 1.0 = 125.0
    score, est = calculate_priority("drip", False, 1)
    assert score == 125.0
    assert est["min_litres_per_day"] == 50.0
    assert est["max_litres_per_day"] == 200.0

    # Steady, drinking, 1 reporter -> midpoint 1250 * 1.5 * 1.0 = 1875.0
    score, est = calculate_priority("steady", True, 1)
    assert score == 1875.0

    # Gush, drinking, 3 reporters -> midpoint 9500 * 1.5 * (1 + 0.25 * 2) = 9500 * 1.5 * 1.5 = 21375.0
    score, est = calculate_priority("gush", True, 3)
    assert score == 21375.0

    # Invalid flow raises ValueError
    with pytest.raises(ValueError):
        calculate_priority("tsunami", True, 1)


# ==============================================================================
# CORS & OPTIONS REQUEST
# ==============================================================================
def test_options_cors_preflight():
    event = make_event("OPTIONS", "/tickets")
    response = lambda_handler(event, None)
    assert response["statusCode"] == 200
    headers = response["headers"]
    assert headers["Access-Control-Allow-Origin"] == "*"
    assert "X-Boond-Pin" in headers["Access-Control-Allow-Headers"]


# ==============================================================================
# GET /tickets
# ==============================================================================
def test_get_tickets_returns_ranked_open_tickets(mock_table):
    # Insert 3 tickets: 2 OPEN (different scores), 1 CLOSED
    mock_table.items["t1"] = {
        "id": "t1",
        "status": "OPEN",
        "priority_score": 125.0,
        "reporters": 1,
        "flow": "drip",
        "drinking": False,
        "is_simulated": False,
    }
    mock_table.items["t2"] = {
        "id": "t2",
        "status": "OPEN",
        "priority_score": 9500.0,
        "reporters": 1,
        "flow": "gush",
        "drinking": False,
        "is_simulated": False,
    }
    mock_table.items["t3"] = {
        "id": "t3",
        "status": "CLOSED",
        "priority_score": 5000.0,
        "reporters": 1,
        "flow": "steady",
        "drinking": True,
        "is_simulated": False,
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event("GET", "/tickets")
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["count"] == 2
    # Ranked: t2 (9500) before t1 (125)
    assert body["tickets"][0]["id"] == "t2"
    assert body["tickets"][1]["id"] == "t1"
    assert "disclaimer" in body


# ==============================================================================
# POST /reports (Creation & 30m Proximity Merging)
# ==============================================================================
def test_post_reports_creates_new_ticket(mock_table):
    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event(
            "POST",
            "/reports",
            body={
                "lat": 28.6139,
                "lng": 77.2090,
                "flow": "steady",
                "drinking": True,
                "photo_key": "photos/before/report1.jpg",
            },
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 201
    body = json.loads(resp["body"])
    assert body["merged"] is False
    ticket = body["ticket"]
    assert ticket["status"] == "OPEN"
    assert ticket["flow"] == "steady"
    assert ticket["drinking"] is True
    assert ticket["reporters"] == 1
    assert ticket["priority_score"] == 1875.0  # 1250 * 1.5 * 1.0


def test_post_reports_merges_within_30_meters(mock_table):
    # Pre-populate open ticket at (28.6139, 77.2090)
    mock_table.items["ticket-existing"] = {
        "id": "ticket-existing",
        "lat": 28.6139,
        "lng": 77.2090,
        "flow": "drip",
        "drinking": False,
        "reporters": 1,
        "status": "OPEN",
        "priority_score": 125.0,
        "has_after_photo": False,
        "dispute_count": 0,
        "created_at": "2026-10-11T12:00:00Z",
    }

    # New report ~15 meters away, upgrading flow to "steady" and drinking=True
    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event(
            "POST",
            "/reports",
            body={
                "lat": 28.614035,
                "lng": 77.2090,
                "flow": "steady",
                "drinking": True,
            },
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["merged"] is True
    ticket = body["ticket"]
    assert ticket["id"] == "ticket-existing"
    assert ticket["reporters"] == 2
    assert ticket["flow"] == "steady"
    assert ticket["drinking"] is True
    # Priority: 1250 * 1.5 * (1 + 0.25) = 2343.75
    assert ticket["priority_score"] == 2343.75


def test_post_reports_rejects_invalid_flow(mock_table):
    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event(
            "POST",
            "/reports",
            body={
                "lat": 28.6139,
                "lng": 77.2090,
                "flow": "torrential",
                "drinking": True,
            },
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 400
    body = json.loads(resp["body"])
    assert body["error"] == "BadRequest"


# ==============================================================================
# POST /photo-url
# ==============================================================================
def test_post_photo_url_success(mock_s3):
    with patch("backend.app.get_s3_client", return_value=mock_s3):
        event = make_event("POST", "/photo-url", body={"kind": "before"})
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["expires_in_seconds"] == 600  # 10 minutes
    assert body["kind"] == "before"
    assert "photos/before/" in body["key"]
    assert body["upload_url"] == "https://mock-s3-upload-url.local/test"


def test_post_photo_url_invalid_kind():
    event = make_event("POST", "/photo-url", body={"kind": "random"})
    resp = lambda_handler(event, None)
    assert resp["statusCode"] == 400
    body = json.loads(resp["body"])
    assert body["error"] == "BadRequest"


# ==============================================================================
# POST /tickets/{id}/close (Cedar Authorization)
# ==============================================================================
def test_post_close_ticket_denied_for_resident(mock_table):
    mock_table.items["ticket-close-1"] = {
        "id": "ticket-close-1",
        "status": "OPEN",
        "has_after_photo": True,
        "dispute_count": 0,
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        # Resident call (no PIN header)
        event = make_event(
            "POST",
            "/tickets/ticket-close-1/close",
            body={},
            headers={},
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 403
    body = json.loads(resp["body"])
    assert body["error"] == "Forbidden"
    assert body["authorization"]["allowed"] is False
    # Ensure ticket was NOT closed
    assert mock_table.items["ticket-close-1"]["status"] == "OPEN"
    assert "closed_at" not in mock_table.items["ticket-close-1"]


def test_post_close_ticket_denied_for_engineer_without_photo(mock_table):
    mock_table.items["ticket-close-2"] = {
        "id": "ticket-close-2",
        "status": "OPEN",
        "has_after_photo": False,
        "dispute_count": 0,
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        # Engineer PIN provided, but no after-repair photo
        event = make_event(
            "POST",
            "/tickets/ticket-close-2/close",
            body={},
            headers={"X-Boond-Pin": "8472"},
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 403
    body = json.loads(resp["body"])
    assert body["authorization"]["allowed"] is False
    assert mock_table.items["ticket-close-2"]["status"] == "OPEN"


def test_post_close_ticket_allowed_for_engineer_with_photo(mock_table):
    mock_table.items["ticket-close-3"] = {
        "id": "ticket-close-3",
        "status": "OPEN",
        "has_after_photo": False,
        "dispute_count": 0,
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        # Engineer PIN provided and submitting after_photo_key
        event = make_event(
            "POST",
            "/tickets/ticket-close-3/close",
            body={"after_photo_key": "photos/after/proof.jpg"},
            headers={"X-Boond-Pin": "8472"},
        )
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["status"] == "closed"
    assert body["authorization"]["allowed"] is True
    assert "engineer_close_ticket" in body["authorization"]["reasons"]
    # Verify DynamoDB ticket was updated
    saved = mock_table.items["ticket-close-3"]
    assert saved["status"] == "CLOSED"
    assert saved["closed_at"] is not None
    assert saved["has_after_photo"] is True


# ==============================================================================
# POST /tickets/{id}/dispute (Cedar Authorization & Reopening)
# ==============================================================================
def test_post_dispute_ticket_first_dispute_remains_closed(mock_table):
    mock_table.items["ticket-disp-1"] = {
        "id": "ticket-disp-1",
        "status": "CLOSED",
        "dispute_count": 0,
        "has_after_photo": True,
        "after_photo_key": "photos/after/old.jpg",
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event("POST", "/tickets/ticket-disp-1/dispute")
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["status"] == "disputed"
    assert body["ticket"]["dispute_count"] == 1
    # Remains closed because 1 dispute < 2
    assert mock_table.items["ticket-disp-1"]["status"] == "CLOSED"
    assert body["authorization"]["allowed"] is False


def test_post_dispute_ticket_second_dispute_reopens_ticket(mock_table):
    mock_table.items["ticket-disp-2"] = {
        "id": "ticket-disp-2",
        "status": "CLOSED",
        "dispute_count": 1,
        "has_after_photo": True,
        "after_photo_key": "photos/after/old.jpg",
        "closed_at": "2026-10-11T10:00:00Z",
    }

    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event("POST", "/tickets/ticket-disp-2/dispute")
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["status"] == "reopened"
    assert body["ticket"]["dispute_count"] == 2
    assert body["ticket"]["status"] == "OPEN"
    # Proof reset
    assert body["ticket"]["has_after_photo"] is False
    assert body["ticket"]["after_photo_key"] is None
    assert body["ticket"]["closed_at"] is None
    assert body["authorization"]["allowed"] is True
    assert "resident_reopen_ticket" in body["authorization"]["reasons"]


# ==============================================================================
# POST /seed (Engineer Only Demo Endpoint)
# ==============================================================================
def test_post_seed_unauthorized_without_pin(mock_table):
    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event("POST", "/seed", headers={})
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 401
    body = json.loads(resp["body"])
    assert body["error"] == "Unauthorized"


def test_post_seed_creates_12_simulated_tickets(mock_table):
    with patch("backend.app.get_dynamo_table", return_value=mock_table):
        event = make_event("POST", "/seed", headers={"X-Boond-Pin": "8472"})
        resp = lambda_handler(event, None)

    assert resp["statusCode"] == 201
    body = json.loads(resp["body"])
    assert body["status"] == "success"
    assert body["count"] == 12
    assert len(body["tickets"]) == 12
    # Verify all are clearly labelled as simulated
    for t in body["tickets"]:
        assert t["is_simulated"] is True
        assert "SIMULATED" in t["simulation_label"]
    assert len(mock_table.items) == 12


# ==============================================================================
# UNKNOWN ROUTE & INVALID JSON
# ==============================================================================
def test_unknown_route_returns_404():
    event = make_event("GET", "/nonexistent")
    resp = lambda_handler(event, None)
    assert resp["statusCode"] == 404
    body = json.loads(resp["body"])
    assert body["error"] == "NotFound"


def test_invalid_json_body_returns_400():
    event = {
        "version": "2.0",
        "routeKey": "POST /reports",
        "rawPath": "/reports",
        "requestContext": {"http": {"method": "POST", "path": "/reports"}},
        "headers": {},
        "body": "not-valid-json{",
        "isBase64Encoded": False,
    }
    resp = lambda_handler(event, None)
    assert resp["statusCode"] == 400
    body = json.loads(resp["body"])
    assert body["error"] == "BadRequest"
