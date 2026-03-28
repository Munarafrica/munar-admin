import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';
import { Switch } from '../../ui/switch';

interface AlertsPrivacyTabProps {
  analytics: EventAnalytics;
  onToggle: (key: 'inApp' | 'email') => void;
}

export const AlertsPrivacyTab: React.FC<AlertsPrivacyTabProps> = ({ analytics, onToggle }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Alerts" description="Live signals across your event">
        <div className="space-y-3">
          {analytics.alertsPrivacy.alerts.map((alert) => (
            <div key={alert.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{alert.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notification settings" description="Choose how you receive alerts">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">In-app alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get alerts inside Munar</p>
            </div>
            <Switch checked={analytics.alertsPrivacy.notificationSettings.inApp} onCheckedChange={() => onToggle('inApp')} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Email alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send alerts to your team</p>
            </div>
            <Switch checked={analytics.alertsPrivacy.notificationSettings.email} onCheckedChange={() => onToggle('email')} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Privacy & compliance" description="Consent and data minimization">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Consent required
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {analytics.alertsPrivacy.privacy.consentRequired ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Behavioral tracking
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {analytics.alertsPrivacy.privacy.behavioralTracking ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Data retention</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{analytics.alertsPrivacy.privacy.dataRetentionDays} days</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Public analytics</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {analytics.alertsPrivacy.privacy.anonymizePublicData ? 'Anonymized' : 'Personalized'}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
