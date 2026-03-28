# Conversion Flows Guide

This guide covers the current backend support for:

- ticket purchase
- registration
- wallet
- notifications

It is written for frontend implementation planning, so each section includes current payloads, response types, and backend gaps where relevant.

## 1. Shared types

```ts
export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'KES'
  | 'ZAR';

export type OrderStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'FULFILLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REVERSED'
  | 'REFUNDED';
```

## 2. Ticket purchase flow

Current backend ticket conversion flow:

1. Create ticket order.
2. If the order total is zero, backend confirms immediately.
3. If the order total is greater than zero, backend reserves the order for 15 minutes.
4. Initialize Paystack checkout.
5. Redirect to Paystack.
6. Backend receives webhook and confirms payment.
7. Frontend polls order status and shows success.

### Step 1: create ticket order

```txt
POST /api/events/:eventId/ticket-orders
```

**Request**

```ts
export type CreateTicketOrderRequest = {
  email: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    attendeePayloads?: Array<Record<string, unknown>>;
  }>;
  metadataJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type TicketOrderResponse = {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  status: OrderStatus;
  email: string | null;
  currency: CurrencyCode;
  subtotalMinor: number;
  feeMinor: number;
  totalMinor: number;
  reservationExpiresAt: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    ticketOrderId: string;
    ticketTypeId: string;
    quantity: number;
    unitPriceMinor: number;
    totalPriceMinor: number;
    attendeePayloadJson: Array<Record<string, unknown>> | null;
    createdAt: string;
    ticketType: {
      id: string;
      name: string;
      priceMinor: number;
      currency: CurrencyCode;
      status: string;
    };
    attendees: Array<{
      id: string;
      fullName: string | null;
      email: string | null;
      phone: string | null;
      badgeCode: string | null;
      checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'REVERSED';
    }>;
  }>;
};
```

### Step 2: initialize payment

```txt
POST /api/payments/ticket-orders/:ticketOrderId/checkout
```

**Request**

```ts
export type InitializeCheckoutRequest = {
  callbackUrl?: string;
  metadataJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type InitializeCheckoutResponse = {
  provider: 'paystack' | string;
  providerReference: string;
  authorizationUrl: string;
  accessCode?: string;
  paymentTransactionId: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: CurrencyCode;
  ticketOrderId: string;
  message?: string;
};
```

### Step 3: callback handling

The frontend callback page should not trust URL params alone. After redirect back from Paystack:

1. read your saved `ticketOrderId`
2. call `GET /api/ticket-orders/:ticketOrderId`
3. decide success or failure from backend order state

### Ticket purchase state machine

```ts
export type TicketPurchaseState =
  | { step: 'draft' }
  | { step: 'creating-order' }
  | { step: 'reserved'; order: TicketOrderResponse }
  | { step: 'redirecting-to-paystack'; checkout: InitializeCheckoutResponse }
  | { step: 'verifying-payment' }
  | { step: 'completed'; order: TicketOrderResponse }
  | { step: 'expired'; orderId: string }
  | { step: 'failed'; message: string };
```

### Important current limitation

This route is still auth-protected:

```txt
POST /api/events/:eventId/ticket-orders
```

So a true anonymous purchase flow is not available yet without a backend change.

## 3. Registration flow

Current backend registration flow is form-based.

### Form creation for organisers

```txt
POST /api/events/:eventId/forms
POST /api/forms/:formId/publish
```

**Create request**

```ts
export type CreateRegistrationFormRequest = {
  title: string;
  formType: 'REGISTRATION';
  schemaJson: Record<string, unknown>;
  logicJson?: Record<string, unknown>;
  paymentConfigJson?: Record<string, unknown>;
  scheduleJson?: {
    opensAt?: string;
    closesAt?: string;
    [key: string]: unknown;
  };
  accessControlJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
};
```

### Registration submit

```txt
POST /api/forms/:formId/submissions
```

**Request**

```ts
export type SubmitRegistrationRequest = {
  answersJson: Record<string, unknown>;
};
```

**Response**

```ts
export type RegistrationSubmissionResponse = {
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

### Registration frontend notes

- The backend validates the submission against `schemaJson`.
- The backend enforces `scheduleJson.opensAt` and `scheduleJson.closesAt` when present.
- The backend has `paymentConfigJson`, but there is no complete public form-payment flow implemented in this repo yet.

### Important current limitation

Like ticket ordering, this submission route is currently auth-protected at the controller level. Public registration is therefore not fully available yet.

## 4. Wallet

There is no end-user wallet API in the current backend.

What does exist is finance reporting for organiser and finance roles:

```txt
GET /api/tenants/:tenantId/finance/summary
GET /api/events/:eventId/finance/summary
GET /api/tenants/:tenantId/payment-transactions?status=&provider=&currency=
GET /api/events/:eventId/payment-transactions?status=&provider=&currency=
```

### Finance summary response

```ts
export type FinanceSummaryResponse = Record<
  CurrencyCode,
  {
    grossCapturedMinor: number;
    netCapturedMinor: number;
    refundedMinor: number;
    queuedPayoutMinor: number;
    processingPayoutMinor: number;
    paidOutMinor: number;
    availableMinor: number;
  }
>;
```

### Payment transaction response

```ts
export type PaymentTransactionResponse = Array<{
  id: string;
  tenantId: string;
  eventId: string | null;
  ticketOrderId: string | null;
  merchOrderId: string | null;
  provider: string;
  providerReference: string;
  transactionType:
    | 'TICKET_ORDER'
    | 'MERCH_ORDER'
    | 'FORM_PAYMENT'
    | 'PAYOUT_REVERSAL'
    | 'ADJUSTMENT';
  status: PaymentStatus;
  currency: CurrencyCode;
  amountMinor: number;
  platformFeeMinor: number;
  gatewayFeeMinor: number;
  netAmountMinor: number;
  metadataJson: Record<string, unknown> | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;
```

### How to treat wallet in the frontend today

If you need a wallet screen now, scope it as an organiser balance screen backed by finance summary and transactions. Do not model it as a stored-value consumer wallet yet.

### Wallet gap

Missing backend pieces for a true wallet:

- wallet balance model
- wallet top-up endpoint
- wallet debit/credit ledger
- wallet transfer flow
- wallet withdrawal flow

## 5. Notifications

Current notification support is good enough for conversion follow-up and in-app inbox basics.

### List current user notifications

```txt
GET /api/notifications/me?status=
```

**Response**

```ts
export type NotificationInboxResponse = Array<{
  id: string;
  notificationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  notification: {
    id: string;
    tenantId: string;
    eventId: string | null;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';
    templateKey: string;
    payloadJson: Record<string, unknown>;
    status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
    scheduledFor: string | null;
    sentAt: string | null;
    createdAt: string;
  };
}>;
```

### Mark notification as read

```txt
PATCH /api/notifications/:recipientId/read
```

**Response**

```ts
export type MarkReadResponse = {
  id: string;
  notificationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
};
```

### Conversion-related notification events already present in backend

The backend already emits templates for:

- free ticket order confirmed
- paid ticket order confirmed
- payment failed

So the frontend can plan around:

```ts
export type ConversionNotificationKind =
  | 'ticket_order_confirmed_free'
  | 'ticket_order_confirmed_paid'
  | 'payment_failed';
```

## 6. Recommended frontend flow mapping

### Ticket purchase

1. Collect attendee and buyer info.
2. Create ticket order.
3. If free, show success screen from returned order.
4. If paid, initialize checkout and redirect to Paystack.
5. On callback, poll order until `PAID` or terminal failure.

### Registration

1. Load form definition.
2. Render fields from `schemaJson`.
3. Submit `answersJson`.
4. Show submitted state from returned submission record.

### Wallet

1. Treat as organiser finance summary only for now.
2. Render `availableMinor`, `netCapturedMinor`, and recent transactions.

### Notifications

1. Load inbox from `GET /notifications/me`.
2. Render notification payloads per `templateKey`.
3. Mark recipient rows as read with `PATCH /notifications/:recipientId/read`.

## 7. Backend gaps to track explicitly

- Ticket purchase is not guest-capable yet.
- Registration is not public yet.
- There is no real wallet system yet.
- Form payment conversion is not fully implemented.
- Merch payment conversion is not fully implemented.
