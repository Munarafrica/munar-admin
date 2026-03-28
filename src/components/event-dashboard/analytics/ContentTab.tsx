import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Line, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, LineChart } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface ContentTabProps {
  analytics: EventAnalytics;
}

export const ContentTab: React.FC<ContentTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Content views" description="Live + replay sessions">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.content.viewTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="Session performance" description="Views, watch time, downloads">
        <div className="space-y-3">
          {analytics.content.sessions.map((session) => (
            <div key={session.title} className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <PlayCircle className="h-4 w-4 text-indigo-500" />
                  {session.title}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300">{session.views} views</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Avg watch: {session.avgWatchMins} mins</span>
                <span>Downloads: {session.downloads}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
