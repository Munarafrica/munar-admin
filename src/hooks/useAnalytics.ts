import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import {
  AnalyticsFilters,
  EventAnalytics,
  ExportRequest,
  ScheduleReportRequest,
  DateRangePreset,
} from '../types/analytics';

interface UseEventAnalyticsOptions {
  eventId: string;
  autoFetch?: boolean;
  initialRange?: DateRangePreset;
}

interface UseEventAnalyticsReturn {
  analytics: EventAnalytics | null;
  isLoading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  setFilters: (next: AnalyticsFilters) => void;
  updateFilter: (key: keyof AnalyticsFilters, value?: string) => void;
  refresh: () => Promise<void>;
  exportReport: (payload: Omit<ExportRequest, 'filters'>) => Promise<void>;
  scheduleReport: (payload: Omit<ScheduleReportRequest, 'filters'>) => Promise<void>;
}

const buildDefaultFilters = (range: DateRangePreset): AnalyticsFilters => ({
  dateRange: range,
  ticketType: 'All',
  channel: 'All',
  location: 'All',
});

export const useEventAnalytics = ({
  eventId,
  autoFetch = true,
  initialRange = '7d',
}: UseEventAnalyticsOptions): UseEventAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(() => buildDefaultFilters(initialRange));

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getEventAnalytics(eventId, filters);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics();
    }
  }, [autoFetch, fetchAnalytics]);

  const updateFilter = useCallback((key: keyof AnalyticsFilters, value?: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const exportReport = useCallback(async (payload: Omit<ExportRequest, 'filters'>) => {
    await analyticsService.exportReport(eventId, { ...payload, filters });
  }, [eventId, filters]);

  const scheduleReport = useCallback(async (payload: Omit<ScheduleReportRequest, 'filters'>) => {
    await analyticsService.scheduleReport(eventId, { ...payload, filters });
  }, [eventId, filters]);

  return {
    analytics,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilter,
    refresh,
    exportReport,
    scheduleReport,
  };
};

export const useAnalyticsFilters = (filters: AnalyticsFilters, analytics: EventAnalytics | null) => {
  return useMemo(() => ({
    dateRange: filters.dateRange,
    ticketType: filters.ticketType || 'All',
    channel: filters.channel || 'All',
    location: filters.location || 'All',
    options: analytics?.filters,
  }), [analytics?.filters, filters]);
};
