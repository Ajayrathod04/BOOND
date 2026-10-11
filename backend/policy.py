"""
BOOND — Cedar Authorization Engine
Evaluates fine-grained access policies using Cedar (cedarpy).

Authorization Rules Enforced:
1. A resident cannot close a ticket.
2. An engineer cannot close a ticket without an after-repair photo.
3. An engineer with the required photo can close a ticket.
4. Reopening a closed ticket requires at least two resident disputes.
5. Authorization failures must fail closed.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import cedarpy

logger = logging.getLogger("boond.policy")

# Path to the Cedar policy file
DEFAULT_POLICY_PATH = Path(__file__).parent / "policies" / "boond.cedar"

_CACHED_POLICY_TEXT: Optional[str] = None


def load_policy_text(
    policy_path: Optional[str | Path] = None,
    force_reload: bool = False,
) -> str:
    """
    Loads Cedar policy definitions from disk. Caches the result for performance.
    """
    global _CACHED_POLICY_TEXT
    target_path = Path(policy_path) if policy_path else DEFAULT_POLICY_PATH

    if policy_path is None and not force_reload and _CACHED_POLICY_TEXT is not None:
        return _CACHED_POLICY_TEXT

    if not target_path.exists():
        raise FileNotFoundError(f"Cedar policy file not found at: {target_path}")

    with open(target_path, "r", encoding="utf-8") as f:
        text = f.read()

    if policy_path is None:
        _CACHED_POLICY_TEXT = text
    return text


def reset_policy_cache() -> None:
    """Resets the cached policy text (used for testing and hot reloading)."""
    global _CACHED_POLICY_TEXT
    _CACHED_POLICY_TEXT = None


def evaluate_authorization(
    principal_role: str,
    action: str,
    ticket_id: str,
    ticket_attrs: Dict[str, Any],
    policies_override: Optional[str] = None,
    policy_path: Optional[str | Path] = None,
) -> Dict[str, Any]:
    """
    Evaluates authorization using cedarpy and Cedar policies.
    Guarantees fail-closed behavior on any exception or unexpected state.

    Args:
        principal_role: e.g., 'engineer' or 'resident'
        action: e.g., 'close_ticket' or 'reopen_ticket'
        ticket_id: Unique identifier of the ticket entity
        ticket_attrs: Attributes of the ticket (has_after_photo, dispute_count)
        policies_override: Optional Cedar policy string to override default file
        policy_path: Optional path to load policies from

    Returns:
        Structured dict containing:
            - allowed (bool): True if authorized, False otherwise
            - decision (str): 'Allow' or 'Deny'
            - reasons (List[str]): Policy IDs triggering the decision (stable @id if present)
            - errors (List[str]): Any diagnostic or runtime errors encountered
    """
    try:
        if policies_override is not None:
            policies = policies_override
        else:
            policies = load_policy_text(policy_path=policy_path)

        # Build Cedar entities
        has_after_photo = bool(ticket_attrs.get("has_after_photo", False))
        dispute_count = int(ticket_attrs.get("dispute_count", 0))

        entities: List[Dict[str, Any]] = [
            {
                "uid": {"type": "Boond::Role", "id": str(principal_role)},
                "attrs": {},
                "parents": [],
            },
            {
                "uid": {"type": "Boond::Ticket", "id": str(ticket_id)},
                "attrs": {
                    "has_after_photo": has_after_photo,
                    "dispute_count": dispute_count,
                },
                "parents": [],
            },
        ]

        # Build Cedar authorization request
        request: Dict[str, Any] = {
            "principal": f'Boond::Role::"{principal_role}"',
            "action": f'Boond::Action::"{action}"',
            "resource": f'Boond::Ticket::"{ticket_id}"',
            "context": {},
        }

        # Evaluate through cedarpy
        authz_result: cedarpy.AuthzResult = cedarpy.is_authorized(
            request=request,
            policies=policies,
            entities=entities,
        )

        errors = list(authz_result.diagnostics.errors or [])

        # Fail closed: Any diagnostic errors or non-allowed decision must resolve to Deny
        if errors and authz_result.allowed:
            logger.warning(
                "Diagnostic errors present during Cedar evaluation. Failing closed: %s",
                errors,
            )
            return {
                "allowed": False,
                "decision": "Deny",
                "reasons": [],
                "errors": errors,
            }

        is_allowed = bool(authz_result.allowed)
        decision_str = "Allow" if is_allowed else "Deny"

        # Extract stable Cedar policy IDs from @id annotations if available
        id_annotations = authz_result.diagnostics.id_annotations_by_reason or {}
        stable_reasons = (
            [id_annotations.get(r, r) for r in authz_result.diagnostics.reasons]
            if is_allowed
            else []
        )

        return {
            "allowed": is_allowed,
            "decision": decision_str,
            "reasons": stable_reasons,
            "errors": errors,
        }

    except Exception as exc:
        # Rule 5: Authorization failures must fail closed
        logger.error(
            "Cedar authorization failed closed due to exception: %s", exc, exc_info=True
        )
        return {
            "allowed": False,
            "decision": "Deny",
            "reasons": [],
            "errors": [f"Fail-closed evaluation: {exc}"],
        }


def authorize_close_ticket(
    principal_role: str,
    ticket: Dict[str, Any],
    policies_override: Optional[str] = None,
) -> Dict[str, Any]:
    """Helper to evaluate ticket closure authorization."""
    ticket_id = str(ticket.get("id", "unknown-ticket"))
    return evaluate_authorization(
        principal_role=principal_role,
        action="close_ticket",
        ticket_id=ticket_id,
        ticket_attrs=ticket,
        policies_override=policies_override,
    )


def authorize_reopen_ticket(
    principal_role: str,
    ticket: Dict[str, Any],
    policies_override: Optional[str] = None,
) -> Dict[str, Any]:
    """Helper to evaluate ticket reopening authorization."""
    ticket_id = str(ticket.get("id", "unknown-ticket"))
    return evaluate_authorization(
        principal_role=principal_role,
        action="reopen_ticket",
        ticket_id=ticket_id,
        ticket_attrs=ticket,
        policies_override=policies_override,
    )
