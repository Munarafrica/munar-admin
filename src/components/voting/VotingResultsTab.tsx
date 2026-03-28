// Voting Results Tab - Display and export results
import React, { useState, useEffect } from 'react';
import { VotingCampaign, ContestantResult } from '../../types/voting';
import { votingService } from '../../services';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  Award,
  Trophy,
  Medal,
  Download,
  Share2,
  Eye,
  EyeOff,
  Crown,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface VotingResultsTabProps {
  campaigns: VotingCampaign[];
  eventId: string;
}

// Group results by category
interface CategoryResults {
  categoryId: string;
  categoryName: string;
  results: ContestantResult[];
}

export const VotingResultsTab: React.FC<VotingResultsTabProps> = ({
  campaigns,
  eventId,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [results, setResults] = useState<ContestantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showVotes, setShowVotes] = useState(true);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  useEffect(() => {
    if (selectedCampaignId) {
      loadResults();
    }
  }, [selectedCampaignId]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await votingService.getResults(eventId, selectedCampaignId);
      setResults(data);
      // Expand all categories by default
      const categoryIds = [...new Set(data.map(r => r.categoryId))];
      setExpandedCategories(new Set(categoryIds));
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await votingService.exportResults(eventId, selectedCampaignId, format);
      // In real app, this would trigger a download
      alert(`Results exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Group results by category
  const groupedResults: CategoryResults[] = React.useMemo(() => {
    const groups: Record<string, CategoryResults> = {};
    
    for (const result of results) {
      if (!groups[result.categoryId]) {
        groups[result.categoryId] = {
          categoryId: result.categoryId,
          categoryName: result.categoryName,
          results: [],
        };
      }
      groups[result.categoryId].results.push(result);
    }
    
    // Sort results within each category by rank
    return Object.values(groups).map(group => ({
      ...group,
      results: group.results.sort((a, b) => a.rank - b.rank),
    }));
  }, [results]);

  // Get top winners (rank 1 from each category)
  const winners = React.useMemo(() => {
    return groupedResults
      .map(group => group.results.find(r => r.rank === 1))
      .filter((w): w is ContestantResult => w !== undefined);
  }, [groupedResults]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Campaign Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between dark:bg-slate-900 dark:border-slate-700">
                {selectedCampaign?.name || 'Select campaign'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {campaigns.map(campaign => (
                <DropdownMenuItem
                  key={campaign.id}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                >
                  {campaign.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Show/Hide votes toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowVotes(!showVotes)}
            className="gap-2"
          >
            {showVotes ? (
              <>
                <Eye className="w-4 h-4" />
                Hide Votes
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Show Votes
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {groupedResults.length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Categories</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {results.length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Contestants</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {results.reduce((sum, r) => sum + r.totalVotes, 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Votes</p>
        </div>
      </div>

      {/* Results by Category */}
      <div className="space-y-4">
        {groupedResults.map((category) => (
          <div
            key={category.categoryId}
            className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.categoryId)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.has(category.categoryId) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <Award className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {category.categoryName}
                </span>
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {category.results.length} contestants
                </Badge>
              </div>
              {/* Winner preview */}
              {category.results[0] && (
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {category.results[0].contestantName}
                  </span>
                </div>
              )}
            </button>

            {/* Results List */}
            {expandedCategories.has(category.categoryId) && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {category.results.map((result) => (
                  <div
                    key={result.contestantId}
                    className={cn(
                      'flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0',
                      result.rank === 1 && 'bg-amber-50/50 dark:bg-amber-900/10',
                      result.rank === 2 && 'bg-slate-50/50 dark:bg-slate-800/30',
                      result.rank === 3 && 'bg-orange-50/50 dark:bg-orange-900/10'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(result.rank)}
                    </div>

                    {/* Avatar */}
                    {result.contestantImageUrl ? (
                      <img
                        src={result.contestantImageUrl}
                        alt={result.contestantName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {result.contestantName.charAt(0)}
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {result.contestantName}
                      </p>
                    </div>

                    {/* Votes */}
                    {showVotes && (
                      <>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {result.totalVotes.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">votes</p>
                        </div>

                        {/* Percentage */}
                        <div className="w-16 text-right">
                          <Badge
                            className={cn(
                              result.rank === 1 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                              result.rank === 2 && 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
                              result.rank === 3 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                              result.rank > 3 && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            )}
                          >
                            {result.percentage.toFixed(1)}%
                          </Badge>
                        </div>

                        {/* Progress bar */}
                        <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              result.rank === 1 && 'bg-gradient-to-r from-amber-400 to-amber-500',
                              result.rank === 2 && 'bg-gradient-to-r from-slate-400 to-slate-500',
                              result.rank === 3 && 'bg-gradient-to-r from-orange-400 to-orange-500',
                              result.rank > 3 && 'bg-gradient-to-r from-indigo-400 to-purple-500'
                            )}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Winners Podium */}
      {winners.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold">Winners</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {winners.map((winner) => (
              <div
                key={winner.contestantId}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              >
                {winner.contestantImageUrl ? (
                  <img
                    src={winner.contestantImageUrl}
                    alt={winner.contestantName}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-amber-400"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-3 ring-2 ring-amber-400">
                    {winner.contestantName.charAt(0)}
                  </div>
                )}
                <p className="font-semibold truncate">{winner.contestantName}</p>
                <p className="text-sm text-white/70 truncate">{winner.categoryName}</p>
                <p className="text-xs text-white/50 mt-1">
                  {winner.totalVotes.toLocaleString()} votes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No results yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Results will appear here once voting begins and contestants receive votes.
          </p>
        </div>
      )}
    </div>
  );
};
