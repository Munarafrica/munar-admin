# Voting Frontend Implementation Guide

This guide covers the Voting screen shown in the event workspace screenshots: campaign management, analytics, results, default voting settings, anti-fraud options, notifications, and display controls.

## Backend Status

Voting does not currently exist as a first-class backend module.

I checked the backend for voting-related routes, models, services, migrations, and DTOs. There are no `VotingCampaign`, `Vote`, `Contestant`, `Ballot`, or voting controller/service files yet. The only matching text was unrelated documentation language in an existing ticketing handoff.

The backend does have event-level infrastructure that voting should plug into:

- `Event` has the tenant/event ownership model.
- `EventSettings.modulesEnabledJson` can include a future `voting: true` flag.
- `EventSettings` has JSON settings fields for existing modules, but no `votingSettingsJson` field yet.
- Payment, notification, public event, analytics, and audit-log patterns already exist and should be reused.

Until the voting backend exists, the frontend should render the screen shell and empty states behind mock/local state or a disabled integration layer. Do not wire real network calls unless the endpoints below are implemented.

## Required Backend Scope

To support the attached frontend screens, the backend should manage:

- Voting campaigns per event
- Categories inside a campaign
- Contestants inside categories
- Free voting and paid voting
- Vote submissions with anti-fraud controls
- Results and result visibility controls
- Analytics summary and time-series data
- CSV/PDF result export
- Event-level default voting settings
- Public voting page/embed controls
- Notifications for voting start/end/reminders/results

## Suggested Backend Models

```ts
type VotingCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'ARCHIVED';
type VotingMode = 'FREE' | 'PAID';
type VotingEligibility = 'ANYONE' | 'TICKET_HOLDERS' | 'REGISTERED_USERS' | 'INVITED_ONLY';
type VotingTransparency = 'LIVE_RESULTS' | 'HIDE_UNTIL_END' | 'MANUAL_RELEASE';

type VotingCampaign = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  status: VotingCampaignStatus;
  votingMode: VotingMode;
  pricePerVoteMinor: number | null;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP' | 'GHS' | 'KES' | 'ZAR';
  eligibility: VotingEligibility;
  transparency: VotingTransparency;
  startsAt: string | null;
  endsAt: string | null;
  maxVotesPerVoter: number | null;
  allowMultipleCategories: boolean;
  showOnEventSite: boolean;
  enableEmbedWidget: boolean;
  captchaEnabled: boolean;
  voteTimeoutSeconds: number | null;
  settingsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type VotingCategory = {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type VotingContestant = {
  id: string;
  campaignId: string;
  categoryId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  voteCount: number;
  revenueMinor: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type VotingVote = {
  id: string;
  campaignId: string;
  categoryId: string;
  contestantId: string;
  voterUserId: string | null;
  voterEmail: string | null;
  quantity: number;
  amountMinor: number;
  status: 'PENDING_PAYMENT' | 'COUNTED' | 'REJECTED' | 'REFUNDED';
  createdAt: string;
};
```

## Suggested Authenticated Endpoints

Organizer endpoints should require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Users should belong to the event tenant. Creating, updating, deleting, publishing, pausing, ending, and exporting should require `OWNER`, `ADMIN`, or `EDITOR`, following the agenda/ticketing patterns.

```http
GET /api/events/:eventId/voting/summary
GET /api/events/:eventId/voting/settings
PATCH /api/events/:eventId/voting/settings

GET /api/events/:eventId/voting/campaigns?search=&status=
POST /api/events/:eventId/voting/campaigns
GET /api/voting/campaigns/:campaignId
PATCH /api/voting/campaigns/:campaignId
DELETE /api/voting/campaigns/:campaignId

POST /api/voting/campaigns/:campaignId/publish
POST /api/voting/campaigns/:campaignId/pause
POST /api/voting/campaigns/:campaignId/end
POST /api/voting/campaigns/:campaignId/archive

GET /api/voting/campaigns/:campaignId/categories
POST /api/voting/campaigns/:campaignId/categories
PATCH /api/voting/categories/:categoryId
DELETE /api/voting/categories/:categoryId

GET /api/voting/campaigns/:campaignId/contestants
POST /api/voting/campaigns/:campaignId/contestants
PATCH /api/voting/contestants/:contestantId
DELETE /api/voting/contestants/:contestantId

GET /api/voting/campaigns/:campaignId/analytics
GET /api/voting/campaigns/:campaignId/results?hideVotes=false
GET /api/voting/campaigns/:campaignId/results/export.csv
GET /api/voting/campaigns/:campaignId/results/export.pdf
```

## Suggested Public Endpoints

```http
GET /api/public/events/:eventSlug/voting
GET /api/public/voting/campaigns/:campaignId
POST /api/public/voting/campaigns/:campaignId/votes
GET /api/public/voting/votes/:voteId
```

For paid voting, the public vote creation endpoint should return a payment initialization payload or create a pending vote and payment transaction, similar to ticket/merch checkout flows.

## Screen Mapping

### Header

The page is event-scoped at:

```txt
/events/:eventId/voting
```

Render:

- Back link
- Title: `Voting`
- Description: `Create voting campaigns, manage contestants, and track real-time results. Enable paid or free voting for awards, competitions, and polls.`
- `Preview Public` button
- `Create Campaign` primary button

`Preview Public` should open the public voting page if `showOnEventSite` is enabled. If the backend is not ready, keep it disabled or show “Voting public page is not available yet.”

### Summary Cards

Backed by `GET /api/events/:eventId/voting/summary`.

```ts
type VotingSummary = {
  totalVotes: number;
  revenueMinor: number;
  currency: string;
  contestants: number;
  activeCampaigns: number;
};
```

Render four cards:

- Total Votes
- Revenue
- Contestants
- Active Campaigns

When no campaigns exist, all values should be zero and revenue should format as `₦0` for NGN events.

### Campaigns Tab

Backed by `GET /api/events/:eventId/voting/campaigns`.

Controls:

- Search input: `Search campaigns...`
- Status filter: `All Status`, `Draft`, `Scheduled`, `Active`, `Paused`, `Ended`, `Archived`
- Empty state: `No voting campaigns yet`
- Empty state helper: `Create your first voting campaign to start collecting votes.`
- Primary action: `Create Campaign`

Campaign cards/table should include:

- Campaign title
- Status
- Voting mode: free or paid
- Vote count
- Revenue
- Contestant count
- Start/end dates
- Quick actions: edit, duplicate if supported, pause/end/archive/delete

### Analytics Tab

Backed by `GET /api/voting/campaigns/:campaignId/analytics` once a campaign is selected. If no campaign exists, show the empty state from the screenshot:

```txt
No analytics data available
```

Recommended analytics payload:

```ts
type VotingAnalytics = {
  campaignId: string;
  totalVotes: number;
  totalRevenueMinor: number;
  uniqueVoters: number;
  conversionRate: number | null;
  votesByDay: Array<{ date: string; votes: number; revenueMinor: number }>;
  topContestants: Array<{ contestantId: string; name: string; votes: number; revenueMinor: number }>;
};
```

Render:

- Campaign selector
- Votes over time
- Revenue over time for paid voting
- Top contestants
- Category-level breakdown

### Results Tab

Backed by `GET /api/voting/campaigns/:campaignId/results?hideVotes=true|false`.

Controls from screenshot:

- Campaign selector: `Select campaign`
- `Hide Votes` toggle
- `Export CSV`
- `Export PDF`

Summary cards:

- Categories
- Contestants
- Total Votes

Empty state:

```txt
No results yet
Results will appear here once voting begins and contestants receive votes.
```

Recommended result payload:

```ts
type VotingResults = {
  campaignId: string;
  categories: Array<{
    id: string;
    name: string;
    totalVotes: number;
    contestants: Array<{
      id: string;
      name: string;
      imageUrl: string | null;
      votes: number;
      revenueMinor: number;
      rank: number;
    }>;
  }>;
  totalVotes: number;
  totalRevenueMinor: number;
};
```

When `Hide Votes` is enabled, hide exact vote counts but keep rank/order visible if backend allows.

### Settings Tab

Backed by:

```http
GET /api/events/:eventId/voting/settings
PATCH /api/events/:eventId/voting/settings
```

Settings shape:

```ts
type VotingSettings = {
  defaultVotingMode: 'FREE' | 'PAID';
  defaultEligibility: 'ANYONE' | 'TICKET_HOLDERS' | 'REGISTERED_USERS' | 'INVITED_ONLY';
  defaultTransparency: 'LIVE_RESULTS' | 'HIDE_UNTIL_END' | 'MANUAL_RELEASE';
  captchaEnabledByDefault: boolean;
  voteTimeoutSeconds: number | null;
  notifyOnVotingStart: boolean;
  notifyOnVotingEnd: boolean;
  notifyVotersOfResults: boolean;
  remindBeforeEnd: boolean;
  showVotingOnEventSite: boolean;
  enableEmbedWidget: boolean;
};
```

Render the cards from the screenshots:

- Default Campaign Settings
  - Default Voting Mode: `Free Voting`, `Paid Voting`
  - Default Eligibility: `Anyone can vote`, `Ticket holders only`, `Registered users only`, `Invited voters only`
  - Default Transparency: `Live (real-time results)`, `Hidden until voting ends`, `Manual result release`
- Anti-Fraud Protection
  - Enable CAPTCHA by Default
  - Vote Timeout (seconds)
- Notifications
  - Notify on Voting Start
  - Notify on Voting End
  - Notify Voters of Results
  - Reminder Before End
- Display Options
  - Show Voting on Event Site
  - Enable Embed Widget

The `Save Settings` button should stay disabled until there are unsaved changes. On save, show success/error toast and refetch settings.

## Frontend State Design

Recommended React query keys:

```ts
['eventVotingSummary', eventId]
['eventVotingSettings', eventId]
['eventVotingCampaigns', eventId, filters]
['votingCampaign', campaignId]
['votingCampaignAnalytics', campaignId]
['votingCampaignResults', campaignId, hideVotes]
['votingCampaignCategories', campaignId]
['votingCampaignContestants', campaignId]
```

Recommended local tab state:

```ts
type VotingTab = 'campaigns' | 'analytics' | 'results' | 'settings';
```

Recommended feature guard while backend is missing:

```ts
const votingApiAvailable = false;
```

If `votingApiAvailable` is false:

- Render the screen shell from screenshots.
- Use zero summary values.
- Use empty states for campaigns, analytics, and results.
- Allow opening the create/settings forms only if they are stored locally or clearly marked as disabled.
- Prevent export actions and public preview actions.

## Validation Rules

Campaign form:

- `title` is required.
- `startsAt` must be before `endsAt` when both are provided.
- Paid voting requires `pricePerVoteMinor > 0`.
- Paid voting requires a currency.
- `maxVotesPerVoter`, if provided, must be greater than zero.
- `voteTimeoutSeconds`, if provided, must be greater than or equal to zero.

Contestant form:

- `name` is required.
- `categoryId` is required.
- `imageUrl` should be a URL if provided.

Vote submission:

- `contestantId` is required.
- `categoryId` is required.
- `quantity` must be at least `1`.
- Enforce CAPTCHA only when backend settings require it.

## Frontend Implementation Prompt

Use this prompt with the frontend codebase:

```txt
Implement the event Voting screen for Munar at /events/:eventId/voting based on the backend handoff in `Frontend Implementation Guides/voting.md`.

Important backend status: real voting endpoints do not exist yet, so build the UI with an API adapter that can be switched on later. Keep `votingApiAvailable = false` or equivalent feature flag for now. When disabled, render zero-value summary cards and empty states, and disable network-only actions like export, public preview, and saving settings unless the app already supports mocked persistence.

Match the attached screenshots:
- Header with Back, title "Voting", description, Preview Public button, and Create Campaign button.
- Four summary cards: Total Votes, Revenue, Contestants, Active Campaigns.
- Tabs: Campaigns, Analytics, Results, Settings.
- Campaigns tab: search input, status filter, empty state "No voting campaigns yet", helper text, and Create Campaign button.
- Analytics tab: empty state "No analytics data available".
- Results tab: campaign selector, Hide Votes toggle, Export CSV, Export PDF, three mini summary cards for Categories, Contestants, Total Votes, and the empty state "No results yet".
- Settings tab: cards for Default Campaign Settings, Anti-Fraud Protection, Notifications, and Display Options. Include Save Settings disabled until form changes.

Use the frontend project’s existing event page layout, tabs, cards, buttons, forms, select, switch/checkbox, toast, icon, and API client patterns. Do not introduce a new design system. Keep styling consistent with the dark Munar event workspace shown in the screenshots.

Create TypeScript types for:
- VotingSummary
- VotingSettings
- VotingCampaign
- VotingCategory
- VotingContestant
- VotingResults
- VotingAnalytics

Create an API module or service with placeholder methods for the future endpoints:
- getEventVotingSummary(eventId)
- getEventVotingSettings(eventId)
- updateEventVotingSettings(eventId, payload)
- listVotingCampaigns(eventId, filters)
- getVotingCampaign(campaignId)
- createVotingCampaign(eventId, payload)
- updateVotingCampaign(campaignId, payload)
- deleteVotingCampaign(campaignId)
- getVotingCampaignAnalytics(campaignId)
- getVotingCampaignResults(campaignId, { hideVotes })
- exportVotingResultsCsv(campaignId)
- exportVotingResultsPdf(campaignId)

When the API flag is off, those methods should return safe mock/empty data without calling the backend.

Add loading, empty, and error states. Ensure the route remains event-scoped and uses the current eventId from route params. Keep all copy user-facing only; do not include implementation notes inside the UI.
```
