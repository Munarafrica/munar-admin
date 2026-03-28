import { config } from '../config';
import { apiClient } from '../lib/api-client';
import {
  CreateWebsitePageRequest,
  PublishedWebsiteOverviewResponse,
  PublishedWebsitePageResponse,
  UpdateEventSettingsRequest,
  WebsitePageResponse,
} from '../types/api';
import { DEFAULT_SECTIONS, DEFAULT_WEBSITE_CONFIG, WebsiteConfig } from '../modules/website/types';

const STORAGE_KEY_PREFIX = 'munar_website_config_';

function getStorageKey(eventId: string): string {
  return `${STORAGE_KEY_PREFIX}${eventId}`;
}

function ensureDefaults(config: WebsiteConfig): WebsiteConfig {
  const existingIds = new Set(config.sections.map((section) => section.id));
  const missingSections = DEFAULT_SECTIONS.filter((section) => !existingIds.has(section.id));
  return {
    ...config,
    sections: [...config.sections, ...missingSections],
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

class WebsiteService {
  getConfig(eventId: string): WebsiteConfig {
    return localLoad(eventId);
  }

  async loadConfig(eventId: string): Promise<WebsiteConfig> {
    if (config.features.useMockData) {
      return this.getConfig(eventId);
    }

    try {
      const [settings, pages] = await Promise.all([
        apiClient.get<Record<string, unknown> | null>(`/events/${eventId}/website-settings`),
        apiClient.get<WebsitePageResponse[]>(`/events/${eventId}/website-pages`),
      ]);

      const homePage = pages.find((page) => page.pageKey === 'home');
      const nextConfig = ensureDefaults({
        ...DEFAULT_WEBSITE_CONFIG,
        ...(settings?.websiteSettingsJson as Partial<WebsiteConfig> | undefined),
        status: (settings as Record<string, any> | null)?.published ? 'published' : 'draft',
        seo: {
          ...DEFAULT_WEBSITE_CONFIG.seo,
          ...(homePage?.seoJson as Record<string, unknown> | undefined),
        },
        sections: (homePage?.sectionsJson as WebsiteConfig['sections']) || DEFAULT_SECTIONS,
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

    const settingsPayload: UpdateEventSettingsRequest = {
      websiteSettingsJson: {
        templateId: nextConfig.templateId,
        theme: nextConfig.theme,
        accessControl: nextConfig.accessControl,
        password: nextConfig.password,
        logoUrl: nextConfig.logoUrl,
        navbarEnabled: nextConfig.navbarEnabled,
        socialLinks: nextConfig.socialLinks,
      },
    };

    const homePagePayload: CreateWebsitePageRequest = {
      pageKey: 'home',
      title: nextConfig.seo.title || 'Home',
      sectionsJson: nextConfig.sections as unknown as Record<string, unknown>,
      seoJson: nextConfig.seo as unknown as Record<string, unknown>,
      isPublished: nextConfig.status === 'published',
    };

    await apiClient.patch(`/events/${eventId}/website-settings`, settingsPayload);

    const pages = await apiClient.get<WebsitePageResponse[]>(`/events/${eventId}/website-pages`);
    const homePage = pages.find((page) => page.pageKey === 'home');

    if (homePage) {
      await apiClient.patch(`/website-pages/${homePage.id}`, homePagePayload);
    } else {
      await apiClient.post(`/events/${eventId}/website-pages`, homePagePayload);
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
}

export const websiteService = new WebsiteService();
