# Website Builder Frontend Implementation Guide

This guide explains how the event website builder works from the frontend against the current backend implementation.

## Feature Summary

The website builder is separate from normal event publishing.

The backend uses two different publish concepts:

- Event publish status: `event.status`
- Website publish status: `event.websitePublished`

The backend also tracks publish state per website page:

- Page publish status: `websitePage.isPublished`

This means a frontend can have:

- an event that is published, but the website is not public
- a website that is published, but some pages are still hidden
- draft pages that are available to authenticated editors but not public users

## Important Backend Rule

A public website page is available only when both of these are true:

- `event.websitePublished === true`
- `page.isPublished === true`

If either is false, the public endpoint returns `404`.

## Public Endpoints

These are the endpoints the frontend public website should use.

### 1. Get Published Website Overview

- Method: `GET`
- URL: `/api/public/events/:eventSlug/website`
- Auth: none

Example:

```http
GET /api/public/events/munar-launch-event/website
```

### Success Response

```json
{
  "event": {
    "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "slug": "munar-launch-event",
    "title": "Munar Launch Event",
    "summary": "A short event summary",
    "description": "Full event description",
    "coverImageUrl": "https://cdn.example.com/events/cover.jpg",
    "logoUrl": "https://cdn.example.com/events/logo.png",
    "startsAt": "2026-07-01T10:00:00.000Z",
    "endsAt": "2026-07-01T18:00:00.000Z",
    "timezone": "Africa/Lagos",
    "venueName": "Eko Convention Centre",
    "venueAddress": "Victoria Island, Lagos",
    "isOnline": false,
    "onlineUrl": null
  },
  "websiteSettings": {
    "theme": "light",
    "layout": "modern"
  },
  "branding": {
    "primaryColor": "#0F172A",
    "accentColor": "#F59E0B"
  },
  "pages": [
    {
      "pageKey": "home",
      "title": "Home"
    },
    {
      "pageKey": "tickets",
      "title": "Tickets"
    }
  ]
}
```

### Frontend Notes

- This endpoint only returns pages that are already published.
- `websiteSettings` comes from `event.settings.websiteSettingsJson`.
- `branding` comes from `event.settings.brandingJson`.
- The page list contains only `pageKey` and `title`.
- The actual page content must be fetched from the page endpoint.

### Failure Cases

- `404 NOT_FOUND` if the event does not exist
- `404 NOT_FOUND` if `event.websitePublished` is `false`

## 2. Get Published Website Page

- Method: `GET`
- URL: `/api/public/events/:eventSlug/pages/:pageKey`
- Auth: none

Example:

```http
GET /api/public/events/munar-launch-event/pages/home
```

### Success Response

```json
{
  "event": {
    "id": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "slug": "munar-launch-event",
    "title": "Munar Launch Event",
    "summary": "A short event summary",
    "coverImageUrl": "https://cdn.example.com/events/cover.jpg",
    "logoUrl": "https://cdn.example.com/events/logo.png"
  },
  "page": {
    "id": "a611de88-2014-4298-b2c8-8c43302e10f1",
    "pageKey": "home",
    "title": "Home",
    "sectionsJson": {
      "sections": [
        {
          "id": "hero-1",
          "type": "hero",
          "props": {
            "headline": "Welcome to Munar Launch Event"
          }
        }
      ]
    },
    "seoJson": {
      "title": "Munar Launch Event",
      "description": "Join us for the launch",
      "keywords": ["munar", "launch", "event"],
      "ogImage": "https://cdn.example.com/events/og-image.jpg"
    }
  }
}
```

### Frontend Notes

- This endpoint returns one page only.
- `sectionsJson` is the main page-builder payload.
- `seoJson` may be `null`.
- The frontend should treat `page.pageKey` as the canonical route key.

### Failure Cases

- `404 NOT_FOUND` if the event does not exist
- `404 NOT_FOUND` if the website is unpublished
- `404 NOT_FOUND` if the page does not exist for the event
- `404 NOT_FOUND` if the page exists but `isPublished` is `false`

## Authenticated Builder Endpoints

These endpoints are for the dashboard/editor frontend, not for the public website.

All of them require:

- `Authorization: Bearer <access_token>`

## 3. List Website Pages For An Event

- Method: `GET`
- URL: `/api/events/:eventId/website-pages`

Optional query params:

- `isPublished=true|false`
- `search=<text>`

Example:

```http
GET /api/events/2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0/website-pages?isPublished=false
Authorization: Bearer <access_token>
```

### Success Response

Returns an array of `WebsitePage` records.

Example:

```json
[
  {
    "id": "a611de88-2014-4298-b2c8-8c43302e10f1",
    "eventId": "2a79d4d3-3c69-453a-94bf-81b5cb1ab4a0",
    "pageKey": "home",
    "title": "Home",
    "sectionsJson": {
      "sections": []
    },
    "seoJson": null,
    "isPublished": true,
    "createdAt": "2026-04-02T11:00:00.000Z",
    "updatedAt": "2026-04-02T11:10:00.000Z"
  }
]
```

## 4. Get Website Page By ID

- Method: `GET`
- URL: `/api/website-pages/:pageId`

Use this for builder editing and preview preparation when you already know the page id.

## 5. Create Website Page

- Method: `POST`
- URL: `/api/events/:eventId/website-pages`

### Request Payload

```json
{
  "pageKey": "home",
  "title": "Home",
  "sectionsJson": {
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "props": {}
      }
    ]
  },
  "seoJson": {
    "title": "Home",
    "description": "Welcome page",
    "keywords": ["home", "event"],
    "ogImage": "https://cdn.example.com/og.jpg"
  },
  "isPublished": false
}
```

### Validation Rules

- `pageKey` is required
- `pageKey` must match `^[a-z0-9-]+$`
- `pageKey` must be unique per event
- `title` is required and must be at least 2 characters
- `sectionsJson` is required
- `sectionsJson.sections` must be an array
- each section must have a string `id`
- each section must have a string `type`
- `props`, when provided, must be an object
- `seoJson.title`, if provided, must be a string
- `seoJson.description`, if provided, must be a string
- `seoJson.keywords`, if provided, must be an array of strings
- `seoJson.ogImage`, if provided, must be a string

## 6. Update Website Page

- Method: `PATCH`
- URL: `/api/website-pages/:pageId`

Any of these can be updated:

- `pageKey`
- `title`
- `sectionsJson`
- `seoJson`
- `isPublished`

### Important Note

The backend allows publish state to be toggled in two ways:

- by `PATCH /api/website-pages/:pageId` with `isPublished`
- by `POST /api/website-pages/:pageId/publish` or `unpublish`

For frontend consistency, it is better to use the dedicated publish/unpublish endpoints for explicit publishing actions.

## 7. Publish Website Page

- Method: `POST`
- URL: `/api/website-pages/:pageId/publish`

This sets:

```json
{
  "isPublished": true
}
```

## 8. Unpublish Website Page

- Method: `POST`
- URL: `/api/website-pages/:pageId/unpublish`

This sets:

```json
{
  "isPublished": false
}
```

## 9. Get Event Website Settings

- Method: `GET`
- URL: `/api/events/:eventId/website-settings`

This returns the event settings record. If no settings row exists yet, the backend creates one automatically.

Relevant fields for the website builder:

- `websiteSettingsJson`
- `brandingJson`

## 10. Update Event Website Settings

- Method: `PATCH`
- URL: `/api/events/:eventId/website-settings`

### Request Payload

```json
{
  "websiteSettingsJson": {
    "theme": "light",
    "layout": "modern"
  },
  "brandingJson": {
    "primaryColor": "#0F172A",
    "accentColor": "#F59E0B"
  }
}
```

### Frontend Notes

- Both fields are optional.
- The backend stores them as raw JSON.
- There is no backend schema enforcement beyond requiring them to be objects.

## 11. Publish Full Website

- Method: `POST`
- URL: `/api/events/:eventId/website/publish`

This sets:

```json
{
  "websitePublished": true
}
```

### Important Notes

- This does not change `event.status`.
- This does not automatically publish every page.
- This does not validate that at least one page is published.
- This can succeed even if the event itself is still in `DRAFT`.

## 12. Unpublish Full Website

- Method: `POST`
- URL: `/api/events/:eventId/website/unpublish`

This sets:

```json
{
  "websitePublished": false
}
```

When this is false, all public website endpoints stop working even if some pages are individually published.

## Event Publish And Website Publish Are Separate

The backend intentionally treats these as different flows.

### Event Publish

- Endpoint: `POST /api/events/:eventId/publish`
- Changes: `event.status` from `DRAFT` to `PUBLISHED`
- Requires: `OWNER` or `ADMIN`
- Validation: event must have at least `title` and `startsAt`

### Website Publish

- Endpoint: `POST /api/events/:eventId/website/publish`
- Changes: `event.websitePublished = true`
- Requires: `OWNER`, `ADMIN`, or `EDITOR`
- Validation: no extra content validation

### Frontend Consequence

Do not assume:

- event published means website published
- website published means event published

They are separate backend states and must be handled separately in the UI.

## Preview Mode Guidance

There is currently no dedicated preview endpoint in the backend.

There is also no public draft endpoint.

### What This Means

If the frontend wants preview mode, it should use authenticated builder endpoints and render draft data locally.

Recommended preview data sources:

- `GET /api/events/:eventId/website-pages`
- `GET /api/website-pages/:pageId`
- `GET /api/events/:eventId/website-settings`

### Recommended Frontend Preview Strategy

For editor preview:

- fetch the current draft page from the authenticated endpoint
- fetch website settings from the authenticated settings endpoint
- merge them in the frontend preview renderer
- do not rely on public endpoints for draft preview

For public preview/share links:

- not supported by the current backend contract

## Common Bug Scenarios

### 1. Public page returns 404 even though the page exists

Possible causes:

- `event.websitePublished` is `false`
- `page.isPublished` is `false`
- wrong `eventSlug`
- wrong `pageKey`

### 2. Website overview loads but a specific page returns 404

Possible cause:

- the website is published, but that page is not published

### 3. Frontend preview shows draft content, but public website does not

Possible cause:

- preview is reading authenticated draft data
- public site is correctly reading only published data

This is expected behavior unless the frontend assumes preview and public use the same source.

### 4. Event was published, but website still is not accessible publicly

Possible cause:

- `event.status === PUBLISHED`
- but `event.websitePublished === false`

### 5. Website was published, but the event is still draft

This is allowed by the current backend.

If the frontend treats this as invalid, that is a frontend rule, not a backend rule.

## Recommended Frontend Data Types

```ts
export type WebsiteSection = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
};

export type WebsiteSectionsJson = {
  sections: WebsiteSection[];
};

export type WebsiteSeoJson = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
} | null;

export type WebsitePage = {
  id: string;
  eventId: string;
  pageKey: string;
  title: string;
  sectionsJson: WebsiteSectionsJson;
  seoJson: WebsiteSeoJson;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicWebsiteOverview = {
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

export type PublicWebsitePageResponse = {
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
    sectionsJson: WebsiteSectionsJson;
    seoJson: WebsiteSeoJson;
  };
};
```

## Recommended Frontend Implementation Pattern

For the builder dashboard:

- use authenticated endpoints
- treat page editing and page publishing as separate actions
- treat website settings and page content as separate state sources
- treat website publish as a separate final action

For the public website:

- first fetch `/api/public/events/:eventSlug/website`
- derive navigation from `pages`
- fetch `/api/public/events/:eventSlug/pages/:pageKey` for page content
- handle `404` as unpublished or missing content, not only as a routing issue

## Final Integration Checklist

- Do not use public endpoints for draft preview.
- Do not assume event publish automatically exposes the website.
- Do not assume website publish automatically exposes every page.
- Always use `pageKey` as the public page route segment.
- Make sure builder save flows produce `sectionsJson.sections` as an array.
- Handle public `404` as a possible publish-state issue.

