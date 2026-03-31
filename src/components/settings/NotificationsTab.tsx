// Notifications settings tab
import React, { useState, useEffect, useCallback } from 'react';
import {
  NotificationSettings,
  NotificationPreference,
  DigestFrequency,
} from '../../types/settings';
import * as settingsService from '../../services/settings.service';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Ticket,
  UserPlus,
  Send,
  RefreshCcw,
  Banknote,
  Clock,
  Sparkles,
  Megaphone,
  Mail,
} from 'lucide-react';

// ─── Notification type → icon mapping ────────────────────────────────────────
const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  ticket_sold: Ticket,
  new_attendee: UserPlus,
  event_published: Send,
  refund_processed: RefreshCcw,
  payout_completed: Banknote,
  event_reminder: Clock,
  product_updates: Sparkles,
  marketing_tips: Megaphone,
};

// ─── Toggle switch component ─────────────────────────────────────────────────
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
      checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700',
      disabled && 'opacity-50 cursor-not-allowed',
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
);

// ─── Digest frequency selector ───────────────────────────────────────────────
const DIGEST_OPTIONS: { value: DigestFrequency; label: string; description: string }[] = [
  { value: 'instant', label: 'Instant', description: 'Receive notifications immediately' },
  { value: 'daily', label: 'Daily Summary', description: 'One email per day at 9:00 AM' },
  { value: 'weekly', label: 'Weekly Summary', description: 'One email every Monday at 9:00 AM' },
];

// ─── Main component ──────────────────────────────────────────────────────────
export const NotificationsTab: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Local working copy
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [digestFrequency, setDigestFrequency] = useState<DigestFrequency>('instant');

  // Original copy for change detection
  const [original, setOriginal] = useState<NotificationSettings | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getNotificationSettings();
      setSettings(data);
      setOriginal(data);
      setPreferences(data.preferences);
      setDigestFrequency(data.digestFrequency);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Track changes
  useEffect(() => {
    if (!original) return;
    const prefsChanged = preferences.some((p, i) =>
      p.emailEnabled !== original.preferences[i]?.emailEnabled
    );
    setHasChanges(prefsChanged || digestFrequency !== original.digestFrequency);
  }, [preferences, digestFrequency, original]);

  const handleToggle = (index: number, value: boolean) => {
    setPreferences(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], emailEnabled: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const updated = await settingsService.saveNotificationSettings({
        preferences,
        digestFrequency,
      });
      setSettings(updated);
      setOriginal(updated);
      setPreferences(updated.preferences);
      setDigestFrequency(updated.digestFrequency);
      setHasChanges(false);
      setSavedMessage('Notification preferences saved');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Choose which notifications you'd like to receive
        </p>
      </div>

      {/* Messages */}
      {savedMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {savedMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Notification toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {preferences.map((pref, idx) => {
          const Icon = NOTIFICATION_ICONS[pref.type] || Bell;
          return (
            <div
              key={pref.type}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{pref.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{pref.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <ToggleSwitch
                  checked={pref.emailEnabled}
                  onChange={val => handleToggle(idx, val)}
                  label={`Toggle ${pref.label} email notification`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Digest frequency */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notification Frequency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">How often should we send you a summary?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIGEST_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDigestFrequency(opt.value)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                digestFrequency === opt.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600',
              )}
            >
              <p className={cn(
                'text-sm font-medium',
                digestFrequency === opt.value
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300',
              )}>
                {opt.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end pt-2">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
