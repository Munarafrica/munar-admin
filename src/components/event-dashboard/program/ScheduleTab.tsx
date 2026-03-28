import React, { useState } from 'react';
import { Session, Speaker } from '../types';
import { Button } from '../../ui/button';
import { Plus, Search, Calendar, MapPin, Users, Edit2, Trash2, Clock, MoreHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { SessionModal } from './SessionModal';
import { cn } from '../../ui/utils';

interface ScheduleTabProps {
  sessions: Session[];
  speakers: Speaker[];
  isLoading?: boolean;
  onAddSession: (session: Partial<Session>) => void | Promise<void>;
  onEditSession: (session: Session) => void | Promise<void>;
  onDeleteSession: (id: string) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ sessions, speakers, isLoading, onAddSession, onEditSession, onDeleteSession }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | 'all'>('all');

  const handleCreate = () => {
    setEditingSession(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleSave = (sessionData: Partial<Session>) => {
    if (editingSession) {
      onEditSession({ ...editingSession, ...sessionData } as Session);
    } else {
      onAddSession(sessionData);
    }
  };

  // Get unique dates
  const dates = Array.from(new Set(sessions.map(s => s.date))).sort();

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = selectedDate === 'all' || s.date === selectedDate;
    return matchesSearch && matchesDate;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Group by date if 'all' is selected
  const groupedSessions = selectedDate === 'all' 
    ? dates.reduce((acc, date) => {
        acc[date] = filteredSessions.filter(s => s.date === date);
        return acc;
      }, {} as Record<string, Session[]>)
    : { [selectedDate]: filteredSessions };

  const getSpeakerAvatars = (speakerIds: string[]) => {
    const sessionSpeakers = speakers.filter(s => speakerIds.includes(s.id));
    return sessionSpeakers.slice(0, 3).map((s, i) => (
      <div 
        key={s.id} 
        className={cn(
            "w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden",
            i > 0 ? "-ml-2" : ""
        )}
        title={s.name}
      >
         {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-3 h-3 m-1 text-slate-400" />}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Search sessions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
            </div>
            
            <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedDate('all')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap",
                        selectedDate === 'all' 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                >
                    All Days
                </button>
                {dates.map(date => (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap",
                            selectedDate === date 
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        )}
                    >
                        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </button>
                ))}
            </div>
        </div>

        <Button 
            onClick={handleCreate} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none whitespace-nowrap"
        >
            <Plus className="w-4 h-4" />
            Add Session
        </Button>
      </div>

      {/* Schedule List */}
      <div className="space-y-8">
        {isLoading ? (
             <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
             </div>
        ) : Object.keys(groupedSessions).length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No sessions found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">Start building your event agenda by adding sessions.</p>
                <Button onClick={handleCreate} className="mt-4 bg-indigo-600 text-white">Create Session</Button>
            </div>
        ) : (
            Object.entries(groupedSessions).map(([date, daySessions]) => (
                <div key={date} className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    <div className="space-y-3">
                        {daySessions.map((session) => (
                            <div 
                                key={session.id} 
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-900"
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Time Column */}
                                    <div className="sm:w-32 flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-1 text-sm">
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{session.startTime}</span>
                                        <span className="text-slate-400 text-xs hidden sm:inline">to</span>
                                        <span className="text-slate-500 dark:text-slate-400 sm:text-xs">{session.endTime}</span>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {session.track && (
                                                        <span 
                                                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white"
                                                            style={{ backgroundColor: session.trackColor || '#6366f1' }}
                                                        >
                                                            {session.track}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{session.title}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{session.description}</p>
                                            </div>
                                            
                                            {/* Action Buttons (Desktop) */}
                                            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button onClick={() => handleEdit(session)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDeleteSession(session.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                {session.location && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {session.location}
                                                    </div>
                                                )}
                                                
                                                {session.speakerIds.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex pl-1">
                                                            {getSpeakerAvatars(session.speakerIds)}
                                                        </div>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {session.speakerIds.length} Speaker{session.speakerIds.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mobile Actions Menu Trigger */}
                                            <div className="sm:hidden">
                                                <button onClick={() => handleEdit(session)} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                    Edit Session
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>

      <SessionModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         session={editingSession}
         speakers={speakers}
      />
    </div>
  );
};
