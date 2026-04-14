# Ticket Scanner Booths Backend Implementation

## Feature Summary

Ticket scanner booths are event-scoped scanner identities for the mobile app. Admin users create booths from Ticket Management. Each booth is auto-named sequentially as `Booth 1`, `Booth 2`, etc. The backend generates a unique pairing token/QR payload for each booth. A mobile scanner operator scans the booth QR, enters name, email, and phone number, and becomes linked to that booth. Every ticket validation performed by that mobile operator should be stored against the booth so the admin dashboard can show scanner details and scan activity.

## Required Backend Model

Create a `ticket_scanner_booths` table:

- `id`
- `tenant_id`
- `event_id`
- `name` such as `Booth 1`
- `status`: `UNCLAIMED`, `ACTIVE`, `INACTIVE`
- `pairing_token_hash`
- `pairing_token_expires_at` optional
- `assigned_scanner_name`
- `assigned_scanner_email`
- `assigned_scanner_phone`
- `linked_at`
- `last_scan_at`
- `created_at`
- `updated_at`

Create a `ticket_scan_records` table:

- `id`
- `tenant_id`
- `event_id`
- `booth_id`
- `attendee_id`
- `ticket_type_id`
- `scanner_name`
- `result`: `VALID`, `DUPLICATE`, `INVALID`
- `failure_reason`
- `scanned_at`
- `created_at`

## Admin API Contract

Use authenticated admin endpoints:

- `GET /events/:eventId/scanner-booths`
  - Returns all booths for an event with scan counts and scanner details.

- `POST /events/:eventId/scanner-booths`
  - Creates the next booth for the event.
  - Backend determines the next event-scoped sequence number and returns `Booth N`.
  - Generates a secure one-time or long-lived pairing token.
  - Response should include `pairingToken` or a `pairingUrl` the frontend can encode as a QR.

- `DELETE /scanner-booths/:boothId`
  - Deletes or archives an unneeded booth.
  - Prefer soft-delete/archive if scan records already exist.

- `GET /events/:eventId/scanner-booth-scans?boothId=:boothId`
  - Returns recent scan activity, optionally filtered by booth.

## Mobile Pairing API Contract

Use mobile/public endpoints:

- `POST /mobile/scanner-booths/pair`
  - Body: `{ pairingToken, name, email, phone }`
  - Validates the token, event, expiry, and current booth state.
  - Links the scanner details to the booth.
  - Sets booth status to `ACTIVE`.
  - Returns booth ID, event summary, scanner profile, and a booth-scoped auth/session credential if needed.

- `POST /mobile/scanner-booths/:boothId/validate-ticket`
  - Body: `{ ticketQrPayload }`
  - Validates that the booth is active and belongs to the event.
  - Validates ticket ownership and check-in state.
  - Checks in the attendee when valid.
  - Writes a `ticket_scan_records` row with booth and scanner attribution for every valid, duplicate, or invalid attempt.
  - Updates `ticket_scanner_booths.last_scan_at`.

## Frontend Shape Already Added

The admin app now expects:

```ts
interface TicketScannerBooth {
  id: string;
  eventId: string;
  name: string;
  status: 'UNCLAIMED' | 'ACTIVE' | 'INACTIVE';
  pairingToken: string;
  pairingUrl?: string;
  assignedScannerName?: string;
  assignedScannerEmail?: string;
  assignedScannerPhone?: string;
  linkedAt?: string | null;
  totalScans: number;
  lastScanAt?: string | null;
  createdAt: string;
}
```

```ts
interface TicketScanRecord {
  id: string;
  eventId: string;
  boothId: string;
  boothName: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail?: string;
  ticketTypeName: string;
  scannedAt: string;
  result: 'VALID' | 'DUPLICATE' | 'INVALID';
  scannerName?: string;
}
```

## Backend Prompt

Implement event-scoped ticket scanner booths for the ticketing module. Add `ticket_scanner_booths` and `ticket_scan_records` persistence. Admins must be able to list, create, and delete/archive booths for an event. On create, auto-name the booth sequentially as `Booth 1`, `Booth 2`, etc. using the next event-scoped sequence number, and generate a secure unique pairing token/URL for QR pairing. Add a mobile pairing endpoint where an operator submits pairing token, name, email, and phone, then the backend links those details to the booth and marks it active. Update mobile ticket validation so every scan is associated with the active booth and writes scan records for valid, duplicate, and invalid attempts. Return scan counts, last scan time, scanner details, and recent scan activity to the admin frontend using the API shape documented in `Frontend Implementation Guides/ticket_scanner_backend_implementation.md`.
