// Campaigns Hook - fetch and manage voting campaigns
import { useState, useEffect, useCallback } from 'react';
import * as votingService from '../services/voting.service';
import {
  VotingCampaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  VotingCategory,
  Contestant,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContestantRequest,
  UpdateContestantRequest,
} from '../types/voting';

interface UseCampaignsOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseCampaignsReturn {
  campaigns: VotingCampaign[];
  isLoading: boolean;
  error: string | null;
  
  // Campaign Actions
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: CreateCampaignRequest) => Promise<VotingCampaign | null>;
  updateCampaign: (campaignId: string, data: UpdateCampaignRequest) => Promise<VotingCampaign | null>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  duplicateCampaign: (campaignId: string) => Promise<VotingCampaign | null>;
  publishCampaign: (campaignId: string) => Promise<VotingCampaign | null>;
  pauseCampaign: (campaignId: string) => Promise<VotingCampaign | null>;
  startCampaign: (campaignId: string) => Promise<VotingCampaign | null>;
  endCampaign: (campaignId: string) => Promise<VotingCampaign | null>;
  
  // Category Actions
  createCategory: (campaignId: string, data: CreateCategoryRequest) => Promise<VotingCategory | null>;
  updateCategory: (campaignId: string, categoryId: string, data: UpdateCategoryRequest) => Promise<VotingCategory | null>;
  deleteCategory: (campaignId: string, categoryId: string) => Promise<boolean>;
  reorderCategories: (campaignId: string, categoryIds: string[]) => Promise<boolean>;
  
  // Contestant Actions
  createContestant: (campaignId: string, categoryId: string, data: CreateContestantRequest) => Promise<Contestant | null>;
  updateContestant: (campaignId: string, contestantId: string, data: UpdateContestantRequest) => Promise<Contestant | null>;
  deleteContestant: (campaignId: string, contestantId: string) => Promise<boolean>;
  moveContestant: (campaignId: string, contestantId: string, newCategoryId: string) => Promise<Contestant | null>;
}

export function useCampaigns({ eventId, autoFetch = true }: UseCampaignsOptions): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<VotingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await votingService.getCampaigns(eventId);
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Create campaign
  const createCampaign = useCallback(async (data: CreateCampaignRequest): Promise<VotingCampaign | null> => {
    try {
      const newCampaign = await votingService.createCampaign(eventId, data);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      return null;
    }
  }, [eventId]);

  // Update campaign
  const updateCampaign = useCallback(async (
    campaignId: string,
    data: UpdateCampaignRequest
  ): Promise<VotingCampaign | null> => {
    try {
      const updated = await votingService.updateCampaign(eventId, campaignId, data);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      return null;
    }
  }, [eventId]);

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      await votingService.deleteCampaign(eventId, campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      return false;
    }
  }, [eventId]);

  // Duplicate campaign
  const duplicateCampaign = useCallback(async (campaignId: string): Promise<VotingCampaign | null> => {
    try {
      const duplicated = await votingService.duplicateCampaign(eventId, campaignId);
      setCampaigns(prev => [...prev, duplicated]);
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate campaign');
      return null;
    }
  }, [eventId]);

  // Publish campaign
  const publishCampaign = useCallback(async (campaignId: string): Promise<VotingCampaign | null> => {
    try {
      const updated = await votingService.publishCampaign(eventId, campaignId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish campaign');
      return null;
    }
  }, [eventId]);

  // Pause campaign
  const pauseCampaign = useCallback(async (campaignId: string): Promise<VotingCampaign | null> => {
    try {
      const updated = await votingService.pauseCampaign(eventId, campaignId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause campaign');
      return null;
    }
  }, [eventId]);

  // Start campaign
  const startCampaign = useCallback(async (campaignId: string): Promise<VotingCampaign | null> => {
    try {
      const updated = await votingService.startCampaign(eventId, campaignId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start campaign');
      return null;
    }
  }, [eventId]);

  // End campaign
  const endCampaign = useCallback(async (campaignId: string): Promise<VotingCampaign | null> => {
    try {
      const updated = await votingService.endCampaign(eventId, campaignId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end campaign');
      return null;
    }
  }, [eventId]);

  // Create category
  const createCategory = useCallback(async (
    campaignId: string,
    data: CreateCategoryRequest
  ): Promise<VotingCategory | null> => {
    try {
      const newCategory = await votingService.createCategory(eventId, campaignId, data);
      // Refresh campaigns to get updated data
      await fetchCampaigns();
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      return null;
    }
  }, [eventId, fetchCampaigns]);

  // Update category
  const updateCategory = useCallback(async (
    campaignId: string,
    categoryId: string,
    data: UpdateCategoryRequest
  ): Promise<VotingCategory | null> => {
    try {
      const updated = await votingService.updateCategory(eventId, campaignId, categoryId, data);
      await fetchCampaigns();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      return null;
    }
  }, [eventId, fetchCampaigns]);

  // Delete category
  const deleteCategory = useCallback(async (
    campaignId: string,
    categoryId: string
  ): Promise<boolean> => {
    try {
      await votingService.deleteCategory(eventId, campaignId, categoryId);
      await fetchCampaigns();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    }
  }, [eventId, fetchCampaigns]);

  // Reorder categories
  const reorderCategories = useCallback(async (
    campaignId: string,
    categoryIds: string[]
  ): Promise<boolean> => {
    try {
      await votingService.reorderCategories(eventId, campaignId, categoryIds);
      await fetchCampaigns();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder categories');
      return false;
    }
  }, [eventId, fetchCampaigns]);

  // Create contestant
  const createContestant = useCallback(async (
    campaignId: string,
    categoryId: string,
    data: CreateContestantRequest
  ): Promise<Contestant | null> => {
    try {
      const newContestant = await votingService.createContestant(eventId, campaignId, categoryId, data);
      await fetchCampaigns();
      return newContestant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contestant');
      return null;
    }
  }, [eventId, fetchCampaigns]);

  // Update contestant
  const updateContestant = useCallback(async (
    campaignId: string,
    contestantId: string,
    data: UpdateContestantRequest
  ): Promise<Contestant | null> => {
    try {
      const updated = await votingService.updateContestant(eventId, campaignId, contestantId, data);
      await fetchCampaigns();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contestant');
      return null;
    }
  }, [eventId, fetchCampaigns]);

  // Delete contestant
  const deleteContestant = useCallback(async (
    campaignId: string,
    contestantId: string
  ): Promise<boolean> => {
    try {
      await votingService.deleteContestant(eventId, campaignId, contestantId);
      await fetchCampaigns();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contestant');
      return false;
    }
  }, [eventId, fetchCampaigns]);

  // Move contestant
  const moveContestant = useCallback(async (
    campaignId: string,
    contestantId: string,
    newCategoryId: string
  ): Promise<Contestant | null> => {
    try {
      const moved = await votingService.moveContestant(eventId, campaignId, contestantId, newCategoryId);
      await fetchCampaigns();
      return moved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move contestant');
      return null;
    }
  }, [eventId, fetchCampaigns]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCampaigns();
    }
  }, [autoFetch, fetchCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    publishCampaign,
    pauseCampaign,
    startCampaign,
    endCampaign,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    createContestant,
    updateContestant,
    deleteContestant,
    moveContestant,
  };
}
