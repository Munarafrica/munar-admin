import React, { useMemo, useState } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { Page } from '../App';
import { BarChart3, FileText, Users, Wallet, Activity, Megaphone, PlayCircle, Users2, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useEventAnalytics } from '../hooks/useAnalytics';
import { AnalyticsFiltersBar } from '../components/event-dashboard/analytics/AnalyticsFilters';
import { AnalyticsOverviewTab } from '../components/event-dashboard/analytics/AnalyticsOverviewTab';
import { TicketSalesTab } from '../components/event-dashboard/analytics/TicketSalesTab';
import { AttendanceTab } from '../components/event-dashboard/analytics/AttendanceTab';
import { EngagementTab } from '../components/event-dashboard/analytics/EngagementTab';
import { FinancialTab } from '../components/event-dashboard/analytics/FinancialTab';
import { CampaignsTab } from '../components/event-dashboard/analytics/CampaignsTab';
import { ContentTab } from '../components/event-dashboard/analytics/ContentTab';
import { NetworkingTab } from '../components/event-dashboard/analytics/NetworkingTab';
import { ReportsTab } from '../components/event-dashboard/analytics/ReportsTab';
import { AlertsPrivacyTab } from '../components/event-dashboard/analytics/AlertsPrivacyTab';
import { ComparisonTab } from '../components/event-dashboard/analytics/ComparisonTab';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { getCurrentEventId } from '../lib/event-storage';

interface EventAnalyticsProps {
  onNavigate: (page: Page) => void;
}

export const EventAnalytics: React.FC<EventAnalyticsProps> = ({ onNavigate }) => {
  const eventId = getCurrentEventId();
  const [activeTab, setActiveTab] = useState('overview');
  const { analytics, isLoading, error, filters, setFilters, exportReport, scheduleReport } = useEventAnalytics({
    eventId,
    initialRange: '7d',
  });


  const currency = analytics?.currency || 'NGN';

  const tabs = useMemo(() => ([
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ticket-sales', label: 'Ticket Sales', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'financial', label: 'Financial', icon: Wallet },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'content', label: 'Content', icon: PlayCircle },
    { id: 'networking', label: 'Networking', icon: Users2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'comparison', label: 'Comparison', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts & Privacy', icon: ShieldCheck },
  ]), []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Button
                variant="ghost"
                onClick={() => onNavigate('event-dashboard')}
                className="h-8 px-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Analytics & Reporting</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor performance, engagement, and revenue across your event.</p>
          </div>
        </div>

        <AnalyticsFiltersBar filters={filters} options={analytics?.filters} onChange={setFilters} />

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-slate-500 dark:text-slate-400">{error}</p>
              </div>
            )}

            {!isLoading && analytics && (
              <>
                {activeTab === 'overview' && <AnalyticsOverviewTab analytics={analytics} currency={currency} />}
                {activeTab === 'ticket-sales' && <TicketSalesTab analytics={analytics} currency={currency} />}
                {activeTab === 'attendance' && <AttendanceTab analytics={analytics} />}
                {activeTab === 'engagement' && <EngagementTab analytics={analytics} />}
                {activeTab === 'financial' && <FinancialTab analytics={analytics} currency={currency} />}
                {activeTab === 'campaigns' && <CampaignsTab analytics={analytics} currency={currency} />}
                {activeTab === 'content' && <ContentTab analytics={analytics} />}
                {activeTab === 'networking' && <NetworkingTab analytics={analytics} />}
                {activeTab === 'reports' && (
                  <ReportsTab
                    analytics={analytics}
                    onExport={(format) => exportReport({ format })}
                    onSchedule={(format, recipients, cadence) =>
                      scheduleReport({ templateId: analytics.reports.templates[0]?.id || 'tpl-1', format, recipients, cadence })
                    }
                  />
                )}
                {activeTab === 'comparison' && <ComparisonTab analytics={analytics} />}
                {activeTab === 'alerts' && (
                  <AlertsPrivacyTab
                    analytics={analytics}
                    onToggle={() => {
                      /* placeholder for toggle mutation */
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
