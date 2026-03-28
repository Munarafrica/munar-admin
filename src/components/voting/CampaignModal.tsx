// Campaign Modal - Create/Edit voting campaigns
import React, { useState, useEffect } from 'react';
import { 
  VotingCampaign, 
  CreateCampaignRequest, 
  VotingMode,
  EligibilityConfig,
  VoteLimits,
  TransparencyConfig,
} from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  X,
  Trophy,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCampaignRequest) => Promise<void>;
  campaign?: VotingCampaign;
}

type Step = 'basics' | 'schedule' | 'settings';

interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  timezone: string;
  votingMode: VotingMode;
  pricePerVote: number;
  eligibility: EligibilityConfig;
  voteLimits: VoteLimits;
  transparency: TransparencyConfig;
  captchaEnabled: boolean;
  voteTimeout: number;
}

const defaultFormState: FormState = {
  name: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  timezone: 'Africa/Lagos',
  votingMode: 'paid',
  pricePerVote: 100,
  eligibility: {
    type: 'open',
    requireVerification: false,
  },
  voteLimits: {
    votesPerPerson: 10,
    votesPerCategory: 5,
    votesPerContestant: 3,
    dailyLimit: 20,
  },
  transparency: {
    mode: 'live',
    showVoteCount: true,
    showPercentage: true,
    showRevenue: false,
    showLeaderboard: true,
    leaderboardSize: 5,
  },
  captchaEnabled: false,
  voteTimeout: 30,
};

export const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  campaign,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>(defaultFormState);

  const steps: { id: Step; label: string; icon: React.ElementType }[] = [
    { id: 'basics', label: 'Basics', icon: Trophy },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        startDate: campaign.startDate.split('T')[0],
        endDate: campaign.endDate.split('T')[0],
        timezone: campaign.timezone,
        votingMode: campaign.votingMode,
        pricePerVote: campaign.pricePerVote || 100,
        eligibility: campaign.eligibility,
        voteLimits: campaign.voteLimits,
        transparency: campaign.transparency,
        captchaEnabled: campaign.captchaEnabled,
        voteTimeout: campaign.voteTimeout || 30,
      });
    } else {
      setFormData(defaultFormState);
    }
    setCurrentStep('basics');
  }, [campaign, isOpen]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVoteLimitsChange = (field: keyof VoteLimits, value: number | 'unlimited') => {
    setFormData(prev => ({
      ...prev,
      voteLimits: { ...prev.voteLimits, [field]: value },
    }));
  };

  const handleTransparencyChange = <K extends keyof TransparencyConfig>(field: K, value: TransparencyConfig[K]) => {
    setFormData(prev => ({
      ...prev,
      transparency: { ...prev.transparency, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const request: CreateCampaignRequest = {
        name: formData.name,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timezone: formData.timezone,
        votingMode: formData.votingMode,
        eligibility: formData.eligibility,
        voteLimits: formData.voteLimits,
        transparency: formData.transparency,
        pricePerVote: formData.votingMode !== 'free' ? formData.pricePerVote : undefined,
        captchaEnabled: formData.captchaEnabled,
        voteTimeout: formData.voteTimeout,
      };
      await onSave(request);
      onClose();
    } catch (error) {
      console.error('Failed to save campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'basics':
        return formData.name.trim().length > 0;
      case 'schedule':
        return formData.startDate && formData.endDate && formData.startDate < formData.endDate;
      case 'settings':
        return formData.votingMode === 'free' || formData.pricePerVote > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-transparent dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {campaign ? 'Edit Campaign' : 'Create Campaign'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = steps.findIndex(s => s.id === currentStep) > index;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all',
                    isActive && 'bg-indigo-100 dark:bg-indigo-900/30',
                    isPast && 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                      isActive && 'bg-indigo-600 text-white',
                      isPast && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                      !isActive && !isPast && 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    )}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive && 'text-indigo-600 dark:text-indigo-400',
                      !isActive && 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[400px]">
          {/* Basics Step */}
          {currentStep === 'basics' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Campaign Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Best Performance Awards 2026"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what this voting campaign is about..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Schedule Step */}
          {currentStep === 'schedule' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Duration:</strong>{' '}
                  {formData.startDate && formData.endDate
                    ? Math.ceil(
                        (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + ' days'
                    : 'Select dates'}
                </p>
              </div>
            </div>
          )}

          {/* Settings Step */}
          {currentStep === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Voting Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['free', 'paid'] as VotingMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleChange('votingMode', mode)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        formData.votingMode === mode
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100 capitalize text-sm">
                        {mode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.votingMode !== 'free' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Price per Vote (NGN)
                  </label>
                  <Input
                    type="number"
                    value={formData.pricePerVote}
                    onChange={(e) => handleChange('pricePerVote', Number(e.target.value))}
                    min={1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Votes per Person
                  </label>
                  <Input
                    type="number"
                    value={typeof formData.voteLimits.votesPerPerson === 'number' ? formData.voteLimits.votesPerPerson : 0}
                    onChange={(e) => handleVoteLimitsChange('votesPerPerson', Number(e.target.value))}
                    min={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Votes per Category
                  </label>
                  <Input
                    type="number"
                    value={typeof formData.voteLimits.votesPerCategory === 'number' ? formData.voteLimits.votesPerCategory : 0}
                    onChange={(e) => handleVoteLimitsChange('votesPerCategory', Number(e.target.value))}
                    min={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.transparency.showVoteCount}
                    onChange={(e) => handleTransparencyChange('showVoteCount', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Show real-time vote counts publicly
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.transparency.showLeaderboard}
                    onChange={(e) => handleTransparencyChange('showLeaderboard', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Show live leaderboard
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.eligibility.requireVerification || false}
                    onChange={(e) => handleChange('eligibility', { ...formData.eligibility, requireVerification: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Require email verification to vote
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <Button
            variant="outline"
            onClick={currentStep === 'basics' ? onClose : prevStep}
            disabled={isSubmitting}
            className="dark:bg-slate-900 dark:border-slate-700"
          >
            {currentStep === 'basics' ? 'Cancel' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>
          {currentStep === 'settings' ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
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
                  {campaign ? 'Save Changes' : 'Create Campaign'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
