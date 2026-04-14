# Settings / Profile Management Frontend Guide

This guide maps the current frontend settings screens to the backend that exists today and the backend gaps that should be added before the settings area can be considered complete.

## Screenshot-Derived Settings Areas

The attached screenshots show a `/settings` page with these sections:

- Account Profile: personal information.
- Organization: manage organization details.
- Notifications: email preferences.
- Security: password and sessions.
- Data & Exports: download user or event data; the visible panel includes `Export Configuration`, `Select Event`, and export format choices such as CSV and Excel.

## Backend Status

There is no dedicated global `SettingsModule` or `/settings/*` controller in the backend yet.

Implemented pieces that the frontend can use now:

| Frontend area | Current backend support | Endpoint |
|---|---|---|
| Current user profile read | Yes | `GET /auth/me` |
| Two-factor settings | Yes | `GET /auth/2fa-settings`, `PATCH /auth/2fa-settings` |
| Organization read/update | Yes, tenant-level | `GET /tenants/:tenantId`, `PATCH /tenants/:tenantId` |
| Organization members/invitations | Yes | `GET /tenants/:tenantId/members`, `GET /tenants/:tenantId/invitations`, `POST /tenants/:tenantId/invitations` |
| Notification inbox | Yes | `GET /notifications/me`, `PATCH /notifications/:recipientId/read`, `PATCH /notifications/read-all` |
| Event settings | Yes, event-scoped | `GET /events/:eventId/settings`, `PATCH /events/:eventId/settings` |
| Form submission CSV export | Yes, form-scoped only | `GET /forms/:formId/submissions/export?format=csv` |

Missing pieces for the screen as designed:

- User profile update endpoint for first name, last name, phone, avatar, and active tenant.
- Change password endpoint for logged-in users.
- Session list and revoke endpoints.
- Login alert preference separate from 2FA.
- Notification preference persistence, including email toggles and digest frequency.
- Global app/account settings endpoint.
- Data export endpoint for the Data & Exports screen, especially event-level exports and XLSX support.
- Account deletion flow.

## Existing API Contracts

### Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

Response shape:

```ts
type CurrentUserResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  userType: 'ORGANISER' | 'ATTENDEE' | 'STAFF' | 'ADMIN';
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorChannel: 'EMAIL' | 'PHONE' | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'FINANCE' | 'STAFF' | 'VIEWER';
    acceptedAt: string | null;
    tenant: {
      id: string;
      slug: string;
      name: string;
      tenantType: 'INDIVIDUAL' | 'ORGANISATION' | 'AGENCY';
      defaultCurrency: string;
      timezone: string;
    };
  }>;
};
```

Use this endpoint to hydrate the settings shell, profile read-only state, and organization selector.

### Two-Factor Settings

```http
GET /auth/2fa-settings
PATCH /auth/2fa-settings
Authorization: Bearer <token>
```

Update payload:

```ts
type UpdateTwoFactorSettingsPayload = {
  enabled: boolean;
  channel?: 'EMAIL' | 'PHONE';
};
```

If the user selects `PHONE`, require a phone number on the frontend. The backend rejects phone 2FA when the user has no phone number.

### Organization Settings

```http
GET /tenants/:tenantId
PATCH /tenants/:tenantId
Authorization: Bearer <token>
```

Update payload:

```ts
type UpdateTenantPayload = {
  name?: string;
  slug?: string;
  tenantType?: 'INDIVIDUAL' | 'ORGANISATION' | 'AGENCY';
  defaultCurrency?: string;
  timezone?: string;
  brandingJson?: Record<string, unknown>;
  settingsJson?: Record<string, unknown>;
};
```

Use this for the Organization section. Treat `Tenant.settingsJson` as the closest existing place for organization-wide app preferences until a dedicated `/settings` module exists.

### Notification Inbox

```http
GET /notifications/me?status=UNREAD&eventId=&limit=&cursor=
PATCH /notifications/:recipientId/read
PATCH /notifications/read-all
Authorization: Bearer <token>
```

Current status values are:

```ts
type NotificationInboxStatus =
  | 'UNREAD'
  | 'PENDING'
  | 'SENT'
  | 'READ'
  | 'FAILED'
  | 'SKIPPED';
```

Important: this is only the in-app notification inbox. It is not notification preferences. The existing notification backend guide proposes `GET /settings/notifications` and `PUT /settings/notifications`, but those endpoints do not currently exist.

### Event Settings

```http
GET /events/:eventId/settings
PATCH /events/:eventId/settings
Authorization: Bearer <token>
```

Payload:

```ts
type UpdateEventSettingsPayload = {
  modulesEnabledJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
  websiteSettingsJson?: Record<string, unknown>;
  ticketingSettingsJson?: Record<string, unknown>;
  formSettingsJson?: Record<string, unknown>;
  merchandisingJson?: Record<string, unknown>;
  financeSettingsJson?: Record<string, unknown>;
};
```

Use event settings only for event-specific configuration, not account-wide profile settings.

### Existing Form Export

```http
GET /forms/:formId/submissions/export?format=csv
Authorization: Bearer <token>
```

The backend currently rejects XLSX for form submissions. Do not show Excel as enabled for this endpoint unless the backend adds XLSX support.

## Recommended Backend Additions

To fully support the settings screens, add a `SettingsModule` with these endpoints:

```http
GET /settings/profile
PATCH /settings/profile
POST /settings/profile/avatar-upload

GET /settings/notifications
PUT /settings/notifications

GET /settings/security
PATCH /settings/security/login-alerts
POST /settings/security/change-password
GET /settings/security/sessions
DELETE /settings/security/sessions/:sessionId
POST /settings/security/sessions/revoke-all

GET /settings/data-exports/options
POST /settings/data-exports
GET /settings/data-exports
GET /settings/data-exports/:exportId/download

POST /settings/account-deletion
POST /settings/account-deletion/confirm
```

Suggested persistence:

- Add `UserSettings` for per-user settings: notification preferences, digest frequency, login alerts, locale, theme, and data export preferences.
- Add profile fields to `User` if needed: `avatarUrl`, `jobTitle`, `bio`, `metadataJson`.
- Add `DataExport` for export requests and generated files.
- Use existing `Tenant.settingsJson` for organization-level preferences or add `TenantSettings` later if it grows.
- Use existing `RefreshToken` records for sessions; expose non-sensitive metadata only.

Suggested notification preference shape:

```ts
type NotificationPreferenceType =
  | 'event_updates'
  | 'event_reminders'
  | 'ticket_sales'
  | 'ticket_checkins'
  | 'forms'
  | 'merch_orders'
  | 'voting'
  | 'sponsors'
  | 'website'
  | 'gallery'
  | 'dp_cover_maker'
  | 'analytics_reports'
  | 'finance'
  | 'security'
  | 'product_updates'
  | 'marketing_tips';

type NotificationPreference = {
  type: NotificationPreferenceType;
  email: boolean;
  inApp: boolean;
  push?: boolean;
};

type NotificationSettingsResponse = {
  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
  preferences: NotificationPreference[];
};
```

Suggested data export shape:

```ts
type DataExportRequest = {
  scope: 'account' | 'tenant' | 'event';
  tenantId?: string;
  eventId?: string;
  format: 'csv' | 'xlsx' | 'json';
  include?: Array<
    | 'profile'
    | 'organization'
    | 'events'
    | 'attendees'
    | 'orders'
    | 'forms'
    | 'analytics'
    | 'finance'
  >;
};

type DataExportRecord = {
  id: string;
  scope: 'account' | 'tenant' | 'event';
  tenantId: string | null;
  eventId: string | null;
  format: 'csv' | 'xlsx' | 'json';
  status: 'queued' | 'processing' | 'ready' | 'failed' | 'expired';
  downloadUrl: string | null;
  createdAt: string;
  expiresAt: string | null;
};
```

## Frontend Implementation Plan

1. Build `/settings` as a tabbed settings shell with the sections from the screenshots: Account Profile, Organization, Notifications, Security, and Data & Exports.
2. Hydrate the page with `GET /auth/me`.
3. For Account Profile, show current user details as editable UI but gate saving behind the missing backend endpoint. If you need a temporary UX, show "Profile editing is coming soon" on submit.
4. For Organization, use the selected tenant from `auth/me.memberships` and wire `GET /tenants/:tenantId` plus `PATCH /tenants/:tenantId`.
5. For Notifications, distinguish inbox from preferences. Preferences are not implemented on the backend; store local draft state only or disable save until `GET/PUT /settings/notifications` exists.
6. For Security, wire 2FA through `GET/PATCH /auth/2fa-settings`. Leave change password, login alerts, and session revoke disabled or behind feature flags until backend endpoints are added.
7. For Data & Exports, list the user's events from `GET /tenants/:tenantId/events`. Do not call the form submission export endpoint unless the user has selected a specific form. Disable XLSX until the backend supports it.
8. Add explicit loading, saving, and error states per section so one failing settings panel does not block the whole settings page.
9. Use optimistic UI only for read/mark notification operations; settings writes should wait for the server response.

## Frontend Prompt

Use this prompt to implement the frontend:

```text
Implement the Munar `/settings` frontend page using the backend contract in `Frontend Implementation Guides/settings_profile_management.md`.

Build a tabbed settings UI with Account Profile, Organization, Notifications, Security, and Data & Exports sections, matching the attached screenshots.

Wire implemented backend endpoints:
- `GET /auth/me` for current user, memberships, and selected tenant context.
- `GET /tenants/:tenantId` and `PATCH /tenants/:tenantId` for Organization settings.
- `GET /auth/2fa-settings` and `PATCH /auth/2fa-settings` for Security 2FA.
- `GET /notifications/me`, `PATCH /notifications/:recipientId/read`, and `PATCH /notifications/read-all` only if the settings area includes notification inbox behavior.
- `GET /tenants/:tenantId/events` to populate the Data & Exports event selector.

Do not invent working calls for missing backend endpoints. For missing features, render the UI with clear disabled or "coming soon" save states:
- Profile update.
- Notification preference persistence and digest frequency.
- Change password.
- Login alerts.
- Session list/revoke.
- Account deletion.
- Account/tenant/event data export generation.
- XLSX export support.

Use typed API helpers, per-section loading/error/saving state, and validate forms client-side. Keep event-specific settings separate from global account settings: only use `GET/PATCH /events/:eventId/settings` when editing event configuration, not account profile settings.
```
