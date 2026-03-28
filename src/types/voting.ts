// Voting Module Types

// ============ Enums ============
export type CampaignStatus = 'draft' | 'published' | 'active' | 'paused' | 'ended' | 'archived';
export type VotingMode = 'free' | 'paid';
export type EligibilityType = 'open' | 'authenticated' | 'ticket-holders' | 'vip' | 'invited';
export type TransparencyMode = 'live' | 'hidden' | 'percentage-only' | 'after-close';
export type RoundStatus = 'upcoming' | 'active' | 'completed';

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
  
  // Vote count (computed)
  voteCount: number;
  
  // Order
  order: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
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

// ============ Campaign ============
export interface VotingCampaign {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  
  // Control flags
  isPublished: boolean; // Visible to voters
  isPaused: boolean;    // Manually paused regardless of schedule
  
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
  
  // Aggregated stats (computed)
  totalVotes: number;
  totalRevenue: number;
  uniqueVoters: number;
  
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

// ============ Time Series Data ============
export interface TimeSeriesData {
  timestamp: string;
  value: number;
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

// ============ Results ============
export interface ContestantResult {
  contestantId: string;
  contestantName: string;
  contestantImageUrl?: string;
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
  timezone?: string;
  votingMode: VotingMode;
  eligibility: EligibilityConfig;
  voteLimits: VoteLimits;
  transparency: TransparencyConfig;
  votePackages?: Omit<VotePackage, 'id' | 'campaignId'>[];
  pricePerVote?: number;
  captchaEnabled?: boolean;
  voteTimeout?: number;
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

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
  order?: number;
}

export interface CreateContestantRequest {
  name: string;
  bio?: string;
  imageUrl?: string;
  socialLinks?: Contestant['socialLinks'];
}

export interface UpdateContestantRequest extends Partial<CreateContestantRequest> {
  activeInRound?: boolean;
  order?: number;
}

export interface CreateRoundRequest {
  name: string;
  startDate: string;
  endDate: string;
  advancementRule: 'top-n' | 'threshold' | 'manual';
  advancementCount?: number;
  advancementThreshold?: number;
}

export interface UpdateRoundRequest extends Partial<CreateRoundRequest> {
  status?: RoundStatus;
}

export interface CastVoteRequest {
  contestantId: string;
  categoryId: string;
  voteCount?: number; // Default 1
  packageId?: string; // For paid votes
  paymentId?: string; // For paid votes
}

export interface VoteFilters {
  categoryId?: string;
  contestantId?: string;
  roundId?: string;
  isPaid?: boolean;
  isValid?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateVotePackageRequest {
  name: string;
  voteCount: number;
  price: number;
  discountPercentage?: number;
  maxPurchases?: number;
}

export interface UpdateVotePackageRequest extends Partial<CreateVotePackageRequest> {
  isActive?: boolean;
}

// ============ Real-Time Events ============
export type VotingRealtimeEvent = 
  | { type: 'vote_cast'; data: { contestantId: string; categoryId: string; voteCount: number; newTotal: number } }
  | { type: 'campaign_status'; data: { campaignId: string; status: CampaignStatus } }
  | { type: 'round_changed'; data: { roundId: string; status: RoundStatus } }
  | { type: 'results_updated'; data: { campaignId: string; results: ContestantResult[] } };

// ============ Payment Intent (for paid voting) ============
export interface VotePaymentIntent {
  id: string;
  campaignId: string;
  packageId?: string;
  voteCount: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentUrl?: string;
  expiresAt: string;
}
