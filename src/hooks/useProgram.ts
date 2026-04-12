// Program Hook - fetch and manage speakers & sessions
import { useState, useEffect, useCallback } from 'react';
import { programService } from '../services';
import { SpeakerQuery, SessionQuery } from '../services/program.service';
import { Speaker, Session } from '../components/event-dashboard/types';

interface UseProgramOptions {
  eventId: string;
  autoFetch?: boolean;
  eventTimezone?: string;
}

interface UseProgramReturn {
  // Speakers
  speakers: Speaker[];
  isLoadingSpeakers: boolean;
  
  // Sessions
  sessions: Session[];
  isLoadingSessions: boolean;
  
  // Tracks
  tracks: Array<{ name: string; color: string }>;
  
  // Common
  error: string | null;
  
  // Speaker Actions
  fetchSpeakers: (params?: SpeakerQuery) => Promise<void>;
  createSpeaker: (data: Omit<Speaker, 'id'>) => Promise<Speaker | null>;
  updateSpeaker: (speakerId: string, data: Partial<Speaker>) => Promise<Speaker | null>;
  deleteSpeaker: (speakerId: string) => Promise<boolean>;
  
  // Session Actions
  fetchSessions: (params?: SessionQuery) => Promise<void>;
  createSession: (data: Omit<Session, 'id'>) => Promise<Session | null>;
  updateSession: (sessionId: string, data: Partial<Session>) => Promise<Session | null>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  
  // Schedule grouped by date
  scheduleByDate: Record<string, Session[]>;
  fetchScheduleByDate: () => Promise<void>;
}

export function useProgram({ eventId, autoFetch = true, eventTimezone }: UseProgramOptions): UseProgramReturn {
  // Speakers state
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(autoFetch);
  
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(autoFetch);
  
  // Tracks
  const [tracks, setTracks] = useState<Array<{ name: string; color: string }>>([]);
  
  // Schedule by date
  const [scheduleByDate, setScheduleByDate] = useState<Record<string, Session[]>>({});
  
  // Error
  const [error, setError] = useState<string | null>(null);

  // ========== SPEAKER METHODS ==========
  
  const fetchSpeakers = useCallback(async (params?: SpeakerQuery) => {
    setIsLoadingSpeakers(true);
    setError(null);
    
    try {
      const data = await programService.getSpeakers(eventId, params);
      setSpeakers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch speakers');
    } finally {
      setIsLoadingSpeakers(false);
    }
  }, [eventId]);

  const createSpeaker = useCallback(async (data: Omit<Speaker, 'id'>): Promise<Speaker | null> => {
    try {
      setError(null);
      const newSpeaker = await programService.createSpeaker(eventId, data);
      setSpeakers(prev => [...prev, newSpeaker]);
      return newSpeaker;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create speaker');
      return null;
    }
  }, [eventId]);

  const updateSpeaker = useCallback(async (speakerId: string, data: Partial<Speaker>): Promise<Speaker | null> => {
    try {
      setError(null);
      const updated = await programService.updateSpeaker(eventId, speakerId, data);
      setSpeakers(prev => prev.map(s => s.id === speakerId ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update speaker');
      return null;
    }
  }, [eventId]);

  const deleteSpeaker = useCallback(async (speakerId: string): Promise<boolean> => {
    try {
      setError(null);
      await programService.deleteSpeaker(eventId, speakerId);
      setSpeakers(prev => prev.filter(s => s.id !== speakerId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete speaker');
      return false;
    }
  }, [eventId]);

  // ========== SESSION METHODS ==========
  
  const fetchSessions = useCallback(async (params?: SessionQuery) => {
    setIsLoadingSessions(true);
    setError(null);
    
    try {
      const sessionsData = await programService.getSessions(eventId, params);
      const tracksData = Array.from(new Map(
        sessionsData
          .filter(session => session.track)
          .map(session => [session.track!, session.trackColor || '#6366f1'] as const)
      ).entries()).map(([name, color]) => ({ name, color }));
      setSessions(sessionsData);
      setTracks(tracksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [eventId]);

  const createSession = useCallback(async (data: Omit<Session, 'id'>): Promise<Session | null> => {
    try {
      setError(null);
      const newSession = await programService.createSession(eventId, data, eventTimezone);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  }, [eventId, eventTimezone]);

  const updateSession = useCallback(async (sessionId: string, data: Partial<Session>): Promise<Session | null> => {
    try {
      setError(null);
      const updated = await programService.updateSession(eventId, sessionId, data, eventTimezone);
      setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      return null;
    }
  }, [eventId, eventTimezone]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      setError(null);
      await programService.deleteSession(eventId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      return false;
    }
  }, [eventId]);

  const fetchScheduleByDate = useCallback(async () => {
    try {
      const grouped = await programService.getScheduleByDate(eventId);
      setScheduleByDate(grouped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    }
  }, [eventId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchSpeakers();
      fetchSessions();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    speakers,
    isLoadingSpeakers,
    sessions,
    isLoadingSessions,
    tracks,
    error,
    fetchSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    scheduleByDate,
    fetchScheduleByDate,
  };
}
