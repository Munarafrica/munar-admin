import React, { useState } from 'react';
import { Speaker, Session } from '../types';
import { Button } from '../../ui/button';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Linkedin, Twitter, Globe, User, Copy, Loader2 } from 'lucide-react';
import { SpeakerModal } from './SpeakerModal';
import { cn } from '../../ui/utils';

interface SpeakersTabProps {
  speakers: Speaker[];
  sessions: Session[];
  isLoading?: boolean;
  onAddSpeaker: (speaker: Partial<Speaker>) => void | Promise<void>;
  onEditSpeaker: (speaker: Speaker) => void | Promise<void>;
  onDeleteSpeaker: (id: string) => void;
}

export const SpeakersTab: React.FC<SpeakersTabProps> = ({ speakers, sessions, isLoading, onAddSpeaker, onEditSpeaker, onDeleteSpeaker }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    setEditingSpeaker(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setIsModalOpen(true);
  };

  const handleSave = (speakerData: Partial<Speaker>) => {
    if (editingSpeaker) {
      onEditSpeaker({ ...editingSpeaker, ...speakerData } as Speaker);
    } else {
      onAddSpeaker(speakerData);
    }
  };

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSessionCount = (speakerId: string) => {
    return sessions.filter(session => session.speakerIds.includes(speakerId)).length;
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search speakers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 gap-2">
                <Filter className="w-4 h-4" />
                Filter
            </Button>
            <Button 
                onClick={handleCreate} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
            >
                <Plus className="w-4 h-4" />
                Add Speaker
            </Button>
        </div>
      </div>

      {/* Grid / List */}
      {isLoading ? (
          <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
      ) : filteredSpeakers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No speakers found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  {searchQuery ? "Try adjusting your search terms." : "Add your first speaker to get started."}
              </p>
              {!searchQuery && (
                  <Button onClick={handleCreate} className="mt-4 bg-indigo-600 text-white">Add Speaker</Button>
              )}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpeakers.map((speaker) => (
                  <div key={speaker.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700">
                                  {speaker.imageUrl ? (
                                      <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                          <User className="w-6 h-6" />
                                      </div>
                                  )}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1" title={speaker.name}>{speaker.name}</h3>
                                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-0.5 line-clamp-1" title={speaker.role}>{speaker.role}</p>
                                  {speaker.organization && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1" title={speaker.organization}>{speaker.organization}</p>
                                  )}
                              </div>
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                                  <button onClick={() => handleEdit(speaker)} className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                      <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => onDeleteSpeaker(speaker.id)} className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 text-xs leading-relaxed">
                          {speaker.bio || "No bio available."}
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                           <div className="flex gap-2">
                               {speaker.linkedInUrl && <a href={speaker.linkedInUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0077b5]"><Linkedin className="w-4 h-4" /></a>}
                               {speaker.twitterUrl && <a href={speaker.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1DA1F2]"><Twitter className="w-4 h-4" /></a>}
                               {speaker.websiteUrl && <a href={speaker.websiteUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500"><Globe className="w-4 h-4" /></a>}
                           </div>

                           <div className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                               {getSessionCount(speaker.id)} Session{getSessionCount(speaker.id) !== 1 ? 's' : ''}
                           </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <SpeakerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        speaker={editingSpeaker} 
      />
    </div>
  );
};
