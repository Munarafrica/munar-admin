# Sponsors Frontend Implementation Guide

This guide covers the Sponsors screen shown at `/events/:eventId/sponsors`: sponsor search, status filtering, grayscale logo setting, empty state, add sponsor modal, logo upload, visibility toggle, and public preview.

## Backend Status

There is no first-class backend sponsors module yet.

I checked the backend for `sponsor`, `sponsorship`, `partner`, and `donor`. There are no sponsor models, controllers, services, DTOs, or Prisma migrations. The only sponsor references are frontend implementation notes for website section image overrides.

The backend does support the building blocks needed for an MVP:

- `GET /api/events/:eventId/website-settings`
- `PATCH /api/events/:eventId/website-settings`
- `POST /api/events/:eventId/website/assets/sign`
- `POST /api/events/:eventId/website/assets`
- `GET /api/public/events/:eventSlug/website`

Sponsors can be stored inside `EventSettings.websiteSettingsJson` and sponsor logos can be uploaded through the existing website asset pipeline.

## Recommended MVP Storage Shape

Store sponsors under `websiteSettingsJson.sponsors`.

```ts
type WebsiteAssetRef = {
  assetId: string;
  url: string;
  altText?: string;
};

type Sponsor = {
  id: string;
  name: string;
  websiteUrl?: string;
  description?: string;
  logo: WebsiteAssetRef;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type SponsorsSettings = {
  grayscaleLogos: boolean;
  sponsors: Sponsor[];
};

type WebsiteSettingsJson = {
  sponsors?: SponsorsSettings;
};
```

Default value:

```ts
const defaultSponsorsSettings: SponsorsSettings = {
  grayscaleLogos: false,
  sponsors: [],
};
```

## Screen Functionality From The Attachments

Implement these organizer-facing controls:

- Search input with placeholder `Search sponsors...`.
- Filter dropdown defaulting to `All`.
- Grayscale logos switch with helper copy `Applies to public section`.
- Empty state: `No sponsors yet`, supporting copy, and `Add sponsor`.
- Add sponsor modal:
  - `Sponsor name *`, required.
  - `Website`, optional URL.
  - `Description`, optional.
  - `Logo *`, required.
  - Upload hint: `Use a 430x215 image for best quality.`
  - Upload accepts PNG/JPG and should also allow SVG if the frontend upload component already supports it.
  - Visibility switch: `Hide or show this sponsor on the public page`.
  - Cancel and Add sponsor actions.
- Public preview section:
  - Heading `Our Sponsors`.
  - Subcopy `We are proud to partner with these amazing brands.`
  - Empty preview copy `No sponsors added yet.`
  - Show `Grayscale on` when grayscale setting is enabled.

## Upload Flow For Sponsor Logos

Use the website asset signed upload flow with category `logo`.

1. Validate locally:
   - required file
   - MIME type: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, or `image/svg+xml`
   - size limit: backend `logo` category allows up to 4 MB
   - preferred dimensions: 430x215

2. Sign upload:

```http
POST /api/events/:eventId/website/assets/sign
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "filename": "acme-logo.png",
  "mimeType": "image/png",
  "sizeBytes": 482193,
  "category": "logo"
}
```

3. Upload the file to the returned `uploadUrl` with the returned headers.

4. Finalize the asset:

```http
POST /api/events/:eventId/website/assets
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "assetId": "asset-id",
  "category": "logo",
  "url": "http://localhost:8000/public/website-assets/asset-id",
  "mimeType": "image/png",
  "sizeBytes": 482193,
  "width": 430,
  "height": 215,
  "altText": "Acme Corp logo"
}
```

5. Save the sponsor in `websiteSettingsJson`:

```http
PATCH /api/events/:eventId/website-settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "websiteSettingsJson": {
    "sponsors": {
      "grayscaleLogos": false,
      "sponsors": [
        {
          "id": "client-generated-uuid",
          "name": "Acme Corp",
          "websiteUrl": "https://company.com",
          "description": "Short tagline or copy",
          "logo": {
            "assetId": "asset-id",
            "url": "http://localhost:8000/public/website-assets/asset-id",
            "altText": "Acme Corp logo"
          },
          "isVisible": true,
          "sortOrder": 0,
          "createdAt": "2026-04-12T12:00:00.000Z",
          "updatedAt": "2026-04-12T12:00:00.000Z"
        }
      ]
    }
  }
}
```

Important: when patching `websiteSettingsJson`, fetch the current settings first and merge into the full existing object. The backend stores the provided `websiteSettingsJson` object as the new value, so do not send only the `sponsors` key if other website settings already exist.

## Listing And Mutations

Use `GET /api/events/:eventId/website-settings` as the source of truth for the admin screen.

Frontend-only mutations for the MVP:

- Create sponsor: append a new sponsor object and patch the merged settings.
- Edit sponsor: replace the matching `id`, update `updatedAt`, then patch.
- Delete sponsor: remove the matching `id`, then patch.
- Toggle visibility: update `isVisible`, then patch.
- Reorder: update `sortOrder` values, then patch.
- Toggle grayscale: update `sponsors.grayscaleLogos`, then patch.

Filter behavior:

- `All`: all sponsors.
- `Visible`: `isVisible === true`.
- `Hidden`: `isVisible === false`.

Search behavior:

- Match case-insensitively against `name`, `websiteUrl`, and `description`.

## Public Website Rendering

The public overview endpoint already returns normalized `websiteSettings`.

```http
GET /api/public/events/:eventSlug/website
```

Read:

```ts
const sponsorSettings = overview.websiteSettings?.sponsors ?? defaultSponsorsSettings;
const visibleSponsors = sponsorSettings.sponsors
  .filter((sponsor) => sponsor.isVisible)
  .sort((a, b) => a.sortOrder - b.sortOrder);
```

Apply grayscale only in the public section when `sponsorSettings.grayscaleLogos` is true.

Use the logo reference URL returned from the backend. The backend normalizes `assetId` references to `/public/website-assets/:assetId`, which redirects to a browser-loadable storage URL.

## Backend Gap To Track

The MVP works through website settings JSON, but it has tradeoffs:

- no sponsor-specific backend validation
- no sponsor-specific audit action
- no pagination for large sponsor lists
- no server-side uniqueness checks for sponsor name
- possible lost updates if two admins edit the settings object at the same time

If sponsors need to become a durable product feature, add a first-class backend resource later:

- `EventSponsor` Prisma model
- `GET /api/events/:eventId/sponsors`
- `POST /api/events/:eventId/sponsors`
- `GET /api/sponsors/:sponsorId`
- `PATCH /api/sponsors/:sponsorId`
- `DELETE /api/sponsors/:sponsorId`
- public sponsors endpoint or inclusion in public website overview

Suggested model fields:

```ts
type EventSponsor = {
  id: string;
  eventId: string;
  name: string;
  websiteUrl: string | null;
  description: string | null;
  logoAssetId: string | null;
  logoUrl: string;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

## Frontend Implementation Prompt

Use this prompt in the frontend repo:

```text
Implement the event Sponsors management screen at /events/:eventId/sponsors.

Match the attached UI behavior:
- search input with placeholder "Search sponsors..."
- filter dropdown with All, Visible, Hidden
- "Grayscale logos" switch that applies to the public sponsor section
- empty state with "No sponsors yet" and "Add sponsor"
- add/edit sponsor modal with required sponsor name, optional website URL, optional description, required logo upload, visibility switch, cancel/save buttons
- public preview with "Our Sponsors", "We are proud to partner with these amazing brands.", and "No sponsors added yet." when empty

Backend integration:
- there is no first-class sponsors API yet
- use GET /api/events/:eventId/website-settings as the source of truth
- store data in websiteSettingsJson.sponsors using this shape:
  {
    grayscaleLogos: boolean,
    sponsors: [{
      id: string,
      name: string,
      websiteUrl?: string,
      description?: string,
      logo: { assetId: string, url: string, altText?: string },
      isVisible: boolean,
      sortOrder: number,
      createdAt: string,
      updatedAt: string
    }]
  }
- when saving, PATCH /api/events/:eventId/website-settings with the full merged websiteSettingsJson object, preserving existing unrelated settings
- upload sponsor logos through the website asset flow:
  1. POST /api/events/:eventId/website/assets/sign with category "logo"
  2. PUT the file to the returned uploadUrl using returned headers
  3. POST /api/events/:eventId/website/assets to finalize
  4. save { assetId, url, altText } on the sponsor

Validation:
- sponsor name and logo are required
- website must be a valid URL when provided
- accepted logo types: PNG, JPG/JPEG, WEBP, SVG
- max logo size: 4 MB
- show the 430x215 recommendation in the upload UI

Public rendering:
- read sponsors from public website overview response at websiteSettings.sponsors
- render only sponsors where isVisible is true, sorted by sortOrder
- apply grayscale CSS only when grayscaleLogos is true

Keep the implementation aligned with the existing website builder upload services/components if present, and avoid introducing a separate sponsors API client until the backend gets first-class sponsor endpoints.
```
