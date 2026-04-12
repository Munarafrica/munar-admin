// Program Service (Speakers & Sessions)
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { ApiResponse, MutationResponse, UploadResponse } from '../types/api';
import { Speaker, Session } from '../components/event-dashboard/types';
import { delay, mockSpeakers, mockSessions, generateId } from './mock/data';

export interface SpeakerQuery {
  search?: string;
  isFeatured?: boolean;
}

export interface SessionQuery {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  track?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

type BackendSpeaker = {
  id: string;
  eventId: string;
  fullName: string;
  jobTitle: string | null;
  organization: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type BackendSessionSpeaker = BackendSpeaker & {
  sessionRole: string | null;
  sessionSortOrder: number;
};

type BackendSession = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
  track: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  speakers: BackendSessionSpeaker[];
};

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
};

const toDateInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toTimeInput = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtc - date.getTime();
};

const combineDateTime = (date: string, time: string, timeZone?: string): string => {
  if (!date || !time) return '';

  if (!timeZone) {
    return new Date(`${date}T${time}`).toISOString();
  }

  try {
    const utcGuess = new Date(`${date}T${time}:00.000Z`);
    const offset = getTimeZoneOffsetMs(utcGuess, timeZone);
    return new Date(utcGuess.getTime() - offset).toISOString();
  } catch {
    return new Date(`${date}T${time}`).toISOString();
  }
};

const normalizeSpeaker = (speaker: BackendSpeaker | Speaker): Speaker => {
  if ('fullName' in speaker) {
    return {
      id: speaker.id,
      name: speaker.fullName,
      role: speaker.jobTitle ?? '',
      organization: speaker.organization ?? '',
      bio: speaker.bio ?? '',
      imageUrl: speaker.profilePhotoUrl ?? undefined,
      linkedInUrl: speaker.linkedinUrl ?? undefined,
      twitterUrl: speaker.twitterUrl ?? undefined,
      websiteUrl: speaker.websiteUrl ?? undefined,
      categories: [],
      isFeatured: speaker.isFeatured,
    };
  }

  return {
    ...speaker,
    role: speaker.role ?? '',
    bio: speaker.bio ?? '',
    categories: speaker.categories ?? [],
    isFeatured: speaker.isFeatured ?? false,
  };
};

const normalizeSession = (session: BackendSession | Session): Session => {
  if ('startsAt' in session) {
    return {
      id: session.id,
      title: session.title,
      description: session.description ?? '',
      date: toDateInput(session.startsAt),
      startTime: toTimeInput(session.startsAt),
      endTime: toTimeInput(session.endsAt),
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      location: session.location ?? '',
      track: session.track ?? 'General',
      trackColor: '#6366f1',
      speakerIds: session.speakers?.map(speaker => speaker.id) ?? [],
      status: session.status,
      speakers: session.speakers?.map(normalizeSpeaker) ?? [],
    };
  }

  return {
    ...session,
    description: session.description ?? '',
    track: session.track ?? 'General',
    trackColor: session.trackColor ?? '#6366f1',
    speakerIds: session.speakerIds ?? [],
    status: session.status ?? 'DRAFT',
  };
};

const toSpeakerPayload = (data: Partial<Speaker>) => ({
  fullName: data.name?.trim() ?? '',
  jobTitle: data.role?.trim() || null,
  organization: data.organization?.trim() || null,
  bio: data.bio?.trim() || null,
  profilePhotoUrl: data.imageUrl || null,
  linkedinUrl: data.linkedInUrl || null,
  twitterUrl: data.twitterUrl || null,
  websiteUrl: data.websiteUrl || null,
  isFeatured: data.isFeatured ?? false,
});

const toSessionPayload = (data: Partial<Session>, timeZone?: string) => {
  const startsAt = data.startsAt || combineDateTime(data.date ?? '', data.startTime ?? '', timeZone);
  const endsAt = data.endsAt || combineDateTime(data.date ?? '', data.endTime ?? '', timeZone);

  return {
    title: data.title?.trim() ?? '',
    description: data.description?.trim() || null,
    startsAt,
    endsAt,
    location: data.location?.trim() || null,
    track: data.track?.trim() || 'General',
    status: data.status ?? 'DRAFT',
    speakerIds: data.speakerIds ?? [],
  };
};

class ProgramService {
  // ========== SPEAKERS ==========

  async getSpeakers(eventId: string, params?: SpeakerQuery): Promise<Speaker[]> {
    if (config.features.useMockData) {
      await delay(400);
      return mockSpeakers
        .filter(speaker => !params?.search || `${speaker.name} ${speaker.role} ${speaker.organization ?? ''}`.toLowerCase().includes(params.search.toLowerCase()))
        .filter(speaker => params?.isFeatured === undefined || speaker.isFeatured === params.isFeatured);
    }

    const response = await apiClient.get<ApiResponse<BackendSpeaker[]> | BackendSpeaker[]>(`/events/${eventId}/speakers`, {
      params,
    });
    return unwrap(response).map(normalizeSpeaker);
  }

  async getSpeaker(_eventId: string, speakerId: string): Promise<Speaker> {
    if (config.features.useMockData) {
      await delay(300);
      const speaker = mockSpeakers.find(s => s.id === speakerId);
      if (!speaker) throw new Error('Speaker not found');
      return speaker;
    }

    const response = await apiClient.get<ApiResponse<BackendSpeaker> | BackendSpeaker>(`/speakers/${speakerId}`);
    return normalizeSpeaker(unwrap(response));
  }

  async createSpeaker(eventId: string, data: Omit<Speaker, 'id'>): Promise<Speaker> {
    if (config.features.useMockData) {
      await delay(500);

      const newSpeaker: Speaker = {
        id: generateId('spk'),
        ...data,
      };

      mockSpeakers.push(newSpeaker);
      return newSpeaker;
    }

    const response = await apiClient.post<ApiResponse<BackendSpeaker> | BackendSpeaker>(`/events/${eventId}/speakers`, toSpeakerPayload(data));
    return normalizeSpeaker(unwrap(response));
  }

  async updateSpeaker(_eventId: string, speakerId: string, data: Partial<Speaker>): Promise<Speaker> {
    if (config.features.useMockData) {
      await delay(400);

      const index = mockSpeakers.findIndex(s => s.id === speakerId);
      if (index === -1) throw new Error('Speaker not found');

      mockSpeakers[index] = { ...mockSpeakers[index], ...data };
      return mockSpeakers[index];
    }

    const response = await apiClient.patch<ApiResponse<BackendSpeaker> | BackendSpeaker>(`/speakers/${speakerId}`, toSpeakerPayload(data));
    return normalizeSpeaker(unwrap(response));
  }

  async deleteSpeaker(_eventId: string, speakerId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);

      const index = mockSpeakers.findIndex(s => s.id === speakerId);
      if (index !== -1) mockSpeakers.splice(index, 1);

      return { success: true, message: 'Speaker deleted successfully' };
    }

    await apiClient.delete(`/speakers/${speakerId}`);
    return { success: true, message: 'Speaker deleted successfully' };
  }

  async uploadSpeakerImage(eventId: string, speakerId: string, file: File): Promise<UploadResponse> {
    if (config.features.useMockData) {
      await delay(800);
      return {
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      };
    }

    return apiClient.upload<UploadResponse>(`/events/${eventId}/speakers/${speakerId}/image`, file);
  }

  // ========== SESSIONS ==========

  async getSessions(eventId: string, params?: SessionQuery): Promise<Session[]> {
    if (config.features.useMockData) {
      await delay(400);

      return mockSessions
        .filter(session => !params?.search || `${session.title} ${session.description} ${session.location ?? ''} ${session.track ?? ''}`.toLowerCase().includes(params.search.toLowerCase()))
        .filter(session => {
          if (!params?.dateFrom || !params?.dateTo) return true;
          const startsAt = combineDateTime(session.date, session.startTime);
          return startsAt >= params.dateFrom && startsAt <= params.dateTo;
        });
    }

    const response = await apiClient.get<ApiResponse<BackendSession[]> | BackendSession[]>(`/events/${eventId}/sessions`, {
      params,
    });
    return unwrap(response).map(normalizeSession);
  }

  async getSession(_eventId: string, sessionId: string): Promise<Session> {
    if (config.features.useMockData) {
      await delay(300);
      const session = mockSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      return session;
    }

    const response = await apiClient.get<ApiResponse<BackendSession> | BackendSession>(`/sessions/${sessionId}`);
    return normalizeSession(unwrap(response));
  }

  async createSession(eventId: string, data: Omit<Session, 'id'>, timeZone?: string): Promise<Session> {
    if (config.features.useMockData) {
      await delay(500);

      const newSession: Session = {
        id: generateId('ses'),
        ...data,
      };

      mockSessions.push(newSession);
      return newSession;
    }

    const response = await apiClient.post<ApiResponse<BackendSession> | BackendSession>(`/events/${eventId}/sessions`, toSessionPayload(data, timeZone));
    return normalizeSession(unwrap(response));
  }

  async updateSession(_eventId: string, sessionId: string, data: Partial<Session>, timeZone?: string): Promise<Session> {
    if (config.features.useMockData) {
      await delay(400);

      const index = mockSessions.findIndex(s => s.id === sessionId);
      if (index === -1) throw new Error('Session not found');

      mockSessions[index] = { ...mockSessions[index], ...data };
      return mockSessions[index];
    }

    const response = await apiClient.patch<ApiResponse<BackendSession> | BackendSession>(`/sessions/${sessionId}`, toSessionPayload(data, timeZone));
    return normalizeSession(unwrap(response));
  }

  async deleteSession(_eventId: string, sessionId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);

      const index = mockSessions.findIndex(s => s.id === sessionId);
      if (index !== -1) mockSessions.splice(index, 1);

      return { success: true, message: 'Session deleted successfully' };
    }

    await apiClient.delete(`/sessions/${sessionId}`);
    return { success: true, message: 'Session deleted successfully' };
  }

  // Get all unique tracks for an event
  async getTracks(eventId: string): Promise<Array<{ name: string; color: string }>> {
    const sessions = await this.getSessions(eventId);
    const tracks = new Map<string, string>();
    sessions.forEach(session => {
      if (session.track) {
        tracks.set(session.track, session.trackColor || '#6366f1');
      }
    });

    return Array.from(tracks.entries()).map(([name, color]) => ({ name, color }));
  }

  // Get schedule by date (grouped sessions)
  async getScheduleByDate(eventId: string): Promise<Record<string, Session[]>> {
    const sessions = await this.getSessions(eventId);

    const grouped: Record<string, Session[]> = {};
    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });

    // Sort sessions within each date by start time
    Object.values(grouped).forEach(daySessions => {
      daySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }
}

export const programService = new ProgramService();
