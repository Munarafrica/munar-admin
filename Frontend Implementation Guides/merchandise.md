# Merchandise Frontend Implementation Guide

This guide explains how merchandise currently works from the frontend against the current backend implementation.

It covers:

- event-level merch enablement
- product management for organizers
- merch image upload for product images
- merch order creation and order management
- backend rules the frontend must respect
- important backend gaps the frontend should know before building

Related pricing handoff:

- see `purchase_vat_frontend_handoff.md` for the VAT contract update on orders

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

### 1. Public merch now exists, but shipping quotes are still missing

The backend now supports public merch browsing and checkout:

- `GET /api/public/events/:eventSlug/products`
- `GET /api/public/products/:productId`
- `POST /api/public/events/:eventId/merch-orders`
- `GET /api/public/merch-orders/:orderId?email=...`
- `POST /api/payments/merch-orders/:merchOrderId/initialize-payment`

What is still missing:

- shipping quote calculation
- reservation timers
- full guest order history dashboard
- payment expiry/retry UX beyond the basic order/payment states

### 2. Inventory is deducted on payment confirmation, not at order creation

Current behavior:

- stock is checked when the order is created
- stock is checked again when payment succeeds
- stock is deducted only when the order is confirmed as paid
- there is no reservation hold in the current MVP flow

Frontend implication:

- do not show reservation countdown timers
- a pending checkout is not guaranteed stock until payment succeeds

### 3. Public buyer lookup is email-based for guest orders

Guest buyers can re-open an order with:

- `GET /api/public/merch-orders/:orderId?email=buyer@example.com`

Frontend implication:

- the storefront should keep both `orderId` and `email` after checkout

## Merch Product Image Upload

Merchandise product create and update still use:

- `imageUrl: string`

The intended frontend flow is now:

1. user selects an image file
2. frontend requests a signed merch-image upload
3. frontend uploads the binary file directly to storage using the signed URL
4. frontend finalizes the upload with the backend
5. backend returns a stable public `url`
6. frontend sends that `url` as `imageUrl` when creating or updating the product

### Supported File Types

- `image/png`
- `image/jpeg`
- `image/webp`

### Enforced Max File Size

- `10MB`
- exact backend limit: `10 * 1024 * 1024` bytes

### Upload Endpoints

#### 1. Presign Merch Image Upload

- Method: `POST`
- URL: `/api/uploads/merch-images/presign`
- Auth: required

Request:

```json
{
  "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
  "fileName": "shirt.webp",
  "contentType": "image/webp",
  "size": 245123
}
```

Success response:

```json
{
  "assetId": "0f6fc0b3-2d7f-4d6c-8e46-6c4fba7b6c14",
  "uploadUrl": "https://s3.example.com/...",
  "fileUrl": "http://localhost:8000/api/public/merch-images/0f6fc0b3-2d7f-4d6c-8e46-6c4fba7b6c14",
  "headers": {
    "Content-Type": "image/webp"
  },
  "mimeType": "image/webp",
  "size": 245123,
  "maxFileSizeBytes": 10485760
}
```

Permission rules:

- `OWNER`
- `ADMIN`
- `EDITOR`

Failure cases:

- `404 NOT_FOUND` if the event does not exist
- `403 FORBIDDEN` if the user cannot manage merch for the event
- `400 VALIDATION_ERROR` for unsupported file type
- `400 VALIDATION_ERROR` for file too large

#### 2. Upload Binary To Storage

Use the returned `uploadUrl` and send the file directly to storage.

Example:

```http
PUT <uploadUrl>
Content-Type: image/webp
```

Important:

- use the exact `Content-Type` from `headers`
- do not send the file to the backend app server in this flow

#### 3. Finalize Merch Image Upload

- Method: `POST`
- URL: `/api/uploads/merch-images/:assetId/complete`
- Auth: required

Request:

```json
{
  "contentType": "image/webp",
  "size": 245123
}
```

Success response:

```json
{
  "url": "http://localhost:8000/api/public/merch-images/0f6fc0b3-2d7f-4d6c-8e46-6c4fba7b6c14",
  "mimeType": "image/webp",
  "size": 245123
}
```

Failure cases:

- `404 NOT_FOUND` if the signed upload asset does not exist
- `403 FORBIDDEN` if the user cannot manage merch for the event
- `400 VALIDATION_ERROR` if the uploaded file cannot be found in storage
- `400 VALIDATION_ERROR` if the uploaded file type does not match the signed upload
- `400 VALIDATION_ERROR` if the uploaded file size does not match the signed upload
- `400 VALIDATION_ERROR` if the uploaded file exceeds 10MB

#### 4. Public Image URL

- Method: `GET`
- URL: `/api/public/merch-images/:assetId`
- Auth: none

Frontend note:

- this route is the stable `imageUrl` that should be saved on the product
- the backend redirects to a signed storage access URL behind the scenes

### Recommended Frontend Upload Flow

```ts
const presign = await api.post("/api/uploads/merch-images/presign", {
  eventId,
  fileName: file.name,
  contentType: file.type,
  size: file.size,
});

await fetch(presign.uploadUrl, {
  method: "PUT",
  headers: presign.headers,
  body: file,
});

const finalized = await api.post(
  `/api/uploads/merch-images/${presign.assetId}/complete`,
  {
    contentType: file.type,
    size: file.size,
  },
);

const imageUrl = finalized.url;
```

Then create or update the product with:

```json
{
  "name": "Munar T-Shirt",
  "productType": "PHYSICAL",
  "basePriceMinor": 150000,
  "imageUrl": "http://localhost:8000/api/public/merch-images/0f6fc0b3-2d7f-4d6c-8e46-6c4fba7b6c14"
}
```

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
  "buyerEmail": "buyer@example.com",
  "status": "PENDING",
  "fulfillmentStatus": "UNFULFILLED",
  "paymentStatus": "PENDING",
  "paymentReference": "mnr_mch_52a92907f599_1774145632965",
  "currency": "NGN",
  "subtotalMinor": 300000,
  "vatMinor": 22500,
  "feeMinor": 0,
  "shippingMinor": 0,
  "totalMinor": 322500,
  "shippingAddressJson": {
    "fullName": "Jane Doe",
    "phone": "+2348000000000",
    "line1": "10 Example Street",
    "city": "Lagos",
    "country": "NG"
  },
  "metadataJson": {
    "note": "Please hold for pickup"
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

## Merch Order And Storefront Handoff

This section is the clean frontend handoff for the current backend.

Use it as the launch checklist for:

- organizer dashboard merch management
- public storefront browsing
- guest or authenticated buyer checkout
- payment redirect and order re-open
- organizer-side fulfillment management

## Endpoint Checklist

### Organizer dashboard

- `POST /api/events/:eventId/products`
- `GET /api/events/:eventId/products`
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`
- `POST /api/products/:productId/variants`
- `PATCH /api/product-variants/:variantId`
- `POST /api/events/:eventId/merch-orders`
- `GET /api/merch-orders/:merchOrderId`
- `GET /api/events/:eventId/merch-orders`
- `PATCH /api/merch-orders/:merchOrderId/fulfillment`

### Public storefront

- `GET /api/public/events/:eventSlug/products`
- `GET /api/public/products/:productId`
- `POST /api/public/events/:eventId/merch-orders`
- `GET /api/public/merch-orders/:orderId?email=buyer@example.com`
- `POST /api/payments/merch-orders/:merchOrderId/initialize-payment`

### Authenticated buyer

- `GET /api/me/merch-orders`

## Organizer Order Endpoints

### 7. Create Merch Order

- Method: `POST`
- URL: `/api/events/:eventId/merch-orders`
- Auth: required

Use this for authenticated dashboard or internal staff order creation.

Request example:

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

Important backend rules:

- `email` is required
- `items` must contain at least one item
- each item must belong to the same event
- selected products must be `ACTIVE`
- if a product has variants, `productVariantId` is required
- if tracked inventory is insufficient, the API returns `400`

Pricing and status rules:

- variant price overrides base product price
- `vatMinor = Math.round(subtotalMinor * 0.075)`
- `shippingMinor = 0`
- `feeMinor = 0`
- `totalMinor` already includes VAT
- if `totalMinor > 0`, order starts as `PENDING`
- if `totalMinor === 0`, order is auto-confirmed as paid

### 8. Get Merch Order By ID

- Method: `GET`
- URL: `/api/merch-orders/:merchOrderId`
- Auth: required

Access rules:

- allowed for the buyer attached to the order
- allowed for tenant members managing the event

Success response includes:

- order fields
- `event`
- `items`
- `items.product`
- `items.productVariant`

### 9. List Merch Orders For Event

- Method: `GET`
- URL: `/api/events/:eventId/merch-orders`
- Auth: required

Permission rules:

- `OWNER`
- `ADMIN`
- `EDITOR`
- `STAFF`

Frontend note:

- results are not paginated
- results are ordered by `createdAt desc`
- no server-side filters exist yet

### 10. Update Fulfillment Status

- Method: `PATCH`
- URL: `/api/merch-orders/:merchOrderId/fulfillment`
- Auth: required

Allowed roles:

- `OWNER`
- `ADMIN`
- `STAFF`

Request example:

```json
{
  "fulfillmentStatus": "SHIPPED"
}
```

Allowed values:

- `UNFULFILLED`
- `PROCESSING`
- `READY`
- `SHIPPED`
- `DELIVERED`
- `COMPLETED`
- `CANCELLED`

Important backend note:

- the backend validates enum membership only
- it does not enforce a strict fulfillment transition graph

## Public Storefront Endpoints

### 11. List Public Products

- Method: `GET`
- URL: `/api/public/events/:eventSlug/products`
- Auth: none

Optional query params:

- `search=<text>`
- `productType=PHYSICAL|DIGITAL`
- `category=<text>`
- `inStock=true|false`

Backend rules:

- only returns products with `status = ACTIVE`
- includes variants
- event must be publicly visible
- results are ordered by `createdAt desc`

Response example:

```json
{
  "event": {
    "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "slug": "munar-launch-event",
    "title": "Munar Launch Event",
    "summary": "A short event summary",
    "currency": "NGN"
  },
  "products": []
}
```

### 12. Public Product Detail

- Method: `GET`
- URL: `/api/public/products/:productId`
- Auth: none

Returns:

- product fields
- `variants`
- event summary

Visibility rules:

- product must be `ACTIVE`
- owning event must be publicly visible

### 13. Create Public Merch Order

- Method: `POST`
- URL: `/api/public/events/:eventId/merch-orders`
- Auth: optional

This is the main buyer checkout creation endpoint.

Request example:

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

Frontend notes:

- guest checkout is supported
- authenticated buyers can also use this endpoint
- persist both `order.id` and `email` after success
- use the returned order object as the source of truth for totals

### 14. Public Buyer Order Lookup

- Method: `GET`
- URL: `/api/public/merch-orders/:orderId?email=buyer@example.com`
- Auth: none

Use this after payment redirect for guest buyers.

Rules:

- the email query must match stored `buyerEmail`
- authenticated buyers can also be resolved through their attached buyer identity

### 15. Buyer Order History

- Method: `GET`
- URL: `/api/me/merch-orders`
- Auth: required

Use this for signed-in buyer account pages.

Frontend note:

- results are not paginated
- results are ordered by `createdAt desc`

### 16. Initialize Merch Payment

- Method: `POST`
- URL: `/api/payments/merch-orders/:merchOrderId/initialize-payment`
- Auth: optional

Request example:

```json
{
  "email": "buyer@example.com",
  "callbackUrl": "https://store.example.com/checkout/complete"
}
```

Success response example:

```json
{
  "checkoutUrl": "https://checkout.paystack.com/u85t7odin9bv816",
  "reference": "mnr_mch_52a92907f599_1774145632965",
  "status": "PENDING",
  "provider": "paystack",
  "merchOrderId": "52a92907-f599-4764-ab01-21694a76d631",
  "transactionId": "cfeee453-225f-4a8a-a4c8-69729db7f7d8",
  "accessCode": "u85t7odin9bv816"
}
```

Frontend rules:

- for guest orders, send the same buyer `email` used at order creation
- redirect the buyer to `checkoutUrl`
- after return, reopen the order using public lookup or buyer history
- do not assume payment success until the order is re-fetched and shows paid state

## Exact Checkout Flow

Use this exact storefront flow:

1. Fetch the catalog with `GET /api/public/events/:eventSlug/products`.
2. Open a product detail with `GET /api/public/products/:productId` if needed.
3. Force variant selection when `variants.length > 0`.
4. Create the order with `POST /api/public/events/:eventId/merch-orders`.
5. If `order.totalMinor === 0`, treat the order as immediately confirmed.
6. If `order.totalMinor > 0`, call `POST /api/payments/merch-orders/:merchOrderId/initialize-payment`.
7. Redirect the buyer to `checkoutUrl`.
8. After redirect back, re-fetch the order with `GET /api/public/merch-orders/:orderId?email=...` or `GET /api/me/merch-orders`.
9. Render the final state from the latest order response, not from redirect assumptions.

## Inventory, Payment, And Order State Expectations

### Inventory behavior

- stock is checked at order creation
- stock is checked again during payment confirmation
- stock is deducted only after successful payment confirmation
- there is no stock reservation timer in the current backend

Frontend implication:

- do not show hold timers
- do not promise stock is reserved while an order is still `PENDING`

### Order and payment states

The main states the frontend should expect in the current merch flow are:

- `PENDING`
- `PAID`
- `FAILED`

Typical behavior:

- paid orders start as `PENDING`
- successful payment webhook moves the order to `PAID`
- failed or abandoned payment can move the order to `FAILED`
- free orders can be auto-confirmed immediately

### Fulfillment states

The frontend should expect:

- `UNFULFILLED`
- `PROCESSING`
- `READY`
- `SHIPPED`
- `DELIVERED`
- `COMPLETED`
- `CANCELLED`

## Product UI Rules The Frontend Should Apply

- if `inventoryTracked` is `false`, hide or disable stock count inputs
- treat `basePriceMinor` as the fallback price only
- if variants exist, use variant price and require variant selection
- hide buyer-facing products whose `status !== ACTIVE`
- if `inventoryTracked === true` and `inventoryCount === 0`, show out-of-stock
- for variant products, prefer variant-level stock when available

## Common Failure Cases

### Validation error shape

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
  "path": "/api/public/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/merch-orders",
  "requestId": "req_abc123def4"
}
```

### Business-rule `400` messages to expect

- `Merch cannot be ordered for this event`
- `At least one merch item is required`
- `One or more products are invalid for this event`
- `Product "<name>" is not available`
- `Invalid variant for selected product`
- `Product "<name>" requires a variant selection`
- `Only X unit(s) left for "<name>"`
- `Only X unit(s) left for variant "<name>"`

### Access and lookup errors

- `401 UNAUTHORIZED` for protected dashboard routes without valid auth
- `403 FORBIDDEN` for tenant members without the required role
- `403 FORBIDDEN` for public guest order lookup with the wrong email
- `404 NOT_FOUND` for missing event, product, variant, or order

### Payment-init failure expectations

The frontend should expect `400` or `403` when:

- the merch order is not in a payable state
- the buyer email does not match the order for guest checkout
- the caller is neither the buyer nor an allowed tenant member
- the payment provider initialization fails

## UI To Hide For Now

The backend is not ready for these storefront features yet, so the frontend should hide them:

- shipping quote calculators
- delivery-method selection driven by backend rates
- cart reservation countdown timers
- “items reserved for X minutes” messaging
- guest order history lists beyond single-order email lookup
- discount-code entry tied to backend pricing logic
- storefront analytics or conversion dashboards

## Suggested Frontend Types

```ts
export type ProductType = 'PHYSICAL' | 'DIGITAL';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

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
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'REVERSED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

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
  product: {
    id: string;
    name: string;
    status: ProductStatus;
  };
  productVariant: {
    id: string;
    name: string;
    sku: string | null;
  } | null;
}

export interface MerchOrder {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  buyerEmail: string | null;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus | null;
  paymentReference: string | null;
  currency: string;
  subtotalMinor: number;
  vatMinor: number;
  feeMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingAddressJson: Record<string, unknown> | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
  };
  items: MerchOrderItem[];
}
```

## Final Frontend Notes

- treat all money values as minor units
- do not send unknown UI-only fields
- persist `orderId` plus `email` for guest recovery
- wait for order re-fetch before showing payment success
- use `imageUrl` returned by merch image finalize as the canonical public image URL
