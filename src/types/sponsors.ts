import { WebsiteAssetRef } from '../modules/website/types';

export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  logoUrl: string;
  logo?: WebsiteAssetRef;
  websiteUrl?: string;
  description?: string;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorRequest {
  name: string;
  logoUrl?: string;
  logo?: WebsiteAssetRef;
  websiteUrl?: string;
  description?: string;
  visible?: boolean;
}

export interface UpdateSponsorRequest extends Partial<CreateSponsorRequest> {
  order?: number;
}

export type ReorderDirection = 'up' | 'down';

export interface SponsorsSettings {
  grayscaleLogos: boolean;
  sponsors: Sponsor[];
}

export const DEFAULT_SPONSORS_SETTINGS: SponsorsSettings = {
  grayscaleLogos: false,
  sponsors: [],
};
