# DP & Cover Maker Frontend Implementation Guide

This guide covers the DP/profile-picture and cover-maker feature shown in the attached `/events/:eventId/dp-maker` screenshots.

## Backend Status

There is no first-class DP & Cover Maker backend implementation yet.

I checked the backend for dedicated maker/frame/template routes and storage. The current backend does not have:

- a `dp-maker`, `cover-maker`, `event-frame`, or generated-share-card controller
- a persisted template model for frame configuration
- a public attendee-facing DP generator endpoint such as `/api/public/events/:eventSlug/dp`
- a server-side image composition/export endpoint
- a generated image gallery/history endpoint

The backend does have generic pieces the frontend can use for an MVP:

- `GET /api/events/:eventId`
- `PATCH /api/events/:eventId`
- `GET /api/events/:eventId/settings`
- `PATCH /api/events/:eventId/settings`
- `POST /api/media/uploads/initiate`
- `POST /api/media/assets/:assetId/complete`
- `GET /api/media/assets?eventId=:eventId&assetType=:assetType`
- `GET /api/media/assets/:assetId/access-url`
- `DELETE /api/media/assets/:assetId`
- `POST /api/events/:eventId/website/assets/sign`
- `POST /api/events/:eventId/website/assets`
- `GET /api/events/:eventId/website/assets`
- `GET /api/public/website-assets/:assetId`

The global API prefix is `/api`.

## Existing Backend Fields To Reuse

The `Event` model already has:

```ts
type Event = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  settings?: EventSettings | null;
};
```

The `EventSettings` model already has flexible JSON fields:

```ts
type EventSettings = {
  eventId: string;
  brandingJson: Record<string, unknown> | null;
  websiteSettingsJson: Record<string, unknown> | null;
};
```

For the frontend MVP, persist the maker configuration inside `brandingJson.dpCoverMaker`.

## Recommended MVP Architecture

Implement the maker mostly on the frontend:

- admin config page: `/events/:eventId/dp-maker`
- public generator page: frontend route such as `/events/:eventSlug/dp` or `/dp/:eventSlug`
- canvas/SVG composition in the browser
- attendee uploads their own photo locally in the browser
- frontend exports the final DP/cover image with `canvas.toBlob()` or `html-to-image`
- backend only stores the admin template configuration and the uploaded transparent frame asset

Do not upload attendee-generated DP images in the MVP unless product explicitly needs server-side history or moderation.

## Screenshot-Driven Frontend Scope

The admin screen should support:

- back navigation
- title: `Configure Event Frame`
- helper text: `Create a custom frame for attendees to generate branded profile pictures`
- share URL field using the event slug
- copy link action
- open/preview public generator action
- `Preview` button
- `Save & Publish` button
- step tabs: `1. Upload`, `2. Position`, `3. Preview`
- large upload dropzone for the transparent event frame
- image picker labelled `Choose Image`
- right-side `Element Controls` panel
- photo placeholder selection and controls
- name text selection and controls

The controls visible in the screenshots are:

- photo placeholder shape:
  - `circle`
  - `square`
  - `rounded`
  - `hexagon`
  - `star`
  - `heart`
- photo placeholder width
- photo placeholder height
- name text font size slider
- name text font family selector, defaulting to `Raleway`
- name text color picker and hex input
- name text alignment:
  - `left`
  - `center`
  - `right`

Add cover-maker support using the same editor shell with a format switch:

- `dp`: square output, recommended `1080x1080`
- `cover`: landscape output, recommended `1640x924` for Facebook-style cover or `1500x500` for X/Twitter-style cover if the product wants that target

If product has not decided the exact cover target yet, default to `1640x924` and keep the canvas size configurable in code.

## Template Shape

Persist this under `EventSettings.brandingJson.dpCoverMaker`.

```ts
type DpCoverMakerConfig = {
  enabled: boolean;
  published: boolean;
  sharePath: string;
  updatedAt: string;
  variants: {
    dp: DpCoverMakerVariant;
    cover?: DpCoverMakerVariant;
  };
};

type DpCoverMakerVariant = {
  label: 'DP' | 'Cover';
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  frameAsset: {
    assetId: string;
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
  } | null;
  photoPlaceholder: {
    shape: 'circle' | 'square' | 'rounded' | 'hexagon' | 'star' | 'heart';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    borderRadius?: number;
  };
  nameText: {
    enabled: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    align: 'left' | 'center' | 'right';
    placeholder: string;
  };
};
```

Default DP config:

```ts
const defaultDpVariant: DpCoverMakerVariant = {
  label: 'DP',
  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#000000',
  },
  frameAsset: null,
  photoPlaceholder: {
    shape: 'circle',
    x: 340,
    y: 250,
    width: 400,
    height: 400,
    rotation: 0,
  },
  nameText: {
    enabled: true,
    x: 190,
    y: 760,
    width: 700,
    height: 96,
    fontFamily: 'Raleway',
    fontSize: 48,
    fontWeight: 700,
    color: '#ffffff',
    align: 'center',
    placeholder: 'Your Name',
  },
};
```

## Upload Flow For The Frame Asset

Preferred frontend path: use website assets because they produce a browser-loadable public URL.

1. Request a signed upload:

```http
POST /api/events/:eventId/website/assets/sign
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "filename": "event-frame.png",
  "mimeType": "image/png",
  "sizeBytes": 482193,
  "category": "custom-block"
}
```

2. Upload the file directly to the returned `uploadUrl` with the returned `headers`.

3. Finalize the asset:

```http
POST /api/events/:eventId/website/assets
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "assetId": "asset-id-from-sign-step",
  "category": "custom-block",
  "url": "https://api.example.com/api/public/website-assets/asset-id-from-sign-step",
  "mimeType": "image/png",
  "sizeBytes": 482193,
  "width": 1080,
  "height": 1080,
  "altText": "DP maker transparent event frame"
}
```

4. Store the finalized asset data in `brandingJson.dpCoverMaker.variants.dp.frameAsset`.

Fallback path: use generic media upload with `assetType: "event_cover"` or `assetType: "general"`, then call `GET /api/media/assets/:assetId/access-url` when rendering. This is less convenient for a public generator because access URLs are signed and temporary.

## Save And Publish Flow

1. Fetch current settings:

```http
GET /api/events/:eventId/settings
Authorization: Bearer <access_token>
```

2. Merge the existing `brandingJson` with the maker config:

```ts
const nextBrandingJson = {
  ...(settings.brandingJson ?? {}),
  dpCoverMaker: nextConfig,
};
```

3. Save:

```http
PATCH /api/events/:eventId/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "brandingJson": {
    "dpCoverMaker": {
      "enabled": true,
      "published": true,
      "sharePath": "/events/lagos-tech-summit-2026/dp",
      "updatedAt": "2026-04-12T12:00:00.000Z",
      "variants": {
        "dp": {
          "label": "DP",
          "canvas": {
            "width": 1080,
            "height": 1080,
            "backgroundColor": "#000000"
          },
          "frameAsset": {
            "assetId": "asset-id-from-sign-step",
            "url": "https://api.example.com/api/public/website-assets/asset-id-from-sign-step",
            "mimeType": "image/png",
            "width": 1080,
            "height": 1080
          },
          "photoPlaceholder": {
            "shape": "circle",
            "x": 340,
            "y": 250,
            "width": 400,
            "height": 400,
            "rotation": 0
          },
          "nameText": {
            "enabled": true,
            "x": 190,
            "y": 760,
            "width": 700,
            "height": 96,
            "fontFamily": "Raleway",
            "fontSize": 48,
            "fontWeight": 700,
            "color": "#ffffff",
            "align": "center",
            "placeholder": "Your Name"
          }
        }
      }
    }
  }
}
```

Important: send the complete merged `brandingJson`, not only the nested `dpCoverMaker` object, so other branding settings are not lost.

## Public Generator Data

There is no public event settings endpoint for this feature today.

For MVP, use one of these approaches:

- If the public frontend already has the authenticated event data in dashboard preview, render the preview locally from the admin config.
- If the public generator must be reachable by attendees without auth, add a backend endpoint before shipping the public page.

Recommended backend endpoint:

```http
GET /api/public/events/:eventSlug/dp-cover-maker
```

Recommended public response:

```ts
type PublicDpCoverMakerResponse = {
  event: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl: string | null;
    logoUrl: string | null;
  };
  config: DpCoverMakerConfig;
};
```

Return `404` when:

- the event does not exist
- `brandingJson.dpCoverMaker.enabled !== true`
- `brandingJson.dpCoverMaker.published !== true`
- no frame asset is configured for the requested variant

## Canvas Composition Rules

Use a real canvas-based renderer for export.

Recommended libraries:

- `fabric` if the frontend already uses it or needs draggable/resizable objects
- `konva`/`react-konva` for React canvas editing
- plain `<canvas>` for a smaller MVP

Rendering order:

1. background color
2. attendee photo clipped to the selected shape
3. uploaded transparent frame image
4. attendee name text

Admin editor requirements:

- dragging and resizing the photo placeholder on the canvas
- dragging the name text on the canvas
- selecting an element updates the right-side controls
- controls update the selected element immediately
- keep element dimensions stable in the panel
- persist on save only, but keep local unsaved state while editing

Public generator requirements:

- attendee uploads/selects their photo locally
- attendee enters their display name
- attendee chooses `DP` or `Cover` if both variants are published
- preview updates immediately
- export button downloads PNG
- optional native share button via `navigator.share` when supported

## Validation

Frontend should enforce:

- frame upload accepts `image/png`, `image/webp`, `image/jpeg`, `image/svg+xml`, and preferably transparent `image/png`
- max frame upload size must stay under the backend `custom-block` website asset limit: `8MB`
- DP frame recommendation: square image, `1080x1080`
- cover frame recommendation: landscape image matching the selected cover preset
- text color must be valid hex
- placeholder dimensions must be positive numbers
- share URL should use the event `slug`, not the event id

## Backend Gaps Before Full Production

Add backend support if product needs this beyond a dashboard-only MVP:

- public read endpoint: `GET /api/public/events/:eventSlug/dp-cover-maker`
- optional authenticated preview endpoint that returns draft config
- optional dedicated JSON field or model for maker configs instead of `brandingJson`
- optional dedicated asset category such as `dp-frame` and `cover-frame`
- optional server-side image composition endpoint if generated images must be stored, moderated, watermarked, or shared from a stable URL
- analytics event for public generator views/downloads/shares

## Frontend Prompt

Use this prompt in the frontend repo:

```text
Implement the DP & Cover Maker feature for Munar.

Route:
- Add an authenticated admin page at /events/:eventId/dp-maker.
- Add a public attendee generator route at /events/:eventSlug/dp if the app can access a public config endpoint. If that endpoint does not exist yet, build the admin preview and leave the public route behind a clear API TODO.

Backend contract:
- Use GET /api/events/:eventId to load event title and slug.
- Use GET /api/events/:eventId/settings to load EventSettings.
- Read and write the maker config at settings.brandingJson.dpCoverMaker.
- Save by PATCH /api/events/:eventId/settings with the complete merged brandingJson object.
- Upload transparent frame assets with POST /api/events/:eventId/website/assets/sign, direct PUT to uploadUrl, then POST /api/events/:eventId/website/assets using category "custom-block".
- Store finalized frame asset metadata in dpCoverMaker.variants.dp.frameAsset and dpCoverMaker.variants.cover.frameAsset.

Admin UI:
- Match the attached dark Munar UI: back link, "Configure Event Frame" heading, helper copy, share URL field, copy/open controls, Preview and Save & Publish buttons.
- Use a three-step workflow: 1 Upload, 2 Position, 3 Preview.
- Upload step: large dropzone with "Upload Event Frame" and "Choose Image"; recommend square 1080x1080 transparent PNG for DP.
- Right panel: "Element Controls" with Photo Placeholder and Name Text sections.
- Photo Placeholder controls: Select button, shape options circle/square/rounded/hexagon/star/heart, width input, height input.
- Name Text controls: Select button, font size slider, font family select defaulting to Raleway, text color picker plus hex input, alignment left/center/right.
- Add a DP/Cover variant switch. DP canvas defaults to 1080x1080. Cover defaults to 1640x924 unless an existing design system specifies another cover size.

Editor behavior:
- Use a canvas renderer such as fabric, react-konva, or the existing frontend canvas library.
- Rendering order must be background, attendee photo placeholder/sample photo clipped to selected shape, uploaded transparent frame, name text.
- Allow drag/resize for the photo placeholder and name text.
- Selecting an element should sync the right-side controls.
- Save should set enabled=true, published=true, sharePath="/events/{event.slug}/dp", updatedAt=ISO string, and variants.dp/cover to the current canvas state.
- Preserve any existing keys in brandingJson when saving.

Public generator:
- Render only published configs.
- Let attendees upload a local photo, enter their name, preview the generated DP/cover, and download a PNG.
- Use navigator.share when supported, otherwise provide download and copy-link actions.
- Do not upload attendee photos or generated images for the MVP.

Types:
- Create DpCoverMakerConfig and DpCoverMakerVariant types matching the backend handoff guide.
- Validate upload type and size on the client: image/png, image/jpeg, image/webp, image/svg+xml, max 8MB for the custom-block website asset path.

Backend gap:
- There is currently no first-class public endpoint for unauthenticated generator config. If the public route cannot load config from existing public app data, add a TODO requiring GET /api/public/events/:eventSlug/dp-cover-maker before shipping the public attendee page.
```
