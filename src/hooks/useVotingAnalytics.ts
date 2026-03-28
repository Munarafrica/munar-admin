// Voting Analytics Hook - fetch analytics and results
import { useState, useCallback, useEffect } from 'react';
import * as votingService from '../services/voting.service';
import { VotingAnalytics, ContestantResult } from '../types/voting';

interface UseVotingAnalyticsOptions {
  eventId: string;
  campaignId?: string;
  autoFetch?: boolean;
}

interface UseVotingAnalyticsReturn {
  analytics: VotingAnalytics | null;
  results: ContestantResult[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAnalytics: (campaignId?: string) => Promise<void>;
  fetchResults: (campaignId: string, roundId?: string) => Promise<void>;
  exportResults: (campaignId: string, format: 'csv' | 'pdf') => Promise<void>;
}

export function useVotingAnalytics({
  eventId,
  campaignId,
  autoFetch = false,
}: UseVotingAnalyticsOptions): UseVotingAnalyticsReturn {
  const [analytics, setAnalytics] = useState<VotingAnalytics | null>(null);
  const [results, setResults] = useState<ContestantResult[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (targetCampaignId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await votingService.getVotingAnalytics(eventId, targetCampaignId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Fetch results
  const fetchResults = useCallback(async (targetCampaignId: string, roundId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await votingService.getResults(eventId, targetCampaignId, roundId);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Export results
  const exportResults = useCallback(async (targetCampaignId: string, format: 'csv' | 'pdf') => {
    try {
      const blob = await votingService.exportResults(eventId, targetCampaignId, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voting-results-${targetCampaignId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export results');
    }
  }, [eventId]);

  // Auto-fetch on mount if campaignId provided
  useEffect(() => {
    if (autoFetch && campaignId) {
      fetchAnalytics(campaignId);
      fetchResults(campaignId);
    }
  }, [autoFetch, campaignId, fetchAnalytics, fetchResults]);

  return {
    analytics,
    results,
    isLoading,
    error,
    fetchAnalytics,
    fetchResults,
    exportResults,
  };
}
