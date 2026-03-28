import React from 'react';
import { Users, Clock3 } from 'lucide-react';
import { Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, BarChart } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface AttendanceTabProps {
  analytics: EventAnalytics;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Attendance overview" description="Registered vs checked-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Registered</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.attendance.registered}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Checked in</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.attendance.checkedIn}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Check-in rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analytics.attendance.checkInRate * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">No-show rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{(analytics.attendance.noShowRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Peak arrival times" description="When attendees are arriving">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.attendance.peakArrivalTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Session attendance" description="Most popular sessions">
        <div className="space-y-3">
          {analytics.attendance.sessionMetrics.map((session) => (
            <div key={session.session} className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{session.session}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.attendees} attendees · {session.capacity} capacity
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{(session.checkInRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-slate-400">check-in</p>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(100, (session.attendees / session.capacity) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
