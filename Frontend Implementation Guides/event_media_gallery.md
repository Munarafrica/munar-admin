# Event Media Gallery Frontend Implementation Guide

This guide covers the Event Media Gallery screen shown in the attached desktop screenshot.

## Backend Status

The backend partially supports event media, but it does not yet support the full gallery product surface shown in the screenshot.

Existing backend support:

- Generic media upload module:
  - `POST /api/media/uploads/initiate`
  - `POST /api/media/assets/:assetId/complete`
  - `GET /api/media/assets?eventId=:eventId&assetType=:assetType`
  - `GET /api/media/assets/:assetId`
  - `GET /api/media/assets/:assetId/access-url`
  - `DELETE /api/media/assets/:assetId`
- Website asset gallery module:
  - `POST /api/events/:eventId/website/assets/sign`
  - `POST /api/events/:eventId/website/assets`
  - `GET /api/events/:eventId/website/assets?category=gallery`
  - `DELETE /api/events/:eventId/website/assets/:assetId`
  - `GET /api/public/website-assets/:assetId`

Current limitations for the screenshot:

- generic media upload only accepts `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/svg+xml`, and `application/pdf`
- generic media upload does not currently accept video MIME types
- generic media upload only allows asset types: `event_cover`, `event_logo`, `website_image`, `product_image`, `general`, `document`, and `form_attachment`
- website gallery assets support image uploads, not videos
- no first-class gallery caption field exists
- no first-class featured or hidden gallery flags exist
- no gallery-specific summary endpoint exists for `Total Media`, `Videos`, `Featured`, or `Storage`
- no endpoint exists for updating gallery metadata after upload
- search exists only for website assets by `originalFilename`, not by caption

Recommendation:

- If the frontend needs to ship immediately with image-only gallery uploads, use the existing website asset flow with `category: "gallery"`.
- If the frontend must match the screenshot exactly, add a first-class event gallery backend surface before implementation.

## Screenshot Requirements

The screenshot implies the following frontend functionality:

- event-scoped gallery page at a route like `/events/:eventId/gallery`
- back navigation to the event management area
- primary actions:
  - `View Gallery`
  - `Upload Media`
- summary cards:
  - `Total Media`
  - `Videos`
  - `Featured`
  - `Storage`
- filter tabs:
  - `All Media`
  - `Photos`
  - `Videos`
  - `Featured`
  - `Hidden`
- caption search input
- media grid with image thumbnails
- video tiles with play overlay and duration label
- visible featured state for featured items
- hidden state for hidden items
- upload flow for multiple files

## Current Image-Only Implementation Path

Use this only if videos and featured/hidden/caption workflows are deferred.

### List Gallery Images

```http
GET /api/events/:eventId/website/assets?category=gallery&status=READY&limit=100
Authorization: Bearer <access_token>
```

Response shape:

```ts
type WebsiteGalleryAssetListResponse = {
  data: WebsiteGalleryAsset[];
  nextCursor: string | null;
};

type WebsiteGalleryAsset = {
  id: string;
  eventId: string;
  ownerId: string;
  category: 'gallery';
  storageProvider: 's3';
  bucket: string;
  objectKey: string;
  url: string;
  mimeType: string;
  originalFilename: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  status: 'PENDING' | 'READY' | 'FAILED' | 'DELETED';
  checksum: string | null;
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
  deletedAt: string | null;
};
```

Frontend mapping:

- thumbnail URL: `asset.url`
- display caption fallback: `asset.altText ?? asset.originalFilename`
- media type: image only
- storage card: sum `asset.sizeBytes`
- total media card: `data.length`
- videos card: `0`
- featured card: `0`
- hidden tab: hide or render an empty state until backend supports hidden media

### Upload Gallery Image

1. Sign upload:

```http
POST /api/events/:eventId/website/assets/sign
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "filename": "event-crowd.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "category": "gallery"
}
```

2. Upload file bytes directly to the returned `uploadUrl`:

```http
PUT <uploadUrl>
Content-Type: image/jpeg
```

Use the returned `headers` from the sign response.

3. Finalize:

```http
POST /api/events/:eventId/website/assets
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "assetId": "asset-id",
  "category": "gallery",
  "url": "http://localhost:8000/api/public/website-assets/asset-id",
  "mimeType": "image/jpeg",
  "sizeBytes": 482193,
  "width": 1600,
  "height": 900,
  "altText": "Crowd photo from the event"
}
```

### Delete Gallery Image

```http
DELETE /api/events/:eventId/website/assets/:assetId
Authorization: Bearer <access_token>
```

If the asset is referenced by website content, the backend may return a conflict. Only use `force=true` after confirming destructive intent in the UI.

```http
DELETE /api/events/:eventId/website/assets/:assetId?force=true
```

## Recommended Full Backend Contract

To fully support the screenshot, implement a dedicated event gallery API instead of stretching website assets.

Suggested model:

```ts
type EventGalleryMedia = {
  id: string;
  eventId: string;
  tenantId: string;
  uploadedByUserId: string;
  kind: 'PHOTO' | 'VIDEO';
  status: 'PENDING' | 'READY' | 'FAILED' | 'HIDDEN';
  storageKey: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  originalFilename: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  caption: string | null;
  altText: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type EventGallerySummary = {
  totalMedia: number;
  photos: number;
  videos: number;
  featured: number;
  hidden: number;
  storageBytes: number;
};
```

Suggested endpoints:

```http
GET /api/events/:eventId/gallery/media?kind=PHOTO&featured=true&status=READY&search=crowd&cursor=&limit=50
GET /api/events/:eventId/gallery/summary
POST /api/events/:eventId/gallery/media/sign
POST /api/events/:eventId/gallery/media/:mediaId/finalize
PATCH /api/events/:eventId/gallery/media/:mediaId
DELETE /api/events/:eventId/gallery/media/:mediaId
```

Suggested upload MIME support:

- photos: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- videos: `video/mp4`, `video/quicktime`, `video/webm`

Suggested metadata update body:

```json
{
  "caption": "Closing celebration",
  "altText": "Crowd cheering during closing celebration",
  "isFeatured": true,
  "status": "READY",
  "sortOrder": 10
}
```

## Frontend UX Guide

Build the screen around a single event ID.

Initial load:

- fetch the event title/context if the route does not already have it
- fetch summary cards
- fetch the first page of gallery media
- default tab should be `All Media`

Tab behavior:

- `All Media`: no kind or featured filter
- `Photos`: `kind=PHOTO`
- `Videos`: `kind=VIDEO`
- `Featured`: `featured=true`
- `Hidden`: `status=HIDDEN`

Search behavior:

- debounce caption search by 250-400ms
- reset pagination when the search value changes
- search against caption and filename when the full backend contract exists
- if using current website gallery assets, search only maps to the backend `search` query and matches `originalFilename`

Upload behavior:

- open a modal/dropzone from `Upload Media`
- support selecting multiple files
- validate size and MIME type before requesting signed URLs
- show per-file progress states: `signing`, `uploading`, `finalizing`, `ready`, `failed`
- after finalize, prepend or refetch gallery media and refresh summary cards
- for current website assets, allow images only and tell the user videos are not available yet

Grid behavior:

- render a stable responsive grid
- use the returned browser-loadable `url` for thumbnails
- show a play icon and duration only for videos
- show skeleton tiles while loading
- show an empty state per tab
- provide a tile menu for actions like edit caption, feature/unfeature, hide/unhide, and delete once the backend supports them

Summary card calculations:

- use `GET /api/events/:eventId/gallery/summary` when implemented
- for image-only current backend, calculate locally from the loaded `data`, but label totals as loaded-page totals if pagination is used

## Frontend Prompt

Use this prompt to implement the frontend:

```text
Implement the Event Media Gallery screen for the event management area.

Route: /events/:eventId/gallery

Use the attached screenshot as the visual and interaction reference. The screen should include back navigation, title "Event Media Gallery", helper text, "View Gallery" and "Upload Media" actions, summary cards for Total Media, Videos, Featured, and Storage, tabs for All Media, Photos, Videos, Featured, and Hidden, a caption search input, and a responsive media grid with image thumbnails and video play overlays.

Backend status:
- The current backend supports image-only gallery uploads through website assets:
  - GET /api/events/:eventId/website/assets?category=gallery&status=READY&limit=100
  - POST /api/events/:eventId/website/assets/sign
  - PUT uploadUrl returned by the sign endpoint
  - POST /api/events/:eventId/website/assets
  - DELETE /api/events/:eventId/website/assets/:assetId
- Use Authorization: Bearer <access_token> on backend API calls.
- Use asset.url for previews and thumbnails.
- Use category: "gallery" for signing and finalizing uploads.
- Current backend gallery support is image-only. Disable video upload for now or show a clear "Video support coming soon" message.
- Current backend has no featured/hidden/caption update endpoint. Render Featured and Hidden tabs as empty or disabled unless a dedicated event gallery API exists.

Implementation requirements:
- Build typed API helpers for list, sign upload, finalize upload, and delete.
- Build a dropzone upload modal that supports multiple images.
- Validate image MIME types before upload: image/jpeg, image/jpg, image/png, image/webp.
- For each file, call sign, upload the raw file bytes to uploadUrl with returned headers, then finalize with assetId, category, publicUrl, MIME type, sizeBytes, width, height, and an optional altText/caption value.
- After successful uploads, refetch the gallery list and recompute summary cards.
- Compute Total Media and Storage from loaded assets. Videos and Featured should be zero until backend support is added.
- Implement debounced search using the backend search query, noting it searches originalFilename in the current backend.
- Keep the grid layout stable on desktop and mobile.
- Add loading, empty, failed upload, and delete-confirmation states.

Future-ready contract:
- Structure the UI state so it can later switch to:
  GET /api/events/:eventId/gallery/media
  GET /api/events/:eventId/gallery/summary
  POST /api/events/:eventId/gallery/media/sign
  POST /api/events/:eventId/gallery/media/:mediaId/finalize
  PATCH /api/events/:eventId/gallery/media/:mediaId
  DELETE /api/events/:eventId/gallery/media/:mediaId
without changing the visual components.
```
