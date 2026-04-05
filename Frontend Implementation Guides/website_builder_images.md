# Website Builder Image Upload Architecture

This guide defines the long-term image approach for the website builder so the frontend and backend can evolve cleanly without reworking the data model later.

## Goal

Allow website-builder users to:

- upload hero backgrounds
- upload section images
- upload logo assets
- upload gallery images
- replace and delete uploaded images
- reuse already-uploaded images later

The recommended production approach is:

1. frontend asks backend for a signed upload URL
2. frontend uploads directly to object storage
3. frontend tells backend the upload is complete
4. backend stores normalized asset metadata
5. website config/page data stores asset references, not raw files

This is better than proxying all file bytes through the app server because it scales better, keeps uploads faster, and is easier to secure and observe.

## Recommended Storage Model

Use one persistent media table for website-builder assets.

Suggested shape:

```ts
type WebsiteAsset = {
  id: string;
  eventId: string;
  ownerId: string;
  category: 'hero' | 'section' | 'logo' | 'gallery' | 'seo' | 'custom-block';
  storageProvider: 's3';
  bucket: string;
  objectKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
  updatedAt: string;
};
```

The website config should reference `assetId` and `url` where helpful, for example:

```ts
type SectionImageRef = {
  assetId: string;
  url: string;
  altText?: string;
};
```

This lets us later add media-library reuse without changing every website section again.

## Backend Ownership And Auth Rules

Backend should enforce these rules on every image endpoint:

- only authenticated event owners, event admins, or users with website-builder permission can sign uploads
- only authenticated event owners, event admins, or users with website-builder permission can finalize assets
- only authenticated event owners, event admins, or users with website-builder permission can list assets
- only authenticated event owners, event admins, or users with website-builder permission can delete assets
- a user may only manage assets for events they can edit
- public website visitors must never be able to sign, finalize, list, or delete website assets

Recommended auth behavior:

- `401` when there is no valid auth token
- `403` when the user is authenticated but does not have access to that event
- `404` when the event does not exist

## Backend Data Model

Recommended Prisma model:

```prisma
model WebsiteAsset {
  id              String   @id @default(cuid())
  eventId          String
  ownerId          String
  category         WebsiteAssetCategory
  storageProvider  WebsiteAssetStorageProvider @default(S3)
  bucket           String
  objectKey        String   @unique
  url              String
  mimeType         String
  originalFilename String
  sizeBytes        Int
  width            Int?
  height           Int?
  altText          String?
  status           WebsiteAssetStatus @default(PENDING)
  checksum         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  finalizedAt      DateTime?
  deletedAt        DateTime?

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId, category, createdAt])
  @@index([eventId, status])
  @@index([ownerId, createdAt])
}

enum WebsiteAssetCategory {
  HERO
  SECTION
  LOGO
  GALLERY
  SEO
  CUSTOM_BLOCK
}

enum WebsiteAssetStorageProvider {
  S3
}

enum WebsiteAssetStatus {
  PENDING
  READY
  FAILED
  DELETED
}
```

Notes:

- `PENDING` means signed but not finalized yet
- `READY` means upload is complete and safe to reference in website config
- `FAILED` means finalize failed or upload could not be verified
- `DELETED` supports soft deletion if preferred
- if your backend does not want soft deletes, `deletedAt` and `DELETED` can be dropped

## Website Config Contract

Backend should expect website config and page JSON to store normalized image references instead of raw upload payloads.

Recommended shapes:

```ts
type WebsiteAssetRef = {
  assetId: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
};

type SectionOverrides = {
  heroImage?: WebsiteAssetRef;
  backgroundImage?: WebsiteAssetRef;
  logoImage?: WebsiteAssetRef;
  iconImage?: WebsiteAssetRef;
};
```

Recommended usage by section:

- `hero.overrides.heroImage`
- `hero.overrides.logoImage`
- `about.overrides.backgroundImage`
- `tickets.overrides.backgroundImage`
- `sponsors.overrides.backgroundImage`
- `gallery.overrides.galleryImages`

Recommended example stored JSON:

```json
{
  "heroImage": {
    "assetId": "clxhero123",
    "url": "https://cdn.example.com/events/evt_123/website/hero/clxhero123-cover.jpg",
    "altText": "Students smiling at the event",
    "width": 1600,
    "height": 900
  }
}
```

## Backend API Contract

### 1. Request signed upload

`POST /events/:eventId/website/assets/sign`

Request:

```json
{
  "filename": "hero-cover.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "category": "hero"
}
```

Response:

```json
{
  "assetId": "asset_123",
  "uploadUrl": "https://s3-presigned-url...",
  "publicUrl": "https://cdn.example.com/events/event_123/hero/asset_123.jpg",
  "objectKey": "events/event_123/hero/asset_123.jpg",
  "headers": {
    "Content-Type": "image/jpeg"
  }
}
```

Notes:

- backend validates event ownership and allowed category
- backend decides final object key
- frontend must not invent storage paths itself

Validation:

- reject unsupported mime types with `400`
- reject oversized files with `400`
- reject unsupported categories with `400`
- reject missing filename or mime type with `400`

Recommended error response:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Unsupported file type for website asset upload"
}
```

### 2. Upload directly to storage

Frontend performs:

`PUT uploadUrl`

Headers:

```http
Content-Type: image/jpeg
```

Body:

- raw file bytes

### 3. Finalize asset

`POST /events/:eventId/website/assets`

Request:

```json
{
  "assetId": "asset_123",
  "category": "hero",
  "url": "https://cdn.example.com/events/event_123/hero/asset_123.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "width": 1600,
  "height": 900,
  "altText": "Crowd photo for event hero"
}
```

Response:

```json
{
  "id": "asset_123",
  "eventId": "event_123",
  "category": "hero",
  "url": "https://cdn.example.com/events/event_123/hero/asset_123.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "width": 1600,
  "height": 900,
  "altText": "Crowd photo for event hero",
  "createdAt": "2026-04-04T19:00:00.000Z"
}
```

Backend finalize behavior:

- verify the pending asset belongs to the event
- verify asset category matches the pending signed upload
- verify storage object exists
- verify uploaded file size is within allowed limit
- update the asset record to `READY`
- set `finalizedAt`

If finalize fails after signing, backend should either:

- leave asset in `FAILED` status for cleanup, or
- delete the pending record and object immediately

### 4. List assets

`GET /events/:eventId/website/assets?category=hero`

Response:

- list of assets already uploaded for this event

This powers a future media library.

Recommended response:

```json
{
  "data": [
    {
      "id": "asset_123",
      "eventId": "event_123",
      "category": "hero",
      "url": "https://cdn.example.com/events/event_123/website/hero/asset_123-cover.jpg",
      "mimeType": "image/jpeg",
      "sizeBytes": 482193,
      "width": 1600,
      "height": 900,
      "altText": "Crowd photo for event hero",
      "status": "READY",
      "createdAt": "2026-04-04T19:00:00.000Z",
      "updatedAt": "2026-04-04T19:00:00.000Z"
    }
  ]
}
```

Recommended query params:

- `category`
- `status`
- `cursor`
- `limit`

### 5. Delete asset

`DELETE /events/:eventId/website/assets/:assetId`

Behavior:

- removes DB record
- deletes storage object or marks for async cleanup

Recommended delete rules:

- if the asset is still referenced by website config, backend may either:
  - reject delete with `409`, or
  - allow delete only if caller explicitly passes `force=true`
- if soft delete is used:
  - set status to `DELETED`
  - set `deletedAt`
  - enqueue object cleanup
- if hard delete is used:
  - delete storage object
  - delete DB row

Recommended conflict error:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Asset is still referenced by website content"
}
```

## Validation Matrix

Recommended backend constraints by category:

| Category | Mime Types | Max Size | Notes |
|---|---|---:|---|
| `hero` | jpeg, png, webp | 10MB | Large visual, allow larger files |
| `section` | jpeg, png, webp, svg | 8MB | For content imagery |
| `logo` | png, webp, svg | 4MB | Prefer transparent images |
| `gallery` | jpeg, png, webp | 12MB | Can be larger than section images |
| `seo` | jpeg, png, webp | 5MB | Social preview asset |
| `custom-block` | jpeg, png, webp, svg | 8MB | Flexible builder content |

Recommended generic rules:

- minimum size: reject empty files
- maximum filename length: 255 chars
- sanitize original filename before key generation
- backend owns final object key naming
- reject finalize for assets still in `PENDING` too long

## Error Contract

All endpoints should use a predictable error shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "File size exceeds maximum allowed size for hero uploads",
  "code": "WEBSITE_ASSET_TOO_LARGE"
}
```

Recommended codes:

- `WEBSITE_ASSET_INVALID_TYPE`
- `WEBSITE_ASSET_TOO_LARGE`
- `WEBSITE_ASSET_INVALID_CATEGORY`
- `WEBSITE_ASSET_NOT_FOUND`
- `WEBSITE_ASSET_UPLOAD_NOT_FINALIZED`
- `WEBSITE_ASSET_STORAGE_MISSING`
- `WEBSITE_ASSET_IN_USE`
- `WEBSITE_ASSET_EVENT_FORBIDDEN`

## Replacement And Deletion Rules

Backend and frontend should follow these rules consistently:

- replacing a section image does not have to delete the old asset immediately
- after replacement, config should point to the new asset ref only
- old assets become unreferenced assets
- backend can later clean up unreferenced assets with a scheduled job

Recommended cleanup behavior:

- pending assets older than 24 hours can be deleted automatically
- ready assets no longer referenced by website config for 7 to 30 days can be deleted automatically

This is safer than immediate deletion because it avoids breaking draft websites if users undo or swap assets frequently.

## Asset Reference Rules

Frontend should only write `READY` assets into website config.

Backend should treat these as valid references:

- assets with matching `eventId`
- assets in `READY` status
- assets not soft-deleted

Backend should reject or ignore:

- cross-event asset references
- pending asset references
- deleted asset references

## Recommended Controller Surface

Suggested backend controllers:

- `WebsiteAssetController.signUpload`
- `WebsiteAssetController.finalizeAsset`
- `WebsiteAssetController.listAssets`
- `WebsiteAssetController.deleteAsset`

Suggested service methods:

- `websiteAssetService.createSignedUpload(...)`
- `websiteAssetService.finalizeUpload(...)`
- `websiteAssetService.listAssets(...)`
- `websiteAssetService.deleteAsset(...)`
- `websiteAssetService.cleanupPendingAssets()`
- `websiteAssetService.cleanupUnusedAssets()`

## Recommended Object Key Strategy

Backend should generate object keys, for example:

`events/{eventId}/website/{category}/{assetId}-{safeFilename}`

Example:

`events/evt_123/website/hero/clxhero123-lagos-couples-connect-cover.jpg`

## Signed Upload Security Notes

Recommended rules for signed upload generation:

- signed URL should expire quickly, e.g. 5 to 15 minutes
- only allow single-object PUT
- bind content type if your storage provider supports it
- do not expose bucket write credentials to frontend
- do not trust frontend-provided object keys

## Backend Handoff Checklist

This guide is backend-complete only if all of these are implemented:

- auth and authorization checks
- `WebsiteAsset` persistence model
- signed upload endpoint
- finalize endpoint
- asset listing endpoint
- asset deletion endpoint
- storage verification on finalize
- validation and error codes
- cleanup strategy for pending/unreferenced assets
- config reference validation

## Frontend Upload Flow

The builder should use this sequence:

1. user picks an image
2. frontend validates size and mime type
3. frontend optionally reads dimensions locally
4. frontend requests signed upload data from backend
5. frontend uploads file directly to storage
6. frontend calls finalize endpoint
7. frontend writes returned asset reference into website config
8. autosave persists config as usual

Suggested frontend service interface:

```ts
type SignedUploadRequest = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  category: 'hero' | 'section' | 'logo' | 'gallery' | 'seo' | 'custom-block';
};

type SignedUploadResponse = {
  assetId: string;
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  headers?: Record<string, string>;
};

type FinalizeAssetRequest = {
  assetId: string;
  category: SignedUploadRequest['category'];
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText?: string;
};
```

## How It Fits The Current Frontend

The repo already has:

- [website-upload.service.ts](/Users/mac/Documents/Munar/Codebase/munar-admin/src/services/website-upload.service.ts)
- [SingleImageField.tsx](/Users/mac/Documents/Munar/Codebase/munar-admin/src/components/website-builder/SingleImageField.tsx)

Right now that service uploads through:

- `POST /events/:eventId/website/upload`

That is workable short-term, but the recommended migration path is:

1. keep `SingleImageField` as the UI component
2. replace the current upload implementation inside `website-upload.service.ts`
3. change it from direct app-server upload to signed-upload orchestration

That means the UI API can remain nearly the same while the backend becomes more scalable.

## Suggested Website Config Additions

Recommended additions to section overrides:

```ts
type SectionImageRef = {
  assetId?: string;
  url: string;
  altText?: string;
};

type SectionOverrides = {
  heroImage?: SectionImageRef;
  backgroundImage?: SectionImageRef;
  iconImage?: SectionImageRef;
};
```

Examples:

- `hero.heroImage`
- `about.backgroundImage`
- `sponsors.backgroundImage`
- `gallery.images[]`

This is preferable to scattering loose string URLs everywhere.

## Validation Rules

Backend should enforce:

- allowed mime types
- max file size
- allowed category values
- event ownership
- image-only uploads for website assets

Frontend should enforce:

- immediate size/type checks
- optional dimension hints
- optimistic preview while upload is in progress

## CDN / Delivery Notes

Recommended:

- serve images through a CDN URL, not raw bucket URLs
- normalize object keys by event and category
- strip EXIF when appropriate
- generate responsive variants later if needed

Example object key:

`events/{eventId}/website/{category}/{assetId}-{safeFilename}`

## Rollout Plan

### Phase 1

- backend implements signed upload endpoints
- frontend upgrades `website-upload.service.ts`
- builder uses uploaded URLs for hero and logo first

### Phase 2

- add section image controls in the right inspector
- support replacing and deleting section images
- add gallery and custom block image support

### Phase 3

- add reusable media library picker
- add alt text editing
- add focal point / crop metadata
- add responsive image variants

## Recommended Frontend Next Step

The next frontend implementation step should be:

1. extend `SectionOverrides` with image reference fields
2. use `SingleImageField` in the inspector for hero/section image selection
3. keep the current upload UI shape
4. swap the service implementation to signed uploads as soon as backend endpoints are available

This keeps the UI work moving now without locking the project into a weak upload architecture.

## Recommendation On Frontend Timing

For the frontend, the best split is:

### Safe to implement now

- extend website config types with image reference fields
- add image pickers in the builder UI using `SingleImageField`
- render uploaded image URLs in the templates
- keep the current upload UI shape stable

### Better to wait for backend confirmation

- swapping `website-upload.service.ts` to the final signed-upload flow
- finalizing exact response parsing
- deletion behavior tied to backend asset lifecycle rules
- any media-library browsing endpoints

Recommendation:

- go ahead now with the frontend data model and UI
- wait for backend’s implementation guide or contract confirmation before replacing the upload service transport layer

That gives us forward progress without hardcoding the wrong API shape.
