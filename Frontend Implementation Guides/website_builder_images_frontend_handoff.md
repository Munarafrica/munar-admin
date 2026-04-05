# Website Builder Image Upload Frontend Handoff

This is the short frontend-only contract for the website-builder image flow.

## Upload Flow

Frontend should use this sequence:

1. call sign upload
2. upload file bytes directly to `uploadUrl`
3. call finalize
4. store the returned `assetId` and `url`
5. use that same `url` for preview and display

## Important Rules

- `uploadUrl` is only for direct browser upload with `PUT`
- do not use `uploadUrl` for image preview
- use the returned asset `url` for display
- do not build raw S3 URLs manually
- sign, finalize, and list all converge on the same display URL shape
- list response shape is top-level:

```json
{
  "data": [...],
  "nextCursor": null
}
```

## Auth

These endpoints require:

- `Authorization: Bearer <access_token>`

Allowed roles:

- `OWNER`
- `ADMIN`
- `EDITOR`

## 1. Sign Upload

- Method: `POST`
- URL: `/api/events/:eventId/website/assets/sign`

### Request

```json
{
  "filename": "hero-cover.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "category": "hero"
}
```

### Response

```json
{
  "assetId": "a611de88-2014-4298-b2c8-8c43302e10f1",
  "uploadUrl": "https://s3-presigned-url...",
  "publicUrl": "http://localhost:8000/api/public/website-assets/a611de88-2014-4298-b2c8-8c43302e10f1",
  "objectKey": "events/event_123/website/hero/a611de88-2014-4298-b2c8-8c43302e10f1-hero-cover.jpg",
  "headers": {
    "Content-Type": "image/jpeg"
  },
  "expiresInSeconds": 900
}
```

### Frontend Action

- upload the raw file with `PUT uploadUrl`
- include the returned `headers`
- keep `assetId`
- keep `publicUrl`

## 2. Direct Upload To Storage

- Method: `PUT`
- URL: `uploadUrl` from sign response

### Required Headers

```http
Content-Type: image/jpeg
```

### Body

- raw file bytes

## 3. Finalize Asset

- Method: `POST`
- URL: `/api/events/:eventId/website/assets`

### Request

```json
{
  "assetId": "a611de88-2014-4298-b2c8-8c43302e10f1",
  "category": "hero",
  "url": "http://localhost:8000/api/public/website-assets/a611de88-2014-4298-b2c8-8c43302e10f1",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "width": 1600,
  "height": 900,
  "altText": "Crowd photo for event hero"
}
```

### Response

```json
{
  "id": "a611de88-2014-4298-b2c8-8c43302e10f1",
  "eventId": "event_123",
  "ownerId": "user_123",
  "category": "hero",
  "storageProvider": "s3",
  "bucket": "munar-assets",
  "objectKey": "events/event_123/website/hero/a611de88-2014-4298-b2c8-8c43302e10f1-hero-cover.jpg",
  "url": "http://localhost:8000/api/public/website-assets/a611de88-2014-4298-b2c8-8c43302e10f1",
  "mimeType": "image/jpeg",
  "originalFilename": "hero-cover.jpg",
  "sizeBytes": 482193,
  "width": 1600,
  "height": 900,
  "altText": "Crowd photo for event hero",
  "status": "READY",
  "checksum": "etag-value",
  "createdAt": "2026-04-04T19:00:00.000Z",
  "updatedAt": "2026-04-04T19:01:00.000Z",
  "finalizedAt": "2026-04-04T19:01:00.000Z",
  "deletedAt": null
}
```

### Frontend Action

- use `response.id` as the asset id
- use `response.url` as the image URL for preview/display
- store `assetId` and `url` in website JSON
- only reference assets that are `READY`

## 4. List Assets

- Method: `GET`
- URL: `/api/events/:eventId/website/assets`

Optional query params:

- `category`
- `status`
- `cursor`
- `limit`
- `search`

### Response

```json
{
  "data": [
    {
      "id": "a611de88-2014-4298-b2c8-8c43302e10f1",
      "eventId": "event_123",
      "ownerId": "user_123",
      "category": "hero",
      "storageProvider": "s3",
      "bucket": "munar-assets",
      "objectKey": "events/event_123/website/hero/a611de88-2014-4298-b2c8-8c43302e10f1-hero-cover.jpg",
      "url": "http://localhost:8000/api/public/website-assets/a611de88-2014-4298-b2c8-8c43302e10f1",
      "mimeType": "image/jpeg",
      "originalFilename": "hero-cover.jpg",
      "sizeBytes": 482193,
      "width": 1600,
      "height": 900,
      "altText": "Crowd photo for event hero",
      "status": "READY",
      "checksum": "etag-value",
      "createdAt": "2026-04-04T19:00:00.000Z",
      "updatedAt": "2026-04-04T19:01:00.000Z",
      "finalizedAt": "2026-04-04T19:01:00.000Z",
      "deletedAt": null
    }
  ],
  "nextCursor": null
}
```

### Exact Shape

```json
{
  "data": [...],
  "nextCursor": null
}
```

Not:

```json
{
  "data": {
    "data": [...],
    "nextCursor": null
  }
}
```

## 5. Delete Asset

- Method: `DELETE`
- URL: `/api/events/:eventId/website/assets/:assetId`

Optional query param:

- `force=true`

### Response

```json
{
  "deleted": true,
  "assetId": "a611de88-2014-4298-b2c8-8c43302e10f1",
  "status": "DELETED"
}
```

## Categories

Use these lowercase category values:

- `hero`
- `section`
- `logo`
- `gallery`
- `seo`
- `custom-block`

## Recommended Stored Asset Ref

```json
{
  "assetId": "a611de88-2014-4298-b2c8-8c43302e10f1",
  "url": "http://localhost:8000/api/public/website-assets/a611de88-2014-4298-b2c8-8c43302e10f1",
  "altText": "Crowd photo for event hero",
  "width": 1600,
  "height": 900
}
```

## Public Display URL

The browser-loadable image URL is:

```text
/api/public/website-assets/:assetId
```

This is the URL frontend should use in image tags and previews.
