# Munar Frontend Workspace Instructions

## Scope
- This workspace is the frontend app only. Backend references in docs point to a separate repo and are not available here.
- Keep workspace instructions short and project-wide. Use [README.md](../README.md), [VOTING_MODULE_SPEC.md](../VOTING_MODULE_SPEC.md), and files under [docs/](../docs/) for deeper feature detail.

## Build And Validation
- Use `npm install`, `npm run dev`, `npm run build`, and `npm run preview` from the repo root.
- There is no root `lint`, `test`, or dedicated `type-check` script. Do not claim those checks ran unless you added and ran them.
- For code changes, prefer validating with `npm run build` when the task warrants it.

## Architecture
- Route definitions live in [src/router/index.tsx](../src/router/index.tsx). Admin routes use `/events/:eventId/...`; public routes use `/e/:eventSlug/...`.
- Event pages rely on the `AppShell -> EventResolver -> BrandProvider -> module/page` layering. Preserve those wrappers when adding routes or pages.
- The module contract lives in [src/types/modules.ts](../src/types/modules.ts). Add new modules through `ModuleType` and `MODULE_REGISTRY`, not by hardcoding routes or metadata elsewhere.
- Reuse the existing service and hook layers under [src/services/](../src/services/) and [src/hooks/](../src/hooks/) instead of embedding fetching logic in components.

## Project Conventions
- This app is mock-first. Services must respect `config.features.useMockData` from [src/config/index.ts](../src/config/index.ts) and keep mock and real API paths aligned.
- Do not call APIs directly from components. Go through the service layer so mock mode, auth handling, and request conventions remain consistent.
- Prefer existing contexts and wrappers: auth and tenant state in [src/contexts/](../src/contexts/), navigation compatibility in [src/lib/navigation.ts](../src/lib/navigation.ts), and module gating via [src/components/ModuleGuard.tsx](../src/components/ModuleGuard.tsx).
- Treat event and tenant scoping as mandatory. New event-facing data flows should stay bound to the active event or tenant context.

## UI Conventions
- Reuse components from [src/components/ui/](../src/components/ui/) before creating new primitives.
- Preserve the established Tailwind styling patterns: `rounded-xl`, `gap-6`, `p-6`, and paired light/dark classes such as `bg-white dark:bg-slate-900` and `text-slate-900 dark:text-slate-100`.
- Use `Button` from `src/components/ui/button.tsx` for general UI and `AuthButton` only for auth flows.
- Do not edit [src/imports/](../src/imports/) unless the task is specifically about Figma-generated imports.

## Useful References
- Product overview and setup: [README.md](../README.md)
- Module implementation reference: [VOTING_MODULE_SPEC.md](../VOTING_MODULE_SPEC.md)
- Feature planning docs: [docs/sponsors-plan.md](../docs/sponsors-plan.md) and [docs/analytics-plan.txt](../docs/analytics-plan.txt)