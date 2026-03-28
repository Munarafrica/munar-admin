import React from 'react';
import { Target } from 'lucide-react';
import { Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, BarChart } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface CampaignsTabProps {
  analytics: EventAnalytics;
  currency: string;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const CampaignsTab: React.FC<CampaignsTabProps> = ({ analytics, currency }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Campaign attribution" description="Performance by campaign">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Campaign</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Channel</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Visitors</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Conversions</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics.campaigns.campaigns.map((campaign) => (
                <tr key={campaign.campaign}>
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">{campaign.campaign}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{campaign.channel}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{campaign.visitors.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{campaign.conversions.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{formatCurrency(campaign.revenue, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Revenue by channel"
          description="Attribution summary"
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Target className="w-4 h-4" />
              Top channels
            </div>
          }
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.campaigns.channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Landing page drop-offs" description="High drop-off pages">
          <div className="space-y-3">
            {analytics.campaigns.landingPages.map((page) => (
              <div key={page.page} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{page.page}</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{(page.dropOffRate * 100).toFixed(0)}% drop-off</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
