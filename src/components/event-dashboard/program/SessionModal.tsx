import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Session, Speaker } from '../types';
import { X, Calendar, Clock, MapPin, Tag, Users, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../../ui/utils';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Partial<Session>) => void | Promise<void>;
  session?: Session;
  speakers: Speaker[];
}

export const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, session, speakers }) => {
  const [formData, setFormData] = useState<Partial<Session>>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    track: 'General',
    trackColor: '#6366f1',
    speakerIds: [],
  });

  const [isSelectingSpeakers, setIsSelectingSpeakers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData(session);
    } else {
      // Default to today or some logical default
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        track: 'General',
        trackColor: '#6366f1',
        speakerIds: [],
      });
    }
    setIsSelectingSpeakers(false);
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Basic validation for time
    if (formData.endTime <= formData.startTime!) {
       toast.error("End time must be after start time");
       return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpeaker = (speakerId: string) => {
    const currentIds = formData.speakerIds || [];
    if (currentIds.includes(speakerId)) {
      setFormData({ ...formData, speakerIds: currentIds.filter(id => id !== speakerId) });
    } else {
      setFormData({ ...formData, speakerIds: [...currentIds, speakerId] });
    }
  };

  const selectedSpeakers = speakers.filter(s => formData.speakerIds?.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {session ? 'Edit Session' : 'Add Session'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="session-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Desc */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Keynote: The Future of Tech"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this session about?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location / Room</label>
                 <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Hall A"
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time <span className="text-red-500">*</span></label>
                 <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                 </div>
               </div>
            </div>

            {/* Speakers */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speakers</label>
                    <button 
                        type="button"
                        onClick={() => setIsSelectingSpeakers(!isSelectingSpeakers)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        {isSelectingSpeakers ? 'Done Selecting' : 'Manage Speakers'}
                    </button>
                </div>
                
                {isSelectingSpeakers ? (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1">
                        {speakers.length === 0 ? (
                             <p className="text-xs text-slate-500 p-2 text-center">No speakers found. Add speakers first.</p>
                        ) : (
                            speakers.map(speaker => (
                                <div 
                                    key={speaker.id} 
                                    onClick={() => toggleSpeaker(speaker.id)}
                                    className={cn(
                                        "flex items-center p-2 rounded cursor-pointer transition-colors",
                                        formData.speakerIds?.includes(speaker.id) 
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    )}
                                >
                                    <div className={cn(
                                        "w-4 h-4 border rounded mr-3 flex items-center justify-center transition-colors",
                                        formData.speakerIds?.includes(speaker.id)
                                            ? "bg-indigo-600 border-indigo-600"
                                            : "border-slate-300 dark:border-slate-600"
                                    )}>
                                        {formData.speakerIds?.includes(speaker.id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            {speaker.imageUrl ? <img src={speaker.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-3 h-3 m-1.5 text-slate-400" />}
                                        </div>
                                        <span className="text-sm">{speaker.name}</span>
                                        <span className="text-xs text-slate-500 opacity-70"> - {speaker.role}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="min-h-[40px] border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex flex-wrap gap-2 bg-white dark:bg-slate-950">
                        {selectedSpeakers.length === 0 ? (
                            <span className="text-sm text-slate-400 px-1">No speakers selected</span>
                        ) : (
                            selectedSpeakers.map(s => (
                                <div key={s.id} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-xs border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 overflow-hidden">
                                        {s.imageUrl && <img src={s.imageUrl} className="w-full h-full object-cover" />}
                                    </div>
                                    <span>{s.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => toggleSpeaker(s.id)}
                                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 ml-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Track / Tag */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Track</label>
                <div className="flex gap-2">
                    <input 
                        type="color" 
                        value={formData.trackColor}
                        onChange={e => setFormData({...formData, trackColor: e.target.value})}
                        className="w-10 h-10 p-1 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer bg-white dark:bg-slate-950"
                    />
                    <input 
                        type="text" 
                        value={formData.track}
                        onChange={e => setFormData({...formData, track: e.target.value})}
                        placeholder="e.g. Workshop, Main Stage"
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
          <Button variant="ghost" onClick={onClose} type="button" disabled={isSaving}>Cancel</Button>
          <Button type="submit" form="session-form" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />{session ? 'Saving...' : 'Creating...'}</>
            ) : (
              session ? 'Save Changes' : 'Create Session'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
