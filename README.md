# Munar Frontend

Munar is a modular event operating system for organisers. This frontend powers both the organiser dashboard and the public event experience, covering authentication, tenant-aware event management, and attendee-facing modules like tickets, forms, merchandise, voting, gallery, DP maker, sponsors, analytics, and event websites.

Built with React, TypeScript, Vite, and React Router, the app is structured around reusable modules and service layers that can run against mock data or a live backend API.

## What This App Does

- Authenticates users with email verification, password reset, and tenant-aware access control
- Lets organisers create and manage events from a central dashboard
- Provides event modules for tickets, forms, merchandise, voting, sponsors, gallery, DP maker, website builder, and analytics
- Exposes public event routes for attendee-facing experiences under event slugs
- Connects to a backend API with token refresh support and configurable feature flags

## Core Product Areas

### Organiser Experience

- Sign up, login, verify email, reset/change password
- Select account type and complete profile setup
- Create and manage events
- Access per-event admin workspaces:
  - Dashboard overview
  - Ticket management
  - Program management
  - Form management
  - Merchandise management
  - Voting management
  - Sponsors management
  - Gallery admin
  - DP maker admin
  - Event analytics
  - Website builder

### Public Event Experience

Public event pages are served under `/e/:eventSlug` and support:

- Event website landing page
- Ticket purchase flows
- Public voting
- Merchandise storefront
- Public forms and form submission
- Gallery
- DP maker

Module access is guarded per event, so only enabled modules appear publicly.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Radix UI primitives
- TipTap editor
- Recharts
- Sonner
- Lucide icons

## Project Structure

```txt
src/
  components/         Shared UI and feature components
  contexts/           Auth, event, brand, voting, and merchandise state
  hooks/              Feature-specific hooks
  lib/                API client, navigation, local storage helpers
  modules/            Public-facing modules (tickets, forms, merch, voting, website, etc.)
  pages/              Route-level organiser and auth pages
  router/             Application route definitions
  services/           API service layer for backend communication
  types/              Shared TypeScript types
```

## Routing Overview

### Auth Routes

- `/login`
- `/signup`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/change-password`
- `/account-type`
- `/profile-setup`

### Platform Routes

- `/events`
- `/events/create`

### Event Admin Routes

- `/events/:eventId`
- `/events/:eventId/tickets`
- `/events/:eventId/program`
- `/events/:eventId/forms`
- `/events/:eventId/merchandise`
- `/events/:eventId/voting`
- `/events/:eventId/sponsors`
- `/events/:eventId/dp-maker`
- `/events/:eventId/gallery`
- `/events/:eventId/analytics`
- `/events/:eventId/website`

### Public Routes

- `/e/:eventSlug`
- `/e/:eventSlug/tickets`
- `/e/:eventSlug/voting`
- `/e/:eventSlug/merch`
- `/e/:eventSlug/forms`
- `/e/:eventSlug/forms/:formId`
- `/e/:eventSlug/dp-maker`
- `/e/:eventSlug/gallery`

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm
- A running Munar backend API

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

The app uses Vite for local development.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create or update `.env` with values like:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000
VITE_USE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=false
```

### Variable Reference

- `VITE_API_BASE_URL`: Base URL for the backend API
- `VITE_API_TIMEOUT`: Request timeout in milliseconds
- `VITE_USE_MOCK_DATA`: Enables mock mode unless explicitly set to `false`
- `VITE_ENABLE_ANALYTICS`: Enables analytics-specific features when set to `true`

## Backend Expectations

This frontend expects a backend that exposes:

- Auth and tenant endpoints under `/api/auth` and `/api/tenants`
- Event management endpoints under `/api/events`
- Token refresh support for authenticated requests
- Event-module endpoints for tickets, forms, merchandise, voting, sponsors, website, analytics, and finance

The included implementation guides in `Frontend Implementation Guide/` document the intended backend contract for auth, tenants, and event modules.

## API and Auth Notes

- Access tokens and refresh tokens are stored in local storage
- Protected requests automatically attach the bearer token
- On `401` responses, the app attempts a token refresh before forcing logout
- Active tenant state is stored locally and used to scope organiser flows

## Deployment

The repository includes a `vercel.json` file configured to:

- Output the production bundle to `build/`
- Run `npm run build`
- Rewrite SPA routes to `index.html`
- Proxy `/api/*` requests to a serverless handler

Adjust this configuration if your deployment topology changes.

## Notes for Contributors

- Route definitions live in `src/router/index.tsx`
- Environment configuration lives in `src/config/index.ts`
- API request handling is centralized in `src/lib/api-client.ts`
- Public modules are organized under `src/modules`
- Service integrations live under `src/services`

## Status

This frontend already contains broad product coverage across the Munar event platform. Some areas are still evolving, and the repo includes planning/implementation notes for active modules such as voting, sponsors, analytics, and backend integration.
