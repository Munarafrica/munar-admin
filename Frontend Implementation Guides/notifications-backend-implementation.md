# Notifications Backend Implementation Handoff

Status: Planning / backend handoff
Date: 2026-04-13
Owner: Backend team

## Goal

Implement a consistent notification system for Munar actions that need user-visible follow-up, including in-app notifications and email notifications.

The frontend already has:

- A generic notification inbox service that reads `GET /notifications/me` and marks items as read with `PATCH /notifications/:recipientId/read`.
- A top-bar in-app inbox that expects notification payloads with a `title` and `body`.
- A notification preferences screen that currently supports email toggles and digest frequency.
- A separate finance notification panel that can either remain finance-specific or be folded into the generic notification system.

This document lists the notification types, trigger actions, recipients, channels, and implementation expectations for backend support.

## Current Frontend Contract

The generic in-app inbox expects recipient rows shaped like:

```ts
type NotificationRecipient = {
  id: string;
  notificationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: 'PENDING' | 'SENT' | 'READ' | 'FAILED';
  notification: {
    id: string;
    tenantId: string | null;
    eventId: string | null;
    channel: 'IN_APP' | 'EMAIL';
    templateKey: string;
    payloadJson: {
      title?: string;
      body?: string;
      [key: string]: unknown;
    };
    status: 'PENDING' | 'SENT' | 'FAILED';
    scheduledFor: string | null;
    sentAt: string | null;
    createdAt: string;
  };
};
```

Existing endpoints used by the frontend:

```http
GET /notifications/me
GET /notifications/me?status=SENT
PATCH /notifications/:recipientId/read
```

Recommended additions:

```http
GET /notifications/me?status=UNREAD&eventId=&limit=&cursor=
PATCH /notifications/:recipientId/read
PATCH /notifications/read-all
GET /settings/notifications
PUT /settings/notifications
```

## Recommended Data Model

Use the backend's existing naming conventions where they differ, but keep these responsibilities:

```ts
type NotificationChannel = 'IN_APP' | 'EMAIL';
type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
type RecipientStatus = 'PENDING' | 'SENT' | 'READ' | 'FAILED';

type Notification = {
  id: string;
  tenantId: string | null;
  eventId: string | null;
  actorUserId: string | null;
  channel: NotificationChannel;
  templateKey: NotificationTemplateKey;
  payloadJson: Record<string, unknown>;
  status: NotificationStatus;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type NotificationRecipient = {
  id: string;
  notificationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: RecipientStatus;
  readAt: string | null;
  sentAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type NotificationPreference = {
  userId: string;
  type: NotificationPreferenceType;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: 'instant' | 'daily' | 'weekly';
};
```

## Delivery Rules

- Create in-app notifications for organizer/admin operational events by default.
- Send email only when the action is transactional, security-sensitive, payment-related, time-sensitive, or explicitly user-facing.
- Respect user preferences for non-critical emails.
- Do not suppress security, password, verification, payment receipt, payout failure, or account deletion emails with marketing/product preference toggles.
- Deduplicate noisy notifications. For example, do not email every website autosave, every gallery visibility toggle, or every section text edit.
- Store enough `payloadJson` for the frontend to render a title/body and navigate to the relevant event/module.
- Include `tenantId` and `eventId` where applicable for access control and filtering.
- Prefer idempotent notification enqueueing for payment callbacks and webhooks. For example, a repeated `ticket_order_paid` webhook should not send duplicate receipts.
- For digests, store individual notification events and group email delivery by user preference.

## Recipient Groups

Use helper resolvers so modules do not duplicate recipient logic:

```ts
getTenantOwnersAndAdmins(tenantId)
getTenantFinanceUsers(tenantId)
getEventOrganizers(eventId)
getEventStaff(eventId)
getTicketOrderRecipients(ticketOrderId)
getEventAttendees(eventId)
getFormRespondent(formSubmissionId)
getMerchOrderBuyer(merchOrderId)
getVotingParticipants(campaignId)
```

Recommended role mapping:

- Organizer/admin operations: tenant `OWNER`, `ADMIN`, and relevant `EDITOR`.
- Finance operations: tenant `OWNER`, `ADMIN`, and `FINANCE`.
- Check-in / validation operations: tenant `OWNER`, `ADMIN`, and relevant `STAFF`.
- Buyer receipts: buyer email and ticket recipient delivery emails.
- Public form confirmations: respondent email, when provided.

## Template Payload Shape

Every template should provide these generic fields:

```ts
type NotificationPayload = {
  title: string;
  body: string;
  actionUrl?: string;
  actorName?: string;
  tenantId?: string;
  eventId?: string;
  eventName?: string;
  module?: string;
  entityId?: string;
  entityName?: string;
  amountMinor?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};
```

The frontend can render `title` and `body` immediately. `actionUrl`, `module`, and `entityId` can be used later for deep linking.

## Notification Preference Types

The frontend currently has these broad preferences:

```ts
type NotificationPreferenceType =
  | 'ticket_sold'
  | 'new_attendee'
  | 'event_published'
  | 'refund_processed'
  | 'payout_completed'
  | 'event_reminder'
  | 'product_updates'
  | 'marketing_tips';
```

Recommended expanded preference groups:

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
```

Keep the existing preference keys as aliases if older clients are using them.

## Template Keys By Module

### Auth and Account

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `auth_email_verification` | User signs up | New user | Email | Contains verification link. |
| `auth_email_verification_resent` | User requests resend | User | Email | Same token behavior as verification. |
| `auth_password_reset_requested` | Forgot password | User | Email | Contains reset link. |
| `auth_password_changed` | Password changed | User | Email, in-app | Security-sensitive. |
| `auth_login_alert` | New/suspicious login when login alerts enabled | User | Email, in-app | Include device/location/IP where available. |
| `auth_session_revoked` | Session revoked | User | Email, in-app | Do not send for routine logout. |
| `account_deletion_initiated` | Account deletion started | User | Email | Existing UI tells user to expect a confirmation email. |

### Tenant and Organization

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `tenant_created` | Workspace/tenant created | Owner/admins | In-app | Email optional. |
| `organization_profile_updated` | Organization branding/profile changed | Owner/admins | In-app | Low priority. |
| `organization_deleted` | Organization deleted | Owner/admins | Email, in-app | Sensitive/destructive. |

### Events

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `event_created` | Event created | Organizer/admins | In-app | Low priority. |
| `event_details_updated` | Event details changed while unpublished | Organizer/admins | In-app | No attendee email. |
| `event_public_details_changed` | Published event date/time/venue changed | Registered attendees, organizer/admins | Email to attendees, in-app to admins | Important attendee-facing update. |
| `event_published` | Event published | Organizer/admins | In-app, optional email | Existing preference key. |
| `event_unpublished` | Event unpublished/archived | Organizer/admins, affected attendees when needed | In-app, email for affected attendees | Use judgement based on sales/registration state. |
| `event_deleted` | Event deleted | Organizer/admins | Email, in-app | Destructive. |
| `event_cloned` | Event cloned | Organizer | In-app | Low priority. |
| `event_reminder` | Reminder before event starts | Attendees | Email, optional in-app | Existing preference key. |
| `event_started` | Event begins | Organizer/admins | In-app | Optional. |
| `event_ended` | Event ends | Organizer/admins | In-app | Optional. |

### Tickets

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `ticket_type_created` | Ticket type created | Organizer/admins | In-app | Operational. |
| `ticket_type_updated` | Ticket type updated | Organizer/admins | In-app | If public sale details change, consider attendee email. |
| `ticket_type_deleted` | Ticket type deleted | Organizer/admins | In-app | Destructive. |
| `ticket_sales_opened` | Ticket status changes to on sale | Organizer/admins | In-app | Optional marketing email if explicit. |
| `ticket_sales_paused` | Ticket sales paused | Organizer/admins | In-app | Operational. |
| `ticket_sold_out` | Ticket inventory reaches zero | Organizer/admins | In-app, optional email | Useful operational alert. |
| `ticket_order_reserved` | Ticket order created/reserved | Buyer | Email, optional in-app | Include reservation expiry. |
| `ticket_reservation_expiring` | Reservation near expiry | Buyer | Email | Scheduled notification. |
| `ticket_order_confirmed_paid` | Payment confirmed or free order confirmed | Buyer and ticket recipients | Email, in-app if logged in | Include ticket details/QR/deep link. Existing mock uses this key. |
| `ticket_order_payment_failed` | Payment failed/expired | Buyer | Email, optional in-app | Include retry link when available. |
| `ticket_sold` | Ticket sold | Organizer/admins | In-app, optional email | Existing preference key. |
| `new_attendee` | New attendee created | Organizer/admins | In-app, optional email | Existing preference key. |
| `attendee_checked_in` | Attendee checked in | Organizer/staff | In-app | Useful for audit/ops. |
| `attendee_checkin_reversed` | Check-in undone | Organizer/staff | In-app | Audit. |
| `ticket_qr_invalid` | Invalid/already-used QR scanned | Staff/admins | In-app | Staff-facing alert. |
| `ticket_question_changed` | Checkout question created/updated/deleted | Organizer/admins | In-app | No email. |

### Program Management

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `program_speaker_added` | Speaker added | Organizer/admins | In-app | Email speaker later if speaker contact is stored. |
| `program_speaker_updated` | Speaker changed | Organizer/admins, speaker if contact exists | In-app, optional email | Email only if public-facing details changed. |
| `program_speaker_removed` | Speaker removed | Organizer/admins, speaker if contact exists | In-app, optional email | |
| `program_session_added` | Session added | Organizer/admins | In-app | |
| `program_session_updated` | Published session changed | Organizer/admins, affected speakers/attendees if applicable | In-app, optional email | Important when time/location changes. |
| `program_session_deleted` | Session deleted | Organizer/admins, affected speakers/attendees if applicable | In-app, optional email | |
| `program_session_starting_soon` | Scheduled reminder | Speakers, bookmarked/registered attendees | Email/in-app | Only when attendee schedule features exist. |

### Forms

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `form_created` | Form created | Organizer/admins | In-app | |
| `form_updated` | Form updated | Organizer/admins | In-app | |
| `form_published` | Form published | Organizer/admins, eligible respondents if explicitly enabled | In-app, optional email | |
| `form_closed` | Form closed | Organizer/admins | In-app | |
| `form_archived` | Form archived | Organizer/admins | In-app | |
| `form_deleted` | Form deleted | Organizer/admins | In-app | |
| `form_submission_received` | Public/authenticated form submitted | Organizer/admins | In-app, optional email | Include form title and respondent. |
| `form_submission_confirmation` | Form submitted | Respondent | Email | Send when respondent email exists. |
| `form_payment_confirmed` | Paid form payment succeeds | Respondent, organizer/admins | Email, in-app | If paid forms are enabled. |
| `form_payment_failed` | Paid form payment fails | Respondent | Email, optional in-app | |
| `form_export_ready` | Response export ready | Requesting organizer | In-app, optional email | Include download link. |

### Merchandise

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `merch_product_created` | Product created | Organizer/admins | In-app | |
| `merch_product_updated` | Product updated | Organizer/admins | In-app | |
| `merch_product_published` | Product status active | Organizer/admins | In-app | Customer email only for explicit product campaigns. |
| `merch_product_archived` | Product archived | Organizer/admins | In-app | |
| `merch_product_deleted` | Product deleted | Organizer/admins | In-app | |
| `merch_low_stock_alert` | Inventory crosses threshold | Organizer/admins | In-app, optional email | Use per-product threshold or default threshold. |
| `merch_out_of_stock` | Product/variant reaches zero | Organizer/admins | In-app, optional email | |
| `merch_restocked` | Inventory restocked from zero/low | Organizer/admins | In-app | |
| `merch_order_created` | Merch order created | Buyer, organizer/admins | Email to buyer, in-app to admins | |
| `merch_payment_confirmed` | Merch payment confirmed | Buyer, organizer/admins | Email, in-app | |
| `merch_payment_failed` | Merch payment failed | Buyer | Email, optional in-app | |
| `merch_fulfillment_updated` | Fulfillment status changes | Buyer, organizer/admins | Email to buyer, in-app to admins | Include status: ready/completed/cancelled. |
| `merch_order_cancelled` | Order cancelled | Buyer, organizer/admins | Email, in-app | |
| `merch_refund_processed` | Refund processed | Buyer, finance users | Email, in-app | Alias preference to `refund_processed`. |

### Voting

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `voting_campaign_created` | Campaign created | Organizer/admins | In-app | |
| `voting_campaign_updated` | Campaign updated | Organizer/admins | In-app | |
| `voting_campaign_deleted` | Campaign deleted | Organizer/admins | In-app | |
| `voting_campaign_published` | Campaign published | Organizer/admins, voters/attendees if opted in | In-app, optional email | |
| `voting_campaign_unpublished` | Campaign unpublished | Organizer/admins | In-app | |
| `voting_campaign_started` | Campaign starts | Organizer/admins, voters if configured | In-app, optional email | Honor `notifyOnVotingStart`. |
| `voting_campaign_paused` | Campaign paused | Organizer/admins | In-app | |
| `voting_campaign_resumed` | Campaign resumed | Organizer/admins | In-app | |
| `voting_campaign_ended` | Campaign ends | Organizer/admins, voters if configured | In-app, optional email | Honor `notifyOnVotingEnd`. |
| `voting_round_started` | Round starts | Organizer/admins, voters if configured | In-app, optional email | |
| `voting_round_ended` | Round ends | Organizer/admins, voters if configured | In-app, optional email | |
| `voting_contestants_advanced` | Contestants advanced to next round | Organizer/admins, contestants if contact exists | In-app, optional email | |
| `voting_category_changed` | Category created/updated/deleted | Organizer/admins | In-app | |
| `voting_contestant_changed` | Contestant created/updated/deleted | Organizer/admins | In-app | |
| `vote_cast` | Vote cast | Voter | In-app optional | Usually no email for free vote. |
| `vote_package_purchase_started` | Paid vote package purchase initialized | Voter | Email optional | Avoid noise if payment page handles it. |
| `vote_package_purchase_confirmed` | Paid vote/vote package payment succeeds | Voter | Email, in-app if logged in | Receipt. |
| `vote_package_purchase_failed` | Paid vote payment fails | Voter | Email optional | Include retry link. |
| `voting_results_published` | Results released | Organizer/admins, voters if configured | In-app, optional email | Honor `notifyVotersOfResults`. |
| `voting_results_export_ready` | Results export ready | Requesting organizer | In-app, optional email | |

### Sponsors

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `sponsor_created` | Sponsor added | Organizer/admins | In-app | |
| `sponsor_updated` | Sponsor changed | Organizer/admins | In-app | |
| `sponsor_deleted` | Sponsor deleted | Organizer/admins | In-app | |
| `sponsor_visibility_changed` | Sponsor shown/hidden | Organizer/admins | In-app | |
| `sponsor_order_changed` | Sponsor reordered | Organizer/admins | In-app | Low priority; can be audit-only. |

### Website Builder

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `website_published` | Event website published | Organizer/admins | In-app, optional email | |
| `website_unpublished` | Event website unpublished | Organizer/admins | In-app | |
| `website_asset_upload_failed` | Image upload or finalize fails | User/editor | In-app | |
| `website_domain_connected` | Custom domain connected | Organizer/admins | Email, in-app | If domain support exists. |
| `website_domain_failed` | Custom domain verification fails | Organizer/admins | Email, in-app | If domain support exists. |

Avoid notifications for normal autosave, section edits, section reorder, and preview actions.

### Gallery

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `gallery_media_uploaded` | Media uploaded | Organizer/admins | In-app | Batch multiple files into one notification. |
| `gallery_media_deleted` | Media deleted | Organizer/admins | In-app | |
| `gallery_media_featured` | Media marked featured/unfeatured | Organizer/admins | In-app | Low priority; can be audit-only. |
| `gallery_media_visibility_changed` | Media shown/hidden | Organizer/admins | In-app | Low priority; can be audit-only. |
| `gallery_updated` | Public gallery meaningfully updated | Organizer/admins, attendees if campaign enabled | In-app, optional email | Use sparingly. |

### DP and Cover Maker

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `dp_cover_maker_published` | Frame/config published | Organizer/admins | In-app, optional email | |
| `dp_cover_maker_updated` | Published config changed | Organizer/admins | In-app | |
| `dp_cover_maker_asset_upload_failed` | Frame upload fails | User/editor | In-app | |

Do not notify organizers for every public DP download/share by default. Track those as analytics events unless product explicitly asks for engagement alerts.

### Analytics and Reports

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `analytics_export_ready` | Analytics export generated | Requesting user | In-app, optional email | Include download URL. |
| `analytics_export_failed` | Analytics export failed | Requesting user | In-app, optional email | |
| `analytics_report_scheduled` | Scheduled report created | Requesting user | In-app | |
| `analytics_scheduled_report_sent` | Scheduled report delivery | Report recipients | Email | |
| `analytics_alert_threshold_crossed` | Sales/check-in/engagement threshold crossed | Organizer/admins | In-app, optional email | Use alert settings. |

### Finance

The frontend currently has separate finance notification types:

```ts
type FinanceNotificationType =
  | 'payout_scheduled'
  | 'payout_completed'
  | 'payout_failed'
  | 'bank_account_verified'
  | 'dispute_resolved'
  | 'refund_processed';
```

Recommended template keys:

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `payout_scheduled` | Payout scheduled | Finance users/owners | In-app, optional email | Existing finance type. |
| `payout_completed` | Payout completed | Finance users/owners | In-app, email | Existing preference key. |
| `payout_failed` | Payout failed | Finance users/owners | In-app, email | Critical. |
| `bank_account_added` | Bank account added | Finance users/owners | In-app, email | Sensitive. |
| `bank_account_verified` | Bank account verified | Finance users/owners | In-app, email | Existing finance type. |
| `bank_account_deleted` | Bank account removed | Finance users/owners | In-app, email | Sensitive. |
| `bank_account_default_changed` | Default bank changed | Finance users/owners | In-app, email | Sensitive. |
| `dispute_created` | Finance dispute created | Finance users/owners | In-app, optional email | |
| `dispute_resolved` | Finance dispute resolved | Finance users/owners | In-app, email | Existing finance type. |
| `refund_processed` | Refund processed | Buyer if relevant, finance users/owners | Email to buyer, in-app/email to finance | Existing preference key. |

### Settings

| Template key | Trigger | Recipient | Channel | Notes |
|---|---|---|---|---|
| `notification_preferences_updated` | Notification preferences saved | User | In-app only or toast only | No email needed. |
| `data_export_requested` | Data export requested | Requesting user | In-app | |
| `data_export_ready` | Data export completed | Requesting user | In-app, optional email | Include download link. |
| `data_export_failed` | Data export failed | Requesting user | In-app, optional email | |
| `security_settings_updated` | Login alerts/2FA settings changed | User | Email, in-app | Security-sensitive. |
| `appearance_updated` | Theme changed | User | None | Do not notify. |

## Implementation Steps

1. Add or confirm notification tables for notifications and recipients.
2. Add template registry containing `templateKey`, default `title`, default `body`, supported channels, preference group, and whether it is critical.
3. Add an enqueue service:

```ts
enqueueNotification({
  tenantId,
  eventId,
  actorUserId,
  templateKey,
  recipients,
  payload,
  channels,
  scheduledFor,
  idempotencyKey,
});
```

4. Add recipient resolver helpers for event organizers, finance users, attendees, buyers, respondents, and voters.
5. Add delivery workers for email and in-app notifications.
6. Add preference filtering for non-critical notifications.
7. Add digest processing for users with daily/weekly digest preferences.
8. Add idempotency keys for webhook-driven notifications, especially payments, refunds, and payouts.
9. Add notification calls to module service methods and webhook handlers.
10. Add tests for each critical notification trigger.

## Idempotency Recommendations

Use deterministic keys for payment and webhook notifications:

```txt
ticket_order_confirmed_paid:{ticketOrderId}
ticket_order_payment_failed:{ticketOrderId}:{paymentTransactionId}
merch_payment_confirmed:{merchOrderId}
merch_payment_failed:{merchOrderId}:{paymentTransactionId}
vote_package_purchase_confirmed:{paymentIntentId}
refund_processed:{refundId}
payout_completed:{payoutId}
payout_failed:{payoutId}
form_submission_received:{formSubmissionId}
data_export_ready:{exportId}
analytics_export_ready:{exportId}
```

For admin CRUD notifications, idempotency can be less strict, but avoid repeated emails on autosaves or repeated patch requests with no meaningful change.

## Priority Rollout

Phase 1: Core transactional notifications

- Auth verification/reset/password changed.
- Ticket order confirmed/payment failed/reservation expiring.
- Event public details changed.
- Form submission received/confirmation.
- Merch order/payment/fulfillment/refund.
- Voting paid vote purchase confirmed and results published.
- Finance payout failed/completed and bank account changes.
- Data/analytics export ready.

Phase 2: Operational in-app notifications

- Event created/published/unpublished/deleted.
- Ticket type CRUD and check-in events.
- Program speaker/session changes.
- Form lifecycle changes.
- Product inventory alerts.
- Voting lifecycle changes.
- Website/gallery/DP publish events.

Phase 3: Optional engagement and marketing notifications

- Gallery updated emails.
- DP maker campaign announcements.
- Product update campaigns.
- Voting start/end/reminder emails to voters/attendees.
- Scheduled analytics threshold alerts.

## Acceptance Criteria

- `GET /notifications/me` returns unread in-app notifications with `title` and `body` in `payloadJson`.
- `PATCH /notifications/:recipientId/read` marks a single recipient notification as read.
- Critical emails are sent regardless of digest frequency.
- Non-critical emails respect user preferences and digest frequency.
- Payment webhook notifications are idempotent.
- Event-scoped notifications include `eventId` and `tenantId`.
- Destructive and security-sensitive actions generate audit-friendly notifications.
- Frontend can continue using existing inbox UI without breaking changes.
