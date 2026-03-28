# Events Frontend Guide

This guide maps the current backend in this repo to a Next.js frontend for:

- event creation
- event dashboard shell
- tickets
- payments via Paystack
- forms and registration
- merch (basic)
- website pages

All routes below assume the Nest global prefix:

```txt
/api
```

Example base URL in local dev:

```txt
http://localhost:8000/api
```

## 1. Shared enums

```ts
export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'KES'
  | 'ZAR';

export type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type TicketTypeStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SOLD_OUT'
  | 'PAUSED'
  | 'CLOSED';

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

export type FormType = 'REGISTRATION' | 'SURVEY' | 'CUSTOM';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ProductType = 'PHYSICAL' | 'DIGITAL';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';
```

## 2. Shared error shape

```ts
export type ApiError = {
  statusCode: number;
  message: string | string[];
  error: string;
  code: string;
  timestamp: string;
  path: string;
  requestId: string | null;
  details?: unknown;
};
```

## 3. Event creation

### Create event

**Endpoint**

```txt
POST /api/events
```

**Auth:** Required

**Request**

```ts
export type CreateEventRequest = {
  tenantId: string;
  title: string;
  summary?: string;
  description?: string;
  visibility?: Visibility;
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
```

**Response**

```ts
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
  status: EventStatus;
  visibility: Visibility;
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
  tenant?: {
    id: string;
    slug: string;
    name: string;
    tenantType: string;
    defaultCurrency: CurrencyCode;
    timezone: string;
  };
  settings?: EventSettings | null;
};
```

### Update event

```txt
PATCH /api/events/:eventId
```

Use the same shape as `CreateEventRequest`, minus `tenantId`.

### Lifecycle actions

```txt
POST /api/events/:eventId/publish
POST /api/events/:eventId/cancel
POST /api/events/:eventId/archive
POST /api/events/:eventId/start
POST /api/events/:eventId/complete
```

All return the updated event object.

### List tenant events

```txt
GET /api/tenants/:tenantId/events?status=&visibility=&currency=&search=
```

**Response**

```ts
export type ListTenantEventsResponse = EventResponse[];
```

## 4. Event dashboard shell

Recommended Next.js organiser dashboard data-loading plan:

1. `GET /api/events/:eventId`
2. `GET /api/events/:eventId/settings`
3. `GET /api/events/:eventId/ticket-types`
4. `GET /api/events/:eventId/forms`
5. `GET /api/events/:eventId/products`
6. `GET /api/events/:eventId/website-pages`
7. `GET /api/events/:eventId/analytics/overview`
8. `GET /api/events/:eventId/finance/summary`

Suggested route structure:

```txt
/app/(dashboard)/events/[eventId]/overview
/app/(dashboard)/events/[eventId]/tickets
/app/(dashboard)/events/[eventId]/orders
/app/(dashboard)/events/[eventId]/attendees
/app/(dashboard)/events/[eventId]/forms
/app/(dashboard)/events/[eventId]/merch
/app/(dashboard)/events/[eventId]/website
/app/(dashboard)/events/[eventId]/settings
```

### Event settings

```txt
GET /api/events/:eventId/settings
PATCH /api/events/:eventId/settings
```

**Patch request**

```ts
export type UpdateEventSettingsRequest = {
  modulesEnabledJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
  websiteSettingsJson?: Record<string, unknown>;
  ticketingSettingsJson?: Record<string, unknown>;
  formSettingsJson?: Record<string, unknown>;
  merchandisingJson?: Record<string, unknown>;
  financeSettingsJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type EventSettingsResponse = EventSettings;
```

### Analytics overview

```txt
GET /api/events/:eventId/analytics/overview?startDate=2026-01-01&endDate=2026-01-31&currency=NGN
```

**Response**

```ts
export type AnalyticsOverviewResponse = Record<
  string,
  Array<{
    date: string;
    metric: string;
    value: string;
  }>
>;
```

### Finance summary

```txt
GET /api/events/:eventId/finance/summary
```

**Response**

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

## 5. Tickets

### Create ticket type

```txt
POST /api/events/:eventId/ticket-types
```

**Auth:** Required

**Request**

```ts
export type CreateTicketTypeRequest = {
  name: string;
  description?: string;
  priceMinor: number;
  capacity?: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  saleStartsAt?: string;
  saleEndsAt?: string;
  accessRulesJson?: Record<string, unknown>;
  customQuestionsJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type TicketTypeResponse = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  status: TicketTypeStatus;
  priceMinor: number;
  currency: CurrencyCode;
  capacity: number | null;
  soldCount: number;
  minPerOrder: number | null;
  maxPerOrder: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  accessRulesJson: Record<string, unknown> | null;
  customQuestionsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

### List ticket types

```txt
GET /api/events/:eventId/ticket-types?status=&search=
```

**Response**

```ts
export type ListTicketTypesResponse = TicketTypeResponse[];
```

### Ticket type status transitions

```txt
POST /api/ticket-types/:ticketTypeId/activate
POST /api/ticket-types/:ticketTypeId/pause
POST /api/ticket-types/:ticketTypeId/close
```

### Create ticket order

```txt
POST /api/events/:eventId/ticket-orders
```

Important: this route is currently protected by the global JWT guard. Even though the service accepts `userId | null`, the controller is not marked `@Public()`. That means guest checkout is not available yet without a backend change.

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
  event: EventResponse;
  items: Array<{
    id: string;
    ticketOrderId: string;
    ticketTypeId: string;
    quantity: number;
    unitPriceMinor: number;
    totalPriceMinor: number;
    attendeePayloadJson: Array<Record<string, unknown>> | null;
    createdAt: string;
    ticketType: TicketTypeResponse;
    attendees: AttendeeResponse[];
  }>;
};

export type AttendeeResponse = {
  id: string;
  eventId: string;
  ticketTypeId: string | null;
  orderItemId: string | null;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'REVERSED';
  checkedInAt: string | null;
  badgeCode: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
```

### Order retrieval

```txt
GET /api/ticket-orders/:ticketOrderId
GET /api/events/:eventId/ticket-orders
GET /api/events/:eventId/attendees
POST /api/attendees/:attendeeId/check-in
```

## 6. Payments with Paystack

The backend already uses a Paystack provider. The frontend should use the backend checkout initializer, not call Paystack directly from the browser for ticket payments.

### Checkout initialization

```txt
POST /api/payments/ticket-orders/:ticketOrderId/checkout
```

**Auth:** Required

**Request**

```ts
export type InitializeTicketOrderCheckoutRequest = {
  callbackUrl?: string;
  metadataJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type InitializeTicketOrderCheckoutResponse = {
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

### Frontend Paystack flow

1. Create a ticket order.
2. If `totalMinor === 0`, treat the returned order as already confirmed after backend processing.
3. If `status === 'RESERVED'`, call checkout initialization.
4. Redirect the browser to `authorizationUrl`.
5. Paystack returns the user to your `callbackUrl`.
6. On the callback page, poll `GET /api/ticket-orders/:ticketOrderId`.
7. Treat the order as complete when `status === 'PAID'`.

### Notes for Next.js

- Save `ticketOrderId` before redirecting.
- Expect an existing pending session to be reused if checkout was already initialized.
- Reservation expiry is 15 minutes for paid ticket orders.
- Backend confirmation happens from the Paystack webhook plus provider verification.

### Paystack callback page example

```ts
export type TicketCheckoutState =
  | { state: 'awaiting_payment' }
  | { state: 'paid'; order: TicketOrderResponse }
  | { state: 'expired' }
  | { state: 'failed'; reason?: string };
```

### Current payment gaps

- There is no frontend-facing merch checkout endpoint yet.
- There is no browser-side Paystack inline flow exposed by this backend.
- The Paystack webhook endpoint is backend-only:

```txt
POST /api/payments/webhooks/paystack
```

## 7. Forms and registration

### Create form

```txt
POST /api/events/:eventId/forms
```

**Request**

```ts
export type CreateFormRequest = {
  title: string;
  formType: FormType;
  schemaJson: Record<string, unknown>;
  logicJson?: Record<string, unknown>;
  paymentConfigJson?: Record<string, unknown>;
  scheduleJson?: Record<string, unknown>;
  accessControlJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type FormResponse = {
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

### Form management

```txt
GET /api/events/:eventId/forms?formType=&status=&search=
GET /api/forms/:formId
PATCH /api/forms/:formId
POST /api/forms/:formId/publish
POST /api/forms/:formId/close
```

### Submit registration form

```txt
POST /api/forms/:formId/submissions
```

Important: this route is also protected right now because the controller is not marked `@Public()`. If you want public registration, the backend must expose this route publicly first.

**Request**

```ts
export type SubmitFormRequest = {
  answersJson: Record<string, unknown>;
};
```

**Response**

```ts
export type FormSubmissionResponse = {
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

## 8. Merch (basic)

### Product catalog management

```txt
POST /api/events/:eventId/products
GET /api/events/:eventId/products?productType=&status=&search=
GET /api/products/:productId
PATCH /api/products/:productId
POST /api/products/:productId/variants
PATCH /api/product-variants/:variantId
```

**Create product request**

```ts
export type CreateProductRequest = {
  name: string;
  productType: ProductType;
  description?: string;
  basePriceMinor: number;
  inventoryTracked?: boolean;
  inventoryCount?: number;
  imageUrl?: string;
  metadataJson?: Record<string, unknown>;
};
```

**Create product variant request**

```ts
export type CreateProductVariantRequest = {
  sku?: string;
  name: string;
  priceMinor: number;
  inventoryCount?: number;
  attributesJson?: Record<string, unknown>;
};
```

**Product response**

```ts
export type ProductVariantResponse = {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  priceMinor: number;
  inventoryCount: number | null;
  attributesJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductResponse = {
  id: string;
  eventId: string;
  name: string;
  productType: ProductType;
  description: string | null;
  status: ProductStatus;
  basePriceMinor: number;
  currency: CurrencyCode;
  inventoryTracked: boolean;
  inventoryCount: number | null;
  imageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariantResponse[];
};
```

### Create merch order

```txt
POST /api/events/:eventId/merch-orders
```

**Auth:** Required at the moment

**Request**

```ts
export type CreateMerchOrderRequest = {
  email: string;
  items: Array<{
    productId: string;
    productVariantId?: string;
    quantity: number;
  }>;
  shippingAddressJson?: Record<string, unknown>;
  metadataJson?: Record<string, unknown>;
};
```

**Response**

```ts
export type MerchOrderResponse = {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: CurrencyCode;
  subtotalMinor: number;
  feeMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingAddressJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    merchOrderId: string;
    productId: string;
    productVariantId: string | null;
    quantity: number;
    unitPriceMinor: number;
    totalPriceMinor: number;
    metadataJson: Record<string, unknown> | null;
    createdAt: string;
    product: ProductResponse;
    productVariant: ProductVariantResponse | null;
  }>;
};
```

### Current merch limitation

The backend creates merch orders, but there is no Paystack merch checkout endpoint yet. Paid merch orders remain a backend gap for frontend completion.

## 9. Website pages

### CMS endpoints

```txt
POST /api/events/:eventId/website-pages
GET /api/events/:eventId/website-pages?isPublished=&search=
GET /api/website-pages/:pageId
PATCH /api/website-pages/:pageId
POST /api/website-pages/:pageId/publish
POST /api/website-pages/:pageId/unpublish
GET /api/events/:eventId/website-settings
PATCH /api/events/:eventId/website-settings
POST /api/events/:eventId/website/publish
POST /api/events/:eventId/website/unpublish
```

**Create page request**

```ts
export type CreateWebsitePageRequest = {
  pageKey: string;
  title: string;
  sectionsJson: Record<string, unknown>;
  seoJson?: Record<string, unknown>;
  isPublished?: boolean;
};
```

**Response**

```ts
export type WebsitePageResponse = {
  id: string;
  eventId: string;
  pageKey: string;
  title: string;
  sectionsJson: Record<string, unknown>;
  seoJson: Record<string, unknown> | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Public website endpoints

```txt
GET /api/public/events/:eventSlug/website
GET /api/public/events/:eventSlug/pages/:pageKey
```

**Published website overview response**

```ts
export type PublishedWebsiteOverviewResponse = {
  event: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    description: string | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
    startsAt: string | null;
    endsAt: string | null;
    timezone: string;
    venueName: string | null;
    venueAddress: string | null;
    isOnline: boolean;
    onlineUrl: string | null;
  };
  websiteSettings: Record<string, unknown> | null;
  branding: Record<string, unknown> | null;
  pages: Array<{
    pageKey: string;
    title: string;
  }>;
};
```

**Published page response**

```ts
export type PublishedWebsitePageResponse = {
  event: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
  };
  page: {
    id: string;
    pageKey: string;
    title: string;
    sectionsJson: Record<string, unknown>;
    seoJson: Record<string, unknown> | null;
  };
};
```

## 10. Recommended implementation order

1. Build organiser event creation and event list.
2. Build event dashboard shell with overview, settings, and analytics.
3. Add ticket type CRUD and order management.
4. Add Paystack redirect checkout for paid ticket orders.
5. Add forms builder and submission UI.
6. Add merch catalog management.
7. Add website page CMS and public event website rendering.

## 11. Backend gaps that affect frontend scope

- Guest ticket purchase is not truly available yet because `POST /events/:eventId/ticket-orders` is protected.
- Public form registration is not truly available yet because `POST /forms/:formId/submissions` is protected.
- Merch payments do not have a checkout initializer yet.
- There is no public event-detail endpoint outside the public website endpoints.
