# Program Management Frontend Implementation Guide

This guide covers the Speakers and Schedule tabs shown in the event Program Management screen.

## Backend Status

The backend now supports first-class event speakers and sessions.

Use these authenticated management endpoints for the organizer/admin interface:

- `GET /api/events/:eventId/speakers`
- `POST /api/events/:eventId/speakers`
- `GET /api/speakers/:speakerId`
- `PATCH /api/speakers/:speakerId`
- `DELETE /api/speakers/:speakerId`
- `GET /api/events/:eventId/sessions`
- `POST /api/events/:eventId/sessions`
- `GET /api/sessions/:sessionId`
- `PATCH /api/sessions/:sessionId`
- `DELETE /api/sessions/:sessionId`

Use these public read endpoints for attendee-facing event pages:

- `GET /api/public/events/:eventSlug/speakers`
- `GET /api/public/events/:eventSlug/sessions`

Public session results only include sessions with `status: "PUBLISHED"`.

## Auth And Access

Organizer endpoints require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Users must belong to the event tenant. Creating, updating, and deleting speakers/sessions requires tenant role:

- `OWNER`
- `ADMIN`
- `EDITOR`

## Speaker Shape

```ts
type EventSpeaker = {
  id: string;
  eventId: string;
  fullName: string;
  jobTitle: string | null;
  organization: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

## Create Speaker

```http
POST /api/events/:eventId/speakers
```

```json
{
  "fullName": "Sarah Connor",
  "jobTitle": "Chief Product Officer",
  "organization": "TechCorp Inc.",
  "bio": "Product leader and keynote speaker.",
  "profilePhotoUrl": "https://cdn.example.com/speakers/sarah.jpg",
  "linkedinUrl": "https://linkedin.com/in/sarah",
  "twitterUrl": "https://twitter.com/sarah",
  "websiteUrl": "https://sarah.example.com",
  "isFeatured": true,
  "sortOrder": 0
}
```

Only `fullName` is required.

## List Speakers

```http
GET /api/events/:eventId/speakers?search=sarah&isFeatured=true
```

Query params:

- `search`: optional; matches full name, job title, or organization.
- `isFeatured`: optional boolean, `true` or `false`.

Response:

```json
[
  {
    "id": "speaker-id",
    "eventId": "event-id",
    "fullName": "Sarah Connor",
    "jobTitle": "Chief Product Officer",
    "organization": "TechCorp Inc.",
    "bio": "Product leader and keynote speaker.",
    "profilePhotoUrl": "https://cdn.example.com/speakers/sarah.jpg",
    "linkedinUrl": "https://linkedin.com/in/sarah",
    "twitterUrl": "https://twitter.com/sarah",
    "websiteUrl": "https://sarah.example.com",
    "isFeatured": true,
    "sortOrder": 0,
    "createdAt": "2026-04-12T12:00:00.000Z",
    "updatedAt": "2026-04-12T12:00:00.000Z"
  }
]
```

## Update Speaker

```http
PATCH /api/speakers/:speakerId
```

Send any subset of the create fields.

```json
{
  "jobTitle": "VP Product",
  "isFeatured": false
}
```

## Delete Speaker

```http
DELETE /api/speakers/:speakerId
```

Response:

```json
{
  "id": "speaker-id",
  "deleted": true
}
```

Deleting a speaker removes its links from sessions.

## Session Shape

```ts
type EventSessionStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

type EventSessionSpeaker = EventSpeaker & {
  sessionRole: string | null;
  sessionSortOrder: number;
};

type EventSession = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
  track: string | null;
  status: EventSessionStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  speakers: EventSessionSpeaker[];
};
```

## Create Session

```http
POST /api/events/:eventId/sessions
```

```json
{
  "title": "Keynote: The Future of Tech",
  "description": "Opening keynote for the event.",
  "startsAt": "2026-12-04T09:00:00.000Z",
  "endsAt": "2026-12-04T10:00:00.000Z",
  "location": "Hall A",
  "track": "General",
  "status": "DRAFT",
  "sortOrder": 0,
  "speakerIds": ["a1c3607e-8ea4-4aa5-8be9-e0f168bd8f4a"]
}
```

Required fields:

- `title`
- `startsAt`
- `endsAt`

Validation rules:

- `startsAt` and `endsAt` must be ISO date strings.
- `endsAt` must be later than `startsAt`.
- `speakerIds` must be UUIDs that belong to the same event.
- `status` defaults to `DRAFT`.

Frontend note: the UI can collect date and time separately, but send a combined ISO timestamp. Use the event timezone when converting local form values.

## List Sessions

```http
GET /api/events/:eventId/sessions?search=keynote&dateFrom=2026-12-04T00:00:00.000Z&dateTo=2026-12-05T00:00:00.000Z&track=General&status=DRAFT
```

Query params:

- `search`: optional; matches title, description, location, or track.
- `dateFrom`: optional ISO date string; filters `startsAt >= dateFrom`.
- `dateTo`: optional ISO date string; filters `startsAt <= dateTo`.
- `track`: optional exact track filter.
- `status`: optional enum: `DRAFT`, `PUBLISHED`, `CANCELLED`.

Response:

```json
[
  {
    "id": "session-id",
    "eventId": "event-id",
    "title": "Keynote: The Future of Tech",
    "description": "Opening keynote for the event.",
    "startsAt": "2026-12-04T09:00:00.000Z",
    "endsAt": "2026-12-04T10:00:00.000Z",
    "location": "Hall A",
    "track": "General",
    "status": "DRAFT",
    "sortOrder": 0,
    "createdAt": "2026-04-12T12:00:00.000Z",
    "updatedAt": "2026-04-12T12:00:00.000Z",
    "speakers": [
      {
        "id": "speaker-id",
        "eventId": "event-id",
        "fullName": "Sarah Connor",
        "jobTitle": "Chief Product Officer",
        "organization": "TechCorp Inc.",
        "bio": null,
        "profilePhotoUrl": null,
        "linkedinUrl": null,
        "twitterUrl": null,
        "websiteUrl": null,
        "isFeatured": true,
        "sortOrder": 0,
        "createdAt": "2026-04-12T12:00:00.000Z",
        "updatedAt": "2026-04-12T12:00:00.000Z",
        "sessionRole": null,
        "sessionSortOrder": 0
      }
    ]
  }
]
```

## Update Session

```http
PATCH /api/sessions/:sessionId
```

Send any subset of the create fields.

```json
{
  "status": "PUBLISHED",
  "speakerIds": [
    "a1c3607e-8ea4-4aa5-8be9-e0f168bd8f4a",
    "24c3ac5a-daf6-4b1b-a03b-66851d6cc0a5"
  ]
}
```

Important:

- If `speakerIds` is omitted, existing speakers remain unchanged.
- If `speakerIds` is `[]`, all speakers are removed from the session.

## Delete Session

```http
DELETE /api/sessions/:sessionId
```

Response:

```json
{
  "id": "session-id",
  "deleted": true
}
```

## Public Speakers

```http
GET /api/public/events/:eventSlug/speakers?search=sarah&isFeatured=true
```

Response:

```json
{
  "event": {
    "id": "event-id",
    "slug": "munar-launch",
    "title": "Munar Launch",
    "summary": "A short event summary",
    "timezone": "Africa/Lagos"
  },
  "speakers": []
}
```

## Public Sessions

```http
GET /api/public/events/:eventSlug/sessions?dateFrom=2026-12-04T00:00:00.000Z&dateTo=2026-12-05T00:00:00.000Z&track=General
```

Response:

```json
{
  "event": {
    "id": "event-id",
    "slug": "munar-launch",
    "title": "Munar Launch",
    "summary": "A short event summary",
    "timezone": "Africa/Lagos"
  },
  "sessions": []
}
```

Only `PUBLISHED` sessions are returned publicly.

## UI Mapping From The Screens

Speakers tab:

- Initial load: `GET /api/events/:eventId/speakers`
- Search input: call list speakers with `?search=...`
- Filter button: use `isFeatured=true/false` if filtering by featured status
- Add Speaker button and empty state button: open the speaker modal
- Create Speaker button: `POST /api/events/:eventId/speakers`
- Edit action: `PATCH /api/speakers/:speakerId`
- Delete action: `DELETE /api/speakers/:speakerId`

Schedule tab:

- Initial load: `GET /api/events/:eventId/sessions`
- Search input: call list sessions with `?search=...`
- All Days filter: omit `dateFrom` and `dateTo`
- Specific day filter: send day bounds as ISO strings in the event timezone
- Add Session button and empty state button: open the session modal
- Manage Speakers link: switch to the Speakers tab or open the Add Speaker modal
- Create Session button: `POST /api/events/:eventId/sessions`
- Edit action: `PATCH /api/sessions/:sessionId`
- Delete action: `DELETE /api/sessions/:sessionId`

## Suggested Frontend State

```ts
type ProgramTab = 'speakers' | 'schedule';

type SpeakerFormValues = {
  profilePhotoUrl?: string;
  fullName: string;
  jobTitle?: string;
  organization?: string;
  bio?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  isFeatured?: boolean;
};

type SessionFormValues = {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  track?: string;
  status?: EventSessionStatus;
  speakerIds?: string[];
};
```

## Copyable Frontend Prompt

Use this prompt to implement the frontend:

```text
Implement the Event Program Management frontend for the Munar admin app.

Context:
- The route is an event-scoped page like /events/:eventId/program.
- The UI has two tabs: Speakers and Schedule.
- The backend base path is /api.
- Authenticated organizer requests must include Authorization: Bearer <access_token>.

Backend endpoints:
- GET /api/events/:eventId/speakers?search=&isFeatured=
- POST /api/events/:eventId/speakers
- GET /api/speakers/:speakerId
- PATCH /api/speakers/:speakerId
- DELETE /api/speakers/:speakerId
- GET /api/events/:eventId/sessions?search=&dateFrom=&dateTo=&track=&status=
- POST /api/events/:eventId/sessions
- GET /api/sessions/:sessionId
- PATCH /api/sessions/:sessionId
- DELETE /api/sessions/:sessionId

Speaker form:
- profilePhotoUrl optional
- fullName required
- jobTitle optional
- organization optional
- bio optional
- linkedinUrl optional
- twitterUrl optional
- websiteUrl optional
- isFeatured optional boolean

Session form:
- title required
- description optional
- date required
- startTime required
- endTime required
- location optional
- track optional, default "General"
- status optional, default "DRAFT"
- speakerIds optional string[]

Implementation requirements:
- On page load, fetch speakers and sessions in parallel.
- Keep the existing empty states: "No speakers found" and "No sessions found".
- Replace the current failing GET /api/events/:eventId/sessions behavior with the endpoint above and show backend errors in the existing alert surface.
- In the Schedule tab, implement search and All Days/day filtering using dateFrom/dateTo ISO query params.
- In the Speakers tab, implement search and featured filtering.
- The Add Speaker modal should POST to /api/events/:eventId/speakers, then refresh the speaker list and close the modal on success.
- The Add Session modal should POST to /api/events/:eventId/sessions, then refresh the session list and close the modal on success.
- Combine date + startTime/endTime into ISO strings before sending startsAt and endsAt. Use the event timezone if available; otherwise use the browser timezone.
- In the session modal, load speakers from GET /api/events/:eventId/speakers and let the user select multiple speakers.
- The Manage Speakers link in the session modal should switch to the Speakers tab or open the Add Speaker modal.
- Support edit/delete actions if the existing UI has action menus; use PATCH/DELETE endpoints above.
- Show loading, saving, and error states without layout shift.
- Preserve the existing dark visual style and component conventions.
```
