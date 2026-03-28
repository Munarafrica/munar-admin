// Contestants Tab - Manage all contestants across categories
import React, { useState } from 'react';
import { Contestant, VotingCampaign } from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  Search,
  Plus,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Trophy,
  Filter,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ExtendedContestant extends Contestant {
  categoryId: string;
  categoryName: string;
  campaignId: string;
  campaignName: string;
}

interface ContestantsTabProps {
  contestants: ExtendedContestant[];
  campaigns: VotingCampaign[];
  isLoading: boolean;
  onEdit: (contestant: ExtendedContestant) => void;
  onDelete: (contestant: ExtendedContestant) => void;
  onAddContestant: (campaignId: string, categoryId: string) => void;
}

export const ContestantsTab: React.FC<ContestantsTabProps> = ({
  contestants,
  campaigns,
  isLoading,
  onEdit,
  onDelete,
  onAddContestant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'votes' | 'category'>('votes');

  // Get all categories for filter
  const allCategories = campaigns.flatMap(c =>
    c.categories.map(cat => ({ id: cat.id, name: cat.name, campaignName: c.name }))
  );

  // Filter and sort contestants
  const filteredContestants = contestants
    .filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || c.categoryId === categoryFilter;
      const matchesCampaign = campaignFilter === 'all' || c.campaignId === campaignFilter;
      return matchesSearch && matchesCategory && matchesCampaign;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'votes':
          return b.voteCount - a.voteCount;
        case 'category':
          return a.categoryName.localeCompare(b.categoryName);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading contestants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-1 gap-3 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              type="search"
              placeholder="Search contestants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="votes">Sort by Votes</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
        <Button
          variant="outline"
          className="gap-2 dark:bg-slate-800 dark:border-slate-700"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Contestants Grid */}
      {filteredContestants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {contestants.length === 0 ? 'No contestants yet' : 'No contestants match your filters'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            {contestants.length === 0
              ? 'Add contestants to your voting categories to get started.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contestant
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Campaign / Category
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Votes
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContestants.map((contestant, index) => (
                <tr
                  key={contestant.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* Rank Badge for Top 3 */}
                      {sortBy === 'votes' && index < 3 && (
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          index === 0 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                          index === 1 && 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
                          index === 2 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                        )}>
                          {index + 1}
                        </div>
                      )}
                      <img
                        src={contestant.imageUrl || 'https://via.placeholder.com/40'}
                        alt={contestant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {contestant.name}
                        </p>
                        {contestant.bio && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {contestant.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono text-slate-700 dark:text-slate-300">
                      {contestant.code || '-'}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{contestant.campaignName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{contestant.categoryName}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {contestant.voteCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      className={cn(
                        contestant.activeInRound
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {contestant.activeInRound ? 'Active' : 'Eliminated'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(contestant)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(contestant)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span>
          Showing {filteredContestants.length} of {contestants.length} contestants
        </span>
        <span>
          Total votes: {contestants.reduce((sum, c) => sum + c.voteCount, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
