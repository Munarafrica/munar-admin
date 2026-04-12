// DP & Cover Maker Module
// Standalone module for generating branded display pictures
// Public route: /dp-maker
// Admin route: /events/:eventId/dp-maker

export { DPMakerAdmin } from '../../pages/DPMakerAdmin';
export { DPMakerPublic } from '../../pages/DPMakerPublic';
export { dpCoverMakerService } from './service';
export type {
  DpCoverMakerConfig,
  DpCoverMakerFrameAsset,
  DpCoverMakerShape,
  DpCoverMakerTextAlign,
  DpCoverMakerVariant,
  DpCoverMakerVariantKey,
} from './types';
