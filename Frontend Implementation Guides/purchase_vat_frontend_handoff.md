# Purchase VAT Frontend Handoff

Orders now include `vatMinor`, and `totalMinor` is VAT-inclusive.

This applies to both:

- ticket orders
- merch orders

Frontend should treat backend order amounts as the source of truth and stop deriving final payable totals locally once an order has been created.

## Contract Update

The backend now stores VAT on the order as:

- `vatMinor`

The backend also returns `totalMinor` with VAT already included.

Do not recompute `totalMinor` on the client from `subtotalMinor`.

## VAT Formula

Backend rule:

- `vatMinor = Math.round(subtotalMinor * 0.075)`

Totals now work like this:

### Ticket Orders

- `totalMinor = subtotalMinor + vatMinor + feeMinor`

### Merch Orders

- `totalMinor = subtotalMinor + vatMinor + shippingMinor + feeMinor`

## Frontend Contract

Frontend order types should include `vatMinor`.

### Ticket Order Shape

```ts
export interface TicketOrderMoney {
  currency: string;
  subtotalMinor: number;
  vatMinor: number;
  feeMinor: number;
  totalMinor: number;
}
```

### Merch Order Shape

```ts
export interface MerchOrderMoney {
  currency: string;
  subtotalMinor: number;
  vatMinor: number;
  feeMinor: number;
  shippingMinor: number;
  totalMinor: number;
}
```

## UI Changes

Display VAT explicitly in:

- ticket checkout summaries
- merch checkout summaries
- payment review screens
- order detail screens
- receipts and confirmation screens

Recommended rows:

- Subtotal
- VAT (7.5%)
- Shipping, if applicable
- Fees, if applicable
- Total

## Flow Changes

### 1. Order Creation

After creating a ticket or merch order, read and render:

- `subtotalMinor`
- `vatMinor`
- `feeMinor`
- `shippingMinor` when present
- `totalMinor`

Use those returned values directly in the UI.

### 2. Payment Initialization

When starting payment:

- use the backend order record as the pricing source
- treat `totalMinor` as already VAT-inclusive
- do not add VAT on the client before redirecting to payment

### 3. Payment Success Handling

After payment confirmation:

- re-fetch the order
- render the stored `subtotalMinor`, `vatMinor`, and `totalMinor` values from the backend response

## Rollout Safety

If older orders may exist without VAT in frontend state yet, use a temporary defensive fallback:

```ts
const vatMinor = order.vatMinor ?? 0;
```

That fallback is only for rollout safety. New orders should include `vatMinor`.

## Rollout Checklist

1. Add `vatMinor` to shared ticket and merch order types.
2. Update all purchase summary components to render VAT.
3. Remove client-side final total derivation after order creation.
4. Ensure checkout, receipts, and order detail screens use backend `totalMinor`.
5. Verify guest and authenticated merch checkout show the same VAT breakdown.
6. Verify ticket checkout and confirmation flows show VAT correctly.

## Team Note

“Orders now include `vatMinor`, and `totalMinor` is VAT-inclusive. Please display VAT in all purchase summaries and stop deriving totals locally.”
