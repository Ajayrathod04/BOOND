// ==============================================================================
// BOOND — Cedar Authorization Policies
// Namespace: Boond
// ==============================================================================
// Rules:
// 1. A resident cannot close a ticket.
// 2. An engineer cannot close a ticket without an after-repair photo.
// 3. An engineer with the required photo can close a ticket.
// 4. Reopening a closed ticket requires at least two resident disputes.
// 5. Authorization failures must fail closed.
// ==============================================================================

// Rule 1, 2, 3: Ticket Closure Policy
// Engineers are permitted to close a ticket only when after-repair photo proof is verified.
// Residents are not granted permission to close tickets (default deny / fail closed).
@id("engineer_close_ticket")
permit (
    principal == Boond::Role::"engineer",
    action == Boond::Action::"close_ticket",
    resource is Boond::Ticket
)
when {
    resource.has_after_photo == true
};

// Rule 4: Ticket Reopening Policy
// Residents are permitted to reopen a closed ticket when dispute count reaches at least 2.
@id("resident_reopen_ticket")
permit (
    principal == Boond::Role::"resident",
    action == Boond::Action::"reopen_ticket",
    resource is Boond::Ticket
)
when {
    resource.dispute_count >= 2
};
