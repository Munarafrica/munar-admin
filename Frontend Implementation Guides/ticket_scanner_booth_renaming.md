# Ticket Scanner Booth Renaming

## Summary

Admins can now rename event scanner booths after creation. This lets the admin app display operational labels such as `Gate A`, `VIP Entrance`, `Main Door`, or `Backstage` instead of only the backend-generated default names like `Booth 1`.

The backend still auto-creates booths as `Booth 1`, `Booth 2`, etc. The rename endpoint updates the booth `name` field used by:

- admin booth list
- pairing/activation response
- scanner mobile app booth label
- scan activity records through `boothName`

## Endpoint

```http
PATCH /api/scanner-booths/:boothId
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Request Body

```json
{
  "name": "Gate A"
}
```

## Validation Rules

- `name` is required.
- `name` must be a string.
- `name` must be at least 2 characters.
- `name` must be at most 80 characters.
- The backend trims the name before saving.
- Booth names must be unique within the same event, case-insensitively.

For example, if `Gate A` exists, renaming another booth to `gate a` will fail.

## Success Response

The response matches the existing `TicketScannerBooth` shape used by the admin scanner booth list.

```json
{
  "id": "booth-id",
  "eventId": "event-id",
  "name": "Gate A",
  "status": "UNCLAIMED",
  "pairingToken": null,
  "pairingUrl": null,
  "assignedScannerName": null,
  "assignedScannerEmail": null,
  "assignedScannerPhone": null,
  "linkedAt": null,
  "totalScans": 0,
  "lastScanAt": null,
  "createdAt": "2026-04-14T10:00:00.000Z"
}
```

Important: `pairingToken` and `pairingUrl` are returned as `null` on rename. The token is only exposed when the booth is first created.

## Error Cases

### Duplicate Name

```http
409 Conflict
```

```json
{
  "message": "A scanner booth with this name already exists for this event"
}
```

### Invalid Name

```http
400 Bad Request
```

Examples:

- empty name
- name shorter than 2 characters
- name longer than 80 characters

### Missing Permission

```http
403 Forbidden
```

User must have the same event/ticketing access currently required for scanner booth management.

### Booth Not Found

```http
404 Not Found
```

Returned if the booth does not exist or has been archived/deleted.

## Suggested Frontend UX

Add rename from the scanner booth row/card actions:

- action label: `Rename`
- open a small modal or inline editable field
- prefill with current booth name
- submit `PATCH /api/scanner-booths/:boothId`
- optimistically update the local booth list or replace the booth with the response
- show duplicate-name errors inline

Recommended client behavior:

- trim name before enabling submit, even though backend also trims
- disable submit if name is unchanged after trimming
- enforce 2-80 character limits in the input
- keep the current QR/pairing UI unchanged

## TypeScript Helper

```ts
type RenameScannerBoothInput = {
  boothId: string;
  name: string;
};

async function renameScannerBooth({ boothId, name }: RenameScannerBoothInput) {
  const response = await api.patch<TicketScannerBooth>(
    `/scanner-booths/${boothId}`,
    { name: name.trim() },
  );

  return response.data;
}
```

## Notes

- This is an admin-authenticated endpoint, not a mobile endpoint.
- Renaming an active booth does not unpair the mobile scanner.
- The mobile scanner will see the new booth name after it refreshes/pairs/downloads latest data. If it already has a local session, a future scanner settings/session refresh can update the displayed name.
