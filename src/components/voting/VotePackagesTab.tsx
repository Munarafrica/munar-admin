// Vote Packages Tab - Manage vote package bundles for purchase
import React, { useState, useEffect } from 'react';
import { VotePackage, CreateVotePackageRequest, VotingCampaign } from '../../types/voting';
import { votingService } from '../../services';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Gift,
  Tag,
  DollarSign,
  Vote,
  X,
  Check,
  ChevronDown,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// Props when used within CampaignDetailView (campaign passed directly)
interface CampaignVotePackagesTabProps {
  campaign: VotingCampaign;
  onSavePackage: (data: CreateVotePackageRequest, packageId?: string) => Promise<void>;
  onTogglePackage: (packageId: string, isActive: boolean) => Promise<void>;
  onDeletePackage: (packageId: string) => Promise<void>;
}

// Props when used at event level (legacy/main voting page)
interface EventVotePackagesTabProps {
  eventId: string;
}

// Union type for both use cases
type VotePackagesTabProps = CampaignVotePackagesTabProps | EventVotePackagesTabProps;

// Type guard
function isCampaignMode(props: VotePackagesTabProps): props is CampaignVotePackagesTabProps {
  return 'campaign' in props;
}

export const VotePackagesTab: React.FC<VotePackagesTabProps> = (props) => {
  // Campaign mode - used within CampaignDetailView
  if (isCampaignMode(props)) {
    return <CampaignVotePackagesContent {...props} />;
  }
  
  // Event mode - used in main voting management page
  return <EventVotePackagesContent {...props} />;
};

// Campaign-specific VotePackages (for CampaignDetailView)
const CampaignVotePackagesContent: React.FC<CampaignVotePackagesTabProps> = ({
  campaign,
  onSavePackage,
  onTogglePackage,
  onDeletePackage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VotePackage | undefined>();

  const packages = campaign.votePackages || [];

  const handleSavePackage = async (packageData: CreateVotePackageRequest) => {
    await onSavePackage(packageData, editingPackage?.id);
    setShowModal(false);
    setEditingPackage(undefined);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    await onDeletePackage(id);
  };

  const handleTogglePackage = async (pkg: VotePackage) => {
    await onTogglePackage(pkg.id, !pkg.isActive);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: campaign.currency || 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Vote Packages</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create bundles of votes that users can purchase at discounted rates
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPackage(undefined);
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No vote packages yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Create vote packages to offer bulk votes at discounted prices.
          </p>
          <Button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-indigo-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        </div>
      )}
      
      {/* Packages Grid */}
      {packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => {
                setEditingPackage(pkg);
                setShowModal(true);
              }}
              onToggle={() => handleTogglePackage(pkg)}
              onDelete={() => handleDeletePackage(pkg.id)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {/* Package Modal */}
      <VotePackageModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPackage(undefined);
        }}
        onSave={handleSavePackage}
        package={editingPackage}
        currency={campaign.currency || 'NGN'}
      />
    </div>
  );
};

// Package Card Component
interface PackageCardProps {
  pkg: VotePackage;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  formatCurrency: (value: number) => string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onEdit,
  onToggle,
  onDelete,
  formatCurrency,
}) => (
  <div
    className={cn(
      "relative bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 transition-all hover:shadow-md",
      !pkg.isActive && "opacity-60"
    )}
  >
    {/* Actions */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggle}>
          {pkg.isActive ? (
            <>
              <PowerOff className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Content */}
    <div className="text-center mb-4">
      <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 bg-slate-100 dark:bg-slate-700">
        <Gift className="w-7 h-7 text-slate-500 dark:text-slate-400" />
      </div>
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {pkg.name}
      </h4>
    </div>

    {/* Stats */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Vote className="w-4 h-4" />
          Votes
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {pkg.voteCount}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          Price
        </span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(pkg.price)}
        </span>
      </div>
      {pkg.discountPercentage && pkg.discountPercentage > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Discount
          </span>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {pkg.discountPercentage}% off
          </Badge>
        </div>
      )}
    </div>

    {/* Price per vote */}
    <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-700">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {formatCurrency(pkg.price / pkg.voteCount)} per vote
      </span>
    </div>

    {/* Status */}
    <div className="mt-3">
      <Badge
        className={cn(
          'w-full justify-center',
          pkg.isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        )}
      >
        {pkg.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  </div>
);

// Event-level VotePackages (for main voting management page)
const EventVotePackagesContent: React.FC<EventVotePackagesTabProps> = ({ eventId }) => {
  const [campaigns, setCampaigns] = useState<VotingCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [packages, setPackages] = useState<VotePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VotePackage | undefined>();

  useEffect(() => {
    loadCampaigns();
  }, [eventId]);

  useEffect(() => {
    if (selectedCampaignId) {
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (campaign) {
        setPackages(campaign.votePackages || []);
      }
    }
  }, [selectedCampaignId, campaigns]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const campaignList = await votingService.getCampaigns(eventId);
      setCampaigns(campaignList);
      if (campaignList.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(campaignList[0].id);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePackage = async (packageData: CreateVotePackageRequest) => {
    if (!selectedCampaignId) return;
    try {
      if (editingPackage) {
        await votingService.updateVotePackage(eventId, selectedCampaignId, editingPackage.id, packageData);
      } else {
        await votingService.createVotePackage(eventId, selectedCampaignId, packageData);
      }
      await loadCampaigns();
      setShowModal(false);
      setEditingPackage(undefined);
    } catch (error) {
      console.error('Failed to save package:', error);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!selectedCampaignId) return;
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await votingService.deleteVotePackage(eventId, selectedCampaignId, id);
      await loadCampaigns();
    } catch (error) {
      console.error('Failed to delete package:', error);
    }
  };

  const handleTogglePackage = async (pkg: VotePackage) => {
    if (!selectedCampaignId) return;
    try {
      await votingService.updateVotePackage(eventId, selectedCampaignId, pkg.id, { isActive: !pkg.isActive } as any);
      await loadCampaigns();
    } catch (error) {
      console.error('Failed to toggle package:', error);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: campaigns.find(c => c.id === selectedCampaignId)?.currency || 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading packages...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No campaigns yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Create a voting campaign first, then add vote packages to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Vote Packages</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create bundles of votes that users can purchase at discounted rates
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPackage(undefined);
            setShowModal(true);
          }}
          disabled={!selectedCampaignId}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {/* Campaign Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Campaign:
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between dark:bg-slate-900 dark:border-slate-700">
              {selectedCampaignId
                ? campaigns.find(c => c.id === selectedCampaignId)?.name || 'Select campaign'
                : 'Select campaign'}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
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
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No vote packages yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Create vote packages to offer bulk votes at discounted prices.
          </p>
          <Button onClick={() => setShowModal(true)} className="mt-4 bg-indigo-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => {
                setEditingPackage(pkg);
                setShowModal(true);
              }}
              onToggle={() => handleTogglePackage(pkg)}
              onDelete={() => handleDeletePackage(pkg.id)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      <VotePackageModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPackage(undefined);
        }}
        onSave={handleSavePackage}
        package={editingPackage}
        currency={campaigns.find(c => c.id === selectedCampaignId)?.currency || 'NGN'}
      />
    </div>
  );
};

// Vote Package Modal
interface VotePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateVotePackageRequest) => Promise<void>;
  package?: VotePackage;
  currency?: string;
}

const VotePackageModal: React.FC<VotePackageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  package: pkg,
  currency = 'NGN',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateVotePackageRequest>({
    name: '',
    voteCount: 10,
    price: 1000,
    discountPercentage: 0,
    maxPurchases: undefined,
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        voteCount: pkg.voteCount,
        price: pkg.price,
        discountPercentage: pkg.discountPercentage || 0,
        maxPurchases: pkg.maxPurchases,
      });
    } else {
      setFormData({
        name: '',
        voteCount: 10,
        price: 1000,
        discountPercentage: 0,
        maxPurchases: undefined,
      });
    }
  }, [pkg, isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {pkg ? 'Edit Package' : 'Create Package'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Package Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Starter Pack"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Votes *
              </label>
              <Input
                type="number"
                value={formData.voteCount}
                onChange={(e) => setFormData({ ...formData, voteCount: Number(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Price ({currency}) *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Discount Percentage
              </label>
              <Input
                type="number"
                value={formData.discountPercentage || 0}
                onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Max Purchases Per User
              </label>
              <Input
                type="number"
                value={formData.maxPurchases || ''}
                onChange={(e) => setFormData({ ...formData, maxPurchases: e.target.value ? Number(e.target.value) : undefined })}
                min={1}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Price per vote: {formData.voteCount > 0 ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(formData.price / formData.voteCount) : 'N/A'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-slate-900 dark:border-slate-700">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {pkg ? 'Save Changes' : 'Create Package'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
