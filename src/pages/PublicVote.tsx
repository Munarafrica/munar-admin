// Public Voting Page - Customer-facing voting interface
import React, { useState, useEffect } from 'react';
import { Page } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PublicCategoryCard } from '../components/voting/PublicCategoryCard';
import { PublicContestantCard } from '../components/voting/PublicContestantCard';
import { VoteModal } from '../components/voting/VoteModal';
import { VotePackagePurchaseModal } from '../components/voting/VotePackagePurchaseModal';
import { LiveLeaderboard } from '../components/voting/LiveLeaderboard';
import { useVotes, useCampaigns } from '../hooks';
import { VotingProvider, useVoting } from '../contexts';
import { VotingCategory, Contestant, VotePackage } from '../types/voting';
import { cn } from '../components/ui/utils';
import {
  Trophy,
  Search,
  ChevronLeft,
  Vote,
  Package,
  BarChart3,
  Timer,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface PublicVoteProps {
  onNavigate: (page: Page) => void;
  campaignId?: string;
}

const MOCK_EVENT_ID = 'evt-1';
const MOCK_CAMPAIGN_ID = 'campaign-1';

const PublicVoteContent: React.FC<PublicVoteProps> = ({ onNavigate, campaignId = MOCK_CAMPAIGN_ID }) => {
  const [selectedCategory, setSelectedCategory] = useState<VotingCategory | null>(null);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userVoteBalance, setUserVoteBalance] = useState(10); // Demo: user has 10 votes

  // Hooks
  const { campaigns } = useCampaigns({ eventId: MOCK_EVENT_ID });
  const { currentCampaign } = useVoting();

  // Find current campaign
  const campaign = currentCampaign || campaigns.find(c => c.id === campaignId);
  
  // Vote packages from campaign
  const votePackages = campaign?.votePackages || [];
  
  // Only initialize useVotes when we have a campaign
  const { castVote, purchaseVotes, isLoading: voteLoading } = useVotes({ 
    eventId: MOCK_EVENT_ID, 
    campaignId: campaign?.id || campaignId 
  });

  // Filter categories and contestants by search
  const categories = campaign?.categories || [];
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContestants = selectedCategory
    ? selectedCategory.contestants.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Time remaining calculation
  const getTimeRemaining = () => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const timeRemaining = getTimeRemaining();

  // Handlers
  const handleSelectCategory = (category: VotingCategory) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleVoteClick = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setShowVoteModal(true);
  };

  const handleCastVote = async (voteCount: number) => {
    if (!selectedContestant || !selectedCategory) return;
    
    try {
      await castVote({
        contestantId: selectedContestant.id,
        categoryId: selectedCategory.id,
        voteCount,
      });
      setUserVoteBalance(prev => prev - voteCount);
      setShowVoteModal(false);
      setSelectedContestant(null);
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  const handlePurchasePackage = async (packageData: VotePackage) => {
    try {
      await purchaseVotes(packageData.id, 1);
      setUserVoteBalance(prev => prev + packageData.voteCount);
      setShowPackageModal(false);
    } catch (error) {
      console.error('Failed to purchase votes:', error);
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-white/60 mb-4">The voting campaign you're looking for doesn't exist.</p>
          <Button onClick={() => onNavigate('event-dashboard')} variant="outline" className="text-white border-white/30">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 font-['Raleway']">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate('voting-management')}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">{campaign.name}</h1>
                <p className="text-xs text-white/60">{campaign.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Remaining */}
              {timeRemaining && !timeRemaining.expired && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">
                    {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m left
                  </span>
                </div>
              )}
              {/* Vote Balance */}
              <button
                onClick={() => setShowPackageModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white font-medium text-sm hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                <Vote className="w-4 h-4" />
                <span>{userVoteBalance} Votes</span>
                <Sparkles className="w-3 h-3" />
              </button>
              {/* Leaderboard Toggle */}
              <Button
                variant="ghost"
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {selectedCategory && (
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </button>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="search"
            placeholder={selectedCategory ? "Search contestants..." : "Search categories..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
          />
        </div>

        {/* Categories View */}
        {!selectedCategory && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
              Choose a Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <PublicCategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleSelectCategory(category)}
                />
              ))}
              {filteredCategories.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60">No categories found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contestants View */}
        {selectedCategory && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedCategory.name}
              </h2>
              <p className="text-white/60">{selectedCategory.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredContestants.map((contestant) => (
                <PublicContestantCard
                  key={contestant.id}
                  contestant={contestant}
                  onVote={() => handleVoteClick(contestant)}
                  showVoteCount={campaign.transparency?.showVoteCount}
                />
              ))}
              {filteredContestants.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60">No contestants found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Vote Modal */}
      <VoteModal
        isOpen={showVoteModal}
        onClose={() => {
          setShowVoteModal(false);
          setSelectedContestant(null);
        }}
        contestant={selectedContestant}
        userVoteBalance={userVoteBalance}
        onCastVote={handleCastVote}
        onBuyVotes={() => {
          setShowVoteModal(false);
          setShowPackageModal(true);
        }}
        isLoading={voteLoading}
        isPaidVoting={campaign.votingMode === 'paid'}
        pricePerVote={campaign.pricePerVote || 100}
      />

      {/* Vote Package Purchase Modal */}
      <VotePackagePurchaseModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        packages={votePackages}
        onPurchase={handlePurchasePackage}
        currency="NGN"
      />

      {/* Leaderboard Sidebar */}
      {showLeaderboard && selectedCategory && (
        <LiveLeaderboard
          category={selectedCategory}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

// Wrap with VotingProvider
export const PublicVote: React.FC<PublicVoteProps> = (props) => {
  return (
    <VotingProvider eventId={MOCK_EVENT_ID}>
      <PublicVoteContent {...props} />
    </VotingProvider>
  );
};
