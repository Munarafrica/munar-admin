// Voting Service - handles campaigns, categories, contestants, votes, and analytics
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { PaginatedResponse } from '../types/api';
import {
  VotingCampaign,
  VotingCategory,
  Contestant,
  Vote,
  VotingRound,
  VotePackage,
  VotingAnalytics,
  VotingSummary,
  VotingResults,
  VotingSettings,
  ContestantResult,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContestantRequest,
  UpdateContestantRequest,
  CreateRoundRequest,
  UpdateRoundRequest,
  CastVoteRequest,
  VoteFilters,
  CreateVotePackageRequest,
  UpdateVotePackageRequest,
  VotePaymentIntent,
} from '../types/voting';
import {
  getMockCampaigns,
  getMockVotes,
  getMockVoteCounts,
  addMockCampaign,
  updateMockCampaign,
  deleteMockCampaign,
  addMockVote,
  getContestantVoteCount,
  mockVotingAnalytics,
  mockResults,
  mockVotingSettings,
  generateVotingId,
  delay,
} from './mock/voting-data';

export const votingApiAvailable = config.features.votingApiAvailable;

const emptyVotingSummary = (currency = config.app.defaultCurrency): VotingSummary => ({
  totalVotes: 0,
  revenueMinor: 0,
  currency,
  contestants: 0,
  activeCampaigns: 0,
});

const emptyVotingSettings = (eventId: string): VotingSettings => ({
  eventId,
  defaultVotingMode: 'free',
  defaultEligibility: 'open',
  defaultTransparency: 'live',
  notifyOnVotingStart: true,
  notifyOnVotingEnd: true,
  notifyVotersOfResults: true,
  reminderBeforeEnd: false,
  reminderHours: 24,
  defaultCaptchaEnabled: false,
  defaultVoteTimeout: 5,
  showVotingOnEventSite: true,
  embedWidgetEnabled: false,
});

const emptyVotingResults = (campaignId = ''): VotingResults => ({
  campaignId,
  categories: [],
  totalVotes: 0,
  totalRevenueMinor: 0,
});

// ============ Campaigns ============

export async function getCampaigns(eventId: string): Promise<VotingCampaign[]> {
  if (!votingApiAvailable) {
    await delay(100);
    return [];
  }

  if (config.features.useMockData) {
    await delay();
    return getMockCampaigns().filter(c => c.eventId === eventId);
  }
  
  return await apiClient.get<VotingCampaign[]>(`/events/${eventId}/voting/campaigns`);
}

export async function getCampaign(eventId: string, campaignId: string): Promise<VotingCampaign> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting campaigns are not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId && c.eventId === eventId);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  }
  
  return await apiClient.get<VotingCampaign>(`/events/${eventId}/voting/campaigns/${campaignId}`);
}

export async function createCampaign(eventId: string, data: CreateCampaignRequest): Promise<VotingCampaign> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting campaign creation is not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    
    const campaignId = generateVotingId('camp');
    const roundId = generateVotingId('round');
    
    const newCampaign: VotingCampaign = {
      id: campaignId,
      eventId,
      name: data.name,
      description: data.description,
      status: 'draft',
      startDate: data.startDate,
      endDate: data.endDate,
      timezone: data.timezone || 'Africa/Lagos',
      rounds: [
        {
          id: roundId,
          campaignId,
          name: 'Main Round',
          order: 1,
          status: 'upcoming',
          startDate: data.startDate,
          endDate: data.endDate,
          advancementRule: 'manual',
          advancedContestantIds: [],
        },
      ],
      currentRoundId: roundId,
      votingMode: data.votingMode,
      eligibility: data.eligibility,
      voteLimits: data.voteLimits,
      transparency: data.transparency,
      votePackages: (data.votePackages || []).map((pkg, idx) => ({
        ...pkg,
        id: generateVotingId('pkg'),
        campaignId,
        isActive: true,
      })),
      pricePerVote: data.pricePerVote,
      currency: 'NGN',
      categories: [],
      totalVotes: 0,
      totalRevenue: 0,
      uniqueVoters: 0,
      publicUrl: `/vote/${campaignId}`,
      captchaEnabled: data.captchaEnabled ?? false,
      voteTimeout: data.voteTimeout ?? 30,
      isPublished: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    };
    
    addMockCampaign(newCampaign);
    return newCampaign;
  }
  
  return await apiClient.post<VotingCampaign>(`/events/${eventId}/voting/campaigns`, data);
}

export async function updateCampaign(
  eventId: string,
  campaignId: string,
  data: UpdateCampaignRequest
): Promise<VotingCampaign> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting campaign updates are not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    updateMockCampaign(campaignId, data as Partial<VotingCampaign>);
    const updated = getMockCampaigns().find(c => c.id === campaignId);
    if (!updated) throw new Error('Campaign not found');
    return updated;
  }
  
  return await apiClient.patch<VotingCampaign>(`/events/${eventId}/voting/campaigns/${campaignId}`, data);
}

export async function deleteCampaign(eventId: string, campaignId: string): Promise<void> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting campaign deletion is not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    deleteMockCampaign(campaignId);
    return;
  }
  
  await apiClient.delete(`/events/${eventId}/voting/campaigns/${campaignId}`);
}

export async function publishCampaign(eventId: string, campaignId: string, isPublished: boolean = true): Promise<VotingCampaign> {
  return updateCampaign(eventId, campaignId, { isPublished } as UpdateCampaignRequest);
}

export async function pauseCampaign(eventId: string, campaignId: string, isPaused: boolean = true): Promise<VotingCampaign> {
  return updateCampaign(eventId, campaignId, { isPaused } as UpdateCampaignRequest);
}

export async function startCampaign(eventId: string, campaignId: string): Promise<VotingCampaign> {
  return updateCampaign(eventId, campaignId, { status: 'active', isPaused: false } as UpdateCampaignRequest);
}

export async function endCampaign(eventId: string, campaignId: string): Promise<VotingCampaign> {
  return updateCampaign(eventId, campaignId, { status: 'ended' });
}

export async function duplicateCampaign(eventId: string, campaignId: string): Promise<VotingCampaign> {
  if (config.features.useMockData) {
    await delay();
    const original = getMockCampaigns().find(c => c.id === campaignId);
    if (!original) throw new Error('Campaign not found');
    
    const newCampaignId = generateVotingId('camp');
    const duplicated: VotingCampaign = {
      ...original,
      id: newCampaignId,
      name: `${original.name} (Copy)`,
      status: 'draft',
      rounds: original.rounds.map(r => ({
        ...r,
        id: generateVotingId('round'),
        campaignId: newCampaignId,
        status: 'upcoming' as const,
        advancedContestantIds: [],
      })),
      categories: original.categories.map(cat => ({
        ...cat,
        id: generateVotingId('cat'),
        campaignId: newCampaignId,
        contestants: cat.contestants.map(cont => ({
          ...cont,
          id: generateVotingId('cont'),
          categoryId: generateVotingId('cat'),
          campaignId: newCampaignId,
        })),
      })),
      publicUrl: `/vote/${newCampaignId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addMockCampaign(duplicated);
    return duplicated;
  }
  
  return await apiClient.post<VotingCampaign>(`/events/${eventId}/voting/campaigns/${campaignId}/duplicate`);
}

// ============ Categories ============

export async function createCategory(
  eventId: string,
  campaignId: string,
  data: CreateCategoryRequest
): Promise<VotingCategory> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const newCategory: VotingCategory = {
      id: generateVotingId('cat'),
      campaignId,
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      order: campaign.categories.length + 1,
      rulesOverride: data.rulesOverride,
      contestants: [],
      isActive: true,
    };
    
    updateMockCampaign(campaignId, {
      categories: [...campaign.categories, newCategory],
    });
    
    return newCategory;
  }
  
  return await apiClient.post<VotingCategory>(
    `/events/${eventId}/voting/campaigns/${campaignId}/categories`,
    data
  );
}

export async function updateCategory(
  eventId: string,
  campaignId: string,
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<VotingCategory> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const updatedCategories = campaign.categories.map(cat =>
      cat.id === categoryId ? { ...cat, ...data } : cat
    );
    
    updateMockCampaign(campaignId, { categories: updatedCategories });
    
    const updated = updatedCategories.find(c => c.id === categoryId);
    if (!updated) throw new Error('Category not found');
    return updated;
  }
  
  return await apiClient.patch<VotingCategory>(
    `/events/${eventId}/voting/campaigns/${campaignId}/categories/${categoryId}`,
    data
  );
}

export async function deleteCategory(
  eventId: string,
  campaignId: string,
  categoryId: string
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    updateMockCampaign(campaignId, {
      categories: campaign.categories.filter(c => c.id !== categoryId),
    });
    return;
  }
  
  await apiClient.delete(`/events/${eventId}/voting/campaigns/${campaignId}/categories/${categoryId}`);
}

export async function reorderCategories(
  eventId: string,
  campaignId: string,
  categoryIds: string[]
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const reorderedCategories = categoryIds.map((id, index) => {
      const category = campaign.categories.find(c => c.id === id);
      if (!category) throw new Error(`Category ${id} not found`);
      return { ...category, order: index + 1 };
    });
    
    updateMockCampaign(campaignId, { categories: reorderedCategories });
    return;
  }
  
  await apiClient.post(`/events/${eventId}/voting/campaigns/${campaignId}/categories/reorder`, {
    categoryIds,
  });
}

// ============ Contestants ============

export async function createContestant(
  eventId: string,
  campaignId: string,
  categoryId: string,
  data: CreateContestantRequest
): Promise<Contestant> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const category = campaign.categories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    
    const contestantId = generateVotingId('cont');
    const code = `${data.name.substring(0, 2).toUpperCase()}${String(category.contestants.length + 1).padStart(3, '0')}`;
    
    const newContestant: Contestant = {
      id: contestantId,
      categoryId,
      campaignId,
      name: data.name,
      bio: data.bio,
      imageUrl: data.imageUrl,
      code,
      directVoteUrl: `/vote/${campaignId}/contestant/${contestantId}`,
      socialLinks: data.socialLinks,
      activeInRound: true,
      voteCount: 0,
      order: category.contestants.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedCategories = campaign.categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, contestants: [...cat.contestants, newContestant] }
        : cat
    );
    
    updateMockCampaign(campaignId, { categories: updatedCategories });
    
    return newContestant;
  }
  
  return await apiClient.post<Contestant>(
    `/events/${eventId}/voting/campaigns/${campaignId}/categories/${categoryId}/contestants`,
    data
  );
}

export async function updateContestant(
  eventId: string,
  campaignId: string,
  contestantId: string,
  data: UpdateContestantRequest
): Promise<Contestant> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    let updatedContestant: Contestant | null = null;
    
    const updatedCategories = campaign.categories.map(cat => ({
      ...cat,
      contestants: cat.contestants.map(cont => {
        if (cont.id === contestantId) {
          updatedContestant = { ...cont, ...data, updatedAt: new Date().toISOString() };
          return updatedContestant;
        }
        return cont;
      }),
    }));
    
    if (!updatedContestant) throw new Error('Contestant not found');
    
    updateMockCampaign(campaignId, { categories: updatedCategories });
    return updatedContestant;
  }
  
  return await apiClient.patch<Contestant>(
    `/events/${eventId}/voting/campaigns/${campaignId}/contestants/${contestantId}`,
    data
  );
}

export async function deleteContestant(
  eventId: string,
  campaignId: string,
  contestantId: string
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const updatedCategories = campaign.categories.map(cat => ({
      ...cat,
      contestants: cat.contestants.filter(cont => cont.id !== contestantId),
    }));
    
    updateMockCampaign(campaignId, { categories: updatedCategories });
    return;
  }
  
  await apiClient.delete(`/events/${eventId}/voting/campaigns/${campaignId}/contestants/${contestantId}`);
}

export async function moveContestant(
  eventId: string,
  campaignId: string,
  contestantId: string,
  newCategoryId: string
): Promise<Contestant> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    let movedContestant: Contestant | null = null;
    
    // Remove from current category
    let updatedCategories = campaign.categories.map(cat => {
      const found = cat.contestants.find(c => c.id === contestantId);
      if (found) {
        movedContestant = { ...found, categoryId: newCategoryId };
      }
      return {
        ...cat,
        contestants: cat.contestants.filter(c => c.id !== contestantId),
      };
    });
    
    if (!movedContestant) throw new Error('Contestant not found');
    
    // Add to new category
    updatedCategories = updatedCategories.map(cat =>
      cat.id === newCategoryId
        ? { ...cat, contestants: [...cat.contestants, movedContestant!] }
        : cat
    );
    
    updateMockCampaign(campaignId, { categories: updatedCategories });
    return movedContestant;
  }
  
  return await apiClient.post<Contestant>(
    `/events/${eventId}/voting/campaigns/${campaignId}/contestants/${contestantId}/move`,
    { categoryId: newCategoryId }
  );
}

// ============ Voting ============

export async function castVote(campaignId: string, data: CastVoteRequest): Promise<Vote> {
  if (config.features.useMockData) {
    await delay();
    
    const newVote: Vote = {
      id: generateVotingId('vote'),
      campaignId,
      categoryId: data.categoryId,
      contestantId: data.contestantId,
      roundId: getMockCampaigns().find(c => c.id === campaignId)?.currentRoundId || 'round-1',
      isAnonymous: true,
      voteCount: data.voteCount || 1,
      isPaid: !!data.paymentId,
      paymentId: data.paymentId,
      isValid: true,
      timestamp: new Date().toISOString(),
    };
    
    addMockVote(newVote);
    return newVote;
  }
  
  return await apiClient.post<Vote>(`/voting/campaigns/${campaignId}/vote`, data);
}

export async function getVotes(
  eventId: string,
  campaignId: string,
  filters?: VoteFilters
): Promise<PaginatedResponse<Vote>> {
  if (config.features.useMockData) {
    await delay();
    let votes = getMockVotes().filter(v => v.campaignId === campaignId);
    
    if (filters?.categoryId) {
      votes = votes.filter(v => v.categoryId === filters.categoryId);
    }
    if (filters?.contestantId) {
      votes = votes.filter(v => v.contestantId === filters.contestantId);
    }
    if (filters?.roundId) {
      votes = votes.filter(v => v.roundId === filters.roundId);
    }
    if (filters?.isPaid !== undefined) {
      votes = votes.filter(v => v.isPaid === filters.isPaid);
    }
    if (filters?.isValid !== undefined) {
      votes = votes.filter(v => v.isValid === filters.isValid);
    }
    
    return {
      data: votes,
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalItems: votes.length,
        itemsPerPage: 50,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
  
  return await apiClient.get<PaginatedResponse<Vote>>(
    `/events/${eventId}/voting/campaigns/${campaignId}/votes`,
    { params: filters as Record<string, string | number | boolean | undefined> }
  );
}

export async function getContestantVotes(
  eventId: string,
  campaignId: string,
  contestantId: string
): Promise<number> {
  if (config.features.useMockData) {
    await delay(100);
    return getContestantVoteCount(contestantId);
  }
  
  const response = await apiClient.get<{ count: number }>(
    `/events/${eventId}/voting/campaigns/${campaignId}/contestants/${contestantId}/votes`
  );
  return response.count;
}

// ============ Rounds ============

export async function createRound(
  eventId: string,
  campaignId: string,
  data: CreateRoundRequest
): Promise<VotingRound> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const newRound: VotingRound = {
      id: generateVotingId('round'),
      campaignId,
      name: data.name,
      order: campaign.rounds.length + 1,
      status: 'upcoming',
      startDate: data.startDate,
      endDate: data.endDate,
      advancementRule: data.advancementRule,
      advancementCount: data.advancementCount,
      advancementThreshold: data.advancementThreshold,
      advancedContestantIds: [],
    };
    
    updateMockCampaign(campaignId, {
      rounds: [...campaign.rounds, newRound],
    });
    
    return newRound;
  }
  
  return await apiClient.post<VotingRound>(
    `/events/${eventId}/voting/campaigns/${campaignId}/rounds`,
    data
  );
}

export async function updateRound(
  eventId: string,
  campaignId: string,
  roundId: string,
  data: UpdateRoundRequest
): Promise<VotingRound> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const updatedRounds = campaign.rounds.map(r =>
      r.id === roundId ? { ...r, ...data } : r
    );
    
    updateMockCampaign(campaignId, { rounds: updatedRounds });
    
    const updated = updatedRounds.find(r => r.id === roundId);
    if (!updated) throw new Error('Round not found');
    return updated;
  }
  
  return await apiClient.patch<VotingRound>(
    `/events/${eventId}/voting/campaigns/${campaignId}/rounds/${roundId}`,
    data
  );
}

export async function startRound(
  eventId: string,
  campaignId: string,
  roundId: string
): Promise<VotingRound> {
  return updateRound(eventId, campaignId, roundId, { status: 'active' });
}

export async function endRound(
  eventId: string,
  campaignId: string,
  roundId: string
): Promise<VotingRound> {
  return updateRound(eventId, campaignId, roundId, { status: 'completed' });
}

export async function advanceContestants(
  eventId: string,
  campaignId: string,
  roundId: string,
  contestantIds: string[]
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const updatedRounds = campaign.rounds.map(r =>
      r.id === roundId ? { ...r, advancedContestantIds: contestantIds } : r
    );
    
    updateMockCampaign(campaignId, { rounds: updatedRounds });
    return;
  }
  
  await apiClient.post(
    `/events/${eventId}/voting/campaigns/${campaignId}/rounds/${roundId}/advance`,
    { contestantIds }
  );
}

// ============ Analytics ============

export async function getVotingAnalytics(
  eventId: string,
  campaignId?: string
): Promise<VotingAnalytics | null> {
  if (!votingApiAvailable) {
    await delay(100);
    return null;
  }

  if (config.features.useMockData) {
    await delay();
    return mockVotingAnalytics;
  }
  
  const url = campaignId
    ? `/events/${eventId}/voting/campaigns/${campaignId}/analytics`
    : `/events/${eventId}/voting/analytics`;
  
  return await apiClient.get<VotingAnalytics>(url);
}

export async function getResults(
  eventId: string,
  campaignId: string,
  roundId?: string
): Promise<ContestantResult[]> {
  if (!votingApiAvailable) {
    await delay(100);
    return [];
  }

  if (config.features.useMockData) {
    await delay();
    let results = [...mockResults];
    
    if (roundId) {
      results = results.filter(r => r.roundId === roundId);
    }
    
    // Sort by rank
    return results.sort((a, b) => a.rank - b.rank);
  }
  
  const url = roundId
    ? `/events/${eventId}/voting/campaigns/${campaignId}/rounds/${roundId}/results`
    : `/events/${eventId}/voting/campaigns/${campaignId}/results`;
  
  return await apiClient.get<ContestantResult[]>(url);
}

export async function exportResults(
  eventId: string,
  campaignId: string,
  format: 'csv' | 'pdf'
): Promise<Blob> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting result export is not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    // Return a mock blob
    const csvContent = 'Rank,Contestant,Category,Votes,Percentage\n1,David Okonkwo,Best Male,156,50%';
    return new Blob([csvContent], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
  }
  
  return await apiClient.get<Blob>(
    `/events/${eventId}/voting/campaigns/${campaignId}/results/export?format=${format}`
  );
}

// ============ Settings ============

export async function getVotingSettings(eventId: string): Promise<VotingSettings> {
  if (!votingApiAvailable) {
    await delay(100);
    return emptyVotingSettings(eventId);
  }

  if (config.features.useMockData) {
    await delay();
    return mockVotingSettings;
  }
  
  return await apiClient.get<VotingSettings>(`/events/${eventId}/voting/settings`);
}

export async function updateVotingSettings(
  eventId: string,
  data: Partial<VotingSettings>
): Promise<VotingSettings> {
  if (!votingApiAvailable) {
    await delay(100);
    return { ...emptyVotingSettings(eventId), ...data };
  }

  if (config.features.useMockData) {
    await delay();
    return { ...mockVotingSettings, ...data };
  }
  
  return await apiClient.patch<VotingSettings>(`/events/${eventId}/voting/settings`, data);
}

// ============ Event voting adapter ============

export async function getEventVotingSummary(eventId: string): Promise<VotingSummary> {
  if (!votingApiAvailable) {
    await delay(100);
    return emptyVotingSummary();
  }

  if (config.features.useMockData) {
    await delay();
    const campaigns = getMockCampaigns().filter(c => c.eventId === eventId);
    return {
      totalVotes: campaigns.reduce((sum, campaign) => sum + campaign.totalVotes, 0),
      revenueMinor: campaigns.reduce((sum, campaign) => sum + campaign.totalRevenue, 0),
      currency: campaigns[0]?.currency || config.app.defaultCurrency,
      contestants: campaigns.reduce(
        (sum, campaign) =>
          sum + campaign.categories.reduce((catSum, category) => catSum + category.contestants.length, 0),
        0
      ),
      activeCampaigns: campaigns.filter(campaign => campaign.status === 'active').length,
    };
  }

  return await apiClient.get<VotingSummary>(`/events/${eventId}/voting/summary`);
}

export const getEventVotingSettings = getVotingSettings;
export const updateEventVotingSettings = updateVotingSettings;

export async function listVotingCampaigns(
  eventId: string,
  filters?: { search?: string; status?: string }
): Promise<VotingCampaign[]> {
  const campaigns = await getCampaigns(eventId);
  return campaigns.filter(campaign => {
    const matchesSearch =
      !filters?.search ||
      campaign.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters?.status || filters.status === 'all' || campaign.status === filters.status;
    return matchesSearch && matchesStatus;
  });
}

export async function getVotingCampaign(campaignId: string): Promise<VotingCampaign> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('Voting campaigns are not available yet');
  }

  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  }

  return await apiClient.get<VotingCampaign>(`/voting/campaigns/${campaignId}`);
}

export const createVotingCampaign = createCampaign;
export const updateVotingCampaign = updateCampaign;
export const deleteVotingCampaign = deleteCampaign;

export async function getVotingCampaignAnalytics(campaignId: string): Promise<VotingAnalytics | null> {
  if (!votingApiAvailable) {
    await delay(100);
    return null;
  }

  if (config.features.useMockData) {
    await delay();
    return mockVotingAnalytics;
  }

  return await apiClient.get<VotingAnalytics>(`/voting/campaigns/${campaignId}/analytics`);
}

export async function getVotingCampaignResults(
  campaignId: string,
  options?: { hideVotes?: boolean }
): Promise<VotingResults> {
  if (!votingApiAvailable) {
    await delay(100);
    return emptyVotingResults(campaignId);
  }

  if (config.features.useMockData) {
    await delay();
    const resultsByCategory = mockResults.reduce<Record<string, VotingResults['categories'][number]>>((acc, result) => {
      if (!acc[result.categoryId]) {
        acc[result.categoryId] = {
          id: result.categoryId,
          name: result.categoryName,
          totalVotes: 0,
          contestants: [],
        };
      }

      const votes = options?.hideVotes ? 0 : result.totalVotes;
      acc[result.categoryId].totalVotes += votes;
      acc[result.categoryId].contestants.push({
        id: result.contestantId,
        name: result.contestantName,
        imageUrl: result.contestantImageUrl || null,
        votes,
        revenueMinor: result.revenue || 0,
        rank: result.rank,
      });
      return acc;
    }, {});

    const categories = Object.values(resultsByCategory);
    return {
      campaignId,
      categories,
      totalVotes: categories.reduce((sum, category) => sum + category.totalVotes, 0),
      totalRevenueMinor: mockResults.reduce((sum, result) => sum + (result.revenue || 0), 0),
    };
  }

  const hideVotes = options?.hideVotes ? 'true' : 'false';
  return await apiClient.get<VotingResults>(`/voting/campaigns/${campaignId}/results?hideVotes=${hideVotes}`);
}

export async function exportVotingResultsCsv(campaignId: string): Promise<Blob> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('CSV export is not available yet');
  }

  return await apiClient.get<Blob>(`/voting/campaigns/${campaignId}/results/export.csv`);
}

export async function exportVotingResultsPdf(campaignId: string): Promise<Blob> {
  if (!votingApiAvailable) {
    await delay(100);
    throw new Error('PDF export is not available yet');
  }

  return await apiClient.get<Blob>(`/voting/campaigns/${campaignId}/results/export.pdf`);
}

// ============ Vote Packages ============

export async function createVotePackage(
  eventId: string,
  campaignId: string,
  data: CreateVotePackageRequest
): Promise<VotePackage> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const newPackage: VotePackage = {
      id: generateVotingId('pkg'),
      campaignId,
      name: data.name,
      voteCount: data.voteCount,
      price: data.price,
      currency: campaign.currency,
      discountPercentage: data.discountPercentage,
      maxPurchases: data.maxPurchases,
      isActive: true,
    };
    
    updateMockCampaign(campaignId, {
      votePackages: [...campaign.votePackages, newPackage],
    });
    
    return newPackage;
  }
  
  return await apiClient.post<VotePackage>(
    `/events/${eventId}/voting/campaigns/${campaignId}/packages`,
    data
  );
}

export async function updateVotePackage(
  eventId: string,
  campaignId: string,
  packageId: string,
  data: UpdateVotePackageRequest
): Promise<VotePackage> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    const updatedPackages = campaign.votePackages.map(pkg =>
      pkg.id === packageId ? { ...pkg, ...data } : pkg
    );
    
    updateMockCampaign(campaignId, { votePackages: updatedPackages });
    
    const updated = updatedPackages.find(p => p.id === packageId);
    if (!updated) throw new Error('Package not found');
    return updated;
  }
  
  return await apiClient.patch<VotePackage>(
    `/events/${eventId}/voting/campaigns/${campaignId}/packages/${packageId}`,
    data
  );
}

export async function deleteVotePackage(
  eventId: string,
  campaignId: string,
  packageId: string
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    updateMockCampaign(campaignId, {
      votePackages: campaign.votePackages.filter(p => p.id !== packageId),
    });
    return;
  }
  
  await apiClient.delete(`/events/${eventId}/voting/campaigns/${campaignId}/packages/${packageId}`);
}

export async function toggleVotePackage(
  eventId: string,
  campaignId: string,
  packageId: string,
  isActive: boolean
): Promise<VotePackage> {
  return updateVotePackage(eventId, campaignId, packageId, { isActive } as UpdateVotePackageRequest);
}

// ============ Payment (for paid voting) ============

export async function purchaseVotes(
  campaignId: string,
  packageId: string,
  quantity: number = 1
): Promise<VotePaymentIntent> {
  if (config.features.useMockData) {
    await delay();
    
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    const pkg = campaign?.votePackages.find(p => p.id === packageId);
    
    if (!pkg) throw new Error('Package not found');
    
    return {
      id: generateVotingId('pay'),
      campaignId,
      packageId,
      voteCount: pkg.voteCount * quantity,
      amount: pkg.price * quantity,
      currency: pkg.currency,
      status: 'pending',
      paymentUrl: 'https://payment.example.com/checkout',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }
  
  return await apiClient.post<VotePaymentIntent>(
    `/voting/campaigns/${campaignId}/packages/${packageId}/purchase`,
    { quantity }
  );
}

export async function purchaseSingleVotes(
  campaignId: string,
  voteCount: number
): Promise<VotePaymentIntent> {
  if (config.features.useMockData) {
    await delay();
    
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign?.pricePerVote) throw new Error('Campaign does not support single vote purchase');
    
    return {
      id: generateVotingId('pay'),
      campaignId,
      voteCount,
      amount: campaign.pricePerVote * voteCount,
      currency: campaign.currency,
      status: 'pending',
      paymentUrl: 'https://payment.example.com/checkout',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }
  
  return await apiClient.post<VotePaymentIntent>(
    `/voting/campaigns/${campaignId}/purchase-votes`,
    { voteCount }
  );
}

// ============ Public Campaign (for voters) ============

export async function getPublicCampaign(campaignId: string): Promise<VotingCampaign> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status !== 'active' && campaign.status !== 'published') {
      throw new Error('Campaign is not available for voting');
    }
    return campaign;
  }
  
  return await apiClient.get<VotingCampaign>(`/voting/campaigns/${campaignId}`);
}

export async function getPublicResults(campaignId: string): Promise<ContestantResult[]> {
  if (config.features.useMockData) {
    await delay();
    const campaign = getMockCampaigns().find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');
    
    // Check transparency settings
    if (campaign.transparency.mode === 'hidden') {
      throw new Error('Results are hidden');
    }
    if (campaign.transparency.mode === 'after-close' && campaign.status !== 'ended') {
      throw new Error('Results will be available after voting ends');
    }
    
    return mockResults.filter(r => r.roundId === campaign.currentRoundId);
  }
  
  return await apiClient.get<ContestantResult[]>(`/voting/campaigns/${campaignId}/results`);
}
