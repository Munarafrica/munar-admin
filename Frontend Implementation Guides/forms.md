# Forms Frontend Implementation Guide

This guide explains how forms work from the frontend against the current backend implementation.

It is written for both:

- the dashboard/editor frontend that creates and manages forms
- the submission frontend that renders a form and sends answers

## Feature Summary

Forms are event-level resources.

Each form belongs to one event and has:

- a title
- a `formType`
- a `status`
- a `schemaJson` definition
- optional config JSON fields for logic, payment, schedule, access control, and branding

Each submitted response becomes a `FormSubmission` record tied to:

- the form
- the event
- optionally the authenticated user who submitted it

## Important Backend Reality

The backend currently supports:

- creating forms
- listing forms for an event
- getting a form by id
- updating a form
- publishing a form
- closing a form
- archiving forms
- deleting forms
- listing published forms for an event
- fetching a published form for an event
- submitting answers to a form
- listing submissions
- getting one submission by id

The backend currently does not support:

- reopening archived forms
- a form slug model
- a public endpoint to fetch a published form without the event slug in the URL

## Data Model

### Form

```ts
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type FormType = 'REGISTRATION' | 'SURVEY' | 'CUSTOM';

export type FormRecord = {
  id: string;
  eventId: string;
  title: string;
  formType: FormType;
  status: FormStatus;
  schemaJson: Record<string, unknown>;
  logicJson: Record<string, unknown> | null;
  paymentConfigJson: Record<string, unknown> | null;
  scheduleJson: Record<string, unknown> | null;
  accessControlJson: Record<string, unknown> | null;
  brandingJson: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

### Form Submission

```ts
export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REVERSED'
  | 'REFUNDED';

export type FormSubmissionRecord = {
  id: string;
  formId: string;
  eventId: string;
  submittedByUserId: string | null;
  status: string;
  answersJson: Record<string, unknown>;
  scoringJson: Record<string, unknown> | null;
  paymentStatus: PaymentStatus | null;
  createdAt: string;
  updatedAt: string;
};
```

## Form Status Lifecycle

The frontend should model form lifecycle with these rules:

- new forms are always created as `DRAFT`
- `DRAFT -> PUBLISHED` is allowed
- `CLOSED -> PUBLISHED` is allowed
- `PUBLISHED -> CLOSED` is allowed
- `DRAFT -> ARCHIVED` is allowed
- `PUBLISHED -> ARCHIVED` is allowed
- `CLOSED -> ARCHIVED` is allowed
- archived forms cannot be updated

## Event Settings Relationship

The event settings model includes:

- `modulesEnabledJson.forms`
- `formSettingsJson`

Important frontend note:

- `modulesEnabledJson.forms` defaults to `false` when an event is created
- current form endpoints do not enforce this flag
- current form endpoints also do not read `formSettingsJson`

So for now:

- the frontend can use `modulesEnabledJson.forms` as a product/UI toggle
- but the backend does not block form APIs when that flag is `false`

## Builder Endpoints

These are the endpoints for the authenticated dashboard/editor frontend.

All of them require:

- `Authorization: Bearer <access_token>`

### 1. Create Form

- Method: `POST`
- URL: `/api/events/:eventId/forms`

Example:

```http
POST /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/forms
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Payload

```json
{
  "title": "Event Registration Form",
  "formType": "REGISTRATION",
  "schemaJson": {
    "fields": [
      {
        "id": "fullName",
        "type": "text",
        "label": "Full name",
        "required": true
      },
      {
        "id": "email",
        "type": "email",
        "label": "Email address",
        "required": true
      },
      {
        "id": "ticketCount",
        "type": "number",
        "label": "Number of tickets",
        "required": true
      },
      {
        "id": "mealPreference",
        "type": "select",
        "label": "Meal preference",
        "options": ["Veg", "Chicken", "Fish"]
      }
    ]
  },
  "logicJson": {
    "version": 1
  },
  "paymentConfigJson": {
    "enabled": false
  },
  "scheduleJson": {
    "opensAt": "2026-07-01T08:00:00.000Z",
    "closesAt": "2026-07-05T23:59:59.000Z"
  },
  "accessControlJson": {
    "requiresAuth": false
  },
  "brandingJson": {
    "primaryColor": "#0F172A"
  }
}
```

### Validation Rules

- `title` is required and must be at least 2 characters
- `formType` is required and must be one of `REGISTRATION | SURVEY | CUSTOM`
- `schemaJson` is required and must be an object
- `schemaJson.fields` must be a non-empty array
- each field must have a string `id`
- each field must have a string `type`

### Success Response

Returns the created `Form` record.

Example:

```json
{
  "id": "9d36a233-920d-4b3d-a0cf-0ee7cf25f677",
  "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "title": "Event Registration Form",
  "formType": "REGISTRATION",
  "status": "DRAFT",
  "schemaJson": {
    "fields": [
      {
        "id": "fullName",
        "type": "text",
        "label": "Full name",
        "required": true
      }
    ]
  },
  "logicJson": {
    "version": 1
  },
  "paymentConfigJson": {
    "enabled": false
  },
  "scheduleJson": {
    "opensAt": "2026-07-01T08:00:00.000Z",
    "closesAt": "2026-07-05T23:59:59.000Z"
  },
  "accessControlJson": {
    "requiresAuth": false
  },
  "brandingJson": {
    "primaryColor": "#0F172A"
  },
  "publishedAt": null,
  "createdAt": "2026-04-04T12:00:00.000Z",
  "updatedAt": "2026-04-04T12:00:00.000Z"
}
```

### Failure Cases

- `404 NOT_FOUND` if the event does not exist
- `403 FORBIDDEN` if the user is not in the tenant
- `403 FORBIDDEN` if the user lacks form editing permissions
- `400 VALIDATION_ERROR` for DTO validation errors
- `400 VALIDATION_ERROR` for invalid `schemaJson`

## 2. List Forms For An Event

- Method: `GET`
- URL: `/api/events/:eventId/forms`

Optional query params:

- `formType=REGISTRATION|SURVEY|CUSTOM`
- `status=DRAFT|PUBLISHED|CLOSED|ARCHIVED`
- `search=<text>`

Example:

```http
GET /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/forms?status=PUBLISHED&search=registration
Authorization: Bearer <access_token>
```

### Success Response

Returns an array of `Form` records ordered by `createdAt desc`.

### Frontend Notes

- there is no pagination right now
- `search` filters `title` with case-insensitive `contains`
- this endpoint is for dashboard/editor use, not public website use

## 3. Get Form By Id

- Method: `GET`
- URL: `/api/forms/:formId`

Example:

```http
GET /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677
Authorization: Bearer <access_token>
```

### Success Response

Returns a single `Form` record.

### Frontend Notes

- use this to open the form builder/editor
- use this when you already know the form id from the event forms list
- use the public endpoints below for shareable/public rendering

## 4. Update Form

- Method: `PATCH`
- URL: `/api/forms/:formId`

Example:

```http
PATCH /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Payload

All fields are optional:

```json
{
  "title": "Updated Registration Form",
  "formType": "CUSTOM",
  "schemaJson": {
    "fields": [
      {
        "id": "fullName",
        "type": "text",
        "label": "Full name",
        "required": true
      },
      {
        "id": "bio",
        "type": "textarea",
        "label": "Tell us about yourself"
      }
    ]
  },
  "logicJson": {
    "version": 2
  },
  "paymentConfigJson": {
    "enabled": true
  },
  "scheduleJson": {
    "opensAt": "2026-07-01T08:00:00.000Z",
    "closesAt": "2026-07-06T23:59:59.000Z"
  },
  "accessControlJson": {
    "requiresAuth": true
  },
  "brandingJson": {
    "primaryColor": "#1D4ED8"
  }
}
```

### Validation Rules

- same field-level rules as create
- if `schemaJson` is present, it is revalidated
- archived forms cannot be updated

### Frontend Notes

- partial updates are supported
- the backend overwrites only the fields you send
- if you want to preserve an existing JSON block, either omit it or send the complete updated object

## 5. Publish Form

- Method: `POST`
- URL: `/api/forms/:formId/publish`

Example:

```http
POST /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/publish
Authorization: Bearer <access_token>
```

### Backend Rules

- allowed from `DRAFT`
- allowed from `CLOSED`
- not allowed from `PUBLISHED`
- not allowed from `ARCHIVED`
- sets `status = PUBLISHED`
- sets `publishedAt = now`

### Frontend Notes

- publish should be a deliberate action in the UI
- once published, the form becomes submittable subject to schedule checks

## 6. Close Form

- Method: `POST`
- URL: `/api/forms/:formId/close`

Example:

```http
POST /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/close
Authorization: Bearer <access_token>
```

### Backend Rules

- allowed only from `PUBLISHED`
- sets `status = CLOSED`
- does not clear `publishedAt`

### Frontend Notes

- closed forms should render as not accepting submissions
- a closed form can later be republished

## 7. Archive Form

- Method: `POST`
- URL: `/api/forms/:formId/archive`

Example:

```http
POST /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/archive
Authorization: Bearer <access_token>
```

### Backend Rules

- allowed from `DRAFT`
- allowed from `PUBLISHED`
- allowed from `CLOSED`
- not allowed from `ARCHIVED`
- sets `status = ARCHIVED`

### Frontend Notes

- archived forms should be read-only in the builder
- archived forms are not returned by the public published-form endpoints

## 8. Delete Form

- Method: `DELETE`
- URL: `/api/forms/:formId`

Example:

```http
DELETE /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677
Authorization: Bearer <access_token>
```

### Backend Rules

- user must have form editing permission
- forms with one or more submissions cannot be deleted

### Success Response

```json
{
  "success": true,
  "deleted": true,
  "id": "9d36a233-920d-4b3d-a0cf-0ee7cf25f677"
}
```

### Frontend Notes

- use archive as the safe default action in UI
- reserve hard delete for forms with no submissions

## Public Endpoints

These are the endpoints for public/shareable form experiences.

## 9. List Published Forms For An Event

- Method: `GET`
- URL: `/api/public/events/:eventSlug/forms`
- Auth: none

Example:

```http
GET /api/public/events/munar-launch-event/forms
```

### Success Response

```json
{
  "event": {
    "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "slug": "munar-launch-event",
    "title": "Munar Launch Event",
    "summary": "A short event summary",
    "coverImageUrl": "https://cdn.example.com/events/cover.jpg",
    "logoUrl": "https://cdn.example.com/events/logo.png"
  },
  "formSettings": null,
  "branding": null,
  "forms": [
    {
      "id": "9d36a233-920d-4b3d-a0cf-0ee7cf25f677",
      "title": "Event Registration Form",
      "formType": "REGISTRATION",
      "status": "PUBLISHED",
      "scheduleJson": {
        "opensAt": "2026-07-01T08:00:00.000Z",
        "closesAt": "2026-07-05T23:59:59.000Z"
      },
      "accessControlJson": {
        "requiresAuth": false
      },
      "publishedAt": "2026-04-05T10:00:00.000Z"
    }
  ]
}
```

### Backend Rules

- event must exist
- `event.settings.modulesEnabledJson.forms` must be `true`
- only forms with `status = PUBLISHED` are returned

### Frontend Notes

- use this for public event forms landing pages
- this endpoint can return an empty `forms` array when the event exists and forms are enabled but no published forms exist yet

## 10. Get Published Form For An Event

- Method: `GET`
- URL: `/api/public/events/:eventSlug/forms/:formId`
- Auth: none

Example:

```http
GET /api/public/events/munar-launch-event/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677
```

### Success Response

Returns:

- basic event metadata
- the published form definition
- event-level `formSettings`
- event-level branding

### Backend Rules

- event must exist
- `event.settings.modulesEnabledJson.forms` must be `true`
- form must belong to the event
- form must have `status = PUBLISHED`

### Frontend Notes

- this is the public endpoint to render a shareable form page
- the route uses `formId`, not a form slug

## Submission Endpoints

## 11. Submit A Form

- Method: `POST`
- URL: `/api/forms/:formId/submissions`
- Auth: optional

Example:

```http
POST /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/submissions
Content-Type: application/json
```

### Request Payload

```json
{
  "answersJson": {
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "ticketCount": 2,
    "mealPreference": "Veg"
  }
}
```

### Success Response

Returns the created `FormSubmission` record.

Example:

```json
{
  "id": "2f62a5e0-b453-4c61-b4e2-ea279af74367",
  "formId": "9d36a233-920d-4b3d-a0cf-0ee7cf25f677",
  "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "submittedByUserId": null,
  "status": "SUBMITTED",
  "answersJson": {
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "ticketCount": 2,
    "mealPreference": "Veg"
  },
  "scoringJson": null,
  "paymentStatus": null,
  "createdAt": "2026-04-04T12:10:00.000Z",
  "updatedAt": "2026-04-04T12:10:00.000Z"
}
```

### Backend Rules

- form must exist
- form status must be `PUBLISHED`
- guest submissions are allowed
- if a valid bearer token is supplied, the backend can still associate the submission to that user
- if `scheduleJson.opensAt` exists and now is before it, submission fails
- if `scheduleJson.closesAt` exists and now is after it, submission fails
- `answersJson` must be an object
- answers are validated against the form schema

### Submission Validation Rules

The backend currently validates these field types explicitly:

- `text`
- `textarea`
- `email`
- `number`
- `boolean`
- `select`

Validation behavior:

- required fields reject `undefined`, `null`, and empty string `""`
- `text` and `textarea` must be strings
- `email` must be a valid email string
- `number` must be a JSON number
- `boolean` must be a JSON boolean
- `select` must be a string
- if a `select` field includes `options`, the submitted value must be one of them

### Important Validation Limitation

The backend does not currently enforce submission validation for unknown field types.

That means:

- a field with `type: "radio"` or `type: "checkbox-group"` can exist in `schemaJson`
- but server-side validation will not check its answer format unless the type maps to one of the supported cases above

Frontend recommendation:

- build the form builder around the field types the backend already validates
- if you introduce richer field types in the UI, add frontend-only validation and treat backend validation as incomplete until the API expands

### Schedule Notes

The backend expects `scheduleJson.opensAt` and `scheduleJson.closesAt` as string or number values parseable by JavaScript `Date`.

Frontend recommendation:

- always send ISO datetime strings
- always display schedule times using the event timezone where relevant

### Failure Cases

- `404 NOT_FOUND` if the form does not exist
- `400 VALIDATION_ERROR` if `answersJson` is invalid
- `400 VALIDATION_ERROR` if the form is not published
- `400 VALIDATION_ERROR` if the form is not yet open
- `400 VALIDATION_ERROR` if the form is closed

## 12. List Submissions For A Form

- Method: `GET`
- URL: `/api/forms/:formId/submissions`
- Auth: required

Optional query params:

- `status=<string>`
- `paymentStatus=PENDING|AUTHORIZED|CAPTURED|FAILED|REVERSED|REFUNDED`

Example:

```http
GET /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/submissions?status=SUBMITTED
Authorization: Bearer <access_token>
```

### Success Response

Returns an array of `FormSubmission` records ordered by `createdAt desc`.

### Frontend Notes

- this endpoint is not paginated right now
- export should use the dedicated export endpoint below instead of paging client-side

### Permission Rules

Allowed roles:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `STAFF`

## 13. Export Submissions For A Form

- Method: `GET`
- URL: `/api/forms/:formId/submissions/export?format=csv|xlsx`
- Auth: required

Example:

```http
GET /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/submissions/export?format=csv
Authorization: Bearer <access_token>
```

### Permission Rules

Allowed roles:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `STAFF`

### Backend Behavior

- exports all submissions for the form
- includes metadata columns:
  - `Submission ID`
  - `Submitted At`
  - `Respondent Name`
  - `Respondent Email`
  - `Status`
  - `Payment Status`
- flattens `answersJson` into columns using field labels where available
- duplicate field labels are disambiguated with the field id
- currently supports `csv`
- `xlsx` is reserved in the API contract but currently returns a validation-style business error telling clients to use `csv`

### Response Behavior

- returns a downloadable file attachment
- `Content-Type` is `text/csv; charset=utf-8` for CSV
- `Content-Disposition` includes a generated filename

### Failure Cases

- `404 NOT_FOUND` if the form does not exist
- `403 FORBIDDEN` if the user cannot view submissions for the form
- `400 VALIDATION_ERROR` if `format=xlsx` is requested right now

## 14. Get Form Analytics

- Method: `GET`
- URL: `/api/forms/:formId/analytics`
- Auth: required

Example:

```http
GET /api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/analytics
Authorization: Bearer <access_token>
```

### Permission Rules

Allowed roles:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `STAFF`

### Success Response

```json
{
  "formId": "9d36a233-920d-4b3d-a0cf-0ee7cf25f677",
  "totalSubmissions": 42,
  "completedSubmissions": 39,
  "partialSubmissions": 3,
  "completionRate": 0.9285714286,
  "submissionsByDay": [
    {
      "date": "2026-04-01",
      "count": 12
    },
    {
      "date": "2026-04-02",
      "count": 30
    }
  ],
  "paymentSummary": {
    "countsByStatus": {
      "CAPTURED": 35,
      "FAILED": 2,
      "UNPAID": 5
    },
    "paidSubmissions": 35,
    "refundedSubmissions": 0,
    "failedPayments": 2
  },
  "fieldSummaries": [
    {
      "fieldId": "mealPreference",
      "label": "Meal preference",
      "type": "select",
      "responses": 40,
      "counts": {
        "Veg": 12,
        "Chicken": 20,
        "Fish": 8
      }
    }
  ]
}
```

### Backend Behavior

- `completedSubmissions` is inferred by checking whether all required fields in the schema have non-empty answers
- `partialSubmissions` is the remaining count
- `completionRate = completedSubmissions / totalSubmissions`
- `paymentSummary` is returned only when the form payment config indicates a paid form
- `fieldSummaries` currently cover choice-style fields the backend can summarize directly:
  - `select`
  - `boolean`

### Failure Cases

- `404 NOT_FOUND` if the form does not exist
- `403 FORBIDDEN` if the user cannot view submissions for the form

## 15. Get Submission By Id

- Method: `GET`
- URL: `/api/form-submissions/:submissionId`
- Auth: required

Example:

```http
GET /api/form-submissions/2f62a5e0-b453-4c61-b4e2-ea279af74367
Authorization: Bearer <access_token>
```

### Success Response

Returns the submission record including its related form and event.

Frontend note:

- use this for submission detail pages in the dashboard

## 16. Delete Submission

- Method: `DELETE`
- URL: `/api/form-submissions/:submissionId`
- Auth: required

Example:

```http
DELETE /api/form-submissions/2f62a5e0-b453-4c61-b4e2-ea279af74367
Authorization: Bearer <access_token>
```

### Permission Rules

Allowed roles:

- `OWNER`
- `ADMIN`

### Backend Behavior

- this is a hard delete
- an audit log entry is created with action `form.submission.deleted`
- paid or settled submissions cannot be deleted
- the backend currently blocks deletion when `paymentStatus` is:
  - `AUTHORIZED`
  - `CAPTURED`
  - `REVERSED`
  - `REFUNDED`

### Success Response

```json
{
  "success": true,
  "deleted": true,
  "id": "2f62a5e0-b453-4c61-b4e2-ea279af74367"
}
```

### Product Risk

- deletion is permanent because submissions are not soft-deleted
- for compliance, support, or reporting-sensitive workflows, archive-like behavior may still be preferable in the future

### Failure Cases

- `404 NOT_FOUND` if the submission does not exist
- `403 FORBIDDEN` if the user lacks deletion permission
- `400 VALIDATION_ERROR` if the submission has a protected paid/settled payment status

## Schema Format The Frontend Should Use

The backend only requires each field to have:

- `id`
- `type`

It also understands these optional properties today:

- `label`
- `required`
- `options`

Recommended frontend field shape:

```ts
export type SupportedFormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'boolean'
  | 'select';

export type FormFieldDefinition = {
  id: string;
  type: SupportedFormFieldType;
  label?: string;
  required?: boolean;
  options?: string[];
};

export type FormSchema = {
  fields: FormFieldDefinition[];
};
```

Recommended example:

```json
{
  "fields": [
    {
      "id": "fullName",
      "type": "text",
      "label": "Full name",
      "required": true
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email",
      "required": true
    },
    {
      "id": "bio",
      "type": "textarea",
      "label": "Short bio"
    },
    {
      "id": "attendingDinner",
      "type": "boolean",
      "label": "Attending dinner?"
    },
    {
      "id": "mealPreference",
      "type": "select",
      "label": "Meal preference",
      "options": ["Veg", "Chicken", "Fish"]
    }
  ]
}
```

## Renderer Mapping Recommendation

The frontend renderer should map backend field types like this:

- `text` -> single-line text input
- `textarea` -> multi-line textarea
- `email` -> email input
- `number` -> numeric input
- `boolean` -> checkbox or toggle
- `select` -> select dropdown

Recommended answer payload shape:

- use the field `id` as the object key
- submit plain JSON values
- do not wrap each answer in nested metadata unless the backend is extended

Example:

```json
{
  "answersJson": {
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "bio": "Mathematician and writer",
    "attendingDinner": true,
    "mealPreference": "Veg"
  }
}
```

## JSON Blocks The Frontend Can Store

The backend stores these objects without additional backend validation beyond object shape:

- `logicJson`
- `paymentConfigJson`
- `scheduleJson`
- `accessControlJson`
- `brandingJson`

That means the frontend can design richer internal structures here, but should do so intentionally.

Recommended rule:

- treat these as frontend-owned configs until the backend adds stronger contracts

### Suggested Shapes

These are recommendations, not enforced backend contracts.

```ts
export type FormScheduleConfig = {
  opensAt?: string;
  closesAt?: string;
};

export type FormBrandingConfig = {
  primaryColor?: string;
  accentColor?: string;
  submitButtonText?: string;
  successMessage?: string;
};

export type FormAccessControlConfig = {
  requiresAuth?: boolean;
  allowedRoles?: string[];
};

export type FormPaymentConfig = {
  enabled?: boolean;
  amountMinor?: number;
  currency?: string;
};
```

## Recommended Frontend Types

```ts
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type FormType = 'REGISTRATION' | 'SURVEY' | 'CUSTOM';

export type SupportedFormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'boolean'
  | 'select';

export type FormFieldDefinition = {
  id: string;
  type: SupportedFormFieldType;
  label?: string;
  required?: boolean;
  options?: string[];
};

export type FormSchema = {
  fields: FormFieldDefinition[];
};

export type CreateFormPayload = {
  title: string;
  formType: FormType;
  schemaJson: FormSchema;
  logicJson?: Record<string, unknown>;
  paymentConfigJson?: Record<string, unknown>;
  scheduleJson?: {
    opensAt?: string;
    closesAt?: string;
  };
  accessControlJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
};

export type UpdateFormPayload = Partial<CreateFormPayload>;

export type SubmitFormPayload = {
  answersJson: Record<string, unknown>;
};
```

## Suggested Dashboard Flow

### Create/Edit Form Builder

Recommended UI flow:

1. Fetch the event.
2. Read `event.settings?.modulesEnabledJson?.forms` to decide whether to show forms as enabled in product UI.
3. List forms with `GET /api/events/:eventId/forms`.
4. Open one form with `GET /api/forms/:formId`.
5. Edit title, type, schema, schedule, branding, and optional config JSON blocks.
6. Save draft with `PATCH /api/forms/:formId`.
7. Publish with `POST /api/forms/:formId/publish`.

### Submissions Dashboard

Recommended UI flow:

1. Open a form from the forms list.
2. Fetch submissions with `GET /api/forms/:formId/submissions`.
3. Filter by `status` and `paymentStatus` when needed.
4. Open one submission with `GET /api/form-submissions/:submissionId`.

## Suggested Submission Flow

For a renderer or embed frontend:

1. Obtain the form definition.
2. Render fields from `schemaJson.fields`.
3. Validate on the client before submit.
4. Send `POST /api/forms/:formId/submissions` with `answersJson`.
5. Show success state from the returned submission object.

For reporting/admin workflows:

1. List submissions with `GET /api/forms/:formId/submissions`.
2. Export all submissions with `GET /api/forms/:formId/submissions/export?format=csv`.
3. Read dashboard metrics with `GET /api/forms/:formId/analytics`.

Important:

- for public event pages, use `GET /api/public/events/:eventSlug/forms`
- for a shareable form page, use `GET /api/public/events/:eventSlug/forms/:formId`
- guest submissions are supported on `POST /api/forms/:formId/submissions`

## Error Response Format

Validation errors use the shared API format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "title",
      "errors": ["title must be longer than or equal to 2 characters"],
      "children": []
    }
  ],
  "timestamp": "2026-04-04T12:20:00.000Z",
  "path": "/api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/forms",
  "requestId": "req_abc123def4"
}
```

Business-rule failures are usually shaped like:

```json
{
  "statusCode": 400,
  "message": "This form is not open for submissions",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-04-04T12:20:00.000Z",
  "path": "/api/forms/9d36a233-920d-4b3d-a0cf-0ee7cf25f677/submissions",
  "requestId": "req_abc123def4"
}
```

Other common cases:

- `401 UNAUTHORIZED` when auth is missing on a protected route
- `403 FORBIDDEN` when the user is in the tenant but lacks permission
- `404 NOT_FOUND` when the event, form, or submission does not exist

## Frontend Assumptions To Keep

The frontend should assume the following are true today:

- forms are identified by `formId`, not slug
- builder APIs are authenticated
- public discovery is event-slug-based, not form-slug-based
- backend-supported field validation is intentionally narrow
- JSON config blocks are mostly pass-through storage today
- there is no pagination on forms or submissions
- submission export currently supports CSV only

## Backend Gaps The Frontend Team Should Know About

The core public forms flow now exists, but there are still some backend gaps worth keeping in mind:

- forms still use `formId` in public routes because there is no form slug yet
- archived forms cannot currently be reopened through an endpoint
- public availability depends on `event.settings.modulesEnabledJson.forms === true`
- `formSettingsJson`, `logicJson`, `paymentConfigJson`, and `accessControlJson` are still mostly frontend-owned contracts

If the product needs richer form-builder capabilities, the backend will also need stronger contracts for:

- conditional logic
- payment configuration
- access control
- custom field types
- multi-select fields
- file uploads
- scoring
- submission status transitions
