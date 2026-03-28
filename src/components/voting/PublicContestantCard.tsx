// Public Contestant Card - Display a contestant for public voting
import React from 'react';
import { Contestant } from '../../types/voting';
import { Button } from '../ui/button';
import { Vote, TrendingUp, Heart, Share2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface PublicContestantCardProps {
  contestant: Contestant;
  onVote: () => void;
  showVoteCount?: boolean;
  rank?: number;
}

export const PublicContestantCard: React.FC<PublicContestantCardProps> = ({
  contestant,
  onVote,
  showVoteCount = true,
  rank,
}) => {
  return (
    <div className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden transition-all hover:bg-white/15 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10">
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className={cn(
          'absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
          rank === 1 && 'bg-gradient-to-br from-amber-400 to-amber-600 text-white',
          rank === 2 && 'bg-gradient-to-br from-slate-300 to-slate-500 text-white',
          rank === 3 && 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
        )}>
          {rank}
        </div>
      )}

      {/* Contestant Code */}
      {contestant.code && (
        <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs font-mono text-white/80">
          {contestant.code}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={contestant.imageUrl || 'https://via.placeholder.com/300'}
          alt={contestant.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Quick Actions */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-lg mb-1 truncate">
            {contestant.name}
          </h3>
          {showVoteCount && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{contestant.voteCount.toLocaleString()} votes</span>
            </div>
          )}
        </div>
      </div>

      {/* Vote Button */}
      <div className="p-4">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onVote();
          }}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white gap-2 py-3"
        >
          <Vote className="w-5 h-5" />
          Vote Now
        </Button>

        {/* Bio Preview */}
        {contestant.bio && (
          <p className="text-xs text-white/50 mt-3 line-clamp-2">
            {contestant.bio}
          </p>
        )}
      </div>
    </div>
  );
};
