import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Line, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, LineChart } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface ComparisonTabProps {
  analytics: EventAnalytics;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Event performance over time" description="Compare with previous editions">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.comparisons.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Edition comparison" description="Year-over-year metrics">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Year</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tickets sold</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Engagement</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Checked in</th>
                <th className="py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">NPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics.comparisons.comparisons.map((row) => (
                <tr key={row.year}>
                  <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100">{row.year}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{row.ticketsSold.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">₦{row.revenue.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{row.engagementScore}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{row.checkedIn}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{row.nps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};
