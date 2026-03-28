// Votes Hook - fetch and manage votes
import { useState, useCallback } from 'react';
import * as votingService from '../services/voting.service';
import {
  Vote,
  CastVoteRequest,
  VoteFilters,
  VotePaymentIntent,
} from '../types/voting';
import { PaginatedResponse } from '../types/api';

interface UseVotesOptions {
  eventId: string;
  campaignId: string;
}

interface UseVotesReturn {
  votes: Vote[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchVotes: (filters?: VoteFilters) => Promise<void>;
  castVote: (data: CastVoteRequest) => Promise<Vote | null>;
  getContestantVotes: (contestantId: string) => Promise<number>;
  
  // Paid voting
  purchaseVotes: (packageId: string, quantity?: number) => Promise<VotePaymentIntent | null>;
  purchaseSingleVotes: (voteCount: number) => Promise<VotePaymentIntent | null>;
}

export function useVotes({ eventId, campaignId }: UseVotesOptions): UseVotesReturn {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch votes with optional filters
  const fetchVotes = useCallback(async (filters?: VoteFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await votingService.getVotes(eventId, campaignId, filters);
      setVotes(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, campaignId]);

  // Cast a vote
  const castVote = useCallback(async (data: CastVoteRequest): Promise<Vote | null> => {
    try {
      const newVote = await votingService.castVote(campaignId, data);
      setVotes(prev => [...prev, newVote]);
      return newVote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
      return null;
    }
  }, [campaignId]);

  // Get vote count for a specific contestant
  const getContestantVotes = useCallback(async (contestantId: string): Promise<number> => {
    try {
      return await votingService.getContestantVotes(eventId, campaignId, contestantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get contestant votes');
      return 0;
    }
  }, [eventId, campaignId]);

  // Purchase votes with a package
  const purchaseVotes = useCallback(async (
    packageId: string,
    quantity: number = 1
  ): Promise<VotePaymentIntent | null> => {
    try {
      return await votingService.purchaseVotes(campaignId, packageId, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase votes');
      return null;
    }
  }, [campaignId]);

  // Purchase single votes
  const purchaseSingleVotes = useCallback(async (voteCount: number): Promise<VotePaymentIntent | null> => {
    try {
      return await votingService.purchaseSingleVotes(campaignId, voteCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase votes');
      return null;
    }
  }, [campaignId]);

  return {
    votes,
    isLoading,
    error,
    fetchVotes,
    castVote,
    getContestantVotes,
    purchaseVotes,
    purchaseSingleVotes,
  };
}
