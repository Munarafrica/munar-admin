// Program Service (Speakers & Sessions)
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { ApiResponse, MutationResponse, UploadResponse } from '../types/api';
import { Speaker, Session } from '../components/event-dashboard/types';
import { delay, mockSpeakers, mockSessions, generateId } from './mock/data';

class ProgramService {
  // ========== SPEAKERS ==========
  
  async getSpeakers(eventId: string): Promise<Speaker[]> {
    if (config.features.useMockData) {
      await delay(400);
      return mockSpeakers;
    }

    const response = await apiClient.get<ApiResponse<Speaker[]>>(`/events/${eventId}/speakers`);
    return response.data;
  }

  async getSpeaker(eventId: string, speakerId: string): Promise<Speaker> {
    if (config.features.useMockData) {
      await delay(300);
      const speaker = mockSpeakers.find(s => s.id === speakerId);
      if (!speaker) throw new Error('Speaker not found');
      return speaker;
    }

    const response = await apiClient.get<ApiResponse<Speaker>>(`/events/${eventId}/speakers/${speakerId}`);
    return response.data;
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

    const response = await apiClient.post<ApiResponse<Speaker>>(`/events/${eventId}/speakers`, data);
    return response.data;
  }

  async updateSpeaker(eventId: string, speakerId: string, data: Partial<Speaker>): Promise<Speaker> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockSpeakers.findIndex(s => s.id === speakerId);
      if (index === -1) throw new Error('Speaker not found');
      
      mockSpeakers[index] = { ...mockSpeakers[index], ...data };
      return mockSpeakers[index];
    }

    const response = await apiClient.patch<ApiResponse<Speaker>>(`/events/${eventId}/speakers/${speakerId}`, data);
    return response.data;
  }

  async deleteSpeaker(eventId: string, speakerId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockSpeakers.findIndex(s => s.id === speakerId);
      if (index !== -1) mockSpeakers.splice(index, 1);
      
      return { success: true, message: 'Speaker deleted successfully' };
    }

    return apiClient.delete<MutationResponse>(`/events/${eventId}/speakers/${speakerId}`);
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
  
  async getSessions(eventId: string, date?: string): Promise<Session[]> {
    if (config.features.useMockData) {
      await delay(400);
      
      if (date) {
        return mockSessions.filter(s => s.date === date);
      }
      return mockSessions;
    }

    const response = await apiClient.get<ApiResponse<Session[]>>(`/events/${eventId}/sessions`, {
      params: date ? { date } : undefined,
    });
    return response.data;
  }

  async getSession(eventId: string, sessionId: string): Promise<Session> {
    if (config.features.useMockData) {
      await delay(300);
      const session = mockSessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      return session;
    }

    const response = await apiClient.get<ApiResponse<Session>>(`/events/${eventId}/sessions/${sessionId}`);
    return response.data;
  }

  async createSession(eventId: string, data: Omit<Session, 'id'>): Promise<Session> {
    if (config.features.useMockData) {
      await delay(500);
      
      const newSession: Session = {
        id: generateId('ses'),
        ...data,
      };
      
      mockSessions.push(newSession);
      return newSession;
    }

    const response = await apiClient.post<ApiResponse<Session>>(`/events/${eventId}/sessions`, data);
    return response.data;
  }

  async updateSession(eventId: string, sessionId: string, data: Partial<Session>): Promise<Session> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockSessions.findIndex(s => s.id === sessionId);
      if (index === -1) throw new Error('Session not found');
      
      mockSessions[index] = { ...mockSessions[index], ...data };
      return mockSessions[index];
    }

    const response = await apiClient.patch<ApiResponse<Session>>(`/events/${eventId}/sessions/${sessionId}`, data);
    return response.data;
  }

  async deleteSession(eventId: string, sessionId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockSessions.findIndex(s => s.id === sessionId);
      if (index !== -1) mockSessions.splice(index, 1);
      
      return { success: true, message: 'Session deleted successfully' };
    }

    return apiClient.delete<MutationResponse>(`/events/${eventId}/sessions/${sessionId}`);
  }

  // Get all unique tracks for an event
  async getTracks(eventId: string): Promise<Array<{ name: string; color: string }>> {
    if (config.features.useMockData) {
      await delay(200);
      
      const tracks = new Map<string, string>();
      mockSessions.forEach(s => {
        if (s.track) {
          tracks.set(s.track, s.trackColor || '#8b5cf6');
        }
      });
      
      return Array.from(tracks.entries()).map(([name, color]) => ({ name, color }));
    }

    const response = await apiClient.get<ApiResponse<Array<{ name: string; color: string }>>>(`/events/${eventId}/tracks`);
    return response.data;
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
