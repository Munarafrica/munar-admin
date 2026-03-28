// Public Category Card - Display a voting category for public users
import React from 'react';
import { VotingCategory } from '../../types/voting';
import { Users, ChevronRight, Vote } from 'lucide-react';

interface PublicCategoryCardProps {
  category: VotingCategory;
  onClick: () => void;
}

export const PublicCategoryCard: React.FC<PublicCategoryCardProps> = ({
  category,
  onClick,
}) => {
  const totalVotes = category.contestants.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <button
      onClick={onClick}
      className="group relative w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 text-left transition-all hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-white/60 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Users className="w-4 h-4" />
            <span>{category.contestants.length} contestants</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            <Vote className="w-4 h-4" />
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>
        </div>

        {/* Contestant Avatars Preview */}
        {category.contestants.length > 0 && (
          <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {category.contestants.slice(0, 5).map((contestant) => (
                <img
                  key={contestant.id}
                  src={contestant.imageUrl || 'https://via.placeholder.com/32'}
                  alt={contestant.name}
                  className="w-8 h-8 rounded-full border-2 border-white/20 object-cover"
                />
              ))}
            </div>
            {category.contestants.length > 5 && (
              <span className="text-xs text-white/50 ml-2">
                +{category.contestants.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};
