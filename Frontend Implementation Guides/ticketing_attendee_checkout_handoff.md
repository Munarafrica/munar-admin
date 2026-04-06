# Ticketing Attendee Checkout Frontend Handoff

This guide explains the current backend contract for attendee-level ticket checkout, ticket-question scoping, attendee-specific delivery, and public-safe payment return polling.

It is intended for:

- the public ticket checkout frontend
- the event website/storefront frontend
- any confirmation or payment-return screen that needs to recover a ticket order after redirect

## Summary

The backend now supports:

- attendee-level payloads for each purchased ticket slot
- event-level ticket questions scoped to all ticket types or specific ticket types
- public-safe question access for checkout
- public-safe ticket order creation
- public-safe ticket checkout initialization
- public-safe ticket order polling after payment redirect
- attendee-specific ticket delivery by email
- QR generation inside attendee ticket emails

The backend also continues to preserve buyer/order metadata for organiser reporting.

## What Changed

### 1. Ticket checkout is now attendee-first

Ticket orders no longer need to be treated as buyer-only payloads.

Each purchased attendee slot can now carry:

- `fullName`
- `email`
- `phone`
- `deliveryEmail`
- `questionAnswers`

### 2. Ticket questions are now event-level resources

Ticket questions are now managed at the event level and can be scoped to:

- all ticket types
- specific `ticketTypeIds`

### 3. Public checkout can fetch questions safely

Frontend can now access applicable ticket checkout questions without organiser auth.

There are now two usable public-safe options:

- `GET /api/public/events/:eventSlug/ticket-types`
- `GET /api/events/:eventId/ticket-questions`

Recommended choice:

- prefer `GET /api/public/events/:eventSlug/ticket-types`

Reason:

- it already includes checkout-safe question data on each ticket type
- it avoids a second public fetch in most storefront flows

### 4. Payment return no longer depends on auth session

After payment redirect, frontend can poll:

- `GET /api/ticket-orders/:ticketOrderId`

This no longer requires an active auth session.

### 5. Ticket delivery is now attendee-specific

After order confirmation, each attendee email receives its own ticket email.

Delivery target priority is:

1. `deliveryEmail`
2. `email`
3. buyer `email`

Each attendee ticket email now includes:

- attendee ticket id
- badge code
- ticket type
- order id
- event schedule
- venue or online link
- attendee submitted answers
- QR code

## Backend Endpoints

### 1. Create Ticket Order

- Method: `POST`
- URL: `/api/events/:eventId/ticket-orders`
- Auth: not required

This endpoint supports both:

- guest checkout
- authenticated checkout

### Request Shape

```json
{
  "email": "buyer@example.com",
  "metadataJson": {
    "buyerName": "Ada Lovelace",
    "buyerPhone": "+2348000000000",
    "deliveryAssignments": [
      {
        "ticketTypeId": "uuid",
        "ticketName": "VIP",
        "quantityIndex": 0,
        "seatIndex": 0,
        "fullName": "Ada Lovelace",
        "email": "ada@example.com"
      }
    ]
  },
  "items": [
    {
      "ticketTypeId": "uuid",
      "quantity": 2,
      "attendeePayloads": [
        {
          "fullName": "Ada Lovelace",
          "email": "ada@example.com",
          "phone": "+2348000000000",
          "deliveryEmail": "ada@example.com",
          "questionAnswers": [
            {
              "questionId": "uuid-or-stable-id",
              "questionLabel": "Dietary restrictions",
              "answer": "Vegetarian"
            }
          ]
        },
        {
          "fullName": "Grace Hopper",
          "email": "grace@example.com",
          "phone": "+2348111111111",
          "deliveryEmail": "grace@example.com",
          "questionAnswers": []
        }
      ]
    }
  ]
}
```

### Important Rules

- `email` is still the buyer email
- `metadataJson` is optional
- `metadataJson` can continue to carry buyer-level reporting info
- `items[].attendeePayloads` is optional but should be sent for attendee-based delivery
- `items[].attendeePayloads.length` must match the expected attendee count

Expected attendee count rules:

- single ticket: `quantity`
- group ticket: `quantity * groupSize`

Question answer validation:

- each `questionAnswers[].questionId` must belong to a question applicable to that ticket type

### Response Notes

The response returns the created order record.

It includes:

- order status
- price breakdown
- `items`
- `items[].ticketType`
- `items[].attendees`
- `paymentTransactions`

Important pricing note:

- `vatMinor` is included
- `totalMinor` is already VAT-inclusive

## 2. Initialize Ticket Checkout

- Method: `POST`
- URL: `/api/payments/ticket-orders/:ticketOrderId/checkout`
- Auth: not required

### Request

```json
{
  "callbackUrl": "https://your-frontend.example.com/payment-return",
  "metadataJson": {
    "source": "public-checkout"
  }
}
```

### Response

```json
{
  "provider": "paystack",
  "providerReference": "mnr_tkt_52a92907f599_1774145632965",
  "authorizationUrl": "https://checkout.paystack.com/u85t7odin9bv816",
  "accessCode": "u85t7odin9bv816",
  "paymentTransactionId": "uuid",
  "status": "PENDING",
  "amountMinor": 500000,
  "currency": "NGN",
  "ticketOrderId": "uuid"
}
```

### Behavior Notes

- no active frontend auth session is required
- if a pending checkout already exists, backend may return the existing session
- use backend `amountMinor` and order totals as source of truth

## 3. Poll Ticket Order After Redirect

- Method: `GET`
- URL: `/api/ticket-orders/:ticketOrderId`
- Auth: not required

### Recommended Frontend Use

After redirect from payment:

1. restore `ticketOrderId` from local storage or redirect state
2. poll this endpoint
3. stop when order status is final enough for your UI

### Response Notes

The response includes:

- order status
- pricing fields
- `items`
- `items[].ticketType`
- `items[].attendees`
- latest `paymentTransactions`

Use this endpoint for:

- payment return pages
- ticket confirmation screens
- success/failure state recovery after refresh

## 4. Public Ticket Questions

### Option A. Recommended

- Method: `GET`
- URL: `/api/public/events/:eventSlug/ticket-types`
- Auth: not required

This returns:

- event summary
- `ticketTypes`
- `ticketQuestions`

Each returned ticket type now also includes:

- `checkoutQuestions`

Recommended frontend behavior:

- use each ticket type’s `checkoutQuestions` to render attendee questions during checkout

### Option B. Fallback

- Method: `GET`
- URL: `/api/events/:eventId/ticket-questions`
- Auth: not required

This returns event ticket questions directly.

## Ticket Question Model

Ticket questions are now event-level and support ticket scoping.

### Response Shape

```json
[
  {
    "id": "uuid",
    "label": "Dietary restrictions",
    "type": "TEXT",
    "required": false,
    "description": "Optional",
    "placeholder": "Enter answer",
    "options": [],
    "configJson": {},
    "ticketTypeIds": [],
    "appliesToAll": true,
    "createdAt": "2026-04-06T12:00:00.000Z",
    "updatedAt": "2026-04-06T12:00:00.000Z"
  }
]
```

### Scoping Meaning

- `ticketTypeIds: []` and `appliesToAll: true`
  means the question applies to all ticket types

- non-empty `ticketTypeIds`
  means the question applies only to those ticket types

### Organiser Create/Update Scope Input

All ticket types:

```json
{
  "label": "T-shirt size",
  "type": "SELECT",
  "required": true,
  "options": ["S", "M", "L"],
  "scope": {
    "ticketTypeIds": "all"
  }
}
```

Specific ticket types:

```json
{
  "label": "Meal choice",
  "scope": {
    "ticketTypeIds": ["uuid-1", "uuid-2"]
  }
}
```

## Public Ticket Type Payload

`GET /api/public/events/:eventSlug/ticket-types` now returns ticket types with checkout-safe question data.

Frontend should expect each ticket type to include:

- `checkoutQuestions`

Example conceptually:

```json
{
  "event": {
    "id": "uuid",
    "slug": "my-event",
    "title": "My Event",
    "summary": "Event summary",
    "currency": "NGN"
  },
  "ticketTypes": [
    {
      "id": "uuid",
      "name": "VIP",
      "status": "ACTIVE",
      "checkoutQuestions": [
        {
          "id": "uuid",
          "label": "Meal choice",
          "type": "SELECT",
          "required": true
        }
      ]
    }
  ],
  "ticketQuestions": [
    {
      "id": "uuid",
      "label": "Meal choice",
      "type": "SELECT"
    }
  ]
}
```

## Frontend Payload Guidance

### Important

The frontend should expand attendee data per attendee slot, not per order.

That means:

- one attendee payload per actual attendee ticket slot

Examples:

- 2 single tickets = 2 attendee payloads
- 1 group ticket with `groupSize = 5` = 5 attendee payloads

### Suggested Frontend Logic

1. User selects ticket quantities.
2. Frontend expands expected attendee slots using ticket quantity and `attendeesPerUnit`.
3. Frontend renders attendee details form per slot.
4. Frontend attaches only applicable `checkoutQuestions` for that ticket type.
5. Frontend submits attendee-expanded payloads.

## Buyer Metadata

Backend still preserves buyer-level metadata for organiser reporting.

Recommended fields to continue sending inside `metadataJson`:

- `buyerName`
- `buyerPhone`
- `deliveryAssignments`

The backend does not enforce a rigid schema on `metadataJson`, so these can continue to evolve on the frontend if needed.

## Ticket Delivery Behavior

After successful confirmation:

- attendee records are created from submitted attendee payloads
- attendee emails are resolved from attendee-level data
- each attendee receives a ticket email with their own ticket details

Delivery target priority:

1. `deliveryEmail`
2. `email`
3. buyer `email`

## Ticket Email Details

Attendee ticket emails now include:

- attendee-specific ticket id
- badge code
- ticket type
- order id
- event title
- start time
- end time
- timezone
- venue or online link
- attendee answers
- QR code

Template note:

- the attendee ticket email now follows the same overall visual language as the verification and welcome emails

## Frontend Adjustments To Make

### Recommended adjustments

- prefer `GET /api/public/events/:eventSlug/ticket-types` for public checkout
- use `checkoutQuestions` from each ticket type
- continue storing `ticketOrderId` locally after order creation
- after redirect, poll `GET /api/ticket-orders/:ticketOrderId`
- send one attendee payload per attendee slot
- for group tickets, fully expand attendee slots before submit
- map answers by `questionId`
- still include `questionLabel` in answer payloads for reporting/display continuity

### Pricing adjustment reminder

Frontend should continue to use backend totals as source of truth:

- `subtotalMinor`
- `vatMinor`
- `feeMinor`
- `totalMinor`

Do not recompute payable totals client-side.

## Current Limitations / Notes

### 1. Attendee answers are persisted inside attendee metadata

Attendee answers are currently stored inside attendee `metadataJson`.

This is already active in:

- attendee creation
- attendee delivery emails
- organiser visibility through attendee records

But note:

- there is not yet a dedicated relational table for ticket question answers

### 2. QR is email-ready, but downloadable pass/PDF is not yet implemented

The backend now generates QR codes for attendee ticket emails.

What still does not exist yet:

- ticket PDF download
- Apple Wallet / Google Wallet pass generation
- dedicated public ticket file download endpoint

### 3. Public ticket order lookup is currently by `ticketOrderId`

Unlike public merch lookup, ticket order lookup currently works by:

- `ticketOrderId`

There is not currently an `orderId + email` gate on the public ticket lookup route.

If product wants that extra protection later, it can be added in a follow-up.

## Recommended Frontend Flow

### Public checkout flow

1. Fetch ticket types from `GET /api/public/events/:eventSlug/ticket-types`
2. Read `checkoutQuestions` per ticket type
3. Expand attendee slots client-side
4. Submit order to `POST /api/events/:eventId/ticket-orders`
5. Persist `ticketOrderId`
6. Initialize payment with `POST /api/payments/ticket-orders/:ticketOrderId/checkout`
7. Redirect to payment provider
8. After redirect, poll `GET /api/ticket-orders/:ticketOrderId`
9. Render final confirmation from backend order data

## Quick Checklist

- [ ] Use public ticket types endpoint for checkout
- [ ] Read `checkoutQuestions`
- [ ] Expand attendee slots correctly
- [ ] Send `deliveryEmail` when attendee delivery should differ from attendee contact email
- [ ] Keep buyer info in `metadataJson`
- [ ] Store `ticketOrderId`
- [ ] Poll ticket order after redirect
- [ ] Render success state from backend response only

