import { config } from '../config';
import { apiClient } from '../lib/api-client';
import {
  BackendEventResponse,
  CreateWebsitePageRequest,
  PublicWebsiteViewRequest,
  PublishedWebsiteOverviewResponse,
  PublishedWebsitePageResponse,
  UpdateEventSettingsRequest,
  WebsitePageResponse,
} from '../types/api';
import { DEFAULT_SECTIONS, DEFAULT_WEBSITE_CONFIG, WebsiteConfig } from '../modules/website/types';

const STORAGE_KEY_PREFIX = 'munar_website_config_';
const PUBLIC_SESSION_STORAGE_KEY = 'munar_public_session_id';

function getStorageKey(eventId: string): string {
  return `${STORAGE_KEY_PREFIX}${eventId}`;
}

function createPublicSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `sess_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return `sess_${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
  }

  return `sess_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export function getPublicSessionId(): string {
  try {
    const existing = window.localStorage.getItem(PUBLIC_SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const created = createPublicSessionId();
    window.localStorage.setItem(PUBLIC_SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return createPublicSessionId();
  }
}

function ensureDefaults(config: WebsiteConfig): WebsiteConfig {
  const existingIds = new Set(config.sections.map((section) => section.id));
  const missingSections = DEFAULT_SECTIONS.filter((section) => !existingIds.has(section.id));
  return {
    ...config,
    sections: [...config.sections, ...missingSections],
  };
}

function extractSections(sectionsJson?: Record<string, unknown> | null): WebsiteConfig['sections'] {
  const rawSections = sectionsJson && 'sections' in sectionsJson
    ? (sectionsJson.sections as unknown)
    : sectionsJson;

  if (!Array.isArray(rawSections)) {
    return [...DEFAULT_SECTIONS];
  }

  const normalized = rawSections
    .map((section, index) => {
      if (!section || typeof section !== 'object') return null;

      const raw = section as Record<string, unknown>;
      const props = (raw.props && typeof raw.props === 'object' ? raw.props : {}) as Record<string, unknown>;
      const id = typeof raw.id === 'string'
        ? raw.id
        : typeof raw.type === 'string'
          ? raw.type
          : null;

      if (!id) return null;

      return {
        id,
        label: typeof props.label === 'string' ? props.label : id,
        visible: typeof props.visible === 'boolean' ? props.visible : true,
        order: typeof props.order === 'number' ? props.order : index,
        variant: typeof props.variant === 'string' ? props.variant : undefined,
        overrides: (props.overrides && typeof props.overrides === 'object'
          ? props.overrides
          : undefined) as WebsiteConfig['sections'][number]['overrides'],
      };
    })
    .filter((section): section is WebsiteConfig['sections'][number] => !!section);

  return normalized.length ? normalized : [...DEFAULT_SECTIONS];
}

function toSectionsJson(sections: WebsiteConfig['sections']): Record<string, unknown> {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      type: section.id,
      props: {
        label: section.label,
        visible: section.visible,
        order: section.order,
        variant: section.variant,
        overrides: section.overrides,
      },
    })),
  };
}

function localLoad(eventId: string): WebsiteConfig {
  try {
    const raw = localStorage.getItem(getStorageKey(eventId));
    if (!raw) return { ...DEFAULT_WEBSITE_CONFIG, sections: [...DEFAULT_SECTIONS] };
    return ensureDefaults(JSON.parse(raw) as WebsiteConfig);
  } catch {
    return { ...DEFAULT_WEBSITE_CONFIG, sections: [...DEFAULT_SECTIONS] };
  }
}

function localSave(eventId: string, config: WebsiteConfig): WebsiteConfig {
  const updated = {
    ...config,
    lastSaved: new Date().toISOString(),
  };
  localStorage.setItem(getStorageKey(eventId), JSON.stringify(updated));
  return updated;
}

function logWebsiteSaveError(step: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[websiteService.saveConfig] ${step} failed:`, error.message, error);
    return;
  }

  console.error(`[websiteService.saveConfig] ${step} failed:`, error);
}

class WebsiteService {
  getConfig(eventId: string): WebsiteConfig {
    return localLoad(eventId);
  }

  async loadConfig(eventId: string): Promise<WebsiteConfig> {
    if (config.features.useMockData) {
      return this.getConfig(eventId);
    }

    try {
      const [event, settings, pages] = await Promise.all([
        apiClient.get<BackendEventResponse>(`/events/${eventId}`),
        apiClient.get<Record<string, unknown> | null>(`/events/${eventId}/website-settings`),
        apiClient.get<WebsitePageResponse[]>(`/events/${eventId}/website-pages`),
      ]);

      const homePage = pages.find((page) => page.pageKey === 'home');
      const nextConfig = ensureDefaults({
        ...DEFAULT_WEBSITE_CONFIG,
        ...(settings?.websiteSettingsJson as Partial<WebsiteConfig> | undefined),
        status: event.websitePublished ? 'published' : 'draft',
        seo: {
          ...DEFAULT_WEBSITE_CONFIG.seo,
          ...(homePage?.seoJson as Record<string, unknown> | undefined),
        },
        sections: extractSections(homePage?.sectionsJson),
      });

      return localSave(eventId, nextConfig);
    } catch {
      return this.getConfig(eventId);
    }
  }

  async saveConfig(eventId: string, nextConfig: WebsiteConfig): Promise<WebsiteConfig> {
    const updated = localSave(eventId, nextConfig);

    if (config.features.useMockData) {
      return updated;
    }

    const currentWebsiteSettingsJson = await apiClient
      .get<Record<string, unknown> | null>(`/events/${eventId}/website-settings`)
      .then((settings) => {
        const json = settings && 'websiteSettingsJson' in settings
          ? (settings.websiteSettingsJson as Record<string, unknown> | null | undefined)
          : settings;
        return json && typeof json === 'object' ? json : {};
      })
      .catch(() => ({}));

    const settingsPayload: UpdateEventSettingsRequest = {
      websiteSettingsJson: {
        ...currentWebsiteSettingsJson,
        templateId: nextConfig.templateId,
        theme: nextConfig.theme,
        accessControl: nextConfig.accessControl,
        password: nextConfig.password,
        logoUrl: nextConfig.logoUrl,
        logoAsset: nextConfig.logoAsset,
        navbarEnabled: nextConfig.navbarEnabled,
        socialLinks: nextConfig.socialLinks,
        ...(nextConfig.sponsors ? { sponsors: nextConfig.sponsors } : {}),
      },
    };

    const homePagePayload: CreateWebsitePageRequest = {
      pageKey: 'home',
      title: nextConfig.seo.title || 'Home',
      sectionsJson: toSectionsJson(nextConfig.sections),
      seoJson: nextConfig.seo as unknown as Record<string, unknown>,
      isPublished: nextConfig.status === 'published',
    };

    try {
      await apiClient.patch(`/events/${eventId}/website-settings`, settingsPayload);
    } catch (error) {
      logWebsiteSaveError('PATCH /events/:eventId/website-settings', error);
      throw error;
    }

    let pages: WebsitePageResponse[];
    try {
      pages = await apiClient.get<WebsitePageResponse[]>(`/events/${eventId}/website-pages`);
    } catch (error) {
      logWebsiteSaveError('GET /events/:eventId/website-pages', error);
      throw error;
    }

    const homePage = pages.find((page) => page.pageKey === 'home');

    if (homePage) {
      try {
        await apiClient.patch(`/website-pages/${homePage.id}`, homePagePayload);
      } catch (error) {
        logWebsiteSaveError('PATCH /website-pages/:pageId', error);
        throw error;
      }
    } else {
      try {
        await apiClient.post(`/events/${eventId}/website-pages`, homePagePayload);
      } catch (error) {
        logWebsiteSaveError('POST /events/:eventId/website-pages', error);
        throw error;
      }
    }

    return updated;
  }

  async publish(eventId: string, websiteConfig: WebsiteConfig): Promise<WebsiteConfig> {
    const updated = await this.saveConfig(eventId, { ...websiteConfig, status: 'published' });
    if (!config.features.useMockData) {
      await apiClient.post(`/events/${eventId}/website/publish`);
    }
    return updated;
  }

  async unpublish(eventId: string, websiteConfig: WebsiteConfig): Promise<WebsiteConfig> {
    const updated = await this.saveConfig(eventId, { ...websiteConfig, status: 'draft' });
    if (!config.features.useMockData) {
      await apiClient.post(`/events/${eventId}/website/unpublish`);
    }
    return updated;
  }

  hasConfig(eventId: string): boolean {
    return !!localStorage.getItem(getStorageKey(eventId));
  }

  async loadPublishedWebsite(eventSlug: string): Promise<PublishedWebsiteOverviewResponse> {
    return apiClient.get<PublishedWebsiteOverviewResponse>(`/public/events/${eventSlug}/website`);
  }

  async loadPublishedPage(eventSlug: string, pageKey = 'home'): Promise<PublishedWebsitePageResponse> {
    return apiClient.get<PublishedWebsitePageResponse>(`/public/events/${eventSlug}/pages/${pageKey}`);
  }

  async trackPublishedWebsiteView(eventSlug: string, pageKey: string, path: string): Promise<void> {
    if (config.features.useMockData) {
      return;
    }

    const payload: PublicWebsiteViewRequest = {
      pageKey,
      sessionId: getPublicSessionId(),
      path,
    };

    const response = await fetch(`${config.api.baseUrl}/public/events/${eventSlug}/website/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to track website view for ${eventSlug}:${pageKey}`);
    }
  }
}

export const websiteService = new WebsiteService();
