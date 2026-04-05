# Merchandise Frontend Implementation Guide

This guide explains how merchandise currently works from the frontend against the current backend implementation.

It covers:

- event-level merch enablement
- product management for organizers
- merch order creation and order management
- backend rules the frontend must respect
- important backend gaps the frontend should know before building

## Feature Summary

The merch feature is event-scoped.

Each merch product belongs to one event:

- `product.eventId`

Each merch order also belongs to one event:

- `merchOrder.eventId`

Merch enablement is tracked in event settings, not on the product itself:

- `event.settings.modulesEnabledJson.merchandising`

There is also an optional merch configuration bucket:

- `event.settings.merchandisingJson`

At the moment, the backend does not enforce `modulesEnabledJson.merchandising === true` before allowing product or order operations.

That means:

- the frontend should use the event settings to decide whether merch UI should be shown
- but the backend currently allows merch APIs even if the module flag is still `false`

## Important Current Backend Limitations

These are important because they affect what the frontend can realistically ship today.

### 1. No public merch storefront endpoints yet

There is currently no public route like:

- `GET /api/public/events/:eventSlug/products`

All product endpoints are authenticated organizer endpoints.

This means a public event website or guest storefront cannot fetch merch products from a public backend endpoint yet.

### 2. No merch checkout/payment initialization endpoint yet

There is payment initialization for ticket orders, but not for merch orders.

Current merch order behavior:

- if `totalMinor > 0`, the order is created with `status = PENDING`
- if `totalMinor === 0`, the order is auto-confirmed and becomes `PAID`

There is currently no backend endpoint to initialize payment for a merch order.

So for paid merch:

- the frontend can create the order
- the frontend can fetch the order
- but the backend does not yet expose the next payment step

### 3. Merch order creation currently requires auth in practice

The order creation service accepts `userId` as nullable, but the route is not marked public and the app uses a global JWT guard.

So in practice:

- `POST /api/events/:eventId/merch-orders` requires `Authorization: Bearer <access_token>`

This means guest checkout is not available right now.

### 4. Order email is required in the request but is not stored on the merch order

`CreateMerchOrderDto` requires:

- `email`

But the `MerchOrder` model does not contain an `email` field, and the service does not persist it.

So the frontend should know:

- the request must include `email`
- the response will not include `email`
- there is currently no reliable way to re-read the buyer email from the merch order response

### 5. `metadataJson` is accepted on merch order create but currently ignored

The create order DTO accepts:

- `metadataJson`

But the order creation service does not save it to the order or items.

Frontend implication:

- do not rely on `metadataJson` being persisted for merch orders yet

## Event Settings Dependency

When an event is created, the backend initializes event settings like this:

```json
{
  "modulesEnabledJson": {
    "ticketing": false,
    "forms": false,
    "merchandising": false,
    "website": false,
    "analytics": true
  }
}
```

For frontend setup screens, merch should typically be considered enabled when:

```json
{
  "modulesEnabledJson": {
    "merchandising": true
  }
}
```

Optional merch-specific configuration can be stored in:

- `settings.merchandisingJson`

The backend treats that field as raw JSON.

Recommended frontend use for `merchandisingJson`:

- store presentation config
- store shipping policy text
- store pickup instructions
- store merch landing page preferences

But note:

- the backend does not validate its shape
- the backend does not use it in order pricing logic

## Enums The Frontend Should Know

### ProductType

- `PHYSICAL`
- `DIGITAL`

### ProductStatus

- `DRAFT`
- `ACTIVE`
- `PAUSED`
- `ARCHIVED`

### OrderStatus

- `PENDING`
- `RESERVED`
- `PAID`
- `FAILED`
- `CANCELLED`
- `EXPIRED`
- `REFUNDED`
- `FULFILLED`

For merch orders today, the backend actively uses:

- `PENDING`
- `PAID`

### FulfillmentStatus

- `UNFULFILLED`
- `PROCESSING`
- `READY`
- `SHIPPED`
- `DELIVERED`
- `COMPLETED`
- `CANCELLED`

## Core Data Shapes

These are the important model shapes the frontend should expect from the current backend.

### Product

```json
{
  "id": "8ebceca7-b6d9-4ea4-a427-01990de9f04f",
  "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "name": "Munar T-Shirt",
  "productType": "PHYSICAL",
  "description": "Premium branded event t-shirt",
  "status": "ACTIVE",
  "basePriceMinor": 150000,
  "currency": "NGN",
  "inventoryTracked": true,
  "inventoryCount": 200,
  "imageUrl": "https://cdn.example.com/merch/tshirt.png",
  "metadataJson": {
    "category": "apparel"
  },
  "createdAt": "2026-04-02T11:00:00.000Z",
  "updatedAt": "2026-04-02T11:10:00.000Z",
  "variants": [
    {
      "id": "985c4fc3-7824-4e1f-b56b-e7d7988bf75e",
      "productId": "8ebceca7-b6d9-4ea4-a427-01990de9f04f",
      "sku": "MNR-TS-BLK-L",
      "name": "Large / Black",
      "priceMinor": 150000,
      "inventoryCount": 40,
      "attributesJson": {
        "size": "L",
        "color": "Black"
      },
      "createdAt": "2026-04-02T11:05:00.000Z",
      "updatedAt": "2026-04-02T11:05:00.000Z"
    }
  ]
}
```

### Merch Order

```json
{
  "id": "4247be9f-e15e-410a-b57e-e8b61ca8ee0a",
  "tenantId": "7a4d0d65-0f63-4fa5-a0f6-3bdf1c01d917",
  "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "buyerUserId": "f5d694e6-9dca-4881-a0f6-f0c648676fca",
  "status": "PENDING",
  "fulfillmentStatus": "UNFULFILLED",
  "currency": "NGN",
  "subtotalMinor": 300000,
  "feeMinor": 0,
  "shippingMinor": 0,
  "totalMinor": 300000,
  "shippingAddressJson": {
    "fullName": "Jane Doe",
    "phone": "+2348000000000",
    "line1": "10 Example Street",
    "city": "Lagos",
    "country": "NG"
  },
  "createdAt": "2026-04-03T10:30:00.000Z",
  "updatedAt": "2026-04-03T10:30:00.000Z",
  "event": {
    "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "title": "Munar Launch Event",
    "slug": "munar-launch-event"
  },
  "items": [
    {
      "id": "6b2f1fde-ff71-44b6-99bb-aa29ddc01c2b",
      "merchOrderId": "4247be9f-e15e-410a-b57e-e8b61ca8ee0a",
      "productId": "8ebceca7-b6d9-4ea4-a427-01990de9f04f",
      "productVariantId": "985c4fc3-7824-4e1f-b56b-e7d7988bf75e",
      "quantity": 2,
      "unitPriceMinor": 150000,
      "totalPriceMinor": 300000,
      "metadataJson": null,
      "createdAt": "2026-04-03T10:30:00.000Z",
      "product": {
        "id": "8ebceca7-b6d9-4ea4-a427-01990de9f04f",
        "name": "Munar T-Shirt",
        "status": "ACTIVE"
      },
      "productVariant": {
        "id": "985c4fc3-7824-4e1f-b56b-e7d7988bf75e",
        "name": "Large / Black",
        "sku": "MNR-TS-BLK-L"
      }
    }
  ]
}
```

## Authenticated Product Management Endpoints

These endpoints are for the organizer dashboard.

All of them require:

- `Authorization: Bearer <access_token>`

### Permission Rules

Product management is allowed only for tenant roles:

- `OWNER`
- `ADMIN`
- `EDITOR`

Users must also belong to the event's tenant.

## 1. Create Product

- Method: `POST`
- URL: `/api/events/:eventId/products`
- Auth: required

Example:

```http
POST /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/products
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Payload

```json
{
  "name": "Munar T-Shirt",
  "productType": "PHYSICAL",
  "description": "Premium branded event t-shirt",
  "basePriceMinor": 150000,
  "inventoryTracked": true,
  "inventoryCount": 200,
  "imageUrl": "https://cdn.example.com/merch/tshirt.png",
  "metadataJson": {
    "category": "apparel"
  }
}
```

### Validation Rules

- `name` is required and must be at least 2 characters
- `productType` is required and must be `PHYSICAL` or `DIGITAL`
- `basePriceMinor` is required and must be an integer `>= 0`
- `inventoryTracked` is optional and defaults to `true`
- `inventoryCount` is optional but cannot be negative
- `imageUrl` is optional string
- `metadataJson` is optional object
- unknown extra fields are rejected

### Backend Rules

- product is always created with `status = DRAFT`
- product `currency` is copied from the event currency
- if `inventoryTracked === false`, the backend stores `inventoryCount = null`

### Success Response

Returns the created `Product`.

## 2. List Products For Event

- Method: `GET`
- URL: `/api/events/:eventId/products`
- Auth: required

Optional query params:

- `productType=PHYSICAL|DIGITAL`
- `status=DRAFT|ACTIVE|PAUSED|ARCHIVED`
- `search=<text>`

Example:

```http
GET /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/products?status=ACTIVE&search=shirt
Authorization: Bearer <access_token>
```

### Success Response

Returns an array of products, each with:

- product fields
- `variants` array

### Frontend Notes

- results are ordered by `createdAt desc`
- `search` matches against `name` and `description` case-insensitively
- this is an organizer endpoint, not a public storefront endpoint

## 3. Get Product By ID

- Method: `GET`
- URL: `/api/products/:productId`
- Auth: required

### Success Response

Returns one product including:

- `event`
- `variants`

Use this for product detail/edit screens in the dashboard.

## 4. Update Product

- Method: `PATCH`
- URL: `/api/products/:productId`
- Auth: required

### Request Payload

All fields are optional.

```json
{
  "name": "Munar Hoodie",
  "description": "Heavyweight branded hoodie",
  "basePriceMinor": 250000,
  "inventoryTracked": true,
  "inventoryCount": 120,
  "imageUrl": "https://cdn.example.com/merch/hoodie.png",
  "status": "ACTIVE",
  "metadataJson": {
    "category": "apparel"
  }
}
```

### Validation Rules

- `name`, if sent, must be at least 2 characters
- `productType`, if sent, must be valid enum
- `basePriceMinor`, if sent, must be integer `>= 0`
- `inventoryCount`, if sent, must be integer `>= 0`
- `status`, if sent, must be valid enum
- unknown extra fields are rejected

### Important Update Behavior

- if `inventoryTracked` is updated to `false`, the backend sets `inventoryCount` to `null`
- if `inventoryTracked` remains `true`, `inventoryCount` is preserved unless overwritten
- a product can be moved from `DRAFT` to `ACTIVE` purely through this update endpoint

## 5. Create Product Variant

- Method: `POST`
- URL: `/api/products/:productId/variants`
- Auth: required

### Request Payload

```json
{
  "sku": "MNR-TS-BLK-L",
  "name": "Large / Black",
  "priceMinor": 150000,
  "inventoryCount": 40,
  "attributesJson": {
    "size": "L",
    "color": "Black"
  }
}
```

### Validation Rules

- `name` is required and must be at least 2 characters
- `priceMinor` is required and must be integer `>= 0`
- `sku` is optional string
- `inventoryCount` is optional integer `>= 0`
- `attributesJson` is optional object

### Backend Rules

- if the parent product has `inventoryTracked === false`, the backend stores variant `inventoryCount = null`
- `sku` must be unique globally because the schema marks it `@unique`

### Frontend Notes

- variant-specific pricing overrides `product.basePriceMinor` during order creation
- `attributesJson` has no enforced schema, so the frontend should keep it consistent itself

## 6. Update Product Variant

- Method: `PATCH`
- URL: `/api/product-variants/:variantId`
- Auth: required

### Request Payload

All fields are optional.

```json
{
  "name": "Medium / Black",
  "priceMinor": 150000,
  "inventoryCount": 30,
  "attributesJson": {
    "size": "M",
    "color": "Black"
  }
}
```

## Merch Order Endpoints

These endpoints are for creating and managing merch orders.

## 7. Create Merch Order

- Method: `POST`
- URL: `/api/events/:eventId/merch-orders`
- Auth: required in practice

Example:

```http
POST /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/merch-orders
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Payload

```json
{
  "email": "buyer@example.com",
  "items": [
    {
      "productId": "8ebceca7-b6d9-4ea4-a427-01990de9f04f",
      "productVariantId": "985c4fc3-7824-4e1f-b56b-e7d7988bf75e",
      "quantity": 2
    }
  ],
  "shippingAddressJson": {
    "fullName": "Jane Doe",
    "phone": "+2348000000000",
    "line1": "10 Example Street",
    "city": "Lagos",
    "country": "NG"
  },
  "metadataJson": {
    "note": "Please hold for pickup"
  }
}
```

### Validation Rules

- `email` is required and must be a valid email
- `items` is required and must be an array
- `items` must contain at least one item logically, or the service returns `400`
- each item must include:
  - `productId` as UUID
  - optional `productVariantId` as UUID
  - `quantity` as integer `>= 1`
- `shippingAddressJson` is optional object
- `metadataJson` is optional object
- unknown extra fields are rejected

### Important Backend Rules

- event must exist
- event status cannot be `CANCELLED` or `ARCHIVED`
- every `productId` must belong to the same event
- every selected product must have `status = ACTIVE`
- if a product has variants, the frontend must send `productVariantId`
- if a product has no variants, the frontend must not rely on variant selection
- if inventory is tracked and stock is insufficient, the API returns `400`

### Pricing Rules

- if `productVariantId` is provided, price comes from `variant.priceMinor`
- otherwise, price comes from `product.basePriceMinor`
- `subtotalMinor = sum(unit price * quantity)`
- `shippingMinor = 0`
- `feeMinor = 0`
- `totalMinor = subtotalMinor + shippingMinor + feeMinor`

### Status Rules

- if `totalMinor > 0`, order is created as `PENDING`
- if `totalMinor === 0`, order is created as `PAID` and auto-confirmed

### Stock Deduction Rules

Inventory is not deducted during order creation itself.

Inventory is deducted only when the order is confirmed.

Today, confirmation happens automatically only for zero-total orders.

Because paid merch checkout is not implemented yet:

- paid merch orders can remain `PENDING`
- inventory for those pending paid orders is not reserved or deducted by this merch module

This is important for frontend expectations around "items held in cart" or "reserved stock":

- there is currently no cart reservation behavior
- there is currently no timed reservation behavior

### Success Response

Returns the full merch order from `getMerchOrderById`, including:

- `event`
- `items`
- each item's `product`
- each item's `productVariant`

## 8. Get Merch Order By ID

- Method: `GET`
- URL: `/api/merch-orders/:merchOrderId`
- Auth: required in practice

### Access Rules

The user can access the order if either:

- they are the buyer
- or they belong to the tenant that owns the event

If neither is true, the API returns `403 FORBIDDEN`.

### Success Response

Returns one merch order including:

- `event`
- `items.product`
- `items.productVariant`

### Frontend Notes

- there is no dedicated buyer-friendly public lookup endpoint
- do not assume a guest can reopen an order later without auth

## 9. List Merch Orders For Event

- Method: `GET`
- URL: `/api/events/:eventId/merch-orders`
- Auth: required

### Permission Rules

Allowed tenant roles:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `STAFF`

### Success Response

Returns an array of merch orders with:

- `items`
- `items.product`
- `items.productVariant`

### Frontend Notes

- results are ordered by `createdAt desc`
- there are currently no filter query params
- if the dashboard needs filtering, sorting, or pagination, it must do that client-side for now

## 10. Update Fulfillment Status

- Method: `PATCH`
- URL: `/api/merch-orders/:merchOrderId/fulfillment`
- Auth: required

### Permission Rules

Allowed tenant roles:

- `OWNER`
- `ADMIN`
- `STAFF`

Editors can view orders but cannot update fulfillment.

### Request Payload

```json
{
  "fulfillmentStatus": "SHIPPED"
}
```

### Allowed Values

- `UNFULFILLED`
- `PROCESSING`
- `READY`
- `SHIPPED`
- `DELIVERED`
- `COMPLETED`
- `CANCELLED`

### Important Backend Behavior

- the backend only validates enum membership
- it does not enforce a state machine

So the frontend could technically send:

- `UNFULFILLED -> DELIVERED`
- `COMPLETED -> PROCESSING`

If you want a stricter UX, enforce fulfillment transitions on the frontend.

## Recommended Frontend State Model

To keep the UI aligned with the current backend, this is the safest mental model.

### Organizer Dashboard

Use the dashboard for:

- enabling merch in event settings
- creating and editing products
- creating and editing variants
- activating or pausing products
- viewing event merch orders
- updating fulfillment status

### Buyer Experience

The current backend only partially supports buyer-side merch.

What works:

- authenticated user can create a merch order
- authenticated user can fetch their merch order by id

What does not exist yet:

- public product discovery endpoint
- guest checkout
- merch payment initialization
- buyer order history endpoint
- cart reservation logic

So if the frontend still wants to build a buyer-side merch experience now, it must do so with these constraints clearly understood.

## Product UI Rules The Frontend Should Apply

These rules are not all enforced directly by the backend, but they match backend behavior and reduce user error.

### Product Create/Edit

- if `inventoryTracked` is off, hide or disable inventory count inputs
- do not show "in stock" numbers if `inventoryTracked === false`
- treat `basePriceMinor` as the fallback price only
- if variants exist, buyer checkout should use variant prices instead of base price

### Variant Selection

- if `product.variants.length > 0`, require buyer to select one variant before order submit
- use variant `name` as the default display label
- if `attributesJson` is structured, the frontend can render chips like size/color

### Product Availability

Suggested frontend availability logic:

- hide or disable products with `status !== ACTIVE` in any buyer-facing experience
- if `inventoryTracked === true` and `inventoryCount === 0`, show out-of-stock
- if using variants, evaluate stock at variant level when `variant.inventoryCount` is not `null`

## Suggested Frontend Types

These are useful TypeScript shapes for the frontend.

```ts
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

export type OrderStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'FULFILLED';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  priceMinor: number;
  inventoryCount: number | null;
  attributesJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  eventId: string;
  name: string;
  productType: ProductType;
  description: string | null;
  status: ProductStatus;
  basePriceMinor: number;
  currency: string;
  inventoryTracked: boolean;
  inventoryCount: number | null;
  imageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface MerchOrderItem {
  id: string;
  merchOrderId: string;
  productId: string;
  productVariantId: string | null;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  product: Product;
  productVariant: ProductVariant | null;
}

export interface MerchOrder {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotalMinor: number;
  feeMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingAddressJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  event?: Record<string, unknown>;
  items: MerchOrderItem[];
}
```

## Common Failure Cases

### Validation errors

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "items",
      "errors": ["items must be an array"],
      "children": []
    }
  ],
  "timestamp": "2026-04-04T10:20:00.000Z",
  "path": "/api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/merch-orders",
  "requestId": "req_abc123def4"
}
```

### Business-rule `400` cases the frontend should expect

- `Merch cannot be ordered for this event`
- `At least one merch item is required`
- `One or more products are invalid for this event`
- `Product "<name>" is not available`
- `Invalid variant for selected product`
- `Product "<name>" requires a variant selection`
- `Only X unit(s) left for "<name>"`
- `basePriceMinor cannot be negative`
- `priceMinor cannot be negative`
- `inventoryCount cannot be negative`

### Authorization and access errors

- `401 UNAUTHORIZED` if token is missing or invalid
- `403 FORBIDDEN` if user is not in the tenant or lacks role permission
- `404 NOT_FOUND` if event, product, variant, or merch order does not exist

## Suggested Frontend Flows

### Organizer Product Setup Flow

1. Fetch event settings.
2. If merch is not enabled, prompt to enable `modulesEnabledJson.merchandising`.
3. Create product in `DRAFT`.
4. Optionally create variants.
5. Update product to `ACTIVE`.
6. Use list products endpoint to refresh dashboard state.

### Organizer Fulfillment Flow

1. Fetch `GET /api/events/:eventId/merch-orders`.
2. Group orders by `fulfillmentStatus` on the client.
3. Open an order detail view using `GET /api/merch-orders/:merchOrderId`.
4. Update status with `PATCH /api/merch-orders/:merchOrderId/fulfillment`.

### Buyer Checkout Flow With Current Backend

This flow is limited by the current API.

1. Fetch products from an authenticated organizer-capable context only, because no public product API exists yet.
2. Let the user select product and variant.
3. Build the create-order payload.
4. Submit `POST /api/events/:eventId/merch-orders`.
5. If `order.totalMinor === 0`, treat the order as confirmed.
6. If `order.totalMinor > 0`, treat the order as created but awaiting a payment capability that the backend does not yet expose.

## Frontend Recommendations Before Full Buyer Merch Launch

If the goal is a full public merch experience, the frontend should wait for or coordinate backend work for:

- public product listing endpoint
- public product detail endpoint if needed
- guest merch order creation or explicitly authenticated buyer flow
- merch payment checkout initialization
- merch payment webhook confirmation path
- buyer-facing order retrieval/history flow
- shipping fee calculation if needed

## Practical Frontend Notes

- Treat all money values as minor units.
- Do not send unknown UI-only fields; the backend rejects them.
- Do not assume `metadataJson` on order create is persisted.
- Do not assume `email` can be retrieved back from a merch order.
- If you need strict fulfillment transitions, enforce them in the UI because the backend currently does not.
- If you need public storefront pages, that requires new backend endpoints first.
