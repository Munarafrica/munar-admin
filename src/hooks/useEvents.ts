// Events Hook - fetch and manage events list
import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventsService, EventListItem } from '../services';
import { SearchParams, PaginatedResponse } from '../types/api';

interface UseEventsOptions {
  autoFetch?: boolean;
  initialParams?: SearchParams;
}

interface UseEventsReturn {
  events: EventListItem[];
  isLoading: boolean;
  error: string | null;
  meta: PaginatedResponse<EventListItem>['meta'] | null;
  
  // Actions
  fetchEvents: (params?: SearchParams) => Promise<void>;
  searchEvents: (search: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  cloneEvent: (eventId: string) => Promise<EventListItem | null>;
  refresh: () => Promise<void>;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { autoFetch = true, initialParams } = options;
  
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<EventListItem>['meta'] | null>(null);
  const [params, setParams] = useState<SearchParams>(initialParams || {});
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchEvents = useCallback(async (fetchParams?: SearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await eventsService.getEvents(fetchParams || params);
      setEvents(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const searchEvents = useCallback(async (search: string) => {
    setSearchQuery(search);
    await fetchEvents({ ...params, search });
  }, [fetchEvents, params]);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      await eventsService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      return false;
    }
  }, []);

  const cloneEvent = useCallback(async (eventId: string): Promise<EventListItem | null> => {
    try {
      const cloned = await eventsService.cloneEvent(eventId);
      const listItem: EventListItem = {
        id: cloned.id,
        name: cloned.name,
        type: cloned.type,
        status: 'Draft',
        date: new Date(cloned.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: cloned.time,
        ticketsSold: 0,
      };
      setEvents(prev => [...prev, listItem]);
      return listItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone event');
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Apply local filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchQuery || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || event.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, filterStatus]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    events: filteredEvents,
    isLoading,
    error,
    meta,
    fetchEvents,
    searchEvents,
    deleteEvent,
    cloneEvent,
    refresh,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
  };
}
