import React, { useState } from 'react';
import { TopBar } from "../components/dashboard/TopBar";
import { Speaker, Session } from "../components/event-dashboard/types";
import { Button } from "../components/ui/button";
import { ChevronLeft } from 'lucide-react';
import { SpeakersTab } from "../components/event-dashboard/program/SpeakersTab";
import { ScheduleTab } from "../components/event-dashboard/program/ScheduleTab";
import { eventsService } from "../services";
import { useEventId } from "../lib/navigation";
import { useProgram } from "../hooks/useProgram";
import { useEvent } from "../contexts";
import { toast } from 'sonner';
import { Page } from "../App";

interface ProgramManagementProps {
  onNavigate?: (page: Page) => void;
  mode?: 'schedule' | 'speakers';
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({ onNavigate, mode = 'schedule' }) => {
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
    type: 'speaker' | 'session';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isSpeakersMode = mode === 'speakers';
  const pageTitle = isSpeakersMode ? 'People & Speakers' : 'Schedule & Agenda';
  const eventId = useEventId();
  const { currentEvent } = useEvent();

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
    fetchSessions,
  } = useProgram({ eventId, autoFetch: !!eventId, eventTimezone: currentEvent?.timezone });

  // --- Speaker Actions ---
  const handleAddSpeaker = async (newSpeaker: Partial<Speaker>) => {
    if (!eventId) { toast.error('No event selected'); throw new Error('No event'); }
    const { id: _id, ...data } = newSpeaker as Speaker;
    const created = await createSpeaker({ categories: [], isFeatured: false, name: '', role: '', bio: '', ...data });
    if (!created) { toast.error('Failed to add speaker'); throw new Error('Failed'); }
    await fetchSpeakers();
    toast.success(`Speaker "${created.name}" added`);
    eventsService.updateModuleCount(eventId, 'People & Speakers', speakers.length + 1, `Added speaker "${created.name}"`, 'mic');
  };

  const handleEditSpeaker = async (updatedSpeaker: Speaker) => {
    const updated = await updateSpeaker(updatedSpeaker.id, updatedSpeaker);
    if (!updated) { toast.error('Failed to update speaker'); throw new Error('Failed'); }
    toast.success('Speaker updated');
  };

  const handleDeleteSpeaker = async (id: string) => {
    const speaker = speakers.find(item => item.id === id);
    setPendingDelete({
      id,
      name: speaker?.name || 'this speaker',
      type: 'speaker',
    });
  };

  // --- Session Actions ---
  const handleAddSession = async (newSession: Partial<Session>) => {
    if (!eventId) { toast.error('No event selected'); throw new Error('No event'); }
    const { id: _id, ...data } = newSession as Session;
    const created = await createSession({ title: '', description: '', date: '', startTime: '', endTime: '', speakerIds: [], ...data });
    if (!created) { toast.error('Failed to add session'); throw new Error('Failed'); }
    await fetchSessions();
    toast.success(`Session "${created.title}" added`);
    eventsService.updateModuleCount(eventId, 'Schedule & Agenda', sessions.length + 1, `Added session "${created.title}"`, 'calendar');
  };

  const handleEditSession = async (updatedSession: Session) => {
    const updated = await updateSession(updatedSession.id, updatedSession);
    if (!updated) { toast.error('Failed to update session'); throw new Error('Failed'); }
    toast.success('Session updated');
  };

  const handleDeleteSession = async (id: string) => {
    const session = sessions.find(item => item.id === id);
    setPendingDelete({
      id,
      name: session?.title || 'this session',
      type: 'session',
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      if (pendingDelete.type === 'speaker') {
        const ok = await deleteSpeaker(pendingDelete.id);
        if (!ok) { toast.error('Failed to delete speaker'); return; }
        toast.success('Speaker removed');
        eventsService.updateModuleCount(eventId, 'People & Speakers', Math.max(0, speakers.length - 1), 'Speaker removed', 'mic');
      } else {
        const ok = await deleteSession(pendingDelete.id);
        if (!ok) { toast.error('Failed to delete session'); return; }
        toast.success('Session removed');
        eventsService.updateModuleCount(eventId, 'Schedule & Agenda', Math.max(0, sessions.length - 1), 'Session removed', 'calendar');
      }

      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
                </div>
            </div>

            {!eventId ? (
              <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                No event selected. Please open an event first.
              </div>
            ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col transition-colors">
                {/* Error banner */}
                {error && (
                  <div className="mx-6 mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {/* Module Content */}
                <div className="p-6 flex-1">
                    {isSpeakersMode ? (
                        <SpeakersTab 
                            speakers={speakers}
                            sessions={sessions}
                            isLoading={isLoadingSpeakers}
                            onAddSpeaker={handleAddSpeaker}
                            onEditSpeaker={handleEditSpeaker}
                            onDeleteSpeaker={handleDeleteSpeaker}
                            onSearchSpeakers={fetchSpeakers}
                        />
                    ) : (
                        <ScheduleTab
                            sessions={sessions}
                            speakers={speakers}
                            isLoading={isLoadingSessions}
                            onAddSession={handleAddSession}
                            onEditSession={handleEditSession}
                            onDeleteSession={handleDeleteSession}
                            onSearchSessions={fetchSessions}
                            onManageSpeakers={() => onNavigate?.('program-speakers-management')}
                        />
                    )}
                </div>
            </div>
            )}
       </main>

       {pendingDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (!isDeleting) {
                  setPendingDelete(null);
                }
              }}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-100 px-6 py-8 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delete {pendingDelete.type === 'speaker' ? 'Speaker' : 'Session'}?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {pendingDelete.type === 'speaker'
                    ? `This will permanently delete "${pendingDelete.name}" and remove them from any assigned sessions.`
                    : `This will permanently delete "${pendingDelete.name}" from this event schedule.`}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setPendingDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void handleConfirmDelete()}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : `Delete ${pendingDelete.type === 'speaker' ? 'Speaker' : 'Session'}`}
                </Button>
              </div>
            </div>
          </div>
       )}
    </div>
  );
};

export default ProgramManagement;
