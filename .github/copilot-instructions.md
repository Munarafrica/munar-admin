# Munar Event Management Platform - AI Coding Instructions

## Quick Start
- **Frontend**: React 18 + TypeScript + Vite + React Router v7 + Tailwind v4 + Radix UI
- **Backend**: Express.js + Neon DB (Postgres) + Drizzle ORM (see [backend/](../backend/))
- **Dev**: `npm run dev` → http://localhost:5173
- **Build**: `npm run build` → outputs to `build/`
- **Config**: Use `.env` to toggle `VITE_USE_MOCK_DATA` (default: true) and set `VITE_API_BASE_URL`

## Architecture Overview

### Layered Architecture: AppShell → EventResolver → BrandProvider → Module
The app implements a sophisticated 4-layer architecture:

1. **AppShell** - Platform level (theme, auth, global state)
2. **EventResolver** - Event level (resolves event from URL, loads core data)
3. **BrandProvider** - Event branding injection
4. **Module** - Feature level (tickets, voting, merch, forms, etc.)

See [src/components/AppShell.tsx](src/components/AppShell.tsx) and [src/components/EventResolver.tsx](src/components/EventResolver.tsx).

### Router Structure (React Router v7)
Routes in [src/router/index.tsx](src/router/index.tsx) are split into two main paths:

**Admin Routes** (organizer dashboard):
- `/login`, `/signup`, `/verification` → Auth flows ([src/pages/](src/pages/))
- `/events` → My Events list
- `/events/create` → Event creation
- `/events/:eventId` → Event Dashboard
- `/events/:eventId/tickets`, `/program`, `/forms`, etc. → Module admin pages

**Public Routes** (attendee/visitor):
- `/e/:eventSlug` → Event website (marketing hub, driven by Website Builder)
- `/e/:eventSlug/tickets`, `/voting`, `/merch`, `/forms` → Public module pages
- Routes automatically guarded by [ModuleGuard](src/components/ModuleGuard.tsx) to check if module is enabled

**Navigation**: Use React Router's `useNavigate()` hook. Legacy `onNavigate` prop still exists for backward compatibility via [useAppNavigate()](src/lib/navigation.ts).

### Module System (ModuleRegistry Pattern)
Core to Munar's extensibility: [src/types/modules.ts](src/types/modules.ts) defines...
- **ModuleType**: 'website' | 'tickets' | 'voting' | 'merch' | 'forms' | 'dp-maker' | 'gallery' | 'sponsors' | 'program' | 'analytics'
- **ModuleConfig**: Per-event module enable/disable state + visibility
- **ModuleDefinition**: Metadata (icon, routes, category, standalone vs website-only)
- **MODULE_REGISTRY**: Canonical registry of all 10 modules

**Key functions**:
- `isModuleEnabled(type, enabledModules)` - Check if module is active for event
- `getModuleByType(type)` - Look up module metadata
- `getDefaultModuleConfigs()` - New events get all modules disabled except analytics

**Module structure**:
```
src/modules/tickets/     # Each module in its own folder
├── TicketsPublic.tsx    # Public facing page (in /e/:slug/tickets route)
├── types.ts             # Module-specific types
├── hooks.ts             # useTickets, etc.
└── ...components
```

When adding a new module: add to `ModuleType` union, define in `MODULE_REGISTRY`, create folder in `src/modules/`.

### Component Organization
```
src/
├── pages/               # Full pages (Page Router endpoints)
├── components/
│   ├── ui/              # Radix-based primitives (Button, Input, Dialog, etc.)
│   ├── auth/            # Auth-specific layouts
│   ├── event-dashboard/ # Event admin UIs
│   ├── ModuleGuard.tsx  # Protects disabled modules (404)
│   └── AppShell.tsx     # App wrapper
├── modules/             # Feature modules (tickets, voting, merch, etc.)
├── contexts/            # Auth, Event, Brand, Voting, Merchandise contexts
├── hooks/               # Data hooks (useEvents, useTickets, useProducts, etc.)
├── services/            # API/mock service layer
├── lib/                 # api-client, navigation, event-storage
├── types/               # Global types + module system
├── config/              # Environment config
└── assets/              # Static images
```


## Backend-Ready Architecture

### Full Stack Setup
The project includes a complete Express.js backend:

| Layer | Technology | Location |
|-------|-----------|----------|
| DB | Neon DB (Postgres) | Cloud-hosted |
| ORM | Drizzle ORM | [backend/src/db/](../backend/src/db/) |
| API | Express.js 4 | [backend/src/](../backend/src/app.ts) |
| Auth | JWT (access + refresh) | [backend/src/routes/auth.ts](../backend/src/routes/) |
| Validation | Zod | Throughout |
| Frontend | React Router | [src/router/](src/router/) |

### Backend Setup (Express + Neon DB + Drizzle)

**Database Configuration:**
1. Create free Postgres database at [console.neon.tech](https://console.neon.tech)
2. Copy connection string to `backend/.env` as `DATABASE_URL`
3. Generate JWT secrets: `openssl rand -hex 64` → `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
4. Set `CORS_ORIGINS` to your frontend URL(s) (comma-separated)

**Database Commands:**
```bash
cd backend

# First-time setup: push schema directly to Neon
npm run db:push

# Or generate migration files then run
npm run db:generate
npm run db:migrate

# Browse DB via UI
npm run db:studio
```

**Start Backend Server:**
```bash
cd backend
npm install
npm run dev
# → API running at http://localhost:3000
# → Health check: http://localhost:3000/api/health
```

### API Route Structure
Per-event endpoints are nested under `/api/events/:eventId/`:
- `tickets` - CRUD + attendees + check-in
- `program/speakers`, `program/sessions`, `program/tracks` - Speaker & session management
- `forms`, `forms/:id/responses` - Custom form CRUD + submissions
- `voting/campaigns` - Voting campaigns + rounds + categories
- `merchandise/products`, `merchandise/orders` - Product inventory + order management
- `sponsors` - Sponsor CRUD
- `website` - Event website configuration

All endpoints require JWT auth (Bearer token) except auth routes and public event lookup (`GET /events/:slug`).

### API Integration Pattern

**When Backend is Connected:**
Set environment variables:
```bash
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:3000/api  # or production URL
```

The client will automatically switch to real API calls. No code changes needed — services check `config.features.useMockData` internally.

**Service Layer** - All API calls go through [src/services/](src/services/):
- `authService` - Login, signup, password reset, profiles
- `eventsService` - Event CRUD, publishing, metrics, checklists
- `ticketsService` - Types, attendees, check-in, analytics
- `programService` - Speakers, sessions, tracks, scheduling
- `formsService` - Custom forms, responses, export
- `merchandiseService` - Products, orders, inventory, fulfilment
- `votingService` - Campaigns, rounds, voting rules, results
- `analyticsService` - Aggregated event metrics
- And more...

**API Client** - [src/lib/api-client.ts](src/lib/api-client.ts) handles:
- Auth token injection + refresh token flow
- Automatic 401 logout on invalid token
- Request timeouts (30s default)
- Typed responses

Example usage:
```typescript
import { apiClient } from '@/lib/api-client';
import { ticketsService } from '@/services';

// Direct API call (typed)
const events = await apiClient.get<Event[]>('/events');

// Or via service (with mock support)
const tickets = await ticketsService.getTickets(eventId);
```

### Contexts for Global State
Wrap pages/modules with relevant contexts:

- **AuthContext** [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - User auth + profile
- **EventContext** [src/contexts/EventContext.tsx](src/contexts/EventContext.tsx) - Current event data + module configs
- **BrandContext** - Event branding (colors, logo) injected by EventResolver
- **VotingContext** [src/contexts/VotingContext.tsx](src/contexts/VotingContext.tsx) - Voting state (similar pattern)
- **MerchandiseContext** [src/contexts/MerchandiseContext.tsx](src/contexts/MerchandiseContext.tsx) - Merch module state

**Usage**:
```typescript
const { currentEvent, metrics, publishEvent } = useEvent();
const { user, isAuthenticated, logout } = useAuth();
const { campaigns, createCampaign } = useVoting({ eventId });
```

### Data Fetching Hooks
Feature-specific hooks in [src/hooks/](src/hooks/) manage local state:
- `useEvents({ search?, filter? })` - Event listing with search/filter
- `useTickets({ eventId })` - Ticket types + attendees
- `useProgram({ eventId })` - Speakers, sessions, schedule
- `useForms({ eventId })` - Custom forms + responses
- `useProducts({ eventId })` - Merch products inventory
- `useOrders({ eventId })` - Merch orders
- `useCampaigns({ eventId })` - Voting campaigns
- `useVotes({ campaignId })` - Vote analytics

Each hook returns state (`isLoading`, `error`, `data`) + mutation methods (`create`, `update`, `delete`).



## Styling & Dark Mode

### Tailwind + CSS Variables  
- **Font**: Always `font-['Raleway']` on root containers
- **Utilities**: Use `cn()` from [src/components/ui/utils.ts](src/components/ui/utils.ts) for conditional classes
- **Spacing**: `gap-6`, `p-6`, `space-y-8` (consistent 6/8px rhythm)
- **Rounded**: `rounded-xl` (not `rounded-lg`)
- **Max widths**: `max-w-[1440px]` for content, `max-w-[540px]` for auth forms
- **CSS variables**: Defined in [src/styles/globals.css](src/styles/globals.css) (–primary, –destructive, etc.)


### Dark Mode (CRITICAL - Always Pair Light/Dark Classes)
Use these established color patterns:

**Backgrounds:** Page `bg-slate-50 dark:bg-slate-950` | Modal `bg-white dark:bg-slate-900` | Card `bg-white dark:bg-slate-800/50` | Input `bg-white dark:bg-slate-950`

**Borders:** Card `border-slate-200 dark:border-slate-800` | Input `border-slate-200 dark:border-slate-700`

**Text:** Primary `text-slate-900 dark:text-slate-100` | Secondary `text-slate-600 dark:text-slate-300` | Muted `text-slate-500 dark:text-slate-400`

**Hover (IMPORTANT):** Table row `hover:bg-slate-50 dark:hover:bg-slate-800/50` | Button `hover:bg-slate-100 dark:hover:bg-slate-800` | ⚠️ AVOID `dark:hover:bg-slate-900/*` (too dark, text invisible)

**Example - Modal structure:**
```tsx
<div className="bg-black/40 backdrop-blur-sm" /> {/* backdrop */}
<div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800" /> {/* container */}
<div className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800" /> {/* header bar */}
```

## UI Component Patterns

### Button Components
The project has **two button components**:

1. **`button.tsx`** (shadcn-style, flexible) - Use for dashboards and general UI:
   ```tsx
   import { Button } from './ui/button';
   <Button variant="default" size="default">Click me</Button>
   <Button variant="outline" size="sm">Secondary</Button>
   ```
   Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
   Sizes: `default`, `sm`, `lg`, `xl`, `icon`

2. **`AuthButton.tsx`** (full-width, auth forms only) - Use for login/signup:
   ```tsx
   import { Button } from './ui/AuthButton';
   <Button variant="primary">Submit</Button>
   <Button variant="google">Sign in with Google</Button>
   ```
   Variants: `primary`, `google`, `link`

### Form Inputs
- Use custom `Input` component with built-in label and password toggle
- Wrap forms in `<form>` with `onSubmit` handling `e.preventDefault()`

### Modals/Dialogs
- Use Radix Dialog primitives for modals
- Pattern: backdrop with `bg-black/40 backdrop-blur-sm`
- Modal container: `rounded-xl shadow-2xl max-h-[90vh]`

## Type Definitions
Event-related types are centralized in [src/components/event-dashboard/types.ts](src/components/event-dashboard/types.ts):
- `EventData`, `EventPhase`, `EventStatus`
- `TicketType`, `Module`, `Activity`, `ChecklistItem`
- Always extend these types rather than creating duplicates

## Theme System
Dark/light mode via [src/components/theme-provider.tsx](src/components/theme-provider.tsx):
- Wraps app in `ThemeProvider` with `storageKey="vite-ui-theme"`
- Access theme with `useTheme()` hook
- Apply dark styles with `dark:` prefix

## Development Commands
```bash
npm install              # Install dependencies
npm run dev             # Start Vite dev server (localhost:5173)
npm run build           # Build for production
npm run preview         # Preview production build locally
```

## Testing & Debugging

### Mock-First Development
The entire app is designed for working offline with mock data:

1. **Default mode**: `VITE_USE_MOCK_DATA=true` in `.env` - all services return mock data
2. **Real API**: Set `VITE_USE_MOCK_DATA=false` to switch to real backend
3. **No code changes needed** - the switch is automatic via `config.features.useMockData`

Mock data for each feature is stored in `src/services/mock/`:
- `events-data.ts` - Mock events, users, checklist
- `tickets-data.ts` - Ticket types, attendees
- `voting-data.ts` - Campaigns, votes, analytics
- `merchandise-data.ts` - Products, orders, inventory
And others...

### Error Handling Patterns

**API errors** are caught via [src/lib/api-client.ts](src/lib/api-client.ts):
- `401 Unauthorized` → automatic logout redirect
- `4xx Client errors` → message shown in UI
- `5xx Server errors` → retry or fallback to mock data
- Network timeouts → 30s default, configurable

**Service errors** should be caught in hooks:
```typescript
const load = async () => {
  try {
    const data = await getItems(eventId);
    setItems(data);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load');
  }
};
```

**Component error boundaries** - wrap risky features:
Use Radix AlertDialog to show error states, don't crash silently.

### Loading & Error States
Always provide feedback in the UI:

```tsx
// ✓ Good: Show loading spinner
if (isLoading) {
  return <Skeleton className="h-8 w-full" />;
}

// ✓ Good: Show error message with retry
if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
      <Button onClick={() => refetch()}>Retry</Button>
    </Alert>
  );
}

// ✗ Avoid: Silent failures
if (error) return null;  // User has no idea what went wrong!
```

### Browser DevTools
**Redux DevTools** - Not used; rely on React's built-in hooks + contexts
**Network tab** - Check actual API calls when `VITE_USE_MOCK_DATA=false`
**Application tab** - Auth tokens stored in localStorage under keys from [src/config/index.ts](src/config/index.ts)

### Debugging Mock Data
To test against specific mock data states:

1. Edit `src/services/mock/*-data.ts` to modify mock records
2. Restart dev server with `npm run dev`
3. Mock data is synchronous - no API latency unless you call `delay()`

Example: Reset all events to draft status:
```typescript
// src/services/mock/events-data.ts
export function getMockEvents(): EventData[] {
  return mockEvents.map(e => ({ ...e, status: 'draft' }));
}
```

### Connecting to Real Backend (Troubleshooting)
1. **Backend not running**: Check `http://localhost:3000/api/health` - should return 200
2. **CORS errors**: Verify `CORS_ORIGINS` in `backend/.env` includes your frontend URL
3. **401 Unauthorized**: Tokens in localStorage may be expired - try logging in again
4. **Token refresh failing**: Check `JWT_REFRESH_SECRET` matches between frontend and backend
5. **Stuck on loading**: Check Network tab in DevTools - are requests hanging?



Every module in Munar follows a consistent contract defined in [src/types/modules.ts](src/types/modules.ts). Use [VOTING_MODULE_SPEC.md](../VOTING_MODULE_SPEC.md) as the canonical reference implementation.

### Module Folder Structure
```
src/modules/my-module/
├── index.ts                  # Barrel export: ModulePublic, types, utils
├── MyModulePublic.tsx        # Public page (wrapped in ModuleGuard)
├── types.ts                  # Module-specific types
├── hooks.ts                  # Custom hooks (useMyModule, useMutations)
├── components/
│   ├── AdminTab.tsx          # Admin dashboard tab
│   ├── AnalyticsTab.tsx      # Analytics/metrics
│   └── SettingsTab.tsx       # Module configuration
└── services/
    └── my-module.service.ts  # API calls with mock data
```

### Service Layer Pattern
Every service must support **mock-first development** with automatic real API switch:

```typescript
// src/services/my-module.service.ts
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { MyModuleItem } from '../types/my-module';
import { getMockItems, addMockItem, delay } from './mock/my-module-data';

export async function getItems(eventId: string): Promise<MyModuleItem[]> {
  // Always check config.features.useMockData first
  if (config.features.useMockData) {
    await delay(300);  // Simulate network latency
    return getMockItems().filter(item => item.eventId === eventId);
  }

  // Real API call falls back to this
  return await apiClient.get<MyModuleItem[]>(`/events/${eventId}/my-module/items`);
}

export async function createItem(eventId: string, data: CreateItemRequest): Promise<MyModuleItem> {
  if (config.features.useMockData) {
    await delay(300);
    const newItem = { id: generateId(), ...data };
    addMockItem(newItem);
    return newItem;
  }

  return await apiClient.post<MyModuleItem>(`/events/${eventId}/my-module/items`, data);
}
```

### Hook Pattern
Feature hooks manage local state and call services:

```typescript
// src/hooks/useMyModule.ts
import { useState, useEffect } from 'react';
import { MyModuleItem } from '../types/my-module';
import { getItems, createItem as createItemAPI } from '../services/my-module.service';

export function useMyModule(eventId: string) {
  const [items, setItems] = useState<MyModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getItems(eventId);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [eventId]);

  const createItem = async (data: CreateItemRequest) => {
    try {
      const newItem = await createItemAPI(eventId, data);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      throw err;
    }
  };

  return { items, isLoading, error, createItem };
}
```

### Context Pattern (for complex module state)
Use a context if multiple components need state:

```typescript
// src/contexts/MyModuleContext.tsx
import { createContext, useContext, useState } from 'react';
import { MyModuleItem } from '../types/my-module';
import { useMyModule } from '../hooks/useMyModule';

interface MyModuleContextType {
  items: MyModuleItem[];
  selectedItem: MyModuleItem | null;
  isLoading: boolean;
  error: string | null;
  selectItem: (item: MyModuleItem) => void;
  createItem: (data: CreateItemRequest) => Promise<MyModuleItem>;
}

const MyModuleContext = createContext<MyModuleContextType | undefined>(undefined);

export function MyModuleProvider({ eventId, children }: { eventId: string; children: React.ReactNode }) {
  const { items, isLoading, error, createItem } = useMyModule(eventId);
  const [selectedItem, setSelectedItem] = useState<MyModuleItem | null>(null);

  return (
    <MyModuleContext.Provider value={{ items, selectedItem, isLoading, error, selectItem: setSelectedItem, createItem }}>
      {children}
    </MyModuleContext.Provider>
  );
}

export function useMyModuleContext() {
  const ctx = useContext(MyModuleContext);
  if (!ctx) throw new Error('useMyModuleContext must be used inside MyModuleProvider');
  return ctx;
}
```



## When Connecting Backend
1. Set `VITE_USE_MOCK_DATA=false` in `.env`
2. Set `VITE_API_BASE_URL` to your backend URL (default: `http://localhost:3000/api`)
3. Services will automatically switch to real API calls
4. Implement any missing service methods in [src/services/](src/services/) as needed
5. For backend setup, see [backend/README.md](../backend/README.md)



## Key Patterns to Follow
1. **React Router navigation**: Use `useNavigate()` hook from react-router-dom, not page state
2. **Module System**: Check [src/types/modules.ts](src/types/modules.ts) MODULE_REGISTRY for module metadata, use `ModuleGuard` to protect disabled modules
3. **Service modules**: Never call API directly—use [src/services/](src/services/) modules; they automatically toggle mock/real based on `config.features.useMockData`
4. **Component composition**: Use data-slot attributes for compound components (see Card)
5. **State management**: Use contexts for global state (Auth, Event, Voting, Merchandise), hooks for feature-specific data
6. **Icon usage**: Import from `lucide-react` for icons, custom icons in [src/components/icons.tsx](src/components/icons.tsx)
7. **Figma assets**: Import via `figma:asset/...` aliases configured in vite.config.ts
8. **Dark mode first**: Always pair light/dark classes; use established color patterns from this guide

## Avoid
- Modifying files in `src/imports/` (Figma-generated, may be overwritten)
- Direct API calls—always use service modules
- Creating new routing systems—use React Router patterns, `useNavigate()`
- Inline styles—use Tailwind classes with CSS variables
- Generic Radix imports—use wrapped components in [src/components/ui/](src/components/ui/)
- Creating duplicate type definitions—extend existing types in [src/types/](src/types/) or [src/components/event-dashboard/types.ts](src/components/event-dashboard/types.ts)
- Forgetting dark mode classes in new components
- Creating new UI components when equivalent exists (see list below)

## Existing UI Components (DO NOT DUPLICATE)
Before creating a new component, check if it already exists in `src/components/ui/`:

**Form Elements:**
- `Input` - Text input with optional label, password toggle, dark mode support
- `Checkbox` - Styled checkbox with label
- `label` - Form labels

**Layout & Containers:**
- `Card`, `CardHeader`, `CardContent`, `CardFooter` - Card containers
- `Divider` - Horizontal divider
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter` - Modal dialogs (use for new modals)

**Buttons & Actions:**
- `button.tsx` - Primary button component (use for dashboards)
- `AuthButton.tsx` - Auth-specific button (use only in auth flows)
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` - Dropdown menus

**Feedback:**
- `Badge` - Status badges with variants
- `Alert` - Alert messages
- `Progress` - Progress bars
- `Skeleton` - Loading skeletons

**Navigation:**
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tabbed interfaces
- `Accordion` - Collapsible sections
- `Breadcrumb` - Breadcrumb navigation

**Data Display:**
- `Avatar` - User avatars
- `Tooltip` - Hover tooltips

**Merchandise Module Components (in `src/components/merchandise/`):**
- `ProductCard` - Product display card
- `ProductModal` - Add/edit product wizard
- `OrderRow` - Order table row
- `OrderDetailModal` - Order details view
- `ImageUploader` - Multi-image upload with drag & drop
- `VariantBuilder` - Product variant manager
- `AnalyticsTab` - Analytics dashboard
- `SettingsTab` - Settings panel
