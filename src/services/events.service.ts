// Events Service
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { 
  BackendEventResponse,
  ApiResponse, 
  PaginatedResponse, 
  SearchParams, 
  CreateEventRequest, 
  UpdateEventRequest,
  MutationResponse,
  UploadResponse,
  PublishedWebsiteOverviewResponse,
} from '../types/api';
import { EventData, Metric, ChecklistItem, Module, Activity } from '../components/event-dashboard/types';
import { getEventPayload, setEventPayload } from '../lib/event-storage';
import { delay, mockEvents, generateId } from './mock/data';
import { ticketsService } from './tickets.service';
import { formsService } from './forms.service';
import { programService } from './program.service';
import { websiteService } from './website.service';
import * as sponsorsService from './sponsors.service';
import * as merchandiseService from './merchandise.service';
import * as votingService from './voting.service';
import { DEFAULT_SECTIONS, DEFAULT_THEME_HORIZON, DEFAULT_THEME_PULSE, WebsiteConfig } from '../modules/website/types';

const EVENTS_STORAGE_KEY = 'munar_events';
const PROGRESS_STORAGE_KEY = 'munar_event_progress';

type EventProgress = {
  modules: Module[];
  activities: Activity[];
};

const defaultModules = (): Module[] => [
  { id: 'mod1', name: 'Event Website', description: 'Customize your landing page', icon: 'globe', status: 'not-started', actionLabel: 'Customize', iconColor: 'green' },
  { id: 'mod2', name: 'Tickets', description: 'Create and manage ticket tiers', icon: 'ticket', status: 'not-started', actionLabel: 'Set up', iconColor: 'orange' },
  { id: 'mod3', name: 'Schedule & Agenda', description: 'Manage sessions and timeline', icon: 'calendar', status: 'not-started', actionLabel: 'Set up', iconColor: 'pink' },
  { id: 'mod4', name: 'People & Speakers', description: 'Speaker profiles and Bios', icon: 'mic', status: 'not-started', actionLabel: 'Set up', iconColor: 'green' },
  { id: 'mod5', name: 'Sponsors', description: 'Create and manage brand partners', icon: 'users', status: 'not-started', actionLabel: 'Set up', iconColor: 'blue' },
  { id: 'mod6', name: 'Forms and surveys', description: 'Collect attendee data and feedback', icon: 'file-text', status: 'not-started', actionLabel: 'Set up', iconColor: 'pink' },
  { id: 'mod7', name: 'Voting', description: 'Setup live polls and awards', icon: 'vote', status: 'not-started', actionLabel: 'Set up', iconColor: 'indigo' },
  { id: 'mod8', name: 'Event Media & Gallery', description: 'Upload and publish gallery', icon: 'globe', status: 'not-started', actionLabel: 'Set up', iconColor: 'purple' },
  { id: 'mod9', name: 'DP & Cover Maker', description: 'Create branded social images', icon: 'image', status: 'not-started', actionLabel: 'Set up', iconColor: 'purple' },
  { id: 'mod10', name: 'Merchandise', description: 'Sell items and add-ons', icon: 'shopping-bag', status: 'not-started', actionLabel: 'Set up', iconColor: 'gray' },
  { id: 'mod11', name: 'Analytics', description: 'Overview of your event analytics', icon: 'layout', status: 'active', actionLabel: 'View', iconColor: 'indigo' },
];

const checklistConfig = [
  { id: 'tickets', label: 'Add tickets or registration', module: 'Tickets', actionLabel: 'Set up' },
  { id: 'website', label: 'Customize event website', module: 'Event Website', actionLabel: 'Customize' },
  { id: 'schedule', label: 'Add schedule and speakers', module: 'Schedule & Agenda', actionLabel: 'Set up' },
  { id: 'sponsors', label: 'Add sponsors', module: 'Sponsors', actionLabel: 'Set up' },
  { id: 'forms', label: 'Create forms and surveys', module: 'Forms and surveys', actionLabel: 'Set up' },
  { id: 'gallery', label: 'Upload event media', module: 'Event Media & Gallery', actionLabel: 'Set up' },
  { id: 'dp', label: 'Create DP & cover maker', module: 'DP & Cover Maker', actionLabel: 'Set up' },
  { id: 'merch', label: 'Add merchandise', module: 'Merchandise', actionLabel: 'Set up' },
  { id: 'voting', label: 'Enable voting', module: 'Voting', actionLabel: 'Set up' },
];

/** Generate slug from event name */
const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const loadStoredEvents = (): EventData[] => {
  if (typeof window === 'undefined') return [...mockEvents];
  const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!raw) return [...mockEvents];
  try {
    const events = JSON.parse(raw) as EventData[];
    // Ensure all events have a slug (backfill for legacy stored events)
    return events.map(e => ({
      ...e,
      slug: e.slug || slugify(e.name),
    }));
  } catch {
    return [...mockEvents];
  }
};

const saveStoredEvents = (events: EventData[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }
};

const loadProgressStore = (): Record<string, EventProgress> => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, EventProgress>;
  } catch {
    return {};
  }
};

const saveProgressStore = (store: Record<string, EventProgress>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store));
};

const ensureProgress = (eventId: string): EventProgress => {
  const store = loadProgressStore();
  if (!store[eventId]) {
    store[eventId] = {
      modules: defaultModules(),
      activities: [],
    };
    saveProgressStore(store);
  }
  return store[eventId];
};

const updateProgress = (eventId: string, progress: EventProgress) => {
  const store = loadProgressStore();
  store[eventId] = progress;
  saveProgressStore(store);
};

const buildChecklist = (modules: Module[]): ChecklistItem[] => {
  const items = checklistConfig.map((item) => {
    const moduleObj = modules.find((module) => module.name === item.module);
    const moduleStatus = moduleObj?.status ?? 'not-started';
    return {
      id: item.id,
      label: item.label,
      status: moduleStatus === 'active' ? 'completed' : 'not-started',
      actionLabel: item.actionLabel,
      phase: 'setup',
      count: moduleObj?.count ?? 0,
    } as ChecklistItem;
  });

  // Move completed items to the bottom while preserving relative order
  const notCompleted = items.filter(i => i.status !== 'completed');
  const completed = items.filter(i => i.status === 'completed');
  return [...notCompleted, ...completed];
};

const getServiceModuleCounts = async (eventId: string): Promise<Record<string, number>> => {
  const [tickets, forms, products, campaigns, sponsors, speakers, sessions] = await Promise.all([
    ticketsService.getTickets(eventId).catch(() => []),
    formsService.getForms(eventId).catch(() => []),
    merchandiseService.getProducts(eventId).catch(() => []),
    votingService.getCampaigns(eventId).catch(() => []),
    sponsorsService.getSponsors(eventId).catch(() => []),
    programService.getSpeakers(eventId).catch(() => []),
    programService.getSessions(eventId).catch(() => []),
  ]);

  return {
    'Tickets': tickets.length,
    'Forms and surveys': forms.length,
    'Merchandise': products.length,
    'Voting': campaigns.length,
    'Sponsors': sponsors.length,
    'People & Speakers': speakers.length,
    'Schedule & Agenda': sessions.length,
  };
};

const sectionsDifferFromDefaults = (sections: WebsiteConfig['sections']): boolean => {
  if (sections.length !== DEFAULT_SECTIONS.length) return true;

  return sections.some((section, index) => {
    const defaultSection = DEFAULT_SECTIONS[index];
    if (!defaultSection) return true;

    return (
      section.id !== defaultSection.id ||
      section.visible !== defaultSection.visible ||
      section.order !== defaultSection.order ||
      section.variant !== defaultSection.variant ||
      !!section.overrides
    );
  });
};

const hasMeaningfulWebsiteConfig = (config: WebsiteConfig): boolean => {
  const defaultTheme = config.templateId === 'pulse' ? DEFAULT_THEME_PULSE : DEFAULT_THEME_HORIZON;
  const hasSeo = Boolean(config.seo.title?.trim() || config.seo.description?.trim() || config.seo.socialImage || config.seo.socialImageAsset);
  const hasBranding = Boolean(config.logoUrl || config.logoAsset);
  const hasSocialLinks = Boolean(config.socialLinks && Object.values(config.socialLinks).some(Boolean));
  const hasCustomContent = Boolean(config.customBlocks?.length || config.buildingBlocks?.length);
  const themeChanged = JSON.stringify(config.theme) !== JSON.stringify(defaultTheme);

  return (
    config.status === 'published' ||
    config.templateId !== 'horizon' ||
    config.accessControl !== 'public' ||
    config.navbarEnabled === false ||
    Boolean(config.slug || config.password) ||
    hasSeo ||
    hasBranding ||
    hasSocialLinks ||
    hasCustomContent ||
    themeChanged ||
    sectionsDifferFromDefaults(config.sections)
  );
};

const getWebsiteModuleCount = async (eventId: string): Promise<number> => {
  try {
    const config = await websiteService.loadConfig(eventId);
    return hasMeaningfulWebsiteConfig(config) ? 1 : 0;
  } catch {
    return websiteService.hasConfig(eventId) ? 1 : 0;
  }
};

const reconcileModuleProgress = async (eventId: string, modules: Module[]): Promise<Module[]> => {
  const [serviceCounts, websiteCount] = await Promise.all([
    getServiceModuleCounts(eventId).catch(() => ({})),
    getWebsiteModuleCount(eventId).catch(() => 0),
  ]);

  const payloadCounts = getEventPayload<Record<string, number>>(eventId, 'module_counts', {});
  const counts = {
    ...payloadCounts,
    ...serviceCounts,
    'Event Website': websiteCount,
  };

  return modules.map((module) => {
    if (module.name === 'Analytics') return module;

    const count = counts[module.name] ?? module.count ?? 0;
    return {
      ...module,
      count,
      status: count > 0 ? 'active' : 'not-started',
    };
  });
};

// Extended event type for list view
export interface EventListItem {
  id: string;
  name: string;
  type: 'Physical' | 'Virtual' | 'Hybrid';
  status: string;
  date: string;
  time: string;
  ticketsSold: number | string;
  coverImageUrl?: string;
}

/** Normalize a raw DB event row (startDate/startTime) to the EventData shape (date/time) */
function normalizeEvent(raw: any): EventData {
  const startsAt = raw.startsAt ?? raw.startDate ?? raw.date;
  const endsAt = raw.endsAt ?? raw.endDate;
  const startDate = startsAt ? new Date(startsAt) : null;
  const endDate = endsAt ? new Date(endsAt) : null;
  const status =
    raw.status === 'PUBLISHED' || raw.status === 'LIVE'
      ? 'published'
      : raw.status === 'DRAFT'
        ? 'draft'
        : raw.status === 'CANCELLED' || raw.status === 'ARCHIVED' || raw.status === 'COMPLETED'
          ? 'unpublished'
          : raw.status;

  return {
    ...raw,
    name: raw.name ?? raw.title ?? '',
    slug: raw.slug ?? '',
    websitePublished: raw.websitePublished ?? false,
    date: raw.date ?? (startDate ? startDate.toISOString().slice(0, 10) : ''),
    time: raw.time ?? (startDate ? startDate.toISOString().slice(11, 16) : ''),
    startDate: raw.startDate ?? (startDate ? startDate.toISOString().slice(0, 10) : ''),
    startTime: raw.startTime ?? (startDate ? startDate.toISOString().slice(11, 16) : ''),
    endDate: raw.endDate ?? (endDate ? endDate.toISOString().slice(0, 10) : undefined),
    endTime: raw.endTime ?? (endDate ? endDate.toISOString().slice(11, 16) : undefined),
    websiteUrl: raw.websiteUrl ?? '',
    description: raw.description ?? '',
    coverImageUrl: raw.coverImageUrl ?? undefined,
    venueLocation: raw.venueLocation ?? raw.venueName ?? raw.venueAddress ?? '',
    currency: raw.currency ?? config.app.defaultCurrency,
    type: raw.type ?? raw.eventType ?? (raw.isOnline ? 'Virtual' : 'Physical'),
    status,
    phase:
      raw.status === 'LIVE'
        ? 'live'
        : raw.status === 'COMPLETED'
          ? 'post-event'
          : 'setup',
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
  };
}

function normalizePublishedEvent(overview: PublishedWebsiteOverviewResponse): EventData {
  const raw = overview.event;
  const startDate = raw.startsAt ? new Date(raw.startsAt) : null;
  const endDate = raw.endsAt ? new Date(raw.endsAt) : null;
  const websiteSettings = (overview.websiteSettings ?? {}) as Record<string, unknown>;
  const branding = (overview.branding ?? {}) as Record<string, unknown>;

  return {
    id: raw.id,
    name: raw.title ?? '',
    slug: raw.slug ?? '',
    description: raw.description ?? raw.summary ?? '',
    date: startDate ? startDate.toISOString().slice(0, 10) : '',
    time: startDate ? startDate.toISOString().slice(11, 16) : '',
    endDate: endDate ? endDate.toISOString().slice(0, 10) : undefined,
    endTime: endDate ? endDate.toISOString().slice(11, 16) : undefined,
    type: raw.isOnline ? 'Virtual' : 'Physical',
    websiteUrl: `${window.location.origin}/e/${raw.slug}`,
    websitePublished: true,
    coverImageUrl: raw.coverImageUrl ?? undefined,
    venueLocation: raw.venueAddress ?? raw.venueName ?? '',
    status: 'published',
    phase: 'setup',
    branding: {
      ...(branding as EventData['branding']),
      logo: raw.logoUrl ?? undefined,
    },
    currency: (websiteSettings.currency as EventData['currency']) ?? config.app.defaultCurrency,
  };
}

/** Normalize a raw DB event row to the EventListItem shape */
function normalizeEventListItem(raw: any): EventListItem {
  const startDate = raw.startsAt ?? raw.startDate ?? raw.date ?? '';
  const formattedDate = startDate
    ? (() => { try { return new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return startDate; } })()
    : '';
  return {
    id: raw.id,
    name: raw.name ?? raw.title,
    type: raw.type ?? raw.eventType ?? (raw.isOnline ? 'Virtual' : 'Physical'),
    status:
      raw.status === 'draft' || raw.status === 'DRAFT'
        ? 'Draft'
        : raw.status === 'published' || raw.status === 'PUBLISHED' || raw.status === 'LIVE'
          ? 'Published'
          : raw.status === 'unpublished' || raw.status === 'ARCHIVED'
            ? 'Unpublished'
            : raw.status,
    date: formattedDate,
    time: raw.startTime ?? raw.time ?? (startDate ? new Date(startDate).toISOString().slice(11, 16) : ''),
    ticketsSold: raw.ticketsSold ?? 0,
    coverImageUrl: raw.coverImageUrl,
  };
}

class EventsService {
  // Get all events for current user
  async getEvents(params?: SearchParams): Promise<PaginatedResponse<EventListItem>> {
    if (config.features.useMockData) {
      await delay(600);
      
      const events = loadStoredEvents();
      let filtered = events.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        status: e.status === 'draft' ? 'Draft' : e.status === 'published' ? 'Published' : 'Scheduled',
        date: new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: e.time,
        ticketsSold: Math.floor(Math.random() * 500),
        coverImageUrl: e.coverImageUrl,
      }));
      
      // Apply search
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(search) ||
          e.type.toLowerCase().includes(search)
        );
      }
      
      return {
        data: filtered,
        meta: {
          currentPage: params?.page || 1,
          totalPages: 1,
          totalItems: filtered.length,
          itemsPerPage: params?.limit || 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const tenantId = localStorage.getItem(config.auth.activeTenantKey);
    const response = tenantId
      ? await apiClient.get<any[]>(`/tenants/${tenantId}/events`, { params })
      : await apiClient.get<PaginatedResponse<any>>('/events', { params });

    const data = Array.isArray(response) ? response : (response.data ?? []);
    return {
      data: data.map(normalizeEventListItem),
      meta: {
        currentPage: params?.page || 1,
        totalPages: 1,
        totalItems: data.length,
        itemsPerPage: data.length || params?.limit || 10,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  // Get single event by ID or slug
  async getEvent(eventIdOrSlug: string): Promise<EventData> {
    if (config.features.useMockData) {
      await delay(400);
      const events = loadStoredEvents();
      // Support lookup by ID or slug
      let event = events.find(e => e.id === eventIdOrSlug || e.slug === eventIdOrSlug);

      // Fallback: If not found in storage, check the immutable seed data
      // This ensures generic URLs like /events/evt-1 always work in dev/demo mode
      if (!event) {
        // Reload seed data just in case memory reference was mutated
        const seedData = (await import('./mock/data')).mockEvents;
        event = seedData.find(e => e.id === eventIdOrSlug || e.slug === eventIdOrSlug);
      }

      if (!event) {
        const availableIds = mockEvents.map(e => e.id).join(', ');
        throw new Error(`Event not found. ID requested: ${eventIdOrSlug}. Available: ${availableIds}`);
      }
      return event;
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_RE.test(eventIdOrSlug);
    const url = isUuid ? `/events/${eventIdOrSlug}` : `/events/slug/${eventIdOrSlug}`;
    const response = await apiClient.get<BackendEventResponse>(url);
    return normalizeEvent(response);
  }

  async getPublicEventBySlug(slug: string): Promise<EventData> {
    if (config.features.useMockData) {
      return this.getEvent(slug);
    }

    const response = await apiClient.get<PublishedWebsiteOverviewResponse>(`/public/events/${slug}/website`);
    return normalizePublishedEvent(response);
  }

  // Create new event
  async createEvent(data: CreateEventRequest): Promise<EventData> {
    if (config.features.useMockData) {
      await delay(800);
      const events = loadStoredEvents();
      const websiteUrl = data.customDomain
        ? `https://${data.customDomain}`
        : `https://${data.subdomain || 'event'}.munar.site`;
      const newEvent: EventData = {
        id: generateId('evt'),
        name: data.name,
        slug: (data.subdomain || data.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
        description: data.description,
        date: data.startDate,
        time: data.startTime,
        endDate: data.endDate,
        endTime: data.endTime,
        type: data.type,
        websiteUrl,
        coverImageUrl: data.coverImageUrl,
        country: data.country,
        venueLocation: data.venueLocation,
        categories: data.categories,
        currency: data.currency || config.app.defaultCurrency,
        status: 'draft',
        phase: 'setup',
      };

      events.push(newEvent);
      saveStoredEvents(events);
      ensureProgress(newEvent.id);
      this.recordActivity(newEvent.id, {
        type: 'system',
        message: `Event "${newEvent.name}" created`,
        isHighPriority: true,
        module: 'System',
        icon: 'system',
      });
      return newEvent;
    }

    const response = await apiClient.post<BackendEventResponse>('/events', {
      tenantId: localStorage.getItem(config.auth.activeTenantKey),
      title: data.name,
      summary: data.description,
      description: data.description,
      category: data.categories?.[0],
      eventType: data.type,
      startsAt: data.startDate ? new Date(`${data.startDate}T${data.startTime || '00:00'}`).toISOString() : undefined,
      endsAt: data.endDate ? new Date(`${data.endDate}T${data.endTime || '00:00'}`).toISOString() : undefined,
      currency: data.currency || config.app.defaultCurrency,
      venueAddress: data.venueLocation,
      isOnline: data.type === 'Virtual',
      coverImageUrl: data.coverImageUrl,
    });
    return normalizeEvent(response);
  }

  // Update event
  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<EventData> {
    if (config.features.useMockData) {
      await delay(500);
      
      const events = loadStoredEvents();
      const index = events.findIndex(e => e.id === eventId);
      if (index === -1) throw new Error('Event not found');

      const websiteUrl = data.customDomain
        ? `https://${data.customDomain}`
        : data.subdomain
          ? `https://${data.subdomain}.munar.site`
          : events[index].websiteUrl;

      events[index] = { ...events[index], ...data, websiteUrl } as EventData;
      saveStoredEvents(events);
      this.recordActivity(eventId, {
        type: 'system',
        message: `Event details updated`,
        isHighPriority: false,
        module: 'System',
        icon: 'system',
      });
      return events[index];
    }

    const response = await apiClient.patch<BackendEventResponse>(`/events/${eventId}`, {
      title: data.name,
      summary: data.description,
      description: data.description,
      category: data.categories?.[0],
      eventType: data.type,
      startsAt: data.startDate ? new Date(`${data.startDate}T${data.startTime || '00:00'}`).toISOString() : undefined,
      endsAt: data.endDate ? new Date(`${data.endDate}T${data.endTime || '00:00'}`).toISOString() : undefined,
      currency: data.currency,
      venueAddress: data.venueLocation,
      isOnline: data.type === 'Virtual',
      coverImageUrl: data.coverImageUrl,
    });
    return normalizeEvent(response);
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(500);
      
      const events = loadStoredEvents();
      const index = events.findIndex(e => e.id === eventId);
      if (index !== -1) events.splice(index, 1);
      saveStoredEvents(events);
      const store = loadProgressStore();
      if (store[eventId]) {
        delete store[eventId];
        saveProgressStore(store);
      }
      
      return { success: true, message: 'Event deleted successfully' };
    }

    return apiClient.delete<MutationResponse>(`/events/${eventId}`);
  }

  // Clone event
  async cloneEvent(eventId: string): Promise<EventData> {
    if (config.features.useMockData) {
      await delay(600);
      
      const events = loadStoredEvents();
      const original = events.find(e => e.id === eventId);
      if (!original) throw new Error('Event not found');
      
      const cloned: EventData = {
        ...original,
        id: generateId('evt'),
        name: `${original.name} (Copy)`,
        status: 'draft',
      };

      events.push(cloned);
      saveStoredEvents(events);
      ensureProgress(cloned.id);
      this.recordActivity(cloned.id, {
        type: 'system',
        message: `Event cloned from "${original.name}"`,
        isHighPriority: false,
        module: 'System',
        icon: 'system',
      });
      return cloned;
    }

    const response = await apiClient.post<ApiResponse<EventData>>(`/events/${eventId}/clone`);
    return response.data;
  }

  // Publish event
  async publishEvent(eventId: string): Promise<EventData> {
    if (config.features.useMockData) {
      return this.updateEvent(eventId, { status: 'published' });
    }
    const response = await apiClient.post<BackendEventResponse>(`/events/${eventId}/publish`);
    return normalizeEvent(response);
  }

  // Unpublish event
  async unpublishEvent(eventId: string): Promise<EventData> {
    if (config.features.useMockData) {
      return this.updateEvent(eventId, { status: 'unpublished' });
    }
    const response = await apiClient.post<BackendEventResponse>(`/events/${eventId}/archive`);
    return normalizeEvent(response);
  }

  // Upload cover image
  async uploadCoverImage(eventId: string, file: File): Promise<UploadResponse> {
    if (config.features.useMockData) {
      await delay(1000);
      return {
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      };
    }

    return apiClient.upload<UploadResponse>(`/events/${eventId}/cover`, file);
  }

  // Get event metrics/analytics
  async getEventMetrics(eventId: string): Promise<Metric[]> {
    if (config.features.useMockData) {
      await delay(400);
      return [
        { id: 'm1', label: 'Registrations', value: '3', context: 'setup' },
        { id: 'm2', label: 'Website Views', value: '12', context: 'setup' },
        { id: 'm3', label: 'Tickets Sold', value: '3', context: 'setup' },
        { id: 'm4', label: 'Total Revenue', value: '₦4.5M', context: 'setup' },
        { id: 'm5', label: 'Check-ins', value: '0', context: 'setup' },
        { id: 'm6', label: 'Survey Responses', value: '0', context: 'setup' },
      ];
    }

    try {
      const response = await apiClient.get<ApiResponse<{
        eventId: string;
        currency?: string;
        summary?: Record<string, { value?: number; unit?: string; scope?: string }>;
      }> | {
        eventId: string;
        currency?: string;
        summary?: Record<string, { value?: number; unit?: string; scope?: string }>;
      }>(`/events/${eventId}/analytics`);
      const payload =
        response && typeof response === 'object' && 'data' in response
          ? response.data
          : response;

      if (payload?.summary) {
        const currency = payload.currency || config.app.defaultCurrency;
        const revenueRaw = Number(payload.summary.totalRevenue?.value ?? 0);
        const revenue = payload.summary.totalRevenue?.unit === 'minor'
          ? revenueRaw / 100
          : revenueRaw;

        return [
          { id: 'm1', label: 'Registrations', value: Number(payload.summary.registrations?.value ?? 0), context: 'setup' },
          { id: 'm2', label: 'Website Views', value: Number(payload.summary.websiteViews?.value ?? 0), context: 'setup' },
          { id: 'm3', label: 'Tickets Sold', value: Number(payload.summary.ticketsSold?.value ?? 0), context: 'setup' },
          {
            id: 'm4',
            label: 'Gross Revenue',
            value: new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(revenue),
            context: 'setup',
          },
          { id: 'm5', label: 'Check-ins', value: Number(payload.summary.checkIns?.value ?? 0), context: 'setup' },
          { id: 'm6', label: 'Survey Responses', value: Number(payload.summary.surveyResponses?.value ?? 0), context: 'setup' },
        ];
      }

      const legacyResponse = await apiClient.get<ApiResponse<Metric[]>>(`/events/${eventId}/metrics`);
      return legacyResponse.data;
    } catch {
      return [
        { id: 'm1', label: 'Registrations', value: '0', context: 'setup' },
        { id: 'm2', label: 'Website Views', value: '0', context: 'setup' },
        { id: 'm3', label: 'Tickets Sold', value: '0', context: 'setup' },
        { id: 'm4', label: 'Total Revenue', value: '₦0', context: 'setup' },
        { id: 'm5', label: 'Check-ins', value: '0', context: 'setup' },
        { id: 'm6', label: 'Survey Responses', value: '0', context: 'setup' },
      ];
    }
  }

  // Get event checklist
  async getEventChecklist(eventId: string): Promise<ChecklistItem[]> {
    if (config.features.useMockData) {
      await delay(300);
      const progress = ensureProgress(eventId);
      const modulesWithCounts = await reconcileModuleProgress(eventId, progress.modules);
      return buildChecklist(modulesWithCounts);
    }

    try {
      const response = await apiClient.get<ApiResponse<ChecklistItem[]>>(`/events/${eventId}/checklist`);
      const baseModules = defaultModules().map((module) => {
        const checklistItem = checklistConfig.find((item) => item.module === module.name);
        const apiItem = checklistItem ? response.data.find((item) => item.id === checklistItem.id) : null;
        return {
          ...module,
          status: apiItem?.status === 'completed' ? 'active' : module.status,
          count: apiItem?.count ?? module.count ?? 0,
        };
      });
      const modulesWithCounts = await reconcileModuleProgress(eventId, baseModules);
      return buildChecklist(modulesWithCounts);
    } catch {
      const modulesWithCounts = await reconcileModuleProgress(eventId, defaultModules());
      return buildChecklist(modulesWithCounts);
    }
  }

  // Get event modules status
  async getEventModules(eventId: string): Promise<Module[]> {
    if (config.features.useMockData) {
      await delay(300);
      const progress = ensureProgress(eventId);
      return reconcileModuleProgress(eventId, progress.modules);
    }

    try {
      const response = await apiClient.get<ApiResponse<Module[]>>(`/events/${eventId}/modules`);
      return reconcileModuleProgress(eventId, response.data);
    } catch {
      return reconcileModuleProgress(eventId, defaultModules());
    }
  }

  // Get event activity feed
  async getEventActivities(eventId: string, limit: number = 10): Promise<Activity[]> {
    if (config.features.useMockData) {
      await delay(300);
      const progress = ensureProgress(eventId);
      return progress.activities.slice(0, limit);
    }

    try {
      const response = await apiClient.get<ApiResponse<Activity[]>>(`/events/${eventId}/activities`, { params: { limit } });
      return response.data;
    } catch {
      return [];
    }
  }

  recordActivity(eventId: string, activity: Omit<Activity, 'id' | 'timestamp'>): Activity[] {
    const progress = ensureProgress(eventId);
    const newActivity: Activity = {
      id: generateId('act'),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    progress.activities = [newActivity, ...progress.activities].slice(0, 20);
    updateProgress(eventId, progress);
    return progress.activities;
  }

  updateModuleCount(eventId: string, moduleName: string, count: number, activityMessage?: string, icon?: string) {
    // Persist counts in payload store
    const existing = getEventPayload<Record<string, number>>(eventId, 'module_counts', {});
    const next = { ...existing, [moduleName]: count };
    setEventPayload(eventId, 'module_counts', next);

    this.setModuleStatus(eventId, moduleName, count > 0 ? 'active' : 'not-started');
    if (activityMessage) {
      this.recordActivity(eventId, {
        type: 'system',
        message: activityMessage,
        isHighPriority: false,
        module: moduleName,
        icon,
      });
    }
  }

  setModuleStatus(eventId: string, moduleName: string, status: Module['status'], activityMessage?: string) {
    const progress = ensureProgress(eventId);
    progress.modules = progress.modules.map((module) =>
      module.name === moduleName ? { ...module, status } : module,
    );
    updateProgress(eventId, progress);
    if (activityMessage) {
      this.recordActivity(eventId, {
        type: 'system',
        message: activityMessage,
        isHighPriority: false,
      });
    }
  }

  markModuleActive(eventId: string, moduleName: string, activityMessage: string) {
    this.setModuleStatus(eventId, moduleName, 'active', activityMessage);
  }
}

export const eventsService = new EventsService();
