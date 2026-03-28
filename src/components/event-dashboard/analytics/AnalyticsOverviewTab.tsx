import React from 'react';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { BarChart, CartesianGrid, Line, LineChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { KpiCard } from './KpiCard';
import { SectionCard } from './SectionCard';

interface AnalyticsOverviewTabProps {
  analytics: EventAnalytics;
  currency: string;
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({ analytics, currency }) => {
  const summaryItems = Object.values(analytics.summary);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} currency={kpi.id === 'total-revenue' || kpi.id === 'revenue-per-attendee' ? currency : undefined} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Revenue trend"
          description="Tickets + merchandise + paid voting"
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <LineChartIcon className="w-4 h-4" />
              Daily revenue
            </div>
          }
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.ticketSales.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Revenue by stream"
          description="Tickets, merchandise, paid voting, sponsorships"
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-4 h-4" />
              Total revenue
            </div>
          }
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.financial.revenueStreams}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
