import React from 'react';
import { Metric, EventPhase } from './types';
import { ChevronRight, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Page } from '../../App';

interface OverviewAnalyticsProps {
  metrics: Metric[];
  phase: EventPhase;
  onNavigate?: (page: Page) => void;
}

export const OverviewAnalytics: React.FC<OverviewAnalyticsProps> = ({ metrics, onNavigate }) => {
  // Map real metrics from the API into display format
  const displayMetrics = metrics.length > 0
    ? metrics.map((m) => ({
        label: m.label,
        value: String(m.value ?? '0'),
        highlight: m.label === 'Total Revenue',
        isText: typeof m.value === 'string' && isNaN(Number(String(m.value).replace(/[^0-9.]/g, ''))),
      }))
    : [
        { label: 'Tickets Sold/registrations', value: '–', highlight: false },
        { label: 'Website Views', value: '–', highlight: false },
        { label: 'Voting Activity', value: 'Not Configured', highlight: false, isText: true },
        { label: 'Total Revenue', value: '₦0', highlight: true },
        { label: 'Check-ins', value: '0', highlight: false },
        { label: 'Survey Responses', value: '0', highlight: false },
      ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-[34px] h-[34px] rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">Analytics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Overview of your event Analytics</p>
            </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onNavigate?.('event-analytics')}
          className="h-8 w-8 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
        >
            <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 overflow-hidden">
          {displayMetrics.map((m, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 flex flex-col justify-between h-[100px] hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{m.label}</span>
                  <span className={cn(
                      "text-xl font-bold tracking-tight mt-1",
                      m.isText ? "text-slate-400 dark:text-slate-500 text-sm font-medium" : "text-slate-900 dark:text-slate-100"
                  )}>
                      {m.value}
                  </span>
              </div>
          ))}
      </div>
    </div>
  );
};
