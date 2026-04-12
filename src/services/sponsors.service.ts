import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { WebsiteAssetRef } from '../modules/website/types';
import {
  CreateSponsorRequest,
  DEFAULT_SPONSORS_SETTINGS,
  ReorderDirection,
  Sponsor,
  SponsorsSettings,
  UpdateSponsorRequest,
} from '../types/sponsors';
import { delay, generateId, mockSponsors } from './mock/data';

type WebsiteSettingsResponse = {
  websiteSettingsJson?: Record<string, unknown> | null;
} | Record<string, unknown> | null;

type StoredSponsor = {
  id: string;
  name: string;
  websiteUrl?: string;
  description?: string;
  logo?: WebsiteAssetRef;
  logoUrl?: string;
  isVisible?: boolean;
  visible?: boolean;
  sortOrder?: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

type StoredSponsorsSettings = {
  grayscaleLogos?: boolean;
  sponsors?: StoredSponsor[];
};

let mockGrayscaleLogos = DEFAULT_SPONSORS_SETTINGS.grayscaleLogos;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return generateId('spon');
}

function getLogoUrl(data: Pick<CreateSponsorRequest, 'logo' | 'logoUrl'>): string {
  return data.logo?.url || data.logoUrl || '';
}

function normalizeWebsiteUrl(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeSponsor(eventId: string, sponsor: StoredSponsor, index: number): Sponsor {
  const logo = sponsor.logo || (sponsor.logoUrl ? { assetId: sponsor.id, url: sponsor.logoUrl, altText: `${sponsor.name} logo` } : undefined);

  return {
    id: sponsor.id,
    eventId,
    name: sponsor.name,
    logo,
    logoUrl: logo?.url || sponsor.logoUrl || '',
    websiteUrl: normalizeWebsiteUrl(sponsor.websiteUrl),
    description: sponsor.description,
    visible: sponsor.isVisible ?? sponsor.visible ?? true,
    order: sponsor.sortOrder ?? sponsor.order ?? index,
    createdAt: sponsor.createdAt || new Date().toISOString(),
    updatedAt: sponsor.updatedAt || new Date().toISOString(),
  };
}

function normalizeSponsorsSettings(eventId: string, value: unknown): SponsorsSettings {
  const stored = (value && typeof value === 'object' ? value : {}) as StoredSponsorsSettings;
  const sponsors = Array.isArray(stored.sponsors)
    ? stored.sponsors.map((sponsor, index) => normalizeSponsor(eventId, sponsor, index))
    : [];

  return {
    grayscaleLogos: stored.grayscaleLogos ?? DEFAULT_SPONSORS_SETTINGS.grayscaleLogos,
    sponsors: sponsors.sort((a, b) => a.order - b.order),
  };
}

function toStoredSponsor(sponsor: Sponsor): StoredSponsor {
  return {
    id: sponsor.id,
    name: sponsor.name,
    websiteUrl: sponsor.websiteUrl,
    description: sponsor.description,
    logo: sponsor.logo || { assetId: sponsor.id, url: sponsor.logoUrl, altText: `${sponsor.name} logo` },
    isVisible: sponsor.visible,
    sortOrder: sponsor.order,
    createdAt: sponsor.createdAt,
    updatedAt: sponsor.updatedAt,
  };
}

function toStoredSponsorsSettings(settings: SponsorsSettings): StoredSponsorsSettings {
  return {
    grayscaleLogos: settings.grayscaleLogos,
    sponsors: settings.sponsors
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((sponsor, index) => toStoredSponsor({ ...sponsor, order: index })),
  };
}

function extractWebsiteSettingsJson(response: WebsiteSettingsResponse): Record<string, unknown> {
  if (!response || typeof response !== 'object') return {};

  if ('websiteSettingsJson' in response) {
    const settingsJson = response.websiteSettingsJson;
    return settingsJson && typeof settingsJson === 'object' ? { ...settingsJson } : {};
  }

  return { ...(response as Record<string, unknown>) };
}

async function getWebsiteSettingsJson(eventId: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get<WebsiteSettingsResponse>(`/events/${eventId}/website-settings`);
  return extractWebsiteSettingsJson(response);
}

function normalizeMockSettings(eventId: string): SponsorsSettings {
  return {
    grayscaleLogos: mockGrayscaleLogos,
    sponsors: mockSponsors
      .filter((sponsor) => sponsor.eventId === eventId)
      .map((sponsor, index) => ({
        ...sponsor,
        logo: sponsor.logo || { assetId: sponsor.id, url: sponsor.logoUrl, altText: `${sponsor.name} logo` },
        order: sponsor.order ?? index,
      }))
      .sort((a, b) => a.order - b.order),
  };
}

async function updateSponsorSettings(
  eventId: string,
  updater: (settings: SponsorsSettings) => SponsorsSettings,
): Promise<SponsorsSettings> {
  if (config.features.useMockData) {
    await delay();
    const current = normalizeMockSettings(eventId);
    const next = updater(current);
    mockGrayscaleLogos = next.grayscaleLogos;

    for (let index = mockSponsors.length - 1; index >= 0; index -= 1) {
      if (mockSponsors[index].eventId === eventId) {
        mockSponsors.splice(index, 1);
      }
    }

    mockSponsors.push(...next.sponsors.map((sponsor) => ({ ...sponsor, eventId })));
    return next;
  }

  const websiteSettingsJson = await getWebsiteSettingsJson(eventId);
  const current = normalizeSponsorsSettings(eventId, websiteSettingsJson.sponsors);
  const next = updater(current);

  await apiClient.patch(`/events/${eventId}/website-settings`, {
    websiteSettingsJson: {
      ...websiteSettingsJson,
      sponsors: toStoredSponsorsSettings(next),
    },
  });

  return next;
}

export async function getSponsorSettings(eventId: string): Promise<SponsorsSettings> {
  if (config.features.useMockData) {
    await delay();
    return normalizeMockSettings(eventId);
  }

  const websiteSettingsJson = await getWebsiteSettingsJson(eventId);
  return normalizeSponsorsSettings(eventId, websiteSettingsJson.sponsors);
}

export async function getSponsors(eventId: string): Promise<Sponsor[]> {
  const settings = await getSponsorSettings(eventId);
  return settings.sponsors;
}

export async function createSponsor(eventId: string, data: CreateSponsorRequest): Promise<Sponsor> {
  const logoUrl = getLogoUrl(data);
  if (!logoUrl) throw new Error('Logo is required');

  const now = new Date().toISOString();
  let created: Sponsor | null = null;

  await updateSponsorSettings(eventId, (settings) => {
    const nextOrder = settings.sponsors.length
      ? Math.max(...settings.sponsors.map((sponsor) => sponsor.order)) + 1
      : 0;

    created = {
      id: createId(),
      eventId,
      name: data.name.trim(),
      logo: data.logo || { assetId: createId(), url: logoUrl, altText: `${data.name.trim()} logo` },
      logoUrl,
      websiteUrl: normalizeWebsiteUrl(data.websiteUrl),
      description: data.description?.trim() || undefined,
      visible: data.visible ?? true,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...settings,
      sponsors: [...settings.sponsors, created],
    };
  });

  if (!created) throw new Error('Failed to create sponsor');
  return created;
}

export async function updateSponsor(eventId: string, sponsorId: string, data: UpdateSponsorRequest): Promise<Sponsor> {
  let updated: Sponsor | null = null;

  await updateSponsorSettings(eventId, (settings) => {
    const sponsors = settings.sponsors.map((sponsor) => {
      if (sponsor.id !== sponsorId) return sponsor;

      const logoUrl = data.logo || data.logoUrl ? getLogoUrl(data) : sponsor.logoUrl;
      updated = {
        ...sponsor,
        ...data,
        logo: data.logo || sponsor.logo,
        logoUrl,
        websiteUrl: data.websiteUrl !== undefined ? normalizeWebsiteUrl(data.websiteUrl) : sponsor.websiteUrl,
        description: data.description !== undefined ? data.description?.trim() || undefined : sponsor.description,
        visible: data.visible ?? sponsor.visible,
        order: data.order ?? sponsor.order,
        updatedAt: new Date().toISOString(),
      };

      return updated;
    });

    if (!updated) throw new Error('Sponsor not found');

    return {
      ...settings,
      sponsors,
    };
  });

  if (!updated) throw new Error('Sponsor not found');
  return updated;
}

export async function deleteSponsor(eventId: string, sponsorId: string): Promise<void> {
  await updateSponsorSettings(eventId, (settings) => ({
    ...settings,
    sponsors: settings.sponsors
      .filter((sponsor) => sponsor.id !== sponsorId)
      .map((sponsor, index) => ({ ...sponsor, order: index, updatedAt: new Date().toISOString() })),
  }));
}

export async function reorderSponsor(
  eventId: string,
  sponsorId: string,
  direction: ReorderDirection,
): Promise<Sponsor[]> {
  let updatedSponsors: Sponsor[] | null = null;

  await updateSponsorSettings(eventId, (settings) => {
    const sponsors = settings.sponsors.slice().sort((a, b) => a.order - b.order);
    const currentIndex = sponsors.findIndex((sponsor) => sponsor.id === sponsorId);
    if (currentIndex === -1) throw new Error('Sponsor not found');

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sponsors.length) {
      updatedSponsors = sponsors;
      return settings;
    }

    [sponsors[currentIndex], sponsors[swapIndex]] = [sponsors[swapIndex], sponsors[currentIndex]];
    updatedSponsors = sponsors.map((sponsor, index) => ({
      ...sponsor,
      order: index,
      updatedAt: new Date().toISOString(),
    }));

    return {
      ...settings,
      sponsors: updatedSponsors,
    };
  });

  return updatedSponsors || [];
}

export async function updateGrayscaleLogos(eventId: string, grayscaleLogos: boolean): Promise<SponsorsSettings> {
  return updateSponsorSettings(eventId, (settings) => ({
    ...settings,
    grayscaleLogos,
  }));
}
