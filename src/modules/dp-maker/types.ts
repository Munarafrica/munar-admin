export type DpCoverMakerVariantKey = 'dp' | 'cover';
export type DpCoverMakerShape = 'circle' | 'square' | 'rounded' | 'hexagon' | 'star' | 'heart';
export type DpCoverMakerTextAlign = 'left' | 'center' | 'right';

export type DpCoverMakerFrameAsset = {
  assetId: string;
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
};

export type DpCoverMakerVariant = {
  label: 'DP' | 'Cover';
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  frameAsset: DpCoverMakerFrameAsset | null;
  photoPlaceholder: {
    shape: DpCoverMakerShape;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    borderRadius?: number;
  };
  nameText: {
    enabled: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    align: DpCoverMakerTextAlign;
    placeholder: string;
  };
};

export type DpCoverMakerConfig = {
  enabled: boolean;
  published: boolean;
  sharePath: string;
  updatedAt: string;
  variants: {
    dp: DpCoverMakerVariant;
    cover?: DpCoverMakerVariant;
  };
};

export type PublicDpCoverMakerResponse = {
  event: {
    id: string;
    slug: string;
    title: string;
    coverImageUrl: string | null;
    logoUrl: string | null;
  };
  config: DpCoverMakerConfig;
};

export const defaultDpVariant: DpCoverMakerVariant = {
  label: 'DP',
  canvas: {
    width: 1080,
    height: 1080,
    backgroundColor: '#000000',
  },
  frameAsset: null,
  photoPlaceholder: {
    shape: 'circle',
    x: 340,
    y: 250,
    width: 400,
    height: 400,
    rotation: 0,
  },
  nameText: {
    enabled: true,
    x: 190,
    y: 760,
    width: 700,
    height: 96,
    fontFamily: 'Raleway',
    fontSize: 48,
    fontWeight: 700,
    color: '#ffffff',
    align: 'center',
    placeholder: 'Your Name',
  },
};

export const defaultCoverVariant: DpCoverMakerVariant = {
  label: 'Cover',
  canvas: {
    width: 1640,
    height: 924,
    backgroundColor: '#000000',
  },
  frameAsset: null,
  photoPlaceholder: {
    shape: 'rounded',
    x: 120,
    y: 220,
    width: 420,
    height: 420,
    rotation: 0,
    borderRadius: 48,
  },
  nameText: {
    enabled: true,
    x: 620,
    y: 450,
    width: 860,
    height: 108,
    fontFamily: 'Raleway',
    fontSize: 64,
    fontWeight: 700,
    color: '#ffffff',
    align: 'left',
    placeholder: 'Your Name',
  },
};

export const createDefaultDpCoverMakerConfig = (eventSlug = 'event'): DpCoverMakerConfig => ({
  enabled: false,
  published: false,
  sharePath: `/events/${eventSlug}/dp`,
  updatedAt: new Date(0).toISOString(),
  variants: {
    dp: { ...defaultDpVariant, canvas: { ...defaultDpVariant.canvas }, photoPlaceholder: { ...defaultDpVariant.photoPlaceholder }, nameText: { ...defaultDpVariant.nameText } },
    cover: { ...defaultCoverVariant, canvas: { ...defaultCoverVariant.canvas }, photoPlaceholder: { ...defaultCoverVariant.photoPlaceholder }, nameText: { ...defaultCoverVariant.nameText } },
  },
});
