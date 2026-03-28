// Campaign Detail View - Full page view for a single campaign
import React, { useState } from 'react';
import { VotingCampaign, VotingSettings, CreateVotePackageRequest, VotingCategory, Contestant, CreateCategoryRequest, CreateContestantRequest } from '../../types/voting';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  ArrowLeft,
  Play,
  Pause,
  Send,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Users,
  Trophy,
  Settings,
  Layers,
  Package,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  BarChart3,
  Link as LinkIcon,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { RoundsTab } from './RoundsTab';
import { VotePackagesTab } from './VotePackagesTab';
import { VotingResultsTab } from './VotingResultsTab';
import { CampaignSettingsTab } from './CampaignSettingsTab';
import { CategoryModal } from './CategoryModal';
import { ContestantModal } from './ContestantModal';

interface CampaignDetailViewProps {
  campaign: VotingCampaign;
  settings: VotingSettings;
  onBack: () => void;
  onUpdateCampaign: (id: string, data: Partial<VotingCampaign>) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onPlayPause: (id: string, isPaused: boolean) => Promise<void>;
  onPublish: (id: string, isPublished: boolean) => Promise<void>;
  onUpdateSettings: (data: Partial<VotingSettings>) => Promise<void>;
  onSavePackage: (campaignId: string, data: CreateVotePackageRequest, packageId?: string) => Promise<void>;
  onTogglePackage: (campaignId: string, packageId: string, isActive: boolean) => Promise<void>;
  onDeletePackage: (campaignId: string, packageId: string) => Promise<void>;
  // Category handlers
  onCreateCategory: (campaignId: string, data: CreateCategoryRequest) => Promise<void>;
  onUpdateCategory: (campaignId: string, categoryId: string, data: CreateCategoryRequest) => Promise<void>;
  onDeleteCategory: (campaignId: string, categoryId: string) => Promise<void>;
  // Contestant handlers
  onCreateContestant: (campaignId: string, categoryId: string, data: CreateContestantRequest) => Promise<void>;
  onUpdateContestant: (campaignId: string, contestantId: string, data: CreateContestantRequest) => Promise<void>;
  onDeleteContestant: (campaignId: string, contestantId: string) => Promise<void>;
}

type TabKey = 'overview' | 'contestants' | 'rounds' | 'packages' | 'results' | 'settings';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const MOCK_EVENT_ID = 'evt-1'; // TODO: Get from props/context

const tabs: TabConfig[] = [
  { key: 'overview', label: 'Overview', icon: Eye },
  { key: 'contestants', label: 'Categories & Contestants', icon: Users },
  { key: 'rounds', label: 'Rounds', icon: Layers },
  { key: 'packages', label: 'Vote Packages', icon: Package },
  { key: 'results', label: 'Results', icon: Trophy },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaign,
  settings,
  onBack,
  onUpdateCampaign,
  onDeleteCampaign,
  onPlayPause,
  onPublish,
  onUpdateSettings,
  onSavePackage,
  onTogglePackage,
  onDeletePackage,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateContestant,
  onUpdateContestant,
  onDeleteContestant,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  
  // Modal states for categories and contestants
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VotingCategory | undefined>();
  const [showContestantModal, setShowContestantModal] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'event';

  const campaignPublicUrl = campaign.publicUrl || `https://${slugify(campaign.name)}.munar.com/vote/${campaign.id}`;

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: VotingCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (data: CreateCategoryRequest) => {
    if (editingCategory) {
      await onUpdateCategory(campaign.id, editingCategory.id, data);
    } else {
      await onCreateCategory(campaign.id, data);
    }
    setShowCategoryModal(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? All contestants in this category will also be deleted.')) {
      await onDeleteCategory(campaign.id, categoryId);
    }
  };

  // Contestant handlers
  const handleAddContestant = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingContestant(undefined);
    setShowContestantModal(true);
  };

  const handleEditContestant = (contestant: Contestant) => {
    setSelectedCategoryId(contestant.categoryId);
    setEditingContestant(contestant);
    setShowContestantModal(true);
  };

  const handleSaveContestant = async (data: CreateContestantRequest) => {
    if (!selectedCategoryId) return;
    
    if (editingContestant) {
      await onUpdateContestant(campaign.id, editingContestant.id, data);
    } else {
      await onCreateContestant(campaign.id, selectedCategoryId, data);
    }
    setShowContestantModal(false);
    setEditingContestant(undefined);
    setSelectedCategoryId(null);
  };

  const handleDeleteContestant = async (contestantId: string) => {
    if (window.confirm('Are you sure you want to delete this contestant?')) {
      await onDeleteContestant(campaign.id, contestantId);
    }
  };

  const getStatusBadge = () => {
    if (campaign.isPaused) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Paused</Badge>;
    }
    
    const statusColors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      ended: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    
    return (
      <Badge className={statusColors[campaign.status] || statusColors.draft}>
        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: campaign.currency || 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      await onDeleteCampaign(campaign.id);
      onBack();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Votes"
                value={campaign.totalVotes.toLocaleString()}
                icon={BarChart3}
                color="indigo"
              />
              <StatCard
                label="Unique Voters"
                value={campaign.uniqueVoters.toLocaleString()}
                icon={Users}
                color="blue"
              />
              <StatCard
                label="Revenue"
                value={formatCurrency(campaign.totalRevenue || 0)}
                icon={DollarSign}
                color="emerald"
              />
              <StatCard
                label="Categories"
                value={campaign.categories?.length.toString() || '0'}
                icon={Layers}
                color="purple"
              />
            </div>

            {/* Campaign Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Campaign Details</h3>
                <div className="space-y-3">
                  <InfoRow label="Description" value={campaign.description || 'No description'} />
                  <InfoRow label="Voting Mode" value={campaign.votingMode === 'paid' ? 'Paid Voting' : 'Free Voting'} />
                  <InfoRow label="Eligibility" value={campaign.eligibility?.type || 'Open'} />
                  {campaign.votingMode === 'paid' && (
                    <InfoRow label="Price per Vote" value={formatCurrency(campaign.pricePerVote || 0)} />
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Schedule</h3>
                <div className="space-y-3">
                  <InfoRow label="Start Date" value={formatDate(campaign.startDate)} />
                  <InfoRow label="End Date" value={formatDate(campaign.endDate)} />
                  <InfoRow label="Timezone" value={campaign.timezone} />
                  <InfoRow label="Current Round" value={campaign.rounds?.find(r => r.id === campaign.currentRoundId)?.name || 'None'} />
                </div>
              </div>
            </div>

            {/* Vote Limits */}
            {campaign.voteLimits && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Vote Limits</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <LimitCard label="Per Person" value={campaign.voteLimits.votesPerPerson || '∞'} />
                  <LimitCard label="Per Category" value={campaign.voteLimits.votesPerCategory || '∞'} />
                  <LimitCard label="Per Contestant" value={campaign.voteLimits.votesPerContestant || '∞'} />
                  <LimitCard label="Daily Limit" value={campaign.voteLimits.dailyLimit || '∞'} />
                </div>
              </div>
            )}
          </div>
        );

      case 'contestants':
        const categories = campaign.categories || [];
        const activeCategory = categories.find(cat => cat.id === selectedCategoryId) || categories[0];

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage categories and contestants</p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Categories & Contestants</h3>
              </div>
              <Button onClick={handleAddCategory} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {/* Empty state */}
            {categories.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No categories yet</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add a category to start organizing contestants.</p>
                <Button onClick={handleAddCategory} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4" />
                  Add a category
                </Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[320px_1fr] gap-6">
                {/* Category list */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Categories</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{categories.length} total</span>
                  </div>
                  <div className="space-y-2">
                    {categories.map(category => {
                      const isActive = activeCategory?.id === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategoryId(category.id)}
                          className={cn(
                            'w-full text-left rounded-lg border px-4 py-3 transition-colors',
                            'hover:bg-slate-50 dark:hover:bg-slate-800',
                            isActive
                              ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{category.description}</p>
                              )}
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {category.contestants?.length || 0} contestant{(category.contestants?.length || 0) === 1 ? '' : 's'}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Category actions for ${category.name}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleAddContestant(category.id)} className="gap-2">
                                  <Plus className="w-4 h-4" />
                                  Add contestant
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleEditCategory(category)} className="gap-2">
                                  <Edit2 className="w-4 h-4" />
                                  Edit category
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() => handleDeleteCategory(category.id)}
                                  className="gap-2 text-red-600 dark:text-red-400"
                                  data-variant="destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contestants for selected category */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{activeCategory?.name}</h4>
                      {activeCategory?.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activeCategory.description}</p>
                      )}
                    </div>
                    {activeCategory && (
                      <Button
                        onClick={() => handleAddContestant(activeCategory.id)}
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Plus className="w-4 h-4" />
                        Add contestant
                      </Button>
                    )}
                  </div>

                  {!activeCategory || (activeCategory.contestants?.length || 0) === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6 text-slate-400" />
                      </div>
                      <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">No contestants in this category</h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Add contestants to start collecting votes.</p>
                      {activeCategory && (
                        <Button onClick={() => handleAddContestant(activeCategory.id)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add contestant
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contestant</th>
                            <th className="py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                            <th className="py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Votes</th>
                            <th className="py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                            <th className="py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {activeCategory?.contestants?.map(contestant => (
                            <tr key={contestant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={contestant.imageUrl || 'https://via.placeholder.com/40'}
                                    alt={contestant.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{contestant.name}</p>
                                    {contestant.bio && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">{contestant.bio}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                  {contestant.code || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{contestant.voteCount?.toLocaleString?.() || 0}</span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <Badge className={cn(
                                  contestant.activeInRound
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                )}>
                                  {contestant.activeInRound ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => handleEditContestant(contestant)} className="gap-2">
                                      <Edit2 className="w-4 h-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onSelect={() => handleDeleteContestant(contestant.id)}
                                      className="gap-2 text-red-600 dark:text-red-400"
                                      data-variant="destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                </div>
              </div>
            )}
          </div>
        );

      case 'rounds':
        return (
          <RoundsTab
            campaigns={[campaign]}
            isLoading={false}
          />
        );

      case 'packages':
        return (
          <VotePackagesTab
            campaign={campaign}
            onSavePackage={(data, packageId) => onSavePackage(campaign.id, data, packageId)}
            onTogglePackage={(packageId, isActive) => onTogglePackage(campaign.id, packageId, isActive)}
            onDeletePackage={(packageId) => onDeletePackage(campaign.id, packageId)}
          />
        );

      case 'results':
        return (
          <VotingResultsTab 
            campaigns={[campaign]} 
            eventId={MOCK_EVENT_ID}
          />
        );

      case 'settings':
        return (
          <CampaignSettingsTab
            campaign={campaign}
            onUpdateCampaign={(data) => onUpdateCampaign(campaign.id, data)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Back and Actions Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Campaigns</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPlayPause(campaign.id, !campaign.isPaused)}
                className="gap-2"
              >
                {campaign.isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
            )}

            {/* Publish/Unpublish */}
            {campaign.status !== 'ended' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPublish(campaign.id, !campaign.isPublished)}
                className="gap-2"
              >
                {campaign.isPublished ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish
                  </>
                )}
              </Button>
            )}

            {/* Public URL pill */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span className="truncate max-w-[200px]" title={campaignPublicUrl}>{campaignPublicUrl}</span>
              <button onClick={() => navigator.clipboard.writeText(campaignPublicUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                <Copy className="w-4 h-4" />
              </button>
              <a href={campaignPublicUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Details
                </DropdownMenuItem>
                {campaign.isPublished && (
                  <DropdownMenuItem className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Public Page
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-600 dark:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Campaign Title and Status */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {campaign.name}
              </h1>
              {getStatusBadge()}
              {!campaign.isPublished && (
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                  Draft
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </span>
              <span>•</span>
              <span>{campaign.votingMode === 'paid' ? 'Paid Voting' : 'Free Voting'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {renderTabContent()}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      {/* Contestant Modal */}
      <ContestantModal
        isOpen={showContestantModal}
        onClose={() => {
          setShowContestantModal(false);
          setEditingContestant(undefined);
          setSelectedCategoryId(null);
        }}
        onSave={handleSaveContestant}
        contestant={editingContestant}
        categoryId={selectedCategoryId || ''}
      />
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'indigo' | 'blue' | 'emerald' | 'purple';
}> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right max-w-[60%]">{value}</span>
  </div>
);

const LimitCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center">
    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);
