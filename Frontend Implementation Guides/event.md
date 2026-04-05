# Event Frontend Implementation Guide

This guide explains how to create events from the frontend against the current backend implementation.

## Endpoint

- Method: `POST`
- URL: `/api/events`
- Auth: `Bearer <access_token>`
- Content-Type: `application/json`

Example:

```http
POST /api/events
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Required Payload

Only these two fields are required:

```json
{
  "tenantId": "7a4d0d65-0f63-4fa5-a0f6-3bdf1c01d917",
  "title": "Munar Launch Event"
}
```

## Full Request Payload

```json
{
  "tenantId": "7a4d0d65-0f63-4fa5-a0f6-3bdf1c01d917",
  "title": "Munar Launch Event",
  "summary": "A short event summary for cards and previews",
  "description": "Full event description shown on detail pages",
  "visibility": "PRIVATE",
  "category": "Conference",
  "eventType": "Physical",
  "startsAt": "2026-07-01T10:00:00.000Z",
  "endsAt": "2026-07-01T18:00:00.000Z",
  "timezone": "Africa/Lagos",
  "currency": "NGN",
  "venueName": "Eko Convention Centre",
  "venueAddress": "Victoria Island, Lagos",
  "isOnline": false,
  "onlineUrl": "https://meet.google.com/abc-defg-hij",
  "coverImageUrl": "https://cdn.example.com/events/cover.jpg",
  "logoUrl": "https://cdn.example.com/events/logo.png"
}
```

## Field Rules

- `tenantId`: required, must be a valid UUID.
- `title`: required, string, 2 to 150 characters.
- `summary`: optional, max 300 characters.
- `description`: optional string.
- `visibility`: optional enum. Allowed values:
  - `PRIVATE`
  - `UNLISTED`
  - `PUBLIC`
- `category`: optional string.
- `eventType`: optional string.
- `startsAt`: optional ISO date string.
- `endsAt`: optional ISO date string and must be later than `startsAt`.
- `timezone`: optional string. If omitted, backend defaults to `Africa/Lagos`.
- `currency`: optional enum. Allowed values:
  - `NGN`
  - `USD`
  - `EUR`
  - `GBP`
  - `GHS`
  - `KES`
  - `ZAR`
- `venueName`: optional string.
- `venueAddress`: optional string.
- `isOnline`: optional boolean. Defaults to `false`.
- `onlineUrl`: optional string, but required if `isOnline` is `true`.
- `coverImageUrl`: optional string.
- `logoUrl`: optional string.

## Backend Defaults Applied On Create

If omitted, the backend fills these values:

- `status`: `DRAFT`
- `visibility`: `PRIVATE`
- `timezone`: `Africa/Lagos`
- `isOnline`: `false`
- `currency`: the tenant's `defaultCurrency`

The backend also creates event settings automatically with:

```json
{
  "modulesEnabledJson": {
    "ticketing": false,
    "forms": false,
    "merchandising": false,
    "website": false,
    "analytics": true
  }
}
```

## Important Validation Notes

- Extra fields are rejected. The backend uses strict validation and whitelisting.
- `endsAt <= startsAt` returns a `400`.
- `isOnline: true` without `onlineUrl` returns a `400`.
- The authenticated user must belong to the tenant.
- Only tenant roles `OWNER`, `ADMIN`, or `EDITOR` can create events.

## Success Response

On success, the backend returns the created event with related `tenant` and `settings`.

Example:

```json
{
  "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "tenantId": "7a4d0d65-0f63-4fa5-a0f6-3bdf1c01d917",
  "slug": "munar-launch-event",
  "title": "Munar Launch Event",
  "summary": "A short event summary for cards and previews",
  "description": "Full event description shown on detail pages",
  "status": "DRAFT",
  "visibility": "PRIVATE",
  "category": "Conference",
  "eventType": "Physical",
  "startsAt": "2026-07-01T10:00:00.000Z",
  "endsAt": "2026-07-01T18:00:00.000Z",
  "timezone": "Africa/Lagos",
  "currency": "NGN",
  "venueName": "Eko Convention Centre",
  "venueAddress": "Victoria Island, Lagos",
  "isOnline": false,
  "onlineUrl": null,
  "coverImageUrl": "https://cdn.example.com/events/cover.jpg",
  "logoUrl": "https://cdn.example.com/events/logo.png",
  "websitePublished": false,
  "createdById": "f5d694e6-9dca-4881-a0f6-f0c648676fca",
  "createdAt": "2026-04-02T10:15:30.000Z",
  "updatedAt": "2026-04-02T10:15:30.000Z",
  "tenant": {
    "id": "7a4d0d65-0f63-4fa5-a0f6-3bdf1c01d917",
    "slug": "munar",
    "name": "Munar",
    "tenantType": "ORGANISATION",
    "defaultCurrency": "NGN",
    "timezone": "Africa/Lagos",
    "brandingJson": null,
    "settingsJson": null,
    "createdAt": "2026-03-01T09:00:00.000Z",
    "updatedAt": "2026-03-01T09:00:00.000Z"
  },
  "settings": {
    "id": "76f98bcc-5dd1-4294-95f8-d2c22d064aa4",
    "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "modulesEnabledJson": {
      "ticketing": false,
      "forms": false,
      "merchandising": false,
      "website": false,
      "analytics": true
    },
    "brandingJson": null,
    "websiteSettingsJson": null,
    "ticketingSettingsJson": null,
    "formSettingsJson": null,
    "merchandisingJson": null,
    "financeSettingsJson": null,
    "createdAt": "2026-04-02T10:15:30.000Z",
    "updatedAt": "2026-04-02T10:15:30.000Z"
  }
}
```

## Error Response Format

The API returns errors in this general format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "tenantId",
      "errors": ["tenantId must be a UUID"],
      "children": []
    }
  ],
  "timestamp": "2026-04-02T10:20:00.000Z",
  "path": "/api/events",
  "requestId": "req_abc123def4"
}
```

Other common cases:

- `403 FORBIDDEN`: user is not in the tenant or lacks permission.
- `404 NOT_FOUND`: tenant not found.
- `400 VALIDATION_ERROR`: invalid payload or business rule failure.

Business-rule error examples:

```json
{
  "statusCode": 400,
  "message": "endsAt must be later than startsAt",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-04-02T10:20:00.000Z",
  "path": "/api/events",
  "requestId": "req_abc123def4"
}
```

```json
{
  "statusCode": 400,
  "message": "onlineUrl is required when isOnline is true",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-04-02T10:20:00.000Z",
  "path": "/api/events",
  "requestId": "req_abc123def4"
}
```

## Recommended Frontend Types

```ts
export type EventVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

export type CurrencyCode =
  | "NGN"
  | "USD"
  | "EUR"
  | "GBP"
  | "GHS"
  | "KES"
  | "ZAR";

export type CreateEventPayload = {
  tenantId: string;
  title: string;
  summary?: string;
  description?: string;
  visibility?: EventVisibility;
  category?: string;
  eventType?: string;
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  currency?: CurrencyCode;
  venueName?: string;
  venueAddress?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  coverImageUrl?: string;
  logoUrl?: string;
};

export type EventSettings = {
  id: string;
  eventId: string;
  modulesEnabledJson: Record<string, unknown> | null;
  brandingJson: Record<string, unknown> | null;
  websiteSettingsJson: Record<string, unknown> | null;
  ticketingSettingsJson: Record<string, unknown> | null;
  formSettingsJson: Record<string, unknown> | null;
  merchandisingJson: Record<string, unknown> | null;
  financeSettingsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type EventResponse = {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "LIVE" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  visibility: EventVisibility;
  category: string | null;
  eventType: string | null;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  currency: CurrencyCode;
  venueName: string | null;
  venueAddress: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  websitePublished: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    slug: string;
    name: string;
    tenantType: string;
    defaultCurrency: CurrencyCode;
    timezone: string;
    brandingJson: unknown;
    settingsJson: unknown;
    createdAt: string;
    updatedAt: string;
  };
  settings: EventSettings | null;
};
```

## Example Frontend Request

```ts
export async function createEvent(
  token: string,
  payload: CreateEventPayload,
): Promise<EventResponse> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
```

## Suggested UI Submission Flow

1. Collect `tenantId` and `title` as the minimum create form.
2. Validate on the client that `endsAt` is after `startsAt`.
3. If `isOnline` is checked, require `onlineUrl` before submit.
4. Submit `POST /api/events`.
5. Store the returned `id`, `slug`, and `settings`.
6. Redirect to the event details or event setup page.

## Optional Follow-up Endpoints After Create

### Get event by ID

- Method: `GET`
- URL: `/api/events/:eventId`

### Update event

- Method: `PATCH`
- URL: `/api/events/:eventId`

Payload is the same shape as create, except all fields are optional and `tenantId` is not accepted.

### Get event settings

- Method: `GET`
- URL: `/api/events/:eventId/settings`

### Update event settings

- Method: `PATCH`
- URL: `/api/events/:eventId/settings`

Example payload:

```json
{
  "modulesEnabledJson": {
    "ticketing": true,
    "forms": true,
    "merchandising": false,
    "website": true,
    "analytics": true
  }
}
```

### Publish event

- Method: `POST`
- URL: `/api/events/:eventId/publish`

Before publish, the event must have at least:

- `title`
- `startsAt`

## Practical Frontend Notes

- Use ISO strings for `startsAt` and `endsAt`.
- Do not send undefined UI-only keys like `step`, `tab`, `draftId`, or `imageFile`; the backend rejects unknown fields.
- If you upload images separately, send the final hosted URL in `coverImageUrl` and `logoUrl`.
- Treat create as successful only after the backend response returns the event object.
