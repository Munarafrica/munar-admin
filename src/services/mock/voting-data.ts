// Voting Mock Data
import {
  VotingCampaign,
  VotingCategory,
  Contestant,
  Vote,
  VotingRound,
  VotePackage,
  VotingAnalytics,
  VotingSettings,
  ContestantResult,
  TimeSeriesData,
} from '../../types/voting';

// Helper to generate IDs
export const generateVotingId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper for delay
export const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ============ Mock Contestants ============
const mockContestants: Contestant[] = [
  // Category 1: Best Male Performer
  {
    id: 'cont-1',
    categoryId: 'cat-1',
    campaignId: 'camp-1',
    name: 'David Okonkwo',
    bio: 'Award-winning performer with 10 years of experience in contemporary dance and music.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    code: 'DO001',
    directVoteUrl: '/vote/camp-1/contestant/cont-1',
    socialLinks: {
      instagram: '@davidokonkwo',
      twitter: '@david_performs',
    },
    activeInRound: true,
    voteCount: 156,
    order: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cont-2',
    categoryId: 'cat-1',
    campaignId: 'camp-1',
    name: 'Emmanuel Adeyemi',
    bio: 'Rising star known for electrifying stage presence and unique vocal style.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    code: 'EA002',
    directVoteUrl: '/vote/camp-1/contestant/cont-2',
    socialLinks: {
      instagram: '@emmanueladeyemi',
    },
    activeInRound: true,
    voteCount: 134,
    order: 2,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cont-3',
    categoryId: 'cat-1',
    campaignId: 'camp-1',
    name: 'Chinedu Obi',
    bio: 'Multi-instrumentalist and composer blending Afrobeat with modern sounds.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    code: 'CO003',
    directVoteUrl: '/vote/camp-1/contestant/cont-3',
    activeInRound: true,
    voteCount: 98,
    order: 3,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  // Category 2: Best Female Performer
  {
    id: 'cont-4',
    categoryId: 'cat-2',
    campaignId: 'camp-1',
    name: 'Amara Nwosu',
    bio: 'Acclaimed vocalist and dancer representing the new wave of Afro-fusion.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    code: 'AN004',
    directVoteUrl: '/vote/camp-1/contestant/cont-4',
    socialLinks: {
      instagram: '@amaranwosu',
      twitter: '@amara_music',
      website: 'https://amaranwosu.com',
    },
    activeInRound: true,
    voteCount: 203,
    order: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cont-5',
    categoryId: 'cat-2',
    campaignId: 'camp-1',
    name: 'Blessing Eze',
    bio: 'Soul and R&B artist with a voice that captivates audiences worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    code: 'BE005',
    directVoteUrl: '/vote/camp-1/contestant/cont-5',
    activeInRound: true,
    voteCount: 178,
    order: 2,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cont-6',
    categoryId: 'cat-2',
    campaignId: 'camp-1',
    name: 'Funke Alade',
    bio: 'Traditional meets contemporary - a unique artistic vision.',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop',
    code: 'FA006',
    directVoteUrl: '/vote/camp-1/contestant/cont-6',
    activeInRound: true,
    voteCount: 145,
    order: 3,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  // Category 3: Best Group Performance
  {
    id: 'cont-7',
    categoryId: 'cat-3',
    campaignId: 'camp-1',
    name: 'The Harmonics',
    bio: 'Five-piece band known for tight harmonies and explosive live shows.',
    imageUrl: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=300&h=300&fit=crop',
    code: 'TH007',
    directVoteUrl: '/vote/camp-1/contestant/cont-7',
    activeInRound: true,
    voteCount: 189,
    order: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cont-8',
    categoryId: 'cat-3',
    campaignId: 'camp-1',
    name: 'Rhythm Masters',
    bio: 'Dance crew combining traditional African dance with hip-hop.',
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&h=300&fit=crop',
    code: 'RM008',
    directVoteUrl: '/vote/camp-1/contestant/cont-8',
    activeInRound: true,
    voteCount: 167,
    order: 2,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];

// ============ Mock Categories ============
const mockCategories: VotingCategory[] = [
  {
    id: 'cat-1',
    campaignId: 'camp-1',
    name: 'Best Male Performer',
    description: 'Vote for the best male solo performer at this year\'s event.',
    order: 1,
    isActive: true,
    contestants: mockContestants.filter(c => c.categoryId === 'cat-1'),
  },
  {
    id: 'cat-2',
    campaignId: 'camp-1',
    name: 'Best Female Performer',
    description: 'Vote for the best female solo performer at this year\'s event.',
    order: 2,
    isActive: true,
    contestants: mockContestants.filter(c => c.categoryId === 'cat-2'),
  },
  {
    id: 'cat-3',
    campaignId: 'camp-1',
    name: 'Best Group Performance',
    description: 'Vote for the best group or band performance.',
    order: 3,
    isActive: true,
    contestants: mockContestants.filter(c => c.categoryId === 'cat-3'),
  },
];

// ============ Mock Rounds ============
const mockRounds: VotingRound[] = [
  {
    id: 'round-1',
    campaignId: 'camp-1',
    name: 'Preliminary Round',
    order: 1,
    status: 'active',
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-02-05T23:59:59Z',
    advancementRule: 'top-n',
    advancementCount: 5,
    advancedContestantIds: [],
  },
  {
    id: 'round-2',
    campaignId: 'camp-1',
    name: 'Semi-Final',
    order: 2,
    status: 'upcoming',
    startDate: '2026-02-06T00:00:00Z',
    endDate: '2026-02-12T23:59:59Z',
    advancementRule: 'top-n',
    advancementCount: 3,
    advancedContestantIds: [],
  },
  {
    id: 'round-3',
    campaignId: 'camp-1',
    name: 'Grand Final',
    order: 3,
    status: 'upcoming',
    startDate: '2026-02-13T00:00:00Z',
    endDate: '2026-02-15T23:59:59Z',
    advancementRule: 'manual',
    advancedContestantIds: [],
  },
];

// ============ Mock Vote Packages ============
const mockVotePackages: VotePackage[] = [
  {
    id: 'pkg-1',
    campaignId: 'camp-1',
    name: '5 Votes',
    voteCount: 5,
    price: 250,
    currency: 'NGN',
    isActive: true,
  },
  {
    id: 'pkg-2',
    campaignId: 'camp-1',
    name: '10 Votes Bundle',
    voteCount: 10,
    price: 450,
    currency: 'NGN',
    discountPercentage: 10,
    isActive: true,
  },
  {
    id: 'pkg-3',
    campaignId: 'camp-1',
    name: '25 Votes Super Bundle',
    voteCount: 25,
    price: 1000,
    currency: 'NGN',
    discountPercentage: 20,
    isActive: true,
  },
  {
    id: 'pkg-4',
    campaignId: 'camp-1',
    name: '50 Votes Mega Pack',
    voteCount: 50,
    price: 1750,
    currency: 'NGN',
    discountPercentage: 30,
    maxPurchases: 5,
    isActive: true,
  },
];

// ============ Mock Campaigns ============
export const mockCampaigns: VotingCampaign[] = [
  {
    id: 'camp-1',
    eventId: 'evt-1',
    name: 'Talent Showcase 2026',
    description: 'Vote for your favorite performers at the Talent Showcase 2026! Your vote determines who wins the grand prize.',
    status: 'active',
    isPaused: false,
    isPublished: true,
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-02-15T23:59:59Z',
    timezone: 'Africa/Lagos',
    rounds: mockRounds,
    currentRoundId: 'round-1',
    votingMode: 'paid',
    eligibility: {
      type: 'open',
    },
    voteLimits: {
      votesPerPerson: 10,
      votesPerCategory: 5,
      votesPerContestant: 3,
      dailyLimit: 20,
    },
    transparency: {
      mode: 'live',
      showVoteCount: true,
      showPercentage: true,
      showRevenue: false,
      showLeaderboard: true,
      leaderboardSize: 5,
    },
    votePackages: mockVotePackages,
    pricePerVote: 50,
    currency: 'NGN',
    categories: mockCategories,
    totalVotes: 1270,
    totalRevenue: 85000,
    uniqueVoters: 342,
    publicUrl: '/vote/camp-1',
    captchaEnabled: false,
    voteTimeout: 30,
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'camp-2',
    eventId: 'evt-1',
    name: 'People\'s Choice Award',
    description: 'A simple free vote to choose the audience favorite.',
    status: 'draft',
    isPaused: false,
    isPublished: false,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-15T23:59:59Z',
    timezone: 'Africa/Lagos',
    rounds: [
      {
        id: 'round-pc-1',
        campaignId: 'camp-2',
        name: 'Main Round',
        order: 1,
        status: 'upcoming',
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-03-15T23:59:59Z',
        advancementRule: 'manual',
        advancedContestantIds: [],
      },
    ],
    currentRoundId: 'round-pc-1',
    votingMode: 'free',
    eligibility: {
      type: 'ticket-holders',
      ticketTypeIds: ['tkt-1', 'tkt-2'],
    },
    voteLimits: {
      votesPerPerson: 1,
      votesPerCategory: 1,
      votesPerContestant: 1,
    },
    transparency: {
      mode: 'after-close',
      showVoteCount: false,
      showPercentage: false,
      showRevenue: false,
      showLeaderboard: false,
    },
    votePackages: [],
    currency: 'NGN',
    categories: [],
    totalVotes: 0,
    totalRevenue: 0,
    uniqueVoters: 0,
    publicUrl: '/vote/camp-2',
    captchaEnabled: true,
    voteTimeout: 60,
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
    createdBy: 'user-1',
  },
];

// ============ Mock Votes ============
export const mockVotes: Vote[] = [
  // Sample votes for contestant 1
  {
    id: 'vote-1',
    campaignId: 'camp-1',
    categoryId: 'cat-1',
    contestantId: 'cont-1',
    roundId: 'round-1',
    voterId: 'user-10',
    isAnonymous: false,
    voteCount: 1,
    isPaid: false,
    isValid: true,
    timestamp: '2026-01-21T10:30:00Z',
  },
  {
    id: 'vote-2',
    campaignId: 'camp-1',
    categoryId: 'cat-1',
    contestantId: 'cont-1',
    roundId: 'round-1',
    voterId: 'user-11',
    isAnonymous: false,
    voteCount: 5,
    isPaid: true,
    paymentId: 'pay-1',
    amount: 250,
    isValid: true,
    timestamp: '2026-01-21T11:00:00Z',
  },
  {
    id: 'vote-3',
    campaignId: 'camp-1',
    categoryId: 'cat-1',
    contestantId: 'cont-2',
    roundId: 'round-1',
    isAnonymous: true,
    voteCount: 1,
    isPaid: false,
    isValid: true,
    timestamp: '2026-01-21T11:30:00Z',
  },
  {
    id: 'vote-4',
    campaignId: 'camp-1',
    categoryId: 'cat-2',
    contestantId: 'cont-4',
    roundId: 'round-1',
    voterId: 'user-12',
    isAnonymous: false,
    voteCount: 10,
    isPaid: true,
    paymentId: 'pay-2',
    amount: 450,
    isValid: true,
    timestamp: '2026-01-21T12:00:00Z',
  },
  {
    id: 'vote-5',
    campaignId: 'camp-1',
    categoryId: 'cat-2',
    contestantId: 'cont-5',
    roundId: 'round-1',
    voterId: 'user-13',
    isAnonymous: false,
    voteCount: 3,
    isPaid: true,
    paymentId: 'pay-3',
    amount: 150,
    isValid: true,
    timestamp: '2026-01-21T12:30:00Z',
  },
];

// ============ Mock Vote Counts (for quick lookup) ============
export const mockVoteCounts: Record<string, number> = {
  'cont-1': 156,
  'cont-2': 89,
  'cont-3': 67,
  'cont-4': 203,
  'cont-5': 145,
  'cont-6': 98,
  'cont-7': 178,
  'cont-8': 134,
};

// ============ Mock Analytics ============
export const mockVotingAnalytics: VotingAnalytics = {
  campaignId: 'camp-1',
  
  // Participation
  totalVotes: 1070,
  uniqueVoters: 412,
  votesPerCategory: {
    'cat-1': 312,
    'cat-2': 446,
    'cat-3': 312,
  },
  votesPerContestant: mockVoteCounts,
  votesOverTime: generateTimeSeriesData(),
  
  // Revenue
  totalRevenue: 42500,
  revenuePerPackage: {
    'pkg-1': 7500,
    'pkg-2': 13500,
    'pkg-3': 12000,
    'pkg-4': 9500,
  },
  averageVotesPerVoter: 2.6,
  paymentSuccessRate: 0.94,
  
  // Voter segments
  votesByTicketType: {
    'tkt-1': 456,
    'tkt-2': 312,
    'tkt-3': 167,
    'anonymous': 135,
  },
  authenticatedVsAnonymous: {
    authenticated: 935,
    anonymous: 135,
  },
  
  // Compliance
  invalidVotes: 23,
  duplicateAttempts: 45,
  ineligibleAttempts: 12,
  
  // Geographic
  votesByLocation: {
    'Lagos': 456,
    'Abuja': 234,
    'Port Harcourt': 123,
    'Ibadan': 98,
    'Kano': 67,
    'Other': 92,
  },
};

// Helper to generate time series data
function generateTimeSeriesData(): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const startDate = new Date('2026-01-20T00:00:00Z');
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    data.push({
      timestamp: date.toISOString(),
      value: Math.floor(100 + Math.random() * 150),
    });
  }
  
  return data;
}

// ============ Mock Results ============
export const mockResults: ContestantResult[] = [
  // Category 1
  {
    contestantId: 'cont-1',
    contestantName: 'David Okonkwo',
    contestantImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    categoryId: 'cat-1',
    categoryName: 'Best Male Performer',
    roundId: 'round-1',
    totalVotes: 156,
    percentage: 50,
    rank: 1,
    revenue: 4680,
  },
  {
    contestantId: 'cont-2',
    contestantName: 'Emmanuel Adeyemi',
    contestantImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    categoryId: 'cat-1',
    categoryName: 'Best Male Performer',
    roundId: 'round-1',
    totalVotes: 89,
    percentage: 28.5,
    rank: 2,
    revenue: 2670,
  },
  {
    contestantId: 'cont-3',
    contestantName: 'Chinedu Obi',
    contestantImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
    categoryId: 'cat-1',
    categoryName: 'Best Male Performer',
    roundId: 'round-1',
    totalVotes: 67,
    percentage: 21.5,
    rank: 3,
    revenue: 2010,
  },
  // Category 2
  {
    contestantId: 'cont-4',
    contestantName: 'Amara Nwosu',
    contestantImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
    categoryId: 'cat-2',
    categoryName: 'Best Female Performer',
    roundId: 'round-1',
    totalVotes: 203,
    percentage: 45.5,
    rank: 1,
    revenue: 6090,
  },
  {
    contestantId: 'cont-5',
    contestantName: 'Blessing Eze',
    contestantImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    categoryId: 'cat-2',
    categoryName: 'Best Female Performer',
    roundId: 'round-1',
    totalVotes: 145,
    percentage: 32.5,
    rank: 2,
    revenue: 4350,
  },
  {
    contestantId: 'cont-6',
    contestantName: 'Funke Alade',
    contestantImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop',
    categoryId: 'cat-2',
    categoryName: 'Best Female Performer',
    roundId: 'round-1',
    totalVotes: 98,
    percentage: 22,
    rank: 3,
    revenue: 2940,
  },
  // Category 3
  {
    contestantId: 'cont-7',
    contestantName: 'The Harmonics',
    contestantImageUrl: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=300&h=300&fit=crop',
    categoryId: 'cat-3',
    categoryName: 'Best Group Performance',
    roundId: 'round-1',
    totalVotes: 178,
    percentage: 57,
    rank: 1,
    revenue: 5340,
  },
  {
    contestantId: 'cont-8',
    contestantName: 'Rhythm Masters',
    contestantImageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=300&h=300&fit=crop',
    categoryId: 'cat-3',
    categoryName: 'Best Group Performance',
    roundId: 'round-1',
    totalVotes: 134,
    percentage: 43,
    rank: 2,
    revenue: 4020,
  },
];

// ============ Mock Settings ============
export const mockVotingSettings: VotingSettings = {
  eventId: 'evt-1',
  
  defaultVotingMode: 'paid',
  defaultEligibility: 'open',
  defaultTransparency: 'live',
  
  notifyOnVotingStart: true,
  notifyOnVotingEnd: true,
  notifyVotersOfResults: true,
  reminderBeforeEnd: true,
  reminderHours: 24,
  
  defaultCaptchaEnabled: false,
  defaultVoteTimeout: 30,
  
  showVotingOnEventSite: true,
  embedWidgetEnabled: true,
};

// ============ Mutable State for CRUD Operations ============
let campaignsState = [...mockCampaigns];
let votesState = [...mockVotes];
let voteCountsState = { ...mockVoteCounts };

export const getMockCampaigns = () => campaignsState;
export const getMockVotes = () => votesState;
export const getMockVoteCounts = () => voteCountsState;

export const resetMockState = () => {
  campaignsState = [...mockCampaigns];
  votesState = [...mockVotes];
  voteCountsState = { ...mockVoteCounts };
};

export const addMockCampaign = (campaign: VotingCampaign) => {
  campaignsState = [...campaignsState, campaign];
};

export const updateMockCampaign = (id: string, updates: Partial<VotingCampaign>) => {
  campaignsState = campaignsState.map(c => 
    c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
  );
};

export const deleteMockCampaign = (id: string) => {
  campaignsState = campaignsState.filter(c => c.id !== id);
};

export const addMockVote = (vote: Vote) => {
  votesState = [...votesState, vote];
  if (voteCountsState[vote.contestantId]) {
    voteCountsState[vote.contestantId] += vote.voteCount;
  } else {
    voteCountsState[vote.contestantId] = vote.voteCount;
  }
};

export const getContestantVoteCount = (contestantId: string): number => {
  return voteCountsState[contestantId] || 0;
};
