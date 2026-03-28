// Campaign Settings Tab - Settings specific to a single campaign
import React, { useState, useEffect } from 'react';
import { VotingCampaign, EligibilityType, TransparencyMode, VotingMode } from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Save,
  Shield,
  Eye,
  Clock,
  Users,
  Lock,
  Globe,
  DollarSign,
  ChevronDown,
  Check,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface CampaignSettingsTabProps {
  campaign: VotingCampaign;
  onUpdateCampaign: (data: Partial<VotingCampaign>) => Promise<void>;
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

export const CampaignSettingsTab: React.FC<CampaignSettingsTabProps> = ({
  campaign,
  onUpdateCampaign,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '',
    votingMode: campaign.votingMode,
    pricePerVote: campaign.pricePerVote || 0,
    eligibilityType: campaign.eligibility?.type || 'open',
    votesPerPerson: campaign.voteLimits?.votesPerPerson,
    votesPerCategory: campaign.voteLimits?.votesPerCategory,
    votesPerContestant: campaign.voteLimits?.votesPerContestant,
    dailyLimit: campaign.voteLimits?.dailyLimit,
    transparencyMode: campaign.transparency?.mode || 'live',
    showVoteCount: campaign.transparency?.showVoteCount ?? true,
    showPercentage: campaign.transparency?.showPercentage ?? true,
    showLeaderboard: campaign.transparency?.showLeaderboard ?? true,
    leaderboardSize: campaign.transparency?.leaderboardSize || 5,
    captchaEnabled: campaign.captchaEnabled ?? false,
    voteTimeout: campaign.voteTimeout || 30,
  });

  useEffect(() => {
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      votingMode: campaign.votingMode,
      pricePerVote: campaign.pricePerVote || 0,
      eligibilityType: campaign.eligibility?.type || 'open',
      votesPerPerson: campaign.voteLimits?.votesPerPerson,
      votesPerCategory: campaign.voteLimits?.votesPerCategory,
      votesPerContestant: campaign.voteLimits?.votesPerContestant,
      dailyLimit: campaign.voteLimits?.dailyLimit,
      transparencyMode: campaign.transparency?.mode || 'live',
      showVoteCount: campaign.transparency?.showVoteCount ?? true,
      showPercentage: campaign.transparency?.showPercentage ?? true,
      showLeaderboard: campaign.transparency?.showLeaderboard ?? true,
      leaderboardSize: campaign.transparency?.leaderboardSize || 5,
      captchaEnabled: campaign.captchaEnabled ?? false,
      voteTimeout: campaign.voteTimeout || 30,
    });
    setHasChanges(false);
  }, [campaign]);

  const handleChange = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateCampaign({
        name: formData.name,
        description: formData.description,
        votingMode: formData.votingMode,
        pricePerVote: formData.pricePerVote,
        eligibility: {
          type: formData.eligibilityType as EligibilityType,
        },
        voteLimits: {
          votesPerPerson: formData.votesPerPerson,
          votesPerCategory: formData.votesPerCategory,
          votesPerContestant: formData.votesPerContestant,
          dailyLimit: formData.dailyLimit,
        },
        transparency: {
          mode: formData.transparencyMode as TransparencyMode,
          showVoteCount: formData.showVoteCount,
          showPercentage: formData.showPercentage,
          showLeaderboard: formData.showLeaderboard,
          leaderboardSize: formData.leaderboardSize,
          showRevenue: false,
        },
        captchaEnabled: formData.captchaEnabled,
        voteTimeout: formData.voteTimeout,
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const votingModeLabels: Record<VotingMode, string> = {
    free: 'Free Voting',
    paid: 'Paid Voting',
  };

  const eligibilityLabels: Record<EligibilityType, string> = {
    open: 'Anyone can vote',
    authenticated: 'Authenticated users',
    'ticket-holders': 'Ticket holders only',
    vip: 'VIP members only',
    invited: 'Invited only',
  };

  const transparencyLabels: Record<TransparencyMode, string> = {
    live: 'Live (real-time results)',
    hidden: 'Hidden until end',
    'percentage-only': 'Percentage only',
    'after-close': 'After voting closes',
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <p className="text-amber-800 dark:text-amber-200 font-medium">
            You have unsaved changes
          </p>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        {/* Basic Info */}
        <SettingsSection title="Basic Information" icon={Globe}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Campaign Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full dark:bg-slate-900 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </SettingsSection>

        {/* Voting Mode */}
        <SettingsSection title="Voting Mode" description="Configure how votes are collected" icon={DollarSign}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mode
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {votingModeLabels[formData.votingMode]}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(['free', 'paid'] as VotingMode[]).map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    onSelect={() => handleChange('votingMode', mode)}
                  >
                    <div className="flex items-center gap-2">
                      {mode === 'paid' && <DollarSign className="w-4 h-4 text-emerald-600" />}
                      {mode === 'free' && <Users className="w-4 h-4 text-blue-600" />}
                      {votingModeLabels[mode]}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {formData.votingMode === 'paid' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Price per Vote ({campaign.currency || 'NGN'})
              </label>
              <Input
                type="number"
                min={0}
                value={formData.pricePerVote}
                onChange={(e) => handleChange('pricePerVote', parseInt(e.target.value) || 0)}
                className="w-full dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          )}
        </SettingsSection>

        {/* Eligibility */}
        <SettingsSection title="Eligibility" description="Who can vote in this campaign" icon={Shield}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Voter Eligibility
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {eligibilityLabels[formData.eligibilityType as EligibilityType]}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(Object.keys(eligibilityLabels) as EligibilityType[]).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={() => handleChange('eligibilityType', type)}
                  >
                    {eligibilityLabels[type]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SettingsSection>

        {/* Vote Limits */}
        <SettingsSection title="Vote Limits" description="Control how many votes each person can cast" icon={Lock}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Per Person (Total)
              </label>
              <Input
                type="number"
                min={0}
                value={formData.votesPerPerson || ''}
                onChange={(e) => handleChange('votesPerPerson', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Per Category
              </label>
              <Input
                type="number"
                min={0}
                value={formData.votesPerCategory || ''}
                onChange={(e) => handleChange('votesPerCategory', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Per Contestant
              </label>
              <Input
                type="number"
                min={0}
                value={formData.votesPerContestant || ''}
                onChange={(e) => handleChange('votesPerContestant', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Limit
              </label>
              <Input
                type="number"
                min={0}
                value={formData.dailyLimit || ''}
                onChange={(e) => handleChange('dailyLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Transparency */}
        <SettingsSection title="Transparency" description="Control result visibility" icon={Eye}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Results Display
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {transparencyLabels[formData.transparencyMode as TransparencyMode]}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(Object.keys(transparencyLabels) as TransparencyMode[]).map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    onSelect={() => handleChange('transparencyMode', mode)}
                  >
                    {transparencyLabels[mode]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <ToggleOption
              label="Show Vote Count"
              description="Display total votes per contestant"
              checked={formData.showVoteCount}
              onChange={(checked) => handleChange('showVoteCount', checked)}
            />
            <ToggleOption
              label="Show Percentage"
              description="Display vote percentage"
              checked={formData.showPercentage}
              onChange={(checked) => handleChange('showPercentage', checked)}
            />
            <ToggleOption
              label="Show Leaderboard"
              description="Display top contestants ranking"
              checked={formData.showLeaderboard}
              onChange={(checked) => handleChange('showLeaderboard', checked)}
            />
          </div>

          {formData.showLeaderboard && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Leaderboard Size
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.leaderboardSize}
                onChange={(e) => handleChange('leaderboardSize', parseInt(e.target.value) || 5)}
                className="w-32 dark:bg-slate-900 dark:border-slate-700"
              />
            </div>
          )}
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" description="Protect against vote manipulation" icon={Shield}>
          <ToggleOption
            label="Enable CAPTCHA"
            description="Require CAPTCHA verification before voting"
            checked={formData.captchaEnabled}
            onChange={(checked) => handleChange('captchaEnabled', checked)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vote Timeout (seconds)
            </label>
            <Input
              type="number"
              min={10}
              max={300}
              value={formData.voteTimeout}
              onChange={(e) => handleChange('voteTimeout', parseInt(e.target.value) || 30)}
              className="w-32 dark:bg-slate-900 dark:border-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Time limit for completing a vote submission
            </p>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

// Toggle Option Component
const ToggleOption: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative mt-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded transition-colors peer-checked:bg-indigo-600 peer-checked:border-indigo-600 group-hover:border-slate-400 dark:group-hover:border-slate-500">
        {checked && <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />}
      </div>
    </div>
    <div>
      <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
    </div>
  </label>
);
