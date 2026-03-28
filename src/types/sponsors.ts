export interface Sponsor {
  id: string;
  eventId: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  description?: string;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorRequest {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  description?: string;
  visible?: boolean;
}

export interface UpdateSponsorRequest extends Partial<CreateSponsorRequest> {
  order?: number;
}

export type ReorderDirection = 'up' | 'down';
