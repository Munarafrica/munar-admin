import { apiClient } from '../../lib/api-client';
import { config } from '../../config';
import { EventSettings, UpdateEventSettingsRequest } from '../../types/api';
import { websiteUploadService } from '../../services/website-upload.service';
import {
  createDefaultDpCoverMakerConfig,
  DpCoverMakerConfig,
  DpCoverMakerFrameAsset,
  DpCoverMakerVariantKey,
  PublicDpCoverMakerResponse,
} from './types';

const MOCK_CONFIG_KEY = 'munar_dp_cover_maker_configs';
const MOCK_SLUG_KEY = 'munar_dp_cover_maker_config_slugs';

type StoredConfigs = Record<string, DpCoverMakerConfig>;
type StoredSlugMap = Record<string, string>;

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

const unwrapSettings = (response: EventSettings | { data?: EventSettings }): EventSettings =>
  ('data' in response && response.data ? response.data : response) as EventSettings;

function normalizeConfig(value: unknown, eventSlug: string): DpCoverMakerConfig {
  const fallback = createDefaultDpCoverMakerConfig(eventSlug);
  if (!value || typeof value !== 'object') return fallback;
  const incoming = value as Partial<DpCoverMakerConfig>;
  return {
    ...fallback,
    ...incoming,
    sharePath: incoming.sharePath || fallback.sharePath,
    variants: {
      dp: {
        ...fallback.variants.dp,
        ...(incoming.variants?.dp ?? {}),
        canvas: { ...fallback.variants.dp.canvas, ...(incoming.variants?.dp?.canvas ?? {}) },
        photoPlaceholder: { ...fallback.variants.dp.photoPlaceholder, ...(incoming.variants?.dp?.photoPlaceholder ?? {}) },
        nameText: { ...fallback.variants.dp.nameText, ...(incoming.variants?.dp?.nameText ?? {}) },
      },
      cover: incoming.variants?.cover
        ? {
            ...fallback.variants.cover!,
            ...incoming.variants.cover,
            canvas: { ...fallback.variants.cover!.canvas, ...(incoming.variants.cover.canvas ?? {}) },
            photoPlaceholder: { ...fallback.variants.cover!.photoPlaceholder, ...(incoming.variants.cover.photoPlaceholder ?? {}) },
            nameText: { ...fallback.variants.cover!.nameText, ...(incoming.variants.cover.nameText ?? {}) },
          }
        : fallback.variants.cover,
    },
  };
}

export const dpCoverMakerService = {
  async loadAdminConfig(eventId: string, eventSlug: string): Promise<{ settings: EventSettings | null; config: DpCoverMakerConfig }> {
    if (config.features.useMockData) {
      const configs = readJson<StoredConfigs>(MOCK_CONFIG_KEY, {});
      return {
        settings: null,
        config: normalizeConfig(configs[eventId], eventSlug),
      };
    }

    const settings = unwrapSettings(await apiClient.get<EventSettings | { data: EventSettings }>(`/events/${eventId}/settings`));
    return {
      settings,
      config: normalizeConfig(settings.brandingJson?.dpCoverMaker, eventSlug),
    };
  },

  async uploadFrame(eventId: string, file: File): Promise<DpCoverMakerFrameAsset> {
    if (config.features.useMockData) {
      const dimensions = await websiteUploadService.getImageDimensions(file).catch(() => ({ width: undefined, height: undefined }));
      return {
        assetId: `local-${Date.now()}`,
        url: URL.createObjectURL(file),
        mimeType: file.type,
        width: dimensions.width,
        height: dimensions.height,
      };
    }

    const asset = await websiteUploadService.uploadImage(eventId, file, 'custom-block', 'DP maker transparent event frame');
    return {
      assetId: asset.id,
      url: asset.url,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
    };
  },

  async saveConfig(
    eventId: string,
    eventSlug: string,
    nextConfig: DpCoverMakerConfig,
    existingSettings: EventSettings | null,
  ): Promise<DpCoverMakerConfig> {
    const configToSave: DpCoverMakerConfig = {
      ...nextConfig,
      enabled: true,
      published: true,
      sharePath: `/events/${eventSlug}/dp`,
      updatedAt: new Date().toISOString(),
    };

    if (config.features.useMockData) {
      const configs = readJson<StoredConfigs>(MOCK_CONFIG_KEY, {});
      const slugMap = readJson<StoredSlugMap>(MOCK_SLUG_KEY, {});
      writeJson(MOCK_CONFIG_KEY, { ...configs, [eventId]: configToSave });
      writeJson(MOCK_SLUG_KEY, { ...slugMap, [eventSlug]: eventId });
      return configToSave;
    }

    const settings = existingSettings ?? unwrapSettings(await apiClient.get<EventSettings | { data: EventSettings }>(`/events/${eventId}/settings`));
    await apiClient.patch<EventSettings>(
      `/events/${eventId}/settings`,
      {
        brandingJson: {
          ...(settings.brandingJson ?? {}),
          dpCoverMaker: configToSave,
        },
      } satisfies UpdateEventSettingsRequest,
    );

    return configToSave;
  },

  async loadPublicConfig(eventSlug: string): Promise<PublicDpCoverMakerResponse> {
    if (config.features.useMockData) {
      const configs = readJson<StoredConfigs>(MOCK_CONFIG_KEY, {});
      const slugMap = readJson<StoredSlugMap>(MOCK_SLUG_KEY, {});
      const eventId = slugMap[eventSlug];
      const makerConfig = eventId ? configs[eventId] : null;
      if (!makerConfig?.enabled || !makerConfig.published || !makerConfig.variants.dp.frameAsset) {
        throw new Error('This event frame is not published yet.');
      }
      return {
        event: { id: eventId, slug: eventSlug, title: eventSlug.replace(/-/g, ' '), coverImageUrl: null, logoUrl: null },
        config: makerConfig,
      };
    }

    return apiClient.get<PublicDpCoverMakerResponse>(`/public/events/${eventSlug}/dp-cover-maker`);
  },

  getVariant(config: DpCoverMakerConfig, variantKey: DpCoverMakerVariantKey) {
    return variantKey === 'cover' ? config.variants.cover ?? config.variants.dp : config.variants.dp;
  },
};
