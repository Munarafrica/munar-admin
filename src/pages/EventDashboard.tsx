import React, { useState } from 'react';
import { TopBar } from "../components/dashboard/TopBar";
import { EventHeader } from "../components/event-dashboard/EventHeader";
import { OverviewAnalytics } from "../components/event-dashboard/OverviewAnalytics";
import { SmartSetupChecklist } from "../components/event-dashboard/SmartSetupChecklist";
import { ModulesHub } from "../components/event-dashboard/ModulesHub";
import { ActivityFeed } from "../components/event-dashboard/ActivityFeed";
import { EventPhase } from "../components/event-dashboard/types";
import { Page } from "../App";
import { useEvent } from '../contexts/EventContext';

interface EventDashboardProps {
  onNavigate?: (page: Page) => void;
}

export const EventDashboard: React.FC<EventDashboardProps> = ({ onNavigate }) => {
  const [phase] = useState<EventPhase>('setup');

  // Use data already fetched by EventResolver → EventContext
  // (no duplicate network calls, no silent swallowed errors)
  const {
    currentEvent: event,
    metrics,
    checklist: checklistItems,
    modules,
    activities,
    isLoading,
    error,
    publishEvent,
    unpublishEvent,
  } = useEvent();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8 space-y-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
              <span className="text-sm">Loading event...</span>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
              <p className="text-red-600 dark:text-red-400 font-medium">Failed to load event</p>
              <p className="text-sm text-red-500 dark:text-red-500 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && event && (
          <>
            {/* Header */}
            <section>
              <EventHeader 
                event={event} 
                onPublish={publishEvent}
                onUnpublish={unpublishEvent}
                onNavigate={onNavigate}
              />
            </section>

            {/* Dashboard Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-full">
                <SmartSetupChecklist items={checklistItems} className="h-full" onNavigate={onNavigate} />
              </div>
              <div className="lg:col-span-2 h-full">
                <OverviewAnalytics metrics={metrics} phase={phase} onNavigate={onNavigate} />
              </div>
            </section>

            {/* Modules */}
            <section>
              <ModulesHub modules={modules} onNavigate={onNavigate} />
            </section>

            {/* Activity */}
            <section>
              <ActivityFeed activities={activities} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default EventDashboard;
