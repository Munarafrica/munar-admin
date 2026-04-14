# Finance Frontend Implementation Guide

This guide covers the Finance & Payouts screen shown at `/finance`: overview, payouts, transactions, payout accounts, and support/disputes.

## Backend Status

The backend already has a first-class finance module.

Existing backend support:

- Finance summary for tenant and event scopes
- Payment transaction listing for tenant and event scopes
- Payout account creation, listing, and updating
- Payout creation, listing, lookup, and status updates
- Refund creation/listing/status updates for captured payment transactions
- Finance access control for tenant `OWNER`, `ADMIN`, and `FINANCE` roles
- Notifications for payout scheduled/completed/failed and payout account changes

The backend is wired through `FinanceModule` and all routes use the global `/api` prefix.

Important backend gaps for the attached screenshots:

- No dedicated finance support/dispute model or endpoint exists yet.
- No direct payout status filter query exists on `GET /api/tenants/:tenantId/payouts`; filter client-side for now.
- No search, event filter, or transaction type filter exists on payment transaction listing; only `status`, `provider`, and `currency` are supported by the backend.
- No Paystack bank/recipient verification endpoint exists. Creating a payout account currently accepts already-known provider/account metadata, including `recipientCode` if available.
- No delete payout account endpoint exists.
- No event-scoped payout list exists. Payouts are listed at tenant scope; event-specific summary exists, but payout creation currently stores tenant payout data and does not accept `eventId`.

## Routes And Permissions

Use authenticated requests:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Finance access is allowed for tenant members with role:

```ts
type FinanceRole = 'OWNER' | 'ADMIN' | 'FINANCE';
```

Show a restricted-state page for `EDITOR`, `STAFF`, and `VIEWER` if the frontend can determine role before calling the API. Still handle backend `403` as the source of truth.

## Existing Endpoints

```http
GET /api/tenants/:tenantId/finance/summary
GET /api/events/:eventId/finance/summary

GET /api/tenants/:tenantId/payment-transactions?status=&provider=&currency=
GET /api/events/:eventId/payment-transactions?status=&provider=&currency=

GET /api/tenants/:tenantId/payout-accounts
POST /api/tenants/:tenantId/payout-accounts
PATCH /api/payout-accounts/:payoutAccountId

GET /api/tenants/:tenantId/payouts
POST /api/tenants/:tenantId/payouts
GET /api/payouts/:payoutId
PATCH /api/payouts/:payoutId/status

POST /api/payment-transactions/:paymentTransactionId/refunds
GET /api/payment-transactions/:paymentTransactionId/refunds
PATCH /api/refunds/:refundId/status
```

## Backend Types

```ts
type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP' | 'GHS' | 'KES' | 'ZAR';

type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REVERSED'
  | 'REFUNDED';

type PaymentTransactionType =
  | 'TICKET_ORDER'
  | 'MERCH_ORDER'
  | 'FORM_PAYMENT'
  | 'PAYOUT_REVERSAL'
  | 'ADJUSTMENT';

type PayoutStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';
```

### Finance Summary

`GET /api/tenants/:tenantId/finance/summary`

`GET /api/events/:eventId/finance/summary`

Response is keyed by currency:

```ts
type FinanceSummaryResponse = Record<
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

Screen mapping:

- `Total Earnings`: use `netCapturedMinor` for the selected/default currency. If product wants all collected money instead, label it `Gross Collected` and use `grossCapturedMinor`.
- `Available Balance`: use `availableMinor`.
- `Pending Balance`: use `queuedPayoutMinor + processingPayoutMinor`.
- `Next Payout`: derive from the earliest `QUEUED` or `PROCESSING` payout returned by `GET /api/tenants/:tenantId/payouts`; otherwise show `No payout scheduled`.
- `Earnings Breakdown`: group captured transactions by `transactionType` or source label on the client.

If the response is `{}`, render zero-value cards and the screenshot empty state.

### Payment Transactions

`GET /api/tenants/:tenantId/payment-transactions?status=&provider=&currency=`

`GET /api/events/:eventId/payment-transactions?status=&provider=&currency=`

Supported backend filters:

- `status`: one `PaymentStatus`
- `provider`: string, for example `paystack`
- `currency`: one `CurrencyCode`

Backend returns Prisma payment transaction rows:

```ts
type PaymentTransaction = {
  id: string;
  tenantId: string;
  eventId: string | null;
  ticketOrderId: string | null;
  merchOrderId: string | null;
  provider: string;
  providerReference: string;
  transactionType: PaymentTransactionType;
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
};
```

Screen mapping:

- Search input `Search by ID, event, name...`: client-side search for now across `id`, `providerReference`, `provider`, `transactionType`, and useful text found in `metadataJson`.
- `All Events`: use tenant endpoint for all events; use event endpoint when the user selects a specific event.
- `All Types`: client-side filter by `transactionType`.
- Empty state: `No transactions yet`.
- For refunds, allow the action only when `status === 'CAPTURED'`. Call `POST /api/payment-transactions/:paymentTransactionId/refunds`, then optionally poll/list refunds with `GET /api/payment-transactions/:paymentTransactionId/refunds`.

### Payout Accounts

`GET /api/tenants/:tenantId/payout-accounts`

```ts
type PayoutAccount = {
  id: string;
  tenantId: string;
  provider: string;
  accountName: string;
  bankName: string;
  accountNumberLast4: string;
  recipientCode: string | null;
  isDefault: boolean;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

Create account:

```http
POST /api/tenants/:tenantId/payout-accounts
```

```ts
type CreatePayoutAccountRequest = {
  provider: string;
  accountName: string;
  bankName: string;
  accountNumberLast4: string;
  recipientCode?: string;
  isDefault?: boolean;
  metadataJson?: Record<string, unknown>;
};
```

Update account:

```http
PATCH /api/payout-accounts/:payoutAccountId
```

```ts
type UpdatePayoutAccountRequest = {
  accountName?: string;
  bankName?: string;
  accountNumberLast4?: string;
  recipientCode?: string;
  isDefault?: boolean;
  metadataJson?: Record<string, unknown>;
};
```

Screen mapping:

- Header: `Payout Accounts`
- Helper: `Manage your bank accounts for receiving payouts`
- Notice: `Bank accounts are verified via Paystack`
- Empty state: `No payout accounts`
- Primary action: `Add Payout Account`
- Show default badge when `isDefault` is true.
- Mask account numbers as `**** ${accountNumberLast4}`.
- Disable delete UI until a backend delete endpoint exists.
- If the app does not already have a Paystack recipient/bank verification flow, make `Add Payout Account` an admin-only/manual metadata form or show a clear "Bank verification is not connected yet" message.

### Payouts

`GET /api/tenants/:tenantId/payouts`

Returns payouts with included `payoutAccount`.

```ts
type Payout = {
  id: string;
  tenantId: string;
  eventId: string | null;
  payoutAccountId: string;
  status: PayoutStatus;
  currency: CurrencyCode;
  amountMinor: number;
  scheduledFor: string;
  paidAt: string | null;
  failureReason: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  payoutAccount?: PayoutAccount;
};
```

Create payout:

```http
POST /api/tenants/:tenantId/payouts
```

```ts
type CreatePayoutRequest = {
  payoutAccountId: string;
  currency: CurrencyCode;
  amountMinor: number;
  scheduledFor?: string;
  metadataJson?: Record<string, unknown>;
};
```

Screen mapping:

- Header: `Payouts`
- Count label: `${payouts.length} payouts total`
- `All Statuses`: client-side filter by `PayoutStatus`
- Empty state: `No payouts yet`
- Helper: `Payouts will appear here after your first payout cycle. Funds are transferred weekly.`
- Use `scheduledFor` for schedule date.
- Use `paidAt` for completed date when `status === 'PAID'`.
- Render failure reason when `status === 'FAILED'`.

Create payout affordance:

- Only enable if `availableMinor > 0` and at least one payout account exists.
- Use the default payout account automatically or ask the user to choose.
- Validate `amountMinor <= selectedCurrencySummary.availableMinor`.

Status updates:

- `PATCH /api/payouts/:payoutId/status` exists, but this is more of an internal/admin operation. Do not expose status changes in the normal organizer UI unless product explicitly wants finance operators to manage payout lifecycle manually.

### Support And Disputes

The screenshot shows:

- Header: `Support & Disputes`
- Helper: `Report and track payout issues`
- Action: `Report Payout Issue`
- Empty state: `No disputes`

There is no backend dispute/report-payout-issue endpoint yet.

Frontend recommendation:

- Render the Support tab and empty state.
- Disable `Report Payout Issue`, or open a modal that submits to an existing support/contact channel if the frontend already has one.
- Do not invent finance dispute API calls.

Suggested future backend endpoints:

```http
GET /api/tenants/:tenantId/finance/disputes?status=&payoutId=
POST /api/tenants/:tenantId/finance/disputes
GET /api/finance/disputes/:disputeId
PATCH /api/finance/disputes/:disputeId
POST /api/finance/disputes/:disputeId/messages
```

Suggested model:

```ts
type FinanceDisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

type FinanceDispute = {
  id: string;
  tenantId: string;
  payoutId: string | null;
  paymentTransactionId: string | null;
  status: FinanceDisputeStatus;
  subject: string;
  description: string;
  createdByUserId: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## UI State From Screenshots

Build a tabbed Finance & Payouts shell:

- `Overview`
- `Payouts`
- `Transactions`
- `Accounts`
- `Support`

Page title:

- `Finance & Payouts`
- `Manage your earnings, payouts, and financial accounts`

Overview tab:

- Summary cards: Total Earnings, Available Balance, Pending Balance, Next Payout
- Earnings Breakdown panel with event filter, empty state `No earnings yet`
- Quick links: `View Payouts`, `View Transactions`

Payouts tab:

- Status filter `All Statuses`
- Payout list or empty state

Transactions tab:

- Search input
- Event filter
- Type filter
- Transaction list or empty state

Accounts tab:

- Add payout account button
- Paystack verification notice
- Account list or empty state

Support tab:

- Report payout issue action
- Disputes list or empty state, disabled until backend exists

## Money Formatting

Backend money fields are minor units.

```ts
function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amountMinor / 100);
}
```

Use the tenant default currency or the first summary currency as the selected currency. If multiple currencies exist, add a currency selector before the cards.

## Suggested Frontend API Adapter

```ts
const financeApi = {
  getTenantSummary: (tenantId: string) =>
    api.get<FinanceSummaryResponse>(`/tenants/${tenantId}/finance/summary`),

  getEventSummary: (eventId: string) =>
    api.get<FinanceSummaryResponse>(`/events/${eventId}/finance/summary`),

  listTenantTransactions: (tenantId: string, params?: {
    status?: PaymentStatus;
    provider?: string;
    currency?: CurrencyCode;
  }) => api.get<PaymentTransaction[]>(`/tenants/${tenantId}/payment-transactions`, { params }),

  listEventTransactions: (eventId: string, params?: {
    status?: PaymentStatus;
    provider?: string;
    currency?: CurrencyCode;
  }) => api.get<PaymentTransaction[]>(`/events/${eventId}/payment-transactions`, { params }),

  listPayoutAccounts: (tenantId: string) =>
    api.get<PayoutAccount[]>(`/tenants/${tenantId}/payout-accounts`),

  createPayoutAccount: (tenantId: string, body: CreatePayoutAccountRequest) =>
    api.post<PayoutAccount>(`/tenants/${tenantId}/payout-accounts`, body),

  updatePayoutAccount: (payoutAccountId: string, body: UpdatePayoutAccountRequest) =>
    api.patch<PayoutAccount>(`/payout-accounts/${payoutAccountId}`, body),

  listPayouts: (tenantId: string) =>
    api.get<Payout[]>(`/tenants/${tenantId}/payouts`),

  createPayout: (tenantId: string, body: CreatePayoutRequest) =>
    api.post<Payout>(`/tenants/${tenantId}/payouts`, body),

  createRefund: (paymentTransactionId: string, body: { amountMinor: number; reason?: string }) =>
    api.post(`/payment-transactions/${paymentTransactionId}/refunds`, body),

  listRefunds: (paymentTransactionId: string) =>
    api.get(`/payment-transactions/${paymentTransactionId}/refunds`),
};
```

## Implementation Prompt

```txt
Implement the Munar Finance & Payouts frontend screen at /finance using the existing backend finance API.

Use the attached screenshots as the visual and functional reference. Build a tabbed shell with Overview, Payouts, Transactions, Accounts, and Support tabs. Match the page title "Finance & Payouts" and subtitle "Manage your earnings, payouts, and financial accounts".

Backend base path is /api and auth uses Bearer tokens. Use these endpoints:
- GET /tenants/:tenantId/finance/summary
- GET /events/:eventId/finance/summary
- GET /tenants/:tenantId/payment-transactions?status=&provider=&currency=
- GET /events/:eventId/payment-transactions?status=&provider=&currency=
- GET /tenants/:tenantId/payout-accounts
- POST /tenants/:tenantId/payout-accounts
- PATCH /payout-accounts/:payoutAccountId
- GET /tenants/:tenantId/payouts
- POST /tenants/:tenantId/payouts
- GET /payouts/:payoutId
- POST /payment-transactions/:paymentTransactionId/refunds
- GET /payment-transactions/:paymentTransactionId/refunds

Implement typed API helpers and React Query or the app's existing data-fetching pattern. Money values are minor units, so divide by 100 and format with Intl.NumberFormat using the selected currency.

Overview:
- Load tenant summary, payout accounts, payouts, and tenant transactions.
- Render cards for Total Earnings, Available Balance, Pending Balance, and Next Payout.
- Map Total Earnings to netCapturedMinor, Available Balance to availableMinor, Pending Balance to queuedPayoutMinor + processingPayoutMinor, and Next Payout to the earliest queued/processing payout.
- Render Earnings Breakdown by grouping captured transactions by transactionType. Show the screenshot empty state when there are none.
- Add quick links to Payouts and Transactions tabs.

Payouts:
- Load GET /tenants/:tenantId/payouts.
- Implement client-side All Statuses filter because the backend does not support payout query filters yet.
- Show empty state "No payouts yet" with helper text from the screenshot.
- Enable Create Payout only when available balance is positive and at least one payout account exists. Validate amountMinor <= availableMinor. Do not expose payout status updates in the normal organizer UI.

Transactions:
- Load tenant transactions by default. Use event transactions only when an event is selected.
- Use backend filters only for status, provider, and currency.
- Implement search and transaction type filtering client-side. Search across id, providerReference, provider, transactionType, and useful metadataJson text.
- Show empty state "No transactions yet".
- Allow refund creation only for CAPTURED transactions.

Accounts:
- Load payout accounts.
- Render the Paystack verification notice and empty state from the screenshot.
- Implement Add Payout Account with fields provider, accountName, bankName, accountNumberLast4, optional recipientCode, and isDefault.
- Mask account number as **** last4. Show default badge for isDefault.
- Do not render delete because the backend has no delete payout account endpoint.
- If Paystack bank verification is not already implemented elsewhere in the frontend, make the form manual metadata entry or show that verification is not connected yet.

Support:
- Render Support & Disputes with the "Report Payout Issue" action and "No disputes" empty state.
- Do not call a backend support/dispute API because none exists yet. Disable the action or connect it to an existing generic support channel if one exists in the frontend.

Handle loading, error, empty, and 403 restricted states. Keep all unsupported backend features clearly disabled rather than mocked as real network calls.
```
