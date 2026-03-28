import React from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, BarChart } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface EngagementTabProps {
  analytics: EventAnalytics;
}

export const EngagementTab: React.FC<EngagementTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Engagement summary" description="Participation across event experiences">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Poll participation</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analytics.engagement.pollParticipation * 100).toFixed(0)}%</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Votes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.engagement.voteCount}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Chat messages</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.engagement.chatMessages}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Q&A questions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.engagement.qnaQuestions}</p>
          </div>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Engagement rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analytics.engagement.engagementRate * 100).toFixed(0)}%</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Interaction breakdown" description="Polls, chat, Q&A">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.engagement.interactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Website section clicks" description="Most clicked site areas">
          <div className="space-y-3">
            {analytics.engagement.websiteClicks.map((section) => (
              <div key={section.section} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  {section.section}
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{section.clicks}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
