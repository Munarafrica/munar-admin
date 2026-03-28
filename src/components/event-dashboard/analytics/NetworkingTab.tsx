import React from 'react';
import { Users2 } from 'lucide-react';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface NetworkingTabProps {
  analytics: EventAnalytics;
}

export const NetworkingTab: React.FC<NetworkingTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Networking overview" description="Lead generation and meetings">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Leads captured</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.networking.leadsCaptured}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Qualified leads</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analytics.networking.leadQualificationRate * 100).toFixed(0)}%</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Conversions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.networking.conversions}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Meetings sent</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.networking.meetingsSent}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Meetings accepted</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.networking.meetingsAccepted}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Messages exchanged</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.networking.messagesExchanged}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Top interaction pairs" description="Most engaged pairs">
        <div className="space-y-3">
          {analytics.networking.topPairs.map((pair) => (
            <div key={`${pair.from}-${pair.to}`} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <Users2 className="h-4 w-4 text-indigo-500" />
                {pair.from} → {pair.to}
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">{pair.count} interactions</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
