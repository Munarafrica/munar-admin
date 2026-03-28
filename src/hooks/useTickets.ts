// Tickets Hook - fetch and manage tickets for an event
import { useState, useEffect, useCallback } from 'react';
import { ticketsService } from '../services';
import { TicketType, Attendee } from '../components/event-dashboard/types';
import { PaginatedResponse, SearchParams } from '../types/api';

interface UseTicketsOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseTicketsReturn {
  // Tickets
  tickets: TicketType[];
  isLoading: boolean;
  error: string | null;
  
  // Attendees
  attendees: Attendee[];
  attendeesMeta: PaginatedResponse<Attendee>['meta'] | null;
  isLoadingAttendees: boolean;
  
  // Ticket Actions
  fetchTickets: () => Promise<void>;
  createTicket: (data: Partial<TicketType>) => Promise<TicketType | null>;
  updateTicket: (ticketId: string, data: Partial<TicketType>) => Promise<TicketType | null>;
  deleteTicket: (ticketId: string) => Promise<boolean>;
  duplicateTicket: (ticketId: string) => Promise<TicketType | null>;
  
  // Attendee Actions
  fetchAttendees: (params?: SearchParams) => Promise<void>;
  checkInAttendee: (attendeeId: string) => Promise<boolean>;
  undoCheckIn: (attendeeId: string) => Promise<boolean>;
  exportAttendees: (format?: 'csv' | 'xlsx') => Promise<void>;
  
  // Analytics
  analytics: {
    totalRevenue: number;
    totalSold: number;
    totalAvailable: number;
  } | null;
  fetchAnalytics: () => Promise<void>;
}

export function useTickets({ eventId, autoFetch = true }: UseTicketsOptions): UseTicketsReturn {
  // Tickets state
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  // Attendees state
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesMeta, setAttendeesMeta] = useState<PaginatedResponse<Attendee>['meta'] | null>(null);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalRevenue: number;
    totalSold: number;
    totalAvailable: number;
  } | null>(null);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ticketsService.getTickets(eventId);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Create ticket
  const createTicket = useCallback(async (data: Partial<TicketType>): Promise<TicketType | null> => {
    try {
      const newTicket = await ticketsService.createTicket(eventId, data as any);
      setTickets(prev => [...prev, newTicket]);
      return newTicket;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      return null;
    }
  }, [eventId]);

  // Update ticket
  const updateTicket = useCallback(async (ticketId: string, data: Partial<TicketType>): Promise<TicketType | null> => {
    try {
      const updated = await ticketsService.updateTicket(eventId, ticketId, data as any);
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      return null;
    }
  }, [eventId]);

  // Delete ticket
  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      await ticketsService.deleteTicket(eventId, ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
      return false;
    }
  }, [eventId]);

  // Duplicate ticket
  const duplicateTicket = useCallback(async (ticketId: string): Promise<TicketType | null> => {
    try {
      const duplicated = await ticketsService.duplicateTicket(eventId, ticketId);
      setTickets(prev => [...prev, duplicated]);
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate ticket');
      return null;
    }
  }, [eventId]);

  // Fetch attendees
  const fetchAttendees = useCallback(async (params?: SearchParams) => {
    setIsLoadingAttendees(true);
    
    try {
      const response = await ticketsService.getAttendees(eventId, params);
      setAttendees(response.data);
      setAttendeesMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendees');
    } finally {
      setIsLoadingAttendees(false);
    }
  }, [eventId]);

  // Check in attendee
  const checkInAttendee = useCallback(async (attendeeId: string): Promise<boolean> => {
    try {
      const updated = await ticketsService.checkInAttendee(eventId, attendeeId);
      setAttendees(prev => prev.map(a => a.id === attendeeId ? updated : a));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in attendee');
      return false;
    }
  }, [eventId]);

  // Undo check in
  const undoCheckIn = useCallback(async (attendeeId: string): Promise<boolean> => {
    try {
      const updated = await ticketsService.undoCheckIn(eventId, attendeeId);
      setAttendees(prev => prev.map(a => a.id === attendeeId ? updated : a));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo check-in');
      return false;
    }
  }, [eventId]);

  // Export attendees
  const exportAttendees = useCallback(async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await ticketsService.exportAttendees(eventId, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendees-${eventId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export attendees');
    }
  }, [eventId]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await ticketsService.getTicketAnalytics(eventId);
      setAnalytics({
        totalRevenue: data.totalRevenue,
        totalSold: data.totalSold,
        totalAvailable: data.totalAvailable,
      });
    } catch {
      // Analytics are non-critical, don't show error
    }
  }, [eventId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchTickets();
      fetchAttendees();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tickets,
    isLoading,
    error,
    attendees,
    attendeesMeta,
    isLoadingAttendees,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    duplicateTicket,
    fetchAttendees,
    checkInAttendee,
    undoCheckIn,
    exportAttendees,
    analytics,
    fetchAnalytics,
  };
}
