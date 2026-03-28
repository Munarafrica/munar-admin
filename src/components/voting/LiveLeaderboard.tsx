// Live Leaderboard - Real-time ranking sidebar
import React from 'react';
import { VotingCategory } from '../../types/voting';
import { cn } from '../ui/utils';
import {
  X,
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface LiveLeaderboardProps {
  category: VotingCategory;
  onClose: () => void;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  category,
  onClose,
}) => {
  // Sort contestants by vote count (filter by activeInRound)
  const rankedContestants = [...category.contestants]
    .filter(c => c.activeInRound)
    .sort((a, b) => b.voteCount - a.voteCount);

  const topVotes = rankedContestants[0]?.voteCount || 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">Leaderboard</h2>
            <p className="text-xs text-white/50 truncate max-w-[150px]">{category.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-white/10">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
        <span className="text-xs font-medium text-red-400">LIVE</span>
      </div>

      {/* Rankings */}
      <div className="flex-1 overflow-y-auto">
        {rankedContestants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Trophy className="w-10 h-10 text-white/30 mb-3" />
            <p className="text-white/50 text-sm">No contestants yet</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {rankedContestants.map((contestant, index) => {
              const rank = index + 1;
              const percentage = (contestant.voteCount / topVotes) * 100;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={contestant.id}
                  className={cn(
                    'relative p-3 rounded-xl transition-all',
                    isTopThree ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  {/* Background Progress */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl opacity-20',
                      rank === 1 && 'bg-gradient-to-r from-amber-500/50 to-transparent',
                      rank === 2 && 'bg-gradient-to-r from-slate-400/50 to-transparent',
                      rank === 3 && 'bg-gradient-to-r from-orange-500/50 to-transparent',
                      rank > 3 && 'bg-gradient-to-r from-indigo-500/30 to-transparent'
                    )}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex items-center gap-3">
                    {/* Rank */}
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      rank === 1 && 'bg-amber-500/20 text-amber-400',
                      rank === 2 && 'bg-slate-400/20 text-slate-300',
                      rank === 3 && 'bg-orange-500/20 text-orange-400',
                      rank > 3 && 'bg-white/10 text-white/60'
                    )}>
                      {getRankIcon(rank) || rank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={contestant.imageUrl || 'https://via.placeholder.com/40'}
                      alt={contestant.name}
                      className={cn(
                        'w-10 h-10 rounded-full object-cover border-2',
                        rank === 1 && 'border-amber-400',
                        rank === 2 && 'border-slate-400',
                        rank === 3 && 'border-orange-400',
                        rank > 3 && 'border-white/20'
                      )}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm truncate">
                          {contestant.name}
                        </p>
                        {rank === 1 && (
                          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                        )}
                      </div>
                      {contestant.code && (
                        <code className="text-xs text-white/40">{contestant.code}</code>
                      )}
                    </div>

                    {/* Votes */}
                    <div className="text-right">
                      <p className={cn(
                        'font-bold text-sm',
                        rank <= 3 ? 'text-white' : 'text-white/80'
                      )}>
                        {contestant.voteCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/40">votes</p>
                    </div>
                  </div>

                  {/* Vote Progress Bar */}
                  <div className="relative mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                        rank === 1 && 'bg-gradient-to-r from-amber-400 to-amber-600',
                        rank === 2 && 'bg-gradient-to-r from-slate-400 to-slate-500',
                        rank === 3 && 'bg-gradient-to-r from-orange-400 to-orange-600',
                        rank > 3 && 'bg-indigo-500'
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">
              {rankedContestants.length}
            </p>
            <p className="text-xs text-white/50">Contestants</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {rankedContestants.reduce((sum, c) => sum + c.voteCount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-white/50">Total Votes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
