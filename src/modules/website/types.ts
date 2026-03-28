// Website Module Types
// Configuration for the Event Website Builder
// Architecture: Templates are the engine, sections are reusable building blocks

export type WebsiteTemplateId = 'horizon' | 'pulse';
export type WebsiteStatus = 'draft' | 'published';
export type AccessControl = 'public' | 'password' | 'private';

// Standard section types (built-in sections)
// 'custom' is a special marker for where custom blocks are rendered in the template
export type SectionId =
  | 'hero'
  | 'about'
  | 'schedule'
  | 'speakers'
  | 'sponsors'
  | 'tickets'
  | 'voting'
  | 'merch'
  | 'forms'
  | 'gallery'
  | 'faq'
  | 'footer'
  | 'custom';

// ── Custom content block types ──────────────────────────────────────────────

export type CustomBlockLayout =
  | 'text-image-left'
  | 'text-image-right'
  | 'full-text'
  | 'image-grid'
  | 'cta-banner'
  | 'testimonial';

export interface CustomBlock {
  id: string;
  layout: CustomBlockLayout;
  title: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  buttonText?: string;
  buttonUrl?: string;
  author?: string;
  authorRole?: string;
}

// ── Unified Building Block System ───────────────────────────────────────────
// All sections (standard and custom) are represented as BuildingBlocks
// This enables custom blocks to be interspersed anywhere among standard sections

export type BuildingBlockType = 'section' | 'custom-block';

export interface BuildingBlock {
  /** Unique identifier. For sections: 'section-{id}', for custom blocks: 'block-{id}' */
  id: string;
  /** Type discriminator */
  type: BuildingBlockType;
  /** Display order in the rendered page */
  order: number;
  /** Whether this block is visible */
  visible: boolean;
  /** For sections: the SectionId; for custom blocks: the CustomBlock */
  data: SectionId | CustomBlock;
}

// ── Section Content Overrides ───────────────────────────────────────────────
// Allow per-section customization of headings, button labels, etc.

export interface SectionOverrides {
  /** Custom heading text (overrides default) */
  heading?: string;
  /** Custom subheading/tagline */
  subheading?: string;
  /** Primary button text */
  buttonText?: string;
  /** Primary button URL (if different from default) */
  buttonUrl?: string;
  /** Secondary button text */
  secondaryButtonText?: string;
  /** Secondary button URL */
  secondaryButtonUrl?: string;
  /** Custom description/intro text */
  description?: string;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  visible: boolean;
  order: number;
  variant?: string;
  /** Per-section content overrides */
  overrides?: SectionOverrides;
}

export interface WebsiteTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: 'sharp' | 'rounded' | 'pill';
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Hero', visible: true, order: 0 },
  { id: 'about', label: 'About', visible: true, order: 1 },
  { id: 'tickets', label: 'Tickets', visible: true, order: 2 },
  { id: 'schedule', label: 'Schedule', visible: true, order: 3 },
  { id: 'speakers', label: 'Speakers', visible: true, order: 4 },
  { id: 'sponsors', label: 'Sponsors', visible: true, order: 5 },
  { id: 'voting', label: 'Voting', visible: false, order: 6 },
  { id: 'merch', label: 'Merchandise', visible: false, order: 7 },
  { id: 'forms', label: 'Forms', visible: false, order: 8 },
  { id: 'gallery', label: 'Gallery', visible: false, order: 9 },
  { id: 'faq', label: 'FAQ', visible: false, order: 10 },
  { id: 'footer', label: 'Footer', visible: true, order: 11 },
];

// ── Building Block Utilities ────────────────────────────────────────────────

/**
 * Convert sections and custom blocks to unified building blocks array
 * This enables proper ordering with custom blocks interspersed among sections
 */
export function toBuildingBlocks(
  sections: SectionConfig[],
  customBlocks: CustomBlock[] = []
): BuildingBlock[] {
  const blocks: BuildingBlock[] = [];
  
  // Add section blocks
  sections.forEach((section) => {
    blocks.push({
      id: `section-${section.id}`,
      type: 'section',
      order: section.order,
      visible: section.visible,
      data: section.id,
    });
  });
  
  // Add custom blocks (they already have ids)
  customBlocks.forEach((block, idx) => {
    blocks.push({
      id: `block-${block.id}`,
      type: 'custom-block',
      order: sections.length + idx, // Default to end if no order specified
      visible: true,
      data: block,
    });
  });
  
  return blocks.sort((a, b) => a.order - b.order);
}

/**
 * Extract sections and custom blocks from building blocks array
 */
export function fromBuildingBlocks(blocks: BuildingBlock[]): {
  sections: SectionConfig[];
  customBlocks: CustomBlock[];
} {
  const sections: SectionConfig[] = [];
  const customBlocks: CustomBlock[] = [];
  
  blocks.forEach((block) => {
    if (block.type === 'section') {
      const sectionId = block.data as SectionId;
      const defaultSection = DEFAULT_SECTIONS.find((s) => s.id === sectionId);
      sections.push({
        id: sectionId,
        label: defaultSection?.label || sectionId,
        visible: block.visible,
        order: block.order,
      });
    } else {
      customBlocks.push(block.data as CustomBlock);
    }
  });
  
  return { sections, customBlocks };
}

export interface WebsiteConfig {
  templateId: WebsiteTemplateId;
  status: WebsiteStatus;
  theme: WebsiteTheme;
  sections: SectionConfig[];
  seo: {
    title: string;
    description: string;
    socialImage?: string;
  };
  slug?: string;
  accessControl: AccessControl;
  password?: string;
  lastSaved?: string;
  /** Custom logo URL shown in the website navbar */
  logoUrl?: string;
  /** Whether the sticky navbar is shown */
  navbarEnabled?: boolean;
  /** 
   * Custom content blocks - can be placed anywhere among sections
   * Each block has an 'order' property that determines its position
   */
  customBlocks?: CustomBlock[];
  /** 
   * Unified building blocks array for complete render order control
   * When present, this takes precedence over sections/customBlocks ordering
   */
  buildingBlocks?: BuildingBlock[];
  /** Social media URLs for the footer */
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export const DEFAULT_THEME_HORIZON: WebsiteTheme = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  headingFont: 'Raleway',
  bodyFont: 'Raleway',
  borderRadius: 'rounded',
  buttonStyle: 'solid',
};

export const DEFAULT_THEME_PULSE: WebsiteTheme = {
  primaryColor: '#f59e0b',
  secondaryColor: '#ef4444',
  accentColor: '#06b6d4',
  backgroundColor: '#0f172a',
  headingFont: 'Raleway',
  bodyFont: 'Raleway',
  borderRadius: 'rounded',
  buttonStyle: 'solid',
};

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  templateId: 'horizon',
  status: 'draft',
  theme: DEFAULT_THEME_HORIZON,
  sections: DEFAULT_SECTIONS,
  seo: { title: '', description: '' },
  accessControl: 'public',
};

// Template definition for the template picker
export interface TemplateDefinition {
  id: WebsiteTemplateId;
  name: string;
  description: string;
  category: string;
  useCase: string;
  supportedModules: string[];
  accentStyle: 'light' | 'dark';
  previewColors: {
    bg: string;
    header: string;
    accent: string;
    text: string;
    card: string;
  };
}

// PostMessage event for real-time preview sync between builder and iframe
export interface WebsitePreviewMessage {
  type: 'WEBSITE_PREVIEW_CONFIG';
  config: WebsiteConfig;
  eventSlug: string;
  /** Highlights the given section in the live preview */
  selectedSectionId?: SectionId | null;
}

export interface WebsitePreviewReadyMessage {
  type: 'WEBSITE_PREVIEW_READY';
}

/** Sent from the iframe template back to the builder when a section is clicked */
export interface WebsiteSectionClickMessage {
  type: 'WEBSITE_SECTION_CLICK';
  sectionId: SectionId;
}
