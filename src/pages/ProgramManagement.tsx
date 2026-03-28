import React, { useState } from 'react';
import { TopBar } from "../components/dashboard/TopBar";
import { Page, Speaker, Session } from "../components/event-dashboard/types";
import { Button } from "../components/ui/button";
import { Users, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from "../components/ui/utils";
import { SpeakersTab } from "../components/event-dashboard/program/SpeakersTab";
import { ScheduleTab } from "../components/event-dashboard/program/ScheduleTab";
import { eventsService } from "../services";
import { getCurrentEventId } from "../lib/event-storage";
import { useProgram } from "../hooks/useProgram";
import { toast } from 'sonner@2.0.3';

interface ProgramManagementProps {
  onNavigate?: (page: Page) => void;
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'speakers' | 'schedule'>('speakers');
  const eventId = getCurrentEventId() ?? '';

  const {
    speakers,
    sessions,
    isLoadingSpeakers,
    isLoadingSessions,
    error,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    fetchSpeakers,
    createSession,
    updateSession,
    deleteSession,
  } = useProgram({ eventId, autoFetch: !!eventId });

  // --- Speaker Actions ---
  const handleAddSpeaker = async (newSpeaker: Partial<Speaker>) => {
    if (!eventId) { toast.error('No event selected'); throw new Error('No event'); }
    const { id: _id, ...data } = newSpeaker as Speaker;
    const created = await createSpeaker({ categories: [], isFeatured: false, name: '', role: '', bio: '', ...data });
    if (!created) { toast.error('Failed to add speaker'); throw new Error('Failed'); }
    toast.success(`Speaker "${created.name}" added`);
    eventsService.updateModuleCount(eventId, 'People & Speakers', speakers.length + 1, `Added speaker "${created.name}"`, 'mic');
  };

  const handleEditSpeaker = async (updatedSpeaker: Speaker) => {
    const updated = await updateSpeaker(updatedSpeaker.id, updatedSpeaker);
    if (!updated) { toast.error('Failed to update speaker'); throw new Error('Failed'); }
    toast.success('Speaker updated');
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!window.confirm('Are you sure? This will remove them from any assigned sessions.')) return;
    const ok = await deleteSpeaker(id);
    if (!ok) { toast.error('Failed to delete speaker'); return; }
    toast.success('Speaker removed');
    eventsService.updateModuleCount(eventId, 'People & Speakers', Math.max(0, speakers.length - 1), 'Speaker removed', 'mic');
  };

  // --- Session Actions ---
  const handleAddSession = async (newSession: Partial<Session>) => {
    if (!eventId) { toast.error('No event selected'); throw new Error('No event'); }
    const { id: _id, ...data } = newSession as Session;
    const created = await createSession({ title: '', description: '', date: '', startTime: '', endTime: '', speakerIds: [], ...data });
    if (!created) { toast.error('Failed to add session'); throw new Error('Failed'); }
    toast.success(`Session "${created.title}" added`);
    eventsService.updateModuleCount(eventId, 'Schedule & Agenda', sessions.length + 1, `Added session "${created.title}"`, 'calendar');
  };

  const handleEditSession = async (updatedSession: Session) => {
    const updated = await updateSession(updatedSession.id, updatedSession);
    if (!updated) { toast.error('Failed to update session'); throw new Error('Failed'); }
    toast.success('Session updated');
  };

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('Delete this session?')) return;
    const ok = await deleteSession(id);
    if (!ok) { toast.error('Failed to delete session'); return; }
    toast.success('Session removed');
    eventsService.updateModuleCount(eventId, 'Schedule & Agenda', Math.max(0, sessions.length - 1), 'Session removed', 'calendar');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
       <TopBar onNavigate={onNavigate} />
       
       <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                        <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Program Management</h1>
                </div>
            </div>

            {!eventId ? (
              <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                No event selected. Please open an event first.
              </div>
            ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col transition-colors">
                {/* Tabs Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('speakers')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                            activeTab === 'speakers' 
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Speakers
                        {isLoadingSpeakers && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                            activeTab === 'schedule' 
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                    >
                        <Calendar className="w-4 h-4" />
                        Schedule
                        {isLoadingSessions && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                    </button>
                </div>

                {/* Error banner */}
                {error && (
                  <div className="mx-6 mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {/* Tab Content */}
                <div className="p-6 flex-1">
                    {activeTab === 'speakers' && (
                        <SpeakersTab 
                            speakers={speakers}
                            sessions={sessions}
                            isLoading={isLoadingSpeakers}
                            onAddSpeaker={handleAddSpeaker}
                            onEditSpeaker={handleEditSpeaker}
                            onDeleteSpeaker={handleDeleteSpeaker}
                        />
                    )}

                    {activeTab === 'schedule' && (
                        <ScheduleTab
                            sessions={sessions}
                            speakers={speakers}
                            isLoading={isLoadingSessions}
                            onAddSession={handleAddSession}
                            onEditSession={handleEditSession}
                            onDeleteSession={handleDeleteSession}
                        />
                    )}
                </div>
            </div>
            )}
       </main>
    </div>
  );
};

export default ProgramManagement;
