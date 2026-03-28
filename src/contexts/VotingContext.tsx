// Voting Context - manages voting state for an event
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  VotingCampaign,
  VotingAnalytics,
  VotingSettings,
  ContestantResult,
} from '../types/voting';
import * as votingService from '../services/voting.service';

interface VotingContextState {
  campaigns: VotingCampaign[];
  currentCampaign: VotingCampaign | null;
  analytics: VotingAnalytics | null;
  results: ContestantResult[];
  settings: VotingSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface VotingContextValue extends VotingContextState {
  // Campaign operations
  loadCampaigns: () => Promise<void>;
  loadCampaign: (campaignId: string) => Promise<void>;
  refreshCampaigns: () => Promise<void>;
  setCurrentCampaign: (campaign: VotingCampaign | null) => void;
  
  // Analytics
  loadAnalytics: (campaignId?: string) => Promise<void>;
  loadResults: (campaignId: string, roundId?: string) => Promise<void>;
  
  // Settings
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<VotingSettings>) => Promise<void>;
  
  // Clear state
  clearVoting: () => void;
}

const VotingContext = createContext<VotingContextValue | undefined>(undefined);

interface VotingProviderProps {
  children: React.ReactNode;
  eventId: string;
  autoLoad?: boolean;
}

export function VotingProvider({ children, eventId, autoLoad = true }: VotingProviderProps) {
  const [state, setState] = useState<VotingContextState>({
    campaigns: [],
    currentCampaign: null,
    analytics: null,
    results: [],
    settings: null,
    isLoading: false,
    error: null,
  });

  // Load all campaigns for the event
  const loadCampaigns = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const campaigns = await votingService.getCampaigns(eventId);
      setState(prev => ({
        ...prev,
        campaigns,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load campaigns',
      }));
    }
  }, [eventId]);

  // Load a specific campaign
  const loadCampaign = useCallback(async (campaignId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const campaign = await votingService.getCampaign(eventId, campaignId);
      setState(prev => ({
        ...prev,
        currentCampaign: campaign,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load campaign',
      }));
    }
  }, [eventId]);

  // Refresh campaigns
  const refreshCampaigns = useCallback(async () => {
    try {
      const campaigns = await votingService.getCampaigns(eventId);
      setState(prev => ({ ...prev, campaigns }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to refresh campaigns',
      }));
    }
  }, [eventId]);

  // Set current campaign
  const setCurrentCampaign = useCallback((campaign: VotingCampaign | null) => {
    setState(prev => ({ ...prev, currentCampaign: campaign }));
  }, []);

  // Load analytics
  const loadAnalytics = useCallback(async (campaignId?: string) => {
    try {
      const analytics = await votingService.getVotingAnalytics(eventId, campaignId);
      setState(prev => ({ ...prev, analytics }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load analytics',
      }));
    }
  }, [eventId]);

  // Load results
  const loadResults = useCallback(async (campaignId: string, roundId?: string) => {
    try {
      const results = await votingService.getResults(eventId, campaignId, roundId);
      setState(prev => ({ ...prev, results }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load results',
      }));
    }
  }, [eventId]);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const settings = await votingService.getVotingSettings(eventId);
      setState(prev => ({ ...prev, settings }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load settings',
      }));
    }
  }, [eventId]);

  // Update settings
  const updateSettings = useCallback(async (settings: Partial<VotingSettings>) => {
    try {
      const updated = await votingService.updateVotingSettings(eventId, settings);
      setState(prev => ({ ...prev, settings: updated }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update settings',
      }));
    }
  }, [eventId]);

  // Clear state
  const clearVoting = useCallback(() => {
    setState({
      campaigns: [],
      currentCampaign: null,
      analytics: null,
      results: [],
      settings: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && eventId) {
      loadCampaigns();
      loadSettings();
    }
  }, [autoLoad, eventId, loadCampaigns, loadSettings]);

  const value: VotingContextValue = {
    ...state,
    loadCampaigns,
    loadCampaign,
    refreshCampaigns,
    setCurrentCampaign,
    loadAnalytics,
    loadResults,
    loadSettings,
    updateSettings,
    clearVoting,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting(): VotingContextValue {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}

// HOC for wrapping components that need voting context
export function withVoting<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { eventId: string }> {
  return function WithVotingComponent({ eventId, ...props }: P & { eventId: string }) {
    return (
      <VotingProvider eventId={eventId}>
        <Component {...(props as P)} />
      </VotingProvider>
    );
  };
}
