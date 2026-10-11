"""
BOOND — Cedar Authorization Test Suite
Tests Cedar policy evaluation using cedarpy against all five authorization rules:

1. A resident cannot close a ticket.
2. An engineer cannot close a ticket without an after-repair photo.
3. An engineer with the required photo can close a ticket.
4. Reopening a closed ticket requires at least two resident disputes.
5. Authorization failures must fail closed.
"""

from unittest.mock import patch
import pytest

from backend.policy import (
    evaluate_authorization,
    authorize_close_ticket,
    authorize_reopen_ticket,
    load_policy_text,
    reset_policy_cache,
)


@pytest.fixture(autouse=True)
def clean_policy_cache():
    """Ensure each test starts with a clean policy cache."""
    reset_policy_cache()
    yield
    reset_policy_cache()


@pytest.fixture
def base_ticket():
    return {
        "id": "ticket-test-001",
        "status": "OPEN",
        "flow": "steady",
        "drinking": True,
        "reporters": 1,
        "has_after_photo": False,
        "dispute_count": 0,
    }


# ==============================================================================
# RULE 1: A resident cannot close a ticket
# ==============================================================================
def test_rule1_resident_cannot_close_ticket_without_photo(base_ticket):
    """A resident caller must never be permitted to close a ticket."""
    ticket = dict(base_ticket, has_after_photo=False)
    result = authorize_close_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert "engineer_close_ticket" not in result["reasons"]


def test_rule1_resident_cannot_close_ticket_even_with_photo(base_ticket):
    """Even if an after-repair photo is present, a resident cannot close a ticket."""
    ticket = dict(base_ticket, has_after_photo=True)
    result = authorize_close_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert result["reasons"] == []


# ==============================================================================
# RULE 2: An engineer cannot close a ticket without an after-repair photo
# ==============================================================================
def test_rule2_engineer_cannot_close_without_after_repair_photo(base_ticket):
    """An engineer must be denied closure if no after-repair photo proof exists."""
    ticket = dict(base_ticket, has_after_photo=False)
    result = authorize_close_ticket(principal_role="engineer", ticket=ticket)

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert "engineer_close_ticket" not in result["reasons"]


# ==============================================================================
# RULE 3: An engineer with the required photo can close a ticket
# ==============================================================================
def test_rule3_engineer_with_photo_can_close_ticket(base_ticket):
    """An engineer with an after-repair photo must be permitted to close the ticket."""
    ticket = dict(base_ticket, has_after_photo=True)
    result = authorize_close_ticket(principal_role="engineer", ticket=ticket)

    assert result["allowed"] is True
    assert result["decision"] == "Allow"
    assert "engineer_close_ticket" in result["reasons"]
    assert len(result["errors"]) == 0


# ==============================================================================
# RULE 4: Reopening a closed ticket requires at least two resident disputes
# ==============================================================================
def test_rule4_reopening_denied_with_zero_disputes(base_ticket):
    """Reopening must be denied when there are 0 disputes."""
    ticket = dict(base_ticket, status="CLOSED", dispute_count=0)
    result = authorize_reopen_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert result["reasons"] == []


def test_rule4_reopening_denied_with_one_dispute(base_ticket):
    """Reopening must be denied when there is only 1 dispute."""
    ticket = dict(base_ticket, status="CLOSED", dispute_count=1)
    result = authorize_reopen_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert "resident_reopen_ticket" not in result["reasons"]


def test_rule4_reopening_allowed_with_exactly_two_disputes(base_ticket):
    """Reopening must be permitted once 2 disputes have been recorded."""
    ticket = dict(base_ticket, status="CLOSED", dispute_count=2)
    result = authorize_reopen_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is True
    assert result["decision"] == "Allow"
    assert "resident_reopen_ticket" in result["reasons"]


def test_rule4_reopening_allowed_with_more_than_two_disputes(base_ticket):
    """Reopening must remain permitted with 3 or more disputes."""
    ticket = dict(base_ticket, status="CLOSED", dispute_count=5)
    result = authorize_reopen_ticket(principal_role="resident", ticket=ticket)

    assert result["allowed"] is True
    assert result["decision"] == "Allow"
    assert "resident_reopen_ticket" in result["reasons"]


# ==============================================================================
# RULE 5: Authorization failures must fail closed
# ==============================================================================
def test_rule5_fail_closed_on_corrupted_policy_syntax(base_ticket):
    """Corrupted or invalid Cedar policy syntax must fail closed (deny)."""
    malformed_policy = "permit(malformed cedar syntax ??? broken);"
    result = evaluate_authorization(
        principal_role="engineer",
        action="close_ticket",
        ticket_id="ticket-fail-closed",
        ticket_attrs={"has_after_photo": True},
        policies_override=malformed_policy,
    )

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert len(result["errors"]) > 0
    assert result["reasons"] == []


def test_rule5_fail_closed_on_missing_policy_file():
    """Missing policy file error must fail closed (deny)."""
    reset_policy_cache()
    result = evaluate_authorization(
        principal_role="engineer",
        action="close_ticket",
        ticket_id="ticket-fail-closed",
        ticket_attrs={"has_after_photo": True},
        policies_override=None,
        policy_path="D:/BOOND/backend/policies/non_existent_policy.cedar",
    )

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert len(result["errors"]) > 0
    assert any("FileNotFoundError" in err or "not found" in err for err in result["errors"])


def test_rule5_fail_closed_on_unexpected_exception(base_ticket):
    """Any unexpected runtime exception during evaluation must fail closed."""
    with patch("cedarpy.is_authorized", side_effect=RuntimeError("Cedar core engine panic")):
        result = authorize_close_ticket(
            principal_role="engineer",
            ticket=dict(base_ticket, has_after_photo=True),
        )

        assert result["allowed"] is False
        assert result["decision"] == "Deny"
        assert result["reasons"] == []
        assert any("panic" in err for err in result["errors"])


def test_rule5_fail_closed_on_unknown_action(base_ticket):
    """Unrecognized action must default to deny without matching any permit."""
    result = evaluate_authorization(
        principal_role="engineer",
        action="delete_ticket_permanently",
        ticket_id="ticket-001",
        ticket_attrs={"has_after_photo": True},
    )

    assert result["allowed"] is False
    assert result["decision"] == "Deny"
    assert result["reasons"] == []
