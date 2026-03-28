# Sponsors Module Implementation Plan (Draft)

Status: Planning only (no code yet)
Author: Copilot (GPT-5.1-Codex-Max)
Date: 2026-01-28

## Goals
- Let organisers add/edit/reorder sponsors (logo, name, optional description, optional website, visibility) via dashboard.
- Render sponsors on public event pages in a clean, responsive grid with links and alt text.
- Keep scope lean: no tier logic, no payments.

## Entities & Data
- Sponsor
  - id: string
  - eventId: string
  - name: string (required)
  - logoUrl: string (required)
  - websiteUrl?: string
  - description?: string
  - visible: boolean
  - order: number
  - createdAt/updatedAt: string
- Derived helpers
  - slug from event name for public URL (fallback until backend provides domain)
  - public sponsor feed per event: `/events/:eventId/sponsors` (mock service first)

## Organizer UX (Dashboard)
- Entry: new “Sponsors” module tile in Event Dashboard modules list (Core).
- Page: Sponsors Management
  - Header: title, breadcrumb, public link pill (https://{eventSlug}.munar.com/sponsors), CTA “Add Sponsor”.
  - Optional search/filter (by name/visibility).
  - List/Grid (responsive table or cards) with:
    - Logo thumbnail, name, description snippet, website icon, visibility toggle, drag handle, edit/delete actions.
  - Empty state: illustration + copy + “Upload your first sponsor”.
  - Reorder: drag-and-drop updates `order`.
- Modal: Add/Edit Sponsor
  - Fields: name*, logo upload*, website URL (optional), description (optional), visibility toggle.
  - Microcopy: logo guidance (430×215), website guidance, preview of logo+name.
  - Buttons: Save, Cancel.

## Public UI
- Section on future event public page (below About/Schedule, above footer). Build as a reusable component ready to drop into the upcoming website builder.
- Heading: “Our Sponsors” + subtitle.
- Grid: 3–4 per row desktop, 1–2 mobile; each item logo + optional link (opens new tab), alt text = sponsor name.
- Grayscale toggle supported via organiser setting (CSS filter when enabled).
- Optional small overlay/card on click (stretch goal only if time allows).

## Technical Integration
- Reuse components: TopBar, Button, Input, ImageUploader, Badge, dropdown-menu, sortable list (if available; else minimal drag using HTML5 + state order).
- New files (tentative):
  - `src/types/sponsors.ts` (Sponsor type) or extend existing types folder.
  - `src/services/sponsors.service.ts` (mock + real toggle with config.features.useMockData).
  - `src/hooks/useSponsors.ts` for data fetching/mutations per event.
  - `src/pages/SponsorsManagement.tsx` (dashboard page with onNavigate pattern).
  - `src/components/sponsors/SponsorCard.tsx` or table row; `SponsorModal.tsx` for add/edit.
  - Public section component: `src/components/public/SponsorsSection.tsx` (used by event public page, if exists).
- Base URLs: use provided event domain if available; fallback to slugified event name with `https://{slug}.munar.com/sponsors` for link pill/copy.
- Accessibility: alt text = sponsor name; focusable controls; adequate hit areas.

## Decisions (from user)
1) Domain: use fallback slugified event name for now; event website builder will supply real domain later.
2) Public placement: will live on the future event website; design component now, integration later.
3) Reorder: up/down controls are acceptable (no drag-and-drop required for v1).
4) Grayscale: include organiser toggle to render public logos in grayscale.
5) Export: defer JSON/CSV export for now.

## Milestones (once approved)
- Wire types/service/hook (mock data) for sponsors.
- Build dashboard page with list, empty state, link pill, add/edit modal, visibility toggle, reorder.
- Integrate module tile entry on Event Dashboard.
- Add public SponsorsSection component and place it in public event view (if available) with responsive grid.
- QA: keyboard nav, alt text, mobile layout, copy-to-clipboard links.

Next: Await answers to open questions before coding.
