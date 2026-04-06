# Event Analytics Frontend Handoff

## Release Note

Event analytics inconsistency across admin surfaces has been fixed on the backend.

Frontend should now standardize on:

- `GET /api/events/:eventId/analytics`

This endpoint is now the canonical source of truth for event-level analytics.

The old competing summary routes:

- `/api/events/:eventId/analytics/overview`
- `/api/events/:eventId/metrics`

now return the same derived analytics summary for compatibility, but frontend should treat `/analytics` as the long-term primary endpoint.

This guide explains the current backend contract for event-level analytics and the canonical endpoint frontend should use going forward.

It is intended for:

- the event dashboard overview card
- the full analytics page
- any event admin widget that displays event KPIs

## Summary

Backend analytics has been consolidated so frontend can use one canonical endpoint for event-level reporting.

Use this endpoint as the source of truth:

- `GET /api/events/:eventId/analytics`

For backward compatibility, these endpoints now return the same canonical payload:

- `GET /api/events/:eventId/analytics/overview`
- `GET /api/events/:eventId/metrics`

Frontend should still migrate to `/analytics` as the primary endpoint.

## Why This Changed

We found that event analytics numbers were being computed from different sources.

That caused inconsistent values across admin surfaces.

Example:

- Ticket Management showed `1` ticket sold
- Event dashboard overview showed `0` tickets sold

Backend now computes the main event analytics summary from one canonical live-query path instead of relying on separate competing logic.

## Canonical Endpoint

- Method: `GET`
- URL: `/api/events/:eventId/analytics`
- Auth: required

### Supported Query Parameters

- `startDate`
- `endDate`
- `currency`

Example:

```http
GET /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/analytics?startDate=2026-04-01&endDate=2026-04-30
Authorization: Bearer <access_token>
```

## Response Shape

```json
{
  "eventId": "string",
  "currency": "NGN",
  "summary": {
    "registrations": { "value": 0 },
    "websiteViews": { "value": 0 },
    "ticketsSold": { "value": 0 },
    "totalRevenue": {
      "value": 0,
      "unit": "minor",
      "scope": "all_captured_event_transactions"
    },
    "checkIns": { "value": 0 },
    "surveyResponses": { "value": 0 }
  },
  "definitions": {
    "registrations": "Count of submissions to forms with formType REGISTRATION within the selected date range.",
    "websiteViews": "Count of analytics events with eventName \"event.viewed\" within the selected date range.",
    "ticketsSold": "Count of confirmed paid/free ticket units for the event, using ticket order item quantities for paid orders in the selected date range.",
    "totalRevenue": "Sum of CAPTURED payment transaction amountMinor values for the event within the selected date range. Returned in minor currency units and currently includes all captured payment transactions linked to the event.",
    "checkIns": "Count of attendees with checkInStatus CHECKED_IN within the selected date range.",
    "surveyResponses": "Count of submissions to forms with formType SURVEY within the selected date range."
  },
  "source": {
    "endpoint": "/events/:eventId/analytics",
    "derivedEndpoints": [
      "/events/:eventId/analytics/overview",
      "/events/:eventId/metrics"
    ]
  }
}
```

## KPI Definitions

These are now the backend definitions frontend should trust.

### registrations

- count of submissions to forms where `formType = REGISTRATION`
- filtered to the selected date range when date filters are provided

### websiteViews

- count of analytics events where `eventName = event.viewed`
- filtered to the selected date range when date filters are provided

### ticketsSold

- count of confirmed ticket units
- derived from ticket order item quantities
- includes:
  - paid ticket orders with captured transactions
  - free ticket orders that reached confirmed paid state
- this is intended to match live ticket sales/order state more closely than the old lag-prone analytics aggregate path

Important note:

- `ticketsSold` is based on ticket units, not attendee seat count
- for example, one group ticket order item with quantity `1` counts as `1` ticket sold

### totalRevenue

- sum of payment transaction `amountMinor` values where `status = CAPTURED`
- filtered to the selected date range when date filters are provided

Important note:

- this is returned in minor currency units
- for NGN, `268750` means `₦2,687.50`
- this is based on captured/settled payment transaction state, not pending payment attempts
- this currently includes all captured payment transactions linked to the event, not only ticket payments
- this figure is VAT-inclusive where the underlying captured transaction amount was VAT-inclusive

Frontend display recommendation:

- do not label this KPI simply as `Revenue` if users may interpret it as net earnings
- preferred labels:
  - `Gross Revenue`
  - `Total Collected`
- if product needs more financial clarity later, frontend can separately display:
  - VAT
  - net revenue
  - payout amount

### checkIns

- count of attendees where `checkInStatus = CHECKED_IN`
- filtered to the selected date range when date filters are provided

### surveyResponses

- count of submissions to forms where `formType = SURVEY`
- filtered to the selected date range when date filters are provided

## Endpoint Compatibility

These routes now use the same canonical analytics summary logic:

- `GET /api/events/:eventId/analytics`
- `GET /api/events/:eventId/analytics/overview`
- `GET /api/events/:eventId/metrics`

That means frontend should no longer see different KPI values between those surfaces due to separate backend computations.

## Frontend Recommendation

Please standardize all event analytics UI on:

- `GET /api/events/:eventId/analytics`

Recommended mapping:

- dashboard overview card
  - `summary.registrations.value`
  - `summary.websiteViews.value`
  - `summary.ticketsSold.value`
  - `summary.totalRevenue.value`
  - `summary.checkIns.value`
  - `summary.surveyResponses.value`

- analytics page
  - same `summary` object

- any event summary widgets
  - same `summary` object

## Migration Guidance

If existing frontend still calls:

- `/api/events/:eventId/metrics`
- `/api/events/:eventId/analytics/overview`

it will still work for now because backend returns the same canonical analytics summary from those routes.

But the intended long-term source of truth is:

- `/api/events/:eventId/analytics`

## Important Notes

### 1. ticketsSold is unit-based

`ticketsSold` reflects ticket order item quantity, not attendee expansion count.

So:

- 2 single tickets = `2`
- 1 couple/group ticket with quantity `1` = `1`

This is intentional because it follows ticket sale units used by ticket order records.

### 2. totalRevenue is captured-only

`totalRevenue` only includes captured payment transactions.

It does not include:

- pending transactions
- abandoned attempts
- failed attempts

### 3. websiteViews depends on analytics event tracking

`websiteViews` depends on `event.viewed` analytics events being emitted correctly.

If frontend/public website tracking does not emit those events, this KPI can remain low or zero.

### 4. Survey and registration are form-type based

These counts depend on `Form.formType`.

That means:

- registration form submissions count toward `registrations`
- survey form submissions count toward `surveyResponses`

## Recommended Frontend Flow

1. Use `GET /api/events/:eventId/analytics` for all event analytics screens
2. Read all dashboard KPIs from the returned `summary`
3. Stop treating `/metrics` and `/analytics/overview` as separate analytics sources
4. Use `definitions` to document KPI meanings in product or internal docs if needed

## Quick Checklist

- [ ] Use `/api/events/:eventId/analytics` as the primary endpoint
- [ ] Map overview card KPIs from `summary`
- [ ] Stop mixing multiple analytics endpoints as separate sources of truth
- [ ] Keep date-range filtering on the same endpoint when needed
- [ ] Treat `ticketsSold` as ticket unit count, not attendee seat count
- [ ] Treat `totalRevenue` as captured-only revenue
