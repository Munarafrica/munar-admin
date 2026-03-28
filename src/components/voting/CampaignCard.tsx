// Campaign Card Component - Displays a voting campaign with categories and contestants
import React, { useState } from 'react';
import { VotingCampaign, VotingCategory, Contestant } from '../../types/voting';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  Trophy,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Play,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  Calendar,
  Eye,
  Share2,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface CampaignCardProps {
  campaign: VotingCampaign;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onAddCategory: () => void;
  onEditCategory: (category: VotingCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddContestant: (categoryId: string) => void;
  onEditContestant: (categoryId: string, contestant: Contestant) => void;
  onDeleteContestant: (categoryId: string, contestantId: string) => void;
  onOpen?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onDuplicate,
  onDelete,
  onPublish,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddContestant,
  onEditContestant,
  onDeleteContestant,
  onOpen,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const getStatusBadge = (status: VotingCampaign['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Ended</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalContestants = campaign.categories.reduce(
    (sum, cat) => sum + cat.contestants.length,
    0
  );

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
      {/* Campaign Header */}
      <div 
        className={cn(
          "p-4 border-b border-slate-100 dark:border-slate-700",
          onOpen && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70"
        )}
        onClick={(e) => {
          // Only trigger if not clicking on dropdown menu
          if (onOpen && !(e.target as HTMLElement).closest('[data-slot="dropdown"]')) {
            onOpen();
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {campaign.name}
                </h3>
                {getStatusBadge(campaign.status)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {campaign.description}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" data-slot="dropdown">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onOpen && (
                <DropdownMenuItem onClick={onOpen}>
                  <Eye className="w-4 h-4 mr-2" />
                  Open Campaign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaign.status === 'draft' && (
                <DropdownMenuItem onClick={onPublish} className="text-emerald-600 dark:text-emerald-400">
                  <Play className="w-4 h-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{totalContestants} contestants</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{campaign.totalVotes.toLocaleString()} votes</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {campaign.categories.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No categories yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCategory}
              className="gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </Button>
          </div>
        ) : (
          <>
            {campaign.categories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {category.contestants.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(category);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </button>

                {/* Expanded Contestants */}
                {expandedCategories.has(category.id) && (
                  <div className="px-3 pb-3 pl-9 space-y-2">
                    {category.contestants.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">No contestants in this category</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {category.contestants.slice(0, 4).map((contestant) => (
                          <div
                            key={contestant.id}
                            className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg group"
                          >
                            <img
                              src={contestant.imageUrl || 'https://via.placeholder.com/40'}
                              alt={contestant.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                {contestant.name}
                              </p>
                              <p className="text-xs text-slate-400">{contestant.voteCount} votes</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                              <button
                                onClick={() => onEditContestant(category.id, contestant)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              >
                                <Edit className="w-3 h-3 text-slate-500" />
                              </button>
                              <button
                                onClick={() => onDeleteContestant(category.id, contestant.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {category.contestants.length > 4 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{category.contestants.length - 4} more contestants
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddContestant(category.id)}
                      className="w-full text-xs gap-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <Plus className="w-3 h-3" />
                      Add Contestant
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Category Button */}
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddCategory}
                className="w-full text-sm gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
