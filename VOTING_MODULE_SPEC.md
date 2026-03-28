# Voting Module - Implementation Specification

> **Status**: Planning Complete - Awaiting Implementation Approval
> **Created**: January 27, 2026
> **Module Owner**: AI Assistant

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Type Definitions](#type-definitions)
5. [Implementation Phases](#implementation-phases)
6. [Component Breakdown](#component-breakdown)
7. [Service Layer](#service-layer)
8. [Real-Time Implementation](#real-time-implementation)
9. [Public Voting Flow](#public-voting-flow)
10. [Testing Checklist](#testing-checklist)
11. [Risk Assessment](#risk-assessment)

---

## 1. Overview

The Voting Module enables event organisers to create, manage, and analyse voting campaigns. It supports:

- **Free and Paid Voting** - Monetize engagement via vote packages
- **Multi-Category Campaigns** - Multiple voting categories per campaign
- **Multi-Round Voting** - Preliminary → Final round progression
- **Real-Time Updates** - Live vote counts via WebSocket
- **Flexible Rules** - Ticket-based eligibility, vote limits, access codes
- **Transparency Options** - Show/hide live results
- **Analytics Dashboard** - Participation, revenue, demographics

---

## 2. Architecture

### 2.1 Following Existing Patterns

| Pattern | Merchandise Module | Voting Module |
|---------|-------------------|---------------|
| Page | `MerchandiseManagement.tsx` | `VotingManagement.tsx` |
| Context | `MerchandiseContext.tsx` | `VotingContext.tsx` |
| Hooks | `useProducts.ts`, `useOrders.ts` | `useCampaigns.ts`, `useVotes.ts` |
| Service | `merchandise.service.ts` | `voting.service.ts` |
| Types | `types/merchandise.ts` | `types/voting.ts` |
| Components | `components/merchandise/` | `components/voting/` |

### 2.2 Navigation Integration

Add to `App.tsx`:
```typescript
export type Page = ... | 'voting-management' | 'public-vote';
```

### 2.3 Context Hierarchy

```
AuthProvider
└── VotingProvider (eventId)
    ├── VotingManagement (organiser)
    └── PublicVotingPage (voter)
```

---

## 3. File Structure

```
src/
├── pages/
│   ├── VotingManagement.tsx          # Main organiser page
│   └── PublicVoting.tsx              # Public voter page
│
├── components/
│   └── voting/
│       ├── index.ts                  # Barrel export
│       │
│       │── Campaigns (Tab 1)
│       ├── CampaignCard.tsx          # Campaign list item
│       ├── CampaignModal.tsx         # Create/edit campaign wizard
│       ├── CategoryCard.tsx          # Category within campaign
│       ├── CategoryModal.tsx         # Create/edit category
│       ├── ContestantCard.tsx        # Contestant display
│       ├── ContestantModal.tsx       # Create/edit contestant
│       │
│       │── Results (Tab 2)
│       ├── ResultsTable.tsx          # Vote results grid
│       ├── ResultsChart.tsx          # Visual charts
│       ├── LiveVoteCounter.tsx       # Real-time counter
│       │
│       │── Analytics (Tab 3)
│       ├── VotingAnalyticsTab.tsx    # Analytics dashboard
│       ├── RevenueChart.tsx          # Revenue metrics
│       ├── ParticipationChart.tsx    # Voter engagement
│       │
│       │── Settings (Tab 4)
│       ├── VotingSettingsTab.tsx     # Module settings
│       ├── NotificationSettings.tsx  # Alert config UI
│       │
│       │── Shared
│       ├── VotePackageBuilder.tsx    # Paid vote packages
│       ├── EligibilityRules.tsx      # Access control config
│       ├── TransparencyOptions.tsx   # Result visibility
│       ├── RoundManager.tsx          # Multi-round config
│       ├── QRCodeGenerator.tsx       # Client-side QR
│       ├── ShareLinks.tsx            # Copy/share URLs
│       │
│       │── Public Voting
│       ├── VotingBooth.tsx           # Main voting UI
│       ├── ContestantVoteCard.tsx    # Voteable contestant
│       ├── PaymentModal.tsx          # Paid vote checkout
│       ├── VoteConfirmation.tsx      # Success state
│       └── VotingWidget.tsx          # Embeddable component
│
├── contexts/
│   └── VotingContext.tsx             # Voting state management
│
├── hooks/
│   ├── useCampaigns.ts               # Campaign CRUD
│   ├── useVotes.ts                   # Vote operations
│   ├── useVotingAnalytics.ts         # Analytics data
│   └── useVotingRealtime.ts          # WebSocket connection
│
├── services/
│   ├── voting.service.ts             # API layer
│   └── mock/
│       └── voting-data.ts            # Mock data
│
└── types/
    └── voting.ts                     # Type definitions
```

---

## 4. Type Definitions

### 4.1 Core Types (`types/voting.ts`)

```typescript
// ============ Enums ============
export type CampaignStatus = 'draft' | 'published' | 'active' | 'paused' | 'ended';
export type VotingMode = 'free' | 'paid' | 'hybrid';
export type EligibilityType = 'open' | 'authenticated' | 'ticket-holders' | 'vip' | 'invited';
export type TransparencyMode = 'live' | 'hidden' | 'percentage-only' | 'after-close';
export type RoundStatus = 'upcoming' | 'active' | 'completed';

// ============ Campaign ============
export interface VotingCampaign {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  
  // Schedule
  startDate: string; // ISO
  endDate: string;   // ISO
  timezone: string;
  
  // Rounds (multi-round support)
  rounds: VotingRound[];
  currentRoundId?: string;
  
  // Rules
  votingMode: VotingMode;
  eligibility: EligibilityConfig;
  voteLimits: VoteLimits;
  transparency: TransparencyConfig;
  
  // Paid voting
  votePackages: VotePackage[];
  pricePerVote?: number;
  currency: string;
  
  // Categories
  categories: VotingCategory[];
  
  // Template
  isTemplate?: boolean;
  templateName?: string;
  
  // Sharing
  publicUrl: string;
  qrCodeUrl?: string;
  
  // Anti-fraud
  captchaEnabled: boolean;
  voteTimeout?: number; // seconds between votes
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ============ Round ============
export interface VotingRound {
  id: string;
  campaignId: string;
  name: string; // e.g., "Preliminary", "Semi-Final", "Final"
  order: number;
  status: RoundStatus;
  startDate: string;
  endDate: string;
  
  // Which contestants advance
  advancementRule: 'top-n' | 'threshold' | 'manual';
  advancementCount?: number; // Top N advance
  advancementThreshold?: number; // Min votes to advance
  
  // Results
  advancedContestantIds: string[];
}

// ============ Eligibility ============
export interface EligibilityConfig {
  type: EligibilityType;
  ticketTypeIds?: string[]; // If ticket-holders
  invitedEmails?: string[]; // If invited
  requireVerification?: boolean;
}

// ============ Vote Limits ============
export interface VoteLimits {
  votesPerPerson: number | 'unlimited';
  votesPerCategory: number | 'unlimited';
  votesPerContestant: number | 'unlimited';
  dailyLimit?: number;
  totalLimit?: number;
  voteWeight?: number; // Multiplier (advanced)
}

// ============ Transparency ============
export interface TransparencyConfig {
  mode: TransparencyMode;
  showVoteCount: boolean;
  showPercentage: boolean;
  showRevenue: boolean; // For paid voting
  showLeaderboard: boolean;
  leaderboardSize?: number;
}

// ============ Vote Package ============
export interface VotePackage {
  id: string;
  campaignId: string;
  name: string;
  voteCount: number;
  price: number;
  currency: string;
  discountPercentage?: number;
  maxPurchases?: number; // Per user
  isActive: boolean;
}

// ============ Category ============
export interface VotingCategory {
  id: string;
  campaignId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  
  // Category-specific rule overrides
  rulesOverride?: Partial<VoteLimits>;
  
  // Contestants
  contestants: Contestant[];
  
  // Status
  isActive: boolean;
}

// ============ Contestant ============
export interface Contestant {
  id: string;
  categoryId: string;
  campaignId: string;
  
  name: string;
  bio?: string;
  imageUrl?: string;
  
  // Unique identifiers
  code: string; // Auto-generated (e.g., "C001")
  directVoteUrl: string;
  
  // Social/links
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  
  // Current round participation
  activeInRound: boolean;
  eliminatedInRoundId?: string;
  
  // Order
  order: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============ Vote ============
export interface Vote {
  id: string;
  campaignId: string;
  categoryId: string;
  contestantId: string;
  roundId: string;
  
  // Voter info
  voterId?: string; // If authenticated
  voterEmail?: string;
  voterTicketTypeId?: string;
  isAnonymous: boolean;
  
  // Vote details
  voteCount: number; // Can be > 1 for paid bundles
  isPaid: boolean;
  paymentId?: string;
  amount?: number;
  
  // Validation
  isValid: boolean;
  invalidReason?: string;
  
  // Anti-fraud
  ipAddress?: string;
  userAgent?: string;
  
  timestamp: string;
}

// ============ Analytics ============
export interface VotingAnalytics {
  campaignId: string;
  
  // Participation
  totalVotes: number;
  uniqueVoters: number;
  votesPerCategory: Record<string, number>;
  votesPerContestant: Record<string, number>;
  votesOverTime: TimeSeriesData[];
  
  // Revenue (paid voting)
  totalRevenue: number;
  revenuePerPackage: Record<string, number>;
  averageVotesPerVoter: number;
  paymentSuccessRate: number;
  
  // Voter segments
  votesByTicketType: Record<string, number>;
  authenticatedVsAnonymous: {
    authenticated: number;
    anonymous: number;
  };
  
  // Compliance
  invalidVotes: number;
  duplicateAttempts: number;
  ineligibleAttempts: number;
  
  // Geographic (if enabled)
  votesByLocation?: Record<string, number>;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

// ============ Results ============
export interface ContestantResult {
  contestantId: string;
  contestantName: string;
  categoryId: string;
  categoryName: string;
  roundId: string;
  
  totalVotes: number;
  percentage: number;
  rank: number;
  
  revenue?: number; // If paid voting
}

// ============ Settings ============
export interface VotingSettings {
  eventId: string;
  
  // Defaults
  defaultVotingMode: VotingMode;
  defaultEligibility: EligibilityType;
  defaultTransparency: TransparencyMode;
  
  // Notifications
  notifyOnVotingStart: boolean;
  notifyOnVotingEnd: boolean;
  notifyVotersOfResults: boolean;
  reminderBeforeEnd: boolean;
  reminderHours: number;
  
  // Anti-fraud defaults
  defaultCaptchaEnabled: boolean;
  defaultVoteTimeout: number;
  
  // Display
  showVotingOnEventSite: boolean;
  embedWidgetEnabled: boolean;
}

// ============ Request Types ============
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  votingMode: VotingMode;
  eligibility: EligibilityConfig;
  voteLimits: VoteLimits;
  transparency: TransparencyConfig;
  votePackages?: Omit<VotePackage, 'id' | 'campaignId'>[];
  pricePerVote?: number;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  status?: CampaignStatus;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  rulesOverride?: Partial<VoteLimits>;
}

export interface CreateContestantRequest {
  name: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: Contestant['socialLinks'];
}

export interface CastVoteRequest {
  contestantId: string;
  categoryId: string;
  voteCount?: number; // Default 1
  paymentId?: string; // For paid votes
}

// ============ Real-Time Events ============
export type VotingRealtimeEvent = 
  | { type: 'vote_cast'; data: { contestantId: string; voteCount: number; newTotal: number } }
  | { type: 'campaign_status'; data: { campaignId: string; status: CampaignStatus } }
  | { type: 'round_changed'; data: { roundId: string; status: RoundStatus } };
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Create `types/voting.ts` with all type definitions
- [ ] Create `services/voting.service.ts` with mock data
- [ ] Create `services/mock/voting-data.ts` with sample data
- [ ] Create `contexts/VotingContext.tsx`
- [ ] Create basic hooks: `useCampaigns.ts`, `useVotes.ts`
- [ ] Add navigation entry in `App.tsx`
- [ ] Update `services/index.ts` and `hooks/index.ts`

### Phase 2: Core Components (Days 3-4)
- [ ] Create `components/voting/` directory structure
- [ ] Implement `CampaignCard.tsx` - campaign list display
- [ ] Implement `CampaignModal.tsx` - create/edit wizard (multi-step)
- [ ] Implement `CategoryCard.tsx` - category display
- [ ] Implement `CategoryModal.tsx` - create/edit category
- [ ] Implement `ContestantCard.tsx` - contestant display
- [ ] Implement `ContestantModal.tsx` - create/edit contestant

### Phase 3: Main Management Page (Day 5)
- [ ] Create `pages/VotingManagement.tsx` with tabs:
  - Campaigns tab (list + CRUD)
  - Results tab (live results view)
  - Analytics tab
  - Settings tab
- [ ] Integrate with `VotingContext`
- [ ] Add filters and search functionality

### Phase 4: Campaign Creation Wizard (Day 6)
- [ ] Multi-step wizard in `CampaignModal.tsx`:
  1. Basic Info (name, description, dates)
  2. Voting Rules (mode, eligibility, limits)
  3. Transparency Options
  4. Categories & Contestants
  5. Paid Voting Config (if applicable)
  6. Review & Publish

### Phase 5: Results & Analytics (Day 7)
- [ ] Implement `VotingAnalyticsTab.tsx`
- [ ] Implement charts using Recharts (already in project)
- [ ] Implement `ResultsTable.tsx` with sorting/filtering
- [ ] Implement `LiveVoteCounter.tsx` component

### Phase 6: Advanced Features (Day 8)
- [ ] Implement `RoundManager.tsx` for multi-round voting
- [ ] Implement `VotePackageBuilder.tsx` for paid voting
- [ ] Implement `EligibilityRules.tsx` for access control
- [ ] Implement QR code generation using `qrcode.react`
- [ ] Implement share links with copy functionality

### Phase 7: Real-Time Integration (Day 9)
- [ ] Create `useVotingRealtime.ts` hook with WebSocket
- [ ] Implement mock WebSocket for development
- [ ] Integrate real-time updates in results view
- [ ] Add live counter animations

### Phase 8: Public Voting Page (Day 10)
- [ ] Create `pages/PublicVoting.tsx`
- [ ] Implement `VotingBooth.tsx` - main voting interface
- [ ] Implement `ContestantVoteCard.tsx` - voteable cards
- [ ] Implement `PaymentModal.tsx` - paid vote checkout
- [ ] Implement `VoteConfirmation.tsx` - success state
- [ ] Mobile-responsive design

### Phase 9: Embeddable Widget (Day 11)
- [ ] Create `VotingWidget.tsx` - standalone embeddable
- [ ] Create embed code generator
- [ ] Add iframe/script embed options

### Phase 10: Settings & Polish (Day 12)
- [ ] Implement `VotingSettingsTab.tsx`
- [ ] Implement `NotificationSettings.tsx` (UI only)
- [ ] Add empty states with proper microcopy
- [ ] Add loading skeletons
- [ ] Add error handling
- [ ] Final polish and testing

---

## 6. Component Breakdown

### 6.1 CampaignModal (Create/Edit Wizard)

**Steps:**
1. **Basic Info**
   - Campaign name (required)
   - Description (optional)
   - Start date/time
   - End date/time
   - Privacy/Status

2. **Voting Rules**
   - Mode: Free / Paid / Hybrid
   - Eligibility: Open / Authenticated / Ticket holders / VIP
   - Ticket type selector (if ticket-based)
   - Vote limits configuration

3. **Transparency**
   - Show live vote counts toggle
   - Show percentage only toggle
   - Show revenue toggle (for paid)
   - Leaderboard options

4. **Categories & Contestants**
   - Inline category creation
   - Drag-to-reorder categories
   - Contestant management per category

5. **Paid Voting** (if mode is paid/hybrid)
   - Price per vote
   - Vote packages builder
   - Currency (from event settings)

6. **Review & Publish**
   - Summary of all settings
   - Save as draft / Publish buttons

### 6.2 VotingManagement Tabs

| Tab | Purpose | Key Components |
|-----|---------|----------------|
| Campaigns | List, create, manage campaigns | CampaignCard, filters, search |
| Results | Live/historical vote results | ResultsTable, charts, exports |
| Analytics | Deep insights and metrics | Charts, segments, exports |
| Settings | Module configuration | Toggle settings, notification config |

### 6.3 Public Voting Components

**VotingBooth.tsx:**
- Campaign header with title, description
- Countdown timer to end
- Category tabs/selector
- Contestant grid
- Vote action buttons
- Payment flow (if paid)

**ContestantVoteCard.tsx:**
- Photo
- Name
- Bio (truncated)
- Vote button
- Vote count (if transparent)
- Code display
- Share button

---

## 7. Service Layer

### 7.1 voting.service.ts Structure

```typescript
// Campaigns
getVotingCampaigns(eventId: string): Promise<VotingCampaign[]>
getVotingCampaign(eventId: string, campaignId: string): Promise<VotingCampaign>
createVotingCampaign(eventId: string, data: CreateCampaignRequest): Promise<VotingCampaign>
updateVotingCampaign(eventId: string, campaignId: string, data: UpdateCampaignRequest): Promise<VotingCampaign>
deleteVotingCampaign(eventId: string, campaignId: string): Promise<void>
publishCampaign(eventId: string, campaignId: string): Promise<VotingCampaign>
pauseCampaign(eventId: string, campaignId: string): Promise<VotingCampaign>
endCampaign(eventId: string, campaignId: string): Promise<VotingCampaign>

// Categories
createCategory(eventId: string, campaignId: string, data: CreateCategoryRequest): Promise<VotingCategory>
updateCategory(eventId: string, campaignId: string, categoryId: string, data: Partial<CreateCategoryRequest>): Promise<VotingCategory>
deleteCategory(eventId: string, campaignId: string, categoryId: string): Promise<void>
reorderCategories(eventId: string, campaignId: string, categoryIds: string[]): Promise<void>

// Contestants
createContestant(eventId: string, campaignId: string, categoryId: string, data: CreateContestantRequest): Promise<Contestant>
updateContestant(eventId: string, campaignId: string, contestantId: string, data: Partial<CreateContestantRequest>): Promise<Contestant>
deleteContestant(eventId: string, campaignId: string, contestantId: string): Promise<void>
moveContestant(eventId: string, campaignId: string, contestantId: string, newCategoryId: string): Promise<Contestant>

// Voting
castVote(campaignId: string, data: CastVoteRequest): Promise<Vote>
getVotes(eventId: string, campaignId: string, filters?: VoteFilters): Promise<PaginatedResponse<Vote>>

// Rounds
createRound(eventId: string, campaignId: string, data: CreateRoundRequest): Promise<VotingRound>
startRound(eventId: string, campaignId: string, roundId: string): Promise<VotingRound>
endRound(eventId: string, campaignId: string, roundId: string): Promise<VotingRound>
advanceContestants(eventId: string, campaignId: string, roundId: string, contestantIds: string[]): Promise<void>

// Analytics
getVotingAnalytics(eventId: string, campaignId?: string): Promise<VotingAnalytics>
getResults(eventId: string, campaignId: string, roundId?: string): Promise<ContestantResult[]>
exportResults(eventId: string, campaignId: string, format: 'csv' | 'pdf'): Promise<Blob>

// Settings
getVotingSettings(eventId: string): Promise<VotingSettings>
updateVotingSettings(eventId: string, data: Partial<VotingSettings>): Promise<VotingSettings>

// Packages
createVotePackage(eventId: string, campaignId: string, data: Omit<VotePackage, 'id' | 'campaignId'>): Promise<VotePackage>
updateVotePackage(eventId: string, campaignId: string, packageId: string, data: Partial<VotePackage>): Promise<VotePackage>
deleteVotePackage(eventId: string, campaignId: string, packageId: string): Promise<void>

// Payment (integrates with existing payment flow)
purchaseVotes(campaignId: string, packageId: string, quantity: number): Promise<PaymentIntent>
```

---

## 8. Real-Time Implementation

### 8.1 WebSocket Hook

```typescript
// useVotingRealtime.ts
export function useVotingRealtime(campaignId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<VotingRealtimeEvent | null>(null);
  
  // Mock implementation for development
  // Real implementation will use WebSocket or Server-Sent Events
  
  return {
    isConnected,
    lastEvent,
    subscribe: (callback: (event: VotingRealtimeEvent) => void) => void,
    unsubscribe: () => void,
  };
}
```

### 8.2 Mock Real-Time (Development)

For development, simulate real-time with:
- Random vote injection every few seconds
- Event-based updates when user votes
- Simulated latency

---

## 9. Public Voting Flow

### 9.1 URL Structure

```
/vote/:campaignId                     # Campaign overview
/vote/:campaignId/category/:catId     # Specific category
/vote/:campaignId/contestant/:contId  # Direct contestant vote
/vote/:campaignId/results             # Public results (if enabled)
```

### 9.2 Voter Journey

1. **Landing** - See campaign details, countdown
2. **Category Selection** - Choose voting category
3. **Browse Contestants** - View all contestants in category
4. **Cast Vote** - Click vote button
   - If free: Vote immediately
   - If paid: Open payment modal
5. **Confirmation** - Success state with share option

### 9.3 Mobile Considerations

- Single-column contestant cards
- Sticky bottom vote action bar
- Touch-friendly vote buttons
- Fast load with skeleton placeholders
- Swipe between categories

---

## 10. Testing Checklist

### 10.1 Campaign Management
- [ ] Create campaign with all options
- [ ] Edit existing campaign
- [ ] Publish/unpublish campaign
- [ ] Delete campaign
- [ ] Duplicate campaign (template provision)

### 10.2 Categories & Contestants
- [ ] Add/edit/delete categories
- [ ] Drag-to-reorder categories
- [ ] Add/edit/delete contestants
- [ ] Move contestant between categories
- [ ] Image upload for contestants

### 10.3 Voting Rules
- [ ] Free voting flow
- [ ] Paid voting flow
- [ ] Ticket-holder-only restriction
- [ ] Vote limits enforcement
- [ ] Access code validation

### 10.4 Multi-Round
- [ ] Create multiple rounds
- [ ] Start/end rounds
- [ ] Advance contestants
- [ ] Round-specific results

### 10.5 Results & Analytics
- [ ] Live vote counter updates
- [ ] Results table accuracy
- [ ] Chart rendering
- [ ] Export functionality
- [ ] Transparency mode enforcement

### 10.6 Public Voting
- [ ] Campaign page loads correctly
- [ ] Vote casting works
- [ ] Payment flow completes
- [ ] Mobile responsiveness
- [ ] Share links work

### 10.7 Real-Time
- [ ] Votes update in real-time
- [ ] Multiple clients sync
- [ ] Reconnection handling

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Mitigation |
|------|------------|
| Real-time complexity | Start with polling, upgrade to WebSocket |
| Payment integration | Reuse existing ticket payment flow |
| Large contestant lists | Virtualized lists, pagination |
| Concurrent voting | Optimistic UI with reconciliation |

### 11.2 UX Risks

| Risk | Mitigation |
|------|------------|
| Complex wizard | Progressive disclosure, smart defaults |
| Paid voting confusion | Clear pricing, confirmation dialogs |
| Mobile voting friction | Minimal clicks to vote |

### 11.3 Dependencies

- `qrcode.react` - For QR code generation (needs installation)
- `recharts` - Already installed for charts
- Existing payment infrastructure

---

## 12. Dependencies to Install

```bash
npm install qrcode.react @types/qrcode.react
```

---

## 13. Mock Data Structure

```typescript
// Sample campaign for development
const mockCampaign: VotingCampaign = {
  id: 'camp-1',
  eventId: 'evt-1',
  name: 'Best Performer 2026',
  description: 'Vote for your favorite performer at the event!',
  status: 'active',
  startDate: '2026-01-28T00:00:00Z',
  endDate: '2026-02-15T23:59:59Z',
  timezone: 'Africa/Lagos',
  rounds: [
    {
      id: 'round-1',
      campaignId: 'camp-1',
      name: 'Preliminary',
      order: 1,
      status: 'active',
      startDate: '2026-01-28T00:00:00Z',
      endDate: '2026-02-05T23:59:59Z',
      advancementRule: 'top-n',
      advancementCount: 10,
      advancedContestantIds: [],
    },
  ],
  currentRoundId: 'round-1',
  votingMode: 'hybrid',
  eligibility: {
    type: 'ticket-holders',
    ticketTypeIds: ['tkt-1', 'tkt-2'],
  },
  voteLimits: {
    votesPerPerson: 5,
    votesPerCategory: 3,
    votesPerContestant: 1,
    dailyLimit: 10,
  },
  transparency: {
    mode: 'live',
    showVoteCount: true,
    showPercentage: true,
    showRevenue: false,
    showLeaderboard: true,
    leaderboardSize: 5,
  },
  votePackages: [
    {
      id: 'pkg-1',
      campaignId: 'camp-1',
      name: '10 Votes Bundle',
      voteCount: 10,
      price: 500,
      currency: 'NGN',
      discountPercentage: 10,
      isActive: true,
    },
  ],
  pricePerVote: 50,
  currency: 'NGN',
  categories: [
    {
      id: 'cat-1',
      campaignId: 'camp-1',
      name: 'Best Male Performer',
      order: 1,
      isActive: true,
      contestants: [
        {
          id: 'cont-1',
          categoryId: 'cat-1',
          campaignId: 'camp-1',
          name: 'John Doe',
          bio: 'Amazing performer with 10 years experience',
          imageUrl: '/assets/contestants/john.jpg',
          code: 'JD001',
          directVoteUrl: '/vote/camp-1/contestant/cont-1',
          activeInRound: true,
          order: 1,
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
        },
      ],
    },
  ],
  publicUrl: '/vote/camp-1',
  captchaEnabled: false,
  voteTimeout: 30,
  createdAt: '2026-01-20T00:00:00Z',
  updatedAt: '2026-01-20T00:00:00Z',
  createdBy: 'user-1',
};
```

---

## 14. Progress Tracking

Use this section to track implementation progress:

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Foundation | ⏳ Pending | |
| Phase 2: Core Components | ⏳ Pending | |
| Phase 3: Main Page | ⏳ Pending | |
| Phase 4: Campaign Wizard | ⏳ Pending | |
| Phase 5: Results & Analytics | ⏳ Pending | |
| Phase 6: Advanced Features | ⏳ Pending | |
| Phase 7: Real-Time | ⏳ Pending | |
| Phase 8: Public Voting | ⏳ Pending | |
| Phase 9: Embeddable Widget | ⏳ Pending | |
| Phase 10: Polish | ⏳ Pending | |

---

## 15. Notes for Implementation

1. **Follow existing patterns exactly** - Copy structure from MerchandiseManagement
2. **Dark mode first** - Apply all dark mode patterns from copilot-instructions.md
3. **Consistent naming** - Use "campaign" not "session", "contestant" not "candidate"
4. **Smart defaults** - Pre-fill sensible values to reduce setup time
5. **Optimistic UI** - Update UI immediately, reconcile with server
6. **Error boundaries** - Graceful degradation on failures
7. **Accessibility** - Keyboard navigation, screen reader support

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Ready for Implementation**: ✅ Yes (awaiting approval)
