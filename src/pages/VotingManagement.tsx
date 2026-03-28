// Voting Management Page
import React, { useState } from 'react';
import { Page } from '../App';
import { TopBar } from '../components/dashboard/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CampaignCard } from '../components/voting/CampaignCard';
import { CampaignModal } from '../components/voting/CampaignModal';
import { CategoryModal } from '../components/voting/CategoryModal';
import { ContestantModal } from '../components/voting/ContestantModal';
import { VotingAnalyticsTab } from '../components/voting/VotingAnalyticsTab';
import { VotingResultsTab } from '../components/voting/VotingResultsTab';
import { VotingSettingsTab } from '../components/voting/VotingSettingsTab';
import { CampaignDetailView } from '../components/voting/CampaignDetailView';
import { useCampaigns, useVotingAnalytics } from '../hooks';
import { VotingProvider, useVoting } from '../contexts';
import { votingService, eventsService } from '../services';
import { getCurrentEventId } from '../lib/event-storage';
import { 
  VotingCampaign, 
  VotingCategory, 
  Contestant,
  CreateCampaignRequest, 
  CreateCategoryRequest,
  CreateContestantRequest,
  VotingSettings,
  CreateVotePackageRequest,
} from '../types/voting';
import { cn } from '../components/ui/utils';
import {
  Trophy,
  Users,
  Package,
  BarChart3,
  Award,
  Plus,
  Search,
  Settings,
  Vote,
  TrendingUp,
  DollarSign,
  Eye,
  ChevronLeft,
} from 'lucide-react';

interface VotingManagementProps {
  onNavigate: (page: Page) => void;
}

const VotingManagementContent: React.FC<VotingManagementProps> = ({ onNavigate }) => {
  const eventId = getCurrentEventId();
  const [activeTab, setActiveTab] = useState<
    'campaigns' | 'analytics' | 'results' | 'settings'
  >('campaigns');
  const [campaignSearch, setCampaignSearch] = useState('');
  
  // Selected campaign for detail view
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VotingCampaign | undefined>();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCampaignForCategory, setSelectedCampaignForCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<VotingCategory | undefined>();
  const [showContestantModal, setShowContestantModal] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | undefined>();
  const [selectedCategoryForContestant, setSelectedCategoryForContestant] = useState<string | null>(null);
  const [selectedCampaignForContestant, setSelectedCampaignForContestant] = useState<string | null>(null);
  
  // Filter states
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');

  // Hooks
  const { 
    campaigns, 
    isLoading: campaignsLoading, 
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    publishCampaign,
    createCategory,
    updateCategory,
    deleteCategory,
    createContestant,
    updateContestant,
    deleteContestant,
  } = useCampaigns({
    eventId,
  });

  const { analytics, isLoading: analyticsLoading } = useVotingAnalytics({ eventId });
  const { settings, updateSettings, isLoading: contextLoading } = useVoting();

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(campaignSearch.toLowerCase());
    const matchesStatus = campaignStatusFilter === 'all' || c.status === campaignStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalVotes = analytics?.totalVotes || 0;
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalContestants = campaigns.reduce((acc, c) => 
    acc + c.categories.reduce((catAcc, cat) => catAcc + cat.contestants.length, 0), 0
  );
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  // Handlers
  const handleAddCampaign = () => {
    setEditingCampaign(undefined);
    setShowCampaignModal(true);
  };
  
  const handleEditCampaign = (campaign: VotingCampaign) => {
    setEditingCampaign(campaign);
    setShowCampaignModal(true);
  };
  
  const handleSaveCampaign = async (campaignData: CreateCampaignRequest) => {
    if (editingCampaign) {
      await updateCampaign(editingCampaign.id, campaignData);
      const created = await createCampaign(campaignData);
      if (created) {
        eventsService.updateModuleCount(
          eventId,
          'Voting',
          campaigns.length + 1,
          `Created campaign "${created.name}"`,
          'vote'
        );
      }
      await createCampaign(campaignData);
    }
    setShowCampaignModal(false);
  };

  const handleAddCategory = (campaignId: string) => {
    setSelectedCampaignForCategory(campaignId);
    setEditingCategory(undefined);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (campaignId: string, category: VotingCategory) => {
    setSelectedCampaignForCategory(campaignId);
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryData: CreateCategoryRequest) => {
    if (!selectedCampaignForCategory) return;
    
    if (editingCategory) {
      await updateCategory(selectedCampaignForCategory, editingCategory.id, categoryData);
    } else {
      eventsService.recordActivity(eventId, {
        type: 'system',
        message: `Added category "${categoryData.name}"`,
        isHighPriority: false,
        module: 'Voting',
        icon: 'vote',
      });
      await createCategory(selectedCampaignForCategory, categoryData);
    }
    setShowCategoryModal(false);
    setSelectedCampaignForCategory(null);
  };

  const handleAddContestant = (campaignId: string, categoryId: string) => {
    setSelectedCampaignForContestant(campaignId);
    setSelectedCategoryForContestant(categoryId);
    setEditingContestant(undefined);
    setShowContestantModal(true);
  };

  const handleEditContestant = (campaignId: string, categoryId: string, contestant: Contestant) => {
    setSelectedCampaignForContestant(campaignId);
    setSelectedCategoryForContestant(categoryId);
    setEditingContestant(contestant);
    setShowContestantModal(true);
  };

  const handleSaveContestant = async (contestantData: CreateContestantRequest) => {
    if (!selectedCampaignForContestant || !selectedCategoryForContestant) return;
    
    if (editingContestant) {
      await updateContestant(selectedCampaignForContestant, editingContestant.id, contestantData);
    } else {
      eventsService.recordActivity(eventId, {
        type: 'system',
        message: `Added contestant "${contestantData.name}"`,
        isHighPriority: false,
        module: 'Voting',
        icon: 'vote',
      });
      await createContestant(selectedCampaignForContestant, selectedCategoryForContestant, contestantData);
    }
    setShowContestantModal(false);
    setSelectedCampaignForContestant(null);
    setSelectedCategoryForContestant(null);
  };

  const handleSaveSettings = async (newSettings: Partial<VotingSettings>) => {
    await updateSettings(newSettings);
  };

  // Campaign Detail View Handlers
  const handleOpenCampaign = (campaign: VotingCampaign) => {
    setSelectedCampaignId(campaign.id);
  };

  const handleCloseCampaign = () => {
    setSelectedCampaignId(null);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaign(campaignId);
    eventsService.updateModuleCount(
      eventId,
      'Voting',
      Math.max(campaigns.length - 1, 0),
      'Campaign deleted',
      'vote'
    );
  };

  const handlePlayPause = async (campaignId: string, isPaused: boolean) => {
    await votingService.pauseCampaign(eventId, campaignId, isPaused);
    // Refresh campaigns
    window.location.reload(); // TODO: Use proper state refresh
  };

  const handlePublishToggle = async (campaignId: string, isPublished: boolean) => {
    await votingService.publishCampaign(eventId, campaignId, isPublished);
    // Refresh campaigns
    window.location.reload(); // TODO: Use proper state refresh
  };

  const handleSaveVotePackage = async (campaignId: string, data: CreateVotePackageRequest, packageId?: string) => {
    if (packageId) {
      await votingService.updateVotePackage(eventId, campaignId, packageId, data);
    } else {
      eventsService.recordActivity(eventId, {
        type: 'system',
        message: `Created vote package "${data.name}"`,
        isHighPriority: false,
        module: 'Voting',
        icon: 'vote',
      });
      await votingService.createVotePackage(eventId, campaignId, data);
    }
    window.location.reload(); // TODO: Use proper state refresh
  };

  const handleToggleVotePackage = async (campaignId: string, packageId: string, isActive: boolean) => {
    await votingService.toggleVotePackage(eventId, campaignId, packageId, isActive);
    window.location.reload(); // TODO: Use proper state refresh
  };

  const handleDeleteVotePackage = async (campaignId: string, packageId: string) => {
    await votingService.deleteVotePackage(eventId, campaignId, packageId);
    window.location.reload(); // TODO: Use proper state refresh
  };

  // Get selected campaign for detail view
  const selectedCampaign = selectedCampaignId 
    ? campaigns.find(c => c.id === selectedCampaignId) 
    : null;

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  // Get all contestants for the contestants tab
  const allContestants = campaigns.flatMap(campaign =>
    campaign.categories.flatMap(category =>
      category.contestants.map(contestant => ({
        ...contestant,
        categoryId: category.id,
        categoryName: category.name,
        campaignId: campaign.id,
        campaignName: campaign.name,
      }))
    )
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {/* Campaign Detail View */}
        {selectedCampaign ? (
          settings ? (
            <CampaignDetailView
              campaign={selectedCampaign}
              settings={settings}
              onBack={handleCloseCampaign}
              onUpdateCampaign={async (id, data) => {
                await updateCampaign(id, data as CreateCampaignRequest);
              }}
              onDeleteCampaign={async (id) => {
                await handleDeleteCampaign(id);
                handleCloseCampaign();
              }}
              onPlayPause={handlePlayPause}
              onPublish={handlePublishToggle}
              onUpdateSettings={handleSaveSettings}
              onSavePackage={handleSaveVotePackage}
              onTogglePackage={handleToggleVotePackage}
              onDeletePackage={handleDeleteVotePackage}
              onCreateCategory={async (campaignId, data) => {
                await createCategory(campaignId, data);
              }}
              onUpdateCategory={async (campaignId, categoryId, data) => {
                await updateCategory(campaignId, categoryId, data);
              }}
              onDeleteCategory={async (campaignId, categoryId) => {
                await deleteCategory(campaignId, categoryId);
              }}
              onCreateContestant={async (campaignId, categoryId, data) => {
                await createContestant(campaignId, categoryId, data);
              }}
              onUpdateContestant={async (campaignId, contestantId, data) => {
                await updateContestant(campaignId, contestantId, data);
              }}
              onDeleteContestant={async (campaignId, contestantId) => {
                await deleteContestant(campaignId, contestantId);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Loading campaign...</p>
            </div>
          )
        ) : (
          <>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
              <button
                onClick={() => onNavigate?.('event-dashboard')}
                className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Voting
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Create voting campaigns, manage contestants, and track real-time results. Enable paid or free voting for awards, competitions, and polls.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('public-vote')}
              className="gap-2 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Eye className="w-4 h-4" />
              Preview Public
            </Button>
            <Button 
              onClick={handleAddCampaign}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Vote className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Votes
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalVotes.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Revenue
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Contestants
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {totalContestants}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Campaigns
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {activeCampaigns}
            </p>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col transition-colors">
          {/* Tabs Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: Trophy },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'results', label: 'Results', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1">
            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="search"
                        placeholder="Search campaigns..."
                        value={campaignSearch}
                        onChange={(e) => setCampaignSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={campaignStatusFilter}
                      onChange={(e) => setCampaignStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="ended">Ended</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleAddCampaign}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 sm:hidden"
                  >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                  </Button>
                </div>

                {/* Campaigns Grid */}
                {campaignsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading campaigns...</p>
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {campaigns.length === 0 ? 'No voting campaigns yet' : 'No campaigns match your filters'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                      {campaigns.length === 0 
                        ? 'Create your first voting campaign to start collecting votes.'
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                    {campaigns.length === 0 && (
                      <Button 
                        onClick={handleAddCampaign}
                        className="mt-4 bg-indigo-600 text-white gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Campaign
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onOpen={() => handleOpenCampaign(campaign)}
                        onEdit={() => handleEditCampaign(campaign)}
                        onDuplicate={() => duplicateCampaign(campaign.id)}
                        onDelete={() => handleDeleteCampaign(campaign.id)}
                        onPublish={() => publishCampaign(campaign.id)}
                        onAddCategory={() => handleAddCategory(campaign.id)}
                        onEditCategory={(category) => handleEditCategory(campaign.id, category)}
                        onDeleteCategory={(categoryId) => deleteCategory(campaign.id, categoryId)}
                        onAddContestant={(categoryId) => handleAddContestant(campaign.id, categoryId)}
                        onEditContestant={(categoryId, contestant) => handleEditContestant(campaign.id, categoryId, contestant)}
                        onDeleteContestant={(categoryId, contestantId) => deleteContestant(campaign.id, contestantId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <VotingAnalyticsTab
                analytics={analytics}
                isLoading={analyticsLoading}
                currency="NGN"
              />
            )}

            {/* RESULTS TAB */}
            {activeTab === 'results' && (
              <VotingResultsTab
                campaigns={campaigns}
                eventId={eventId}
              />
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <VotingSettingsTab
                settings={settings}
                onSave={handleSaveSettings}
                isLoading={contextLoading}
              />
            )}
          </div>
        </div>
        </>
        )}
        
        {/* Campaign Modal */}
        <CampaignModal
          isOpen={showCampaignModal}
          onClose={() => {
            setShowCampaignModal(false);
            setEditingCampaign(undefined);
          }}
          onSave={handleSaveCampaign}
          campaign={editingCampaign}
        />
        
        {/* Category Modal */}
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(undefined);
            setSelectedCampaignForCategory(null);
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
            setSelectedCategoryForContestant(null);
          }}
          onSave={handleSaveContestant}
          contestant={editingContestant}
          categoryId={selectedCategoryForContestant || ''}
        />
      </main>
    </div>
  );
};

// Wrap with VotingProvider
export const VotingManagement: React.FC<VotingManagementProps> = (props) => {
  return (
    <VotingProvider eventId={getCurrentEventId()}>
      <VotingManagementContent {...props} />
    </VotingProvider>
  );
};
