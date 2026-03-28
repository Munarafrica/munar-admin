// Website Module
// The central event website — template-driven marketing hub
// Public route: / (root of event slug)
// Admin route: /events/:eventId/website (Website Builder)

export { EventWebsitePublic } from './EventWebsitePublic';
export type {
  WebsiteConfig, WebsiteTheme, SectionConfig, WebsiteTemplateId, SectionId,
  WebsitePreviewMessage, WebsitePreviewReadyMessage, WebsiteSectionClickMessage,
} from './types';
export { DEFAULT_WEBSITE_CONFIG, DEFAULT_SECTIONS, DEFAULT_THEME_HORIZON, DEFAULT_THEME_PULSE } from './types';
export { HorizonTemplate } from './templates/HorizonTemplate';
export { PulseTemplate } from './templates/PulseTemplate';
export { TEMPLATE_REGISTRY, getTemplateById } from './templates/registry';
