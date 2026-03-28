// Voting Settings Tab - Configure voting rules and preferences
import React, { useState, useEffect } from 'react';
import { VotingSettings, VotingMode, EligibilityType, TransparencyMode } from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  Shield,
  Bell,
  Eye,
  EyeOff,
  Lock,
  DollarSign,
  Users,
  Globe,
  Save,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface VotingSettingsTabProps {
  settings: VotingSettings | null;
  onSave: (settings: Partial<VotingSettings>) => Promise<void>;
  isLoading: boolean;
}

export const VotingSettingsTab: React.FC<VotingSettingsTabProps> = ({
  settings,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<VotingSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = <K extends keyof VotingSettings>(field: K, value: VotingSettings[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading settings...</p>
      </div>
    );
  }

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
    <div className="space-y-8 max-w-3xl">
      {/* Default Campaign Settings */}
      <SettingsSection
        title="Default Campaign Settings"
        description="Set defaults for new voting campaigns"
        icon={Shield}
      >
        <div className="space-y-4">
          {/* Default Voting Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Voting Mode
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {votingModeLabels[formData.defaultVotingMode || 'free']}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(['free', 'paid'] as VotingMode[]).map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    onSelect={() => handleChange('defaultVotingMode', mode)}
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

          {/* Default Eligibility */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Eligibility
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {eligibilityLabels[formData.defaultEligibility || 'open']}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(['open', 'authenticated', 'ticket-holders', 'vip', 'invited'] as EligibilityType[]).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={() => handleChange('defaultEligibility', type)}
                  >
                    {eligibilityLabels[type]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Default Transparency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Transparency
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-slate-900 dark:border-slate-700"
                >
                  {transparencyLabels[formData.defaultTransparency || 'live']}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                {(['live', 'hidden', 'percentage-only', 'after-close'] as TransparencyMode[]).map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    onSelect={() => handleChange('defaultTransparency', mode)}
                  >
                    <div className="flex items-center gap-2">
                      {mode === 'live' && <Eye className="w-4 h-4 text-blue-600" />}
                      {mode === 'hidden' && <EyeOff className="w-4 h-4 text-slate-600" />}
                      {mode === 'percentage-only' && <Lock className="w-4 h-4 text-amber-600" />}
                      {mode === 'after-close' && <Lock className="w-4 h-4 text-purple-600" />}
                      {transparencyLabels[mode]}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SettingsSection>

      {/* Anti-Fraud Settings */}
      <SettingsSection
        title="Anti-Fraud Protection"
        description="Default security settings for campaigns"
        icon={Shield}
      >
        <div className="space-y-4">
          <ToggleSetting
            label="Enable CAPTCHA by Default"
            description="Require CAPTCHA verification on vote submissions"
            checked={formData.defaultCaptchaEnabled ?? true}
            onChange={(checked) => handleChange('defaultCaptchaEnabled', checked)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vote Timeout (seconds)
            </label>
            <Input
              type="number"
              value={formData.defaultVoteTimeout || 5}
              onChange={(e) => handleChange('defaultVoteTimeout', Number(e.target.value))}
              min={1}
              max={60}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Minimum time between votes to prevent spam
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection
        title="Notifications"
        description="Configure alerts and notifications"
        icon={Bell}
      >
        <div className="space-y-4">
          <ToggleSetting
            label="Notify on Voting Start"
            description="Send notifications when voting campaigns begin"
            checked={formData.notifyOnVotingStart ?? true}
            onChange={(checked) => handleChange('notifyOnVotingStart', checked)}
          />
          <ToggleSetting
            label="Notify on Voting End"
            description="Send notifications when voting campaigns end"
            checked={formData.notifyOnVotingEnd ?? true}
            onChange={(checked) => handleChange('notifyOnVotingEnd', checked)}
          />
          <ToggleSetting
            label="Notify Voters of Results"
            description="Send results to voters when voting ends"
            checked={formData.notifyVotersOfResults ?? true}
            onChange={(checked) => handleChange('notifyVotersOfResults', checked)}
          />
          <ToggleSetting
            label="Reminder Before End"
            description="Send reminder notifications before voting ends"
            checked={formData.reminderBeforeEnd ?? false}
            onChange={(checked) => handleChange('reminderBeforeEnd', checked)}
          />
          {formData.reminderBeforeEnd && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reminder Hours Before End
              </label>
              <Input
                type="number"
                value={formData.reminderHours || 24}
                onChange={(e) => handleChange('reminderHours', Number(e.target.value))}
                min={1}
                max={72}
              />
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Display Options */}
      <SettingsSection
        title="Display Options"
        description="Control visibility and embedding"
        icon={Eye}
      >
        <div className="space-y-4">
          <ToggleSetting
            label="Show Voting on Event Site"
            description="Display voting link on your event page"
            checked={formData.showVotingOnEventSite ?? true}
            onChange={(checked) => handleChange('showVotingOnEventSite', checked)}
          />
          <ToggleSetting
            label="Enable Embed Widget"
            description="Allow embedding voting widget on external sites"
            checked={formData.embedWidgetEnabled ?? false}
            onChange={(checked) => handleChange('embedWidgetEnabled', checked)}
          />
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="sticky bottom-0 flex justify-end p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 -mx-6 -mb-6">
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges || isSaving}
          className={cn(
            'gap-2 transition-all',
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
    <div className="flex-1">
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </label>
);
