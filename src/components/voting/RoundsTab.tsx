// Rounds Tab - Manage voting rounds and knockout stages
import React, { useState } from 'react';
import { VotingCampaign, VotingRound } from '../../types/voting';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  Layers,
  Plus,
  Play,
  Pause,
  Check,
  Clock,
  Trophy,
  Calendar,
  Users,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { RoundModal, CreateRoundData } from './RoundModal';

interface RoundsTabProps {
  campaigns: VotingCampaign[];
  isLoading: boolean;
  onAddRound?: (campaignId: string, data: CreateRoundData) => Promise<void>;
  onUpdateRound?: (campaignId: string, roundId: string, data: CreateRoundData) => Promise<void>;
  onDeleteRound?: (campaignId: string, roundId: string) => Promise<void>;
  onStartRound?: (campaignId: string, roundId: string) => Promise<void>;
  onEndRound?: (campaignId: string, roundId: string) => Promise<void>;
}

export const RoundsTab: React.FC<RoundsTabProps> = ({
  campaigns,
  isLoading,
  onAddRound,
  onUpdateRound,
  onDeleteRound,
  onStartRound,
  onEndRound,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [editingRound, setEditingRound] = useState<VotingRound | undefined>();

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const rounds = selectedCampaign?.rounds || [];

  // If there's only one campaign (campaign detail view), hide the selector
  const singleCampaignMode = campaigns.length === 1;

  const getRoundStatusBadge = (status: VotingRound['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddRound = () => {
    setEditingRound(undefined);
    setShowRoundModal(true);
  };

  const handleEditRound = (round: VotingRound) => {
    setEditingRound(round);
    setShowRoundModal(true);
  };

  const handleSaveRound = async (data: CreateRoundData) => {
    if (!selectedCampaignId) return;
    
    if (editingRound && onUpdateRound) {
      await onUpdateRound(selectedCampaignId, editingRound.id, data);
    } else if (onAddRound) {
      await onAddRound(selectedCampaignId, data);
    }
    setShowRoundModal(false);
    setEditingRound(undefined);
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!selectedCampaignId || !onDeleteRound) return;
    
    if (window.confirm('Are you sure you want to delete this round? This action cannot be undone.')) {
      await onDeleteRound(selectedCampaignId, roundId);
    }
  };

  const handleStartRound = async (roundId: string) => {
    if (!selectedCampaignId || !onStartRound) return;
    await onStartRound(selectedCampaignId, roundId);
  };

  const handleEndRound = async (roundId: string) => {
    if (!selectedCampaignId || !onEndRound) return;
    
    if (window.confirm('Are you sure you want to end this round? This will finalize results and advance qualified contestants.')) {
      await onEndRound(selectedCampaignId, roundId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading rounds...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No campaigns yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Create a voting campaign first to manage rounds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Selector - only show if multiple campaigns */}
      <div className="flex items-center justify-between">
        {!singleCampaignMode ? (
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {rounds.length} round{rounds.length !== 1 ? 's' : ''} configured
          </div>
        )}
        <Button 
          onClick={handleAddRound}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Round
        </Button>
      </div>

      {/* Rounds Timeline */}
      {rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No rounds configured
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            This campaign is running as a single round. Add multiple rounds to enable knockout stages or elimination voting.
          </p>
          <Button 
            onClick={handleAddRound}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Configure Rounds
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rounds List */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {rounds.map((round) => (
              <div key={round.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline Node */}
                <div className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border-2',
                  round.status === 'active' && 'border-emerald-500',
                  round.status === 'completed' && 'border-slate-300 dark:border-slate-600',
                  round.status === 'upcoming' && 'border-blue-500',
                )}>
                  {round.status === 'active' ? (
                    <div className="relative">
                      <Play className="w-5 h-5 text-emerald-500" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  ) : round.status === 'completed' ? (
                    <Check className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                {/* Round Card */}
                <div className={cn(
                  'flex-1 bg-white dark:bg-slate-800/50 rounded-xl border p-4',
                  round.status === 'active' && 'border-emerald-200 dark:border-emerald-800',
                  round.status === 'completed' && 'border-slate-200 dark:border-slate-700 opacity-75',
                  round.status === 'upcoming' && 'border-blue-200 dark:border-blue-800',
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {round.name}
                        </h3>
                        {getRoundStatusBadge(round.status)}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Round {round.order} of {rounds.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {round.status === 'upcoming' && onStartRound && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartRound(round.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Start
                        </Button>
                      )}
                      {round.status === 'active' && onEndRound && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEndRound(round.id)}
                          className="gap-1"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          End Round
                        </Button>
                      )}
                      
                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleEditRound(round)}
                            className="gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Round
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRound(round.id)}
                            className="gap-2 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Round
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(round.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{round.advancementCount || 'All'} qualify</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Trophy className="w-4 h-4" />
                      <span className="capitalize">{round.advancementRule.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {round.status === 'completed' && round.advancedContestantIds && round.advancedContestantIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Results
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {round.advancedContestantIds.slice(0, 5).map((id: string, i: number) => (
                          <Badge key={id} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            #{i + 1} Qualified
                          </Badge>
                        ))}
                        {round.advancedContestantIds.length > 5 && (
                          <Badge variant="secondary">
                            +{round.advancedContestantIds.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">About Rounds</p>
              <p className="text-blue-600 dark:text-blue-400">
                Each round can have different voting rules and elimination criteria.
                Contestants who don't meet the qualifying threshold are eliminated
                before the next round begins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Round Modal */}
      <RoundModal
        isOpen={showRoundModal}
        onClose={() => {
          setShowRoundModal(false);
          setEditingRound(undefined);
        }}
        onSave={handleSaveRound}
        round={editingRound}
        roundNumber={rounds.length + 1}
      />
    </div>
  );
};
