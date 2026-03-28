// Template Registry - Enhanced template definitions with component references
// Adding a new template: 1) Create component, 2) Add entry here, 3) Import in index.ts
import React from 'react';
import {
  TemplateDefinition,
  WebsiteTheme,
  SectionId,
  DEFAULT_THEME_HORIZON,
  DEFAULT_THEME_PULSE,
} from '../types';

// ── Section Metadata ────────────────────────────────────────────────────────
// Describes each section's purpose and configuration options

export interface SectionMeta {
  id: SectionId;
  label: string;
  description: string;
  icon: string;
  /** Whether this section can be hidden (hero/footer typically can't) */
  canHide: boolean;
  /** Whether this section supports content overrides */
  hasOverrides: boolean;
  /** Available override fields for this section */
  overrideFields?: ('heading' | 'subheading' | 'buttonText' | 'buttonUrl' | 'description')[];
}

export const SECTION_METADATA: Record<SectionId, SectionMeta> = {
  hero: {
    id: 'hero',
    label: 'Hero',
    description: 'Event name, date, and main call-to-action',
    icon: 'layout',
    canHide: false,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText', 'buttonUrl'],
  },
  about: {
    id: 'about',
    label: 'About',
    description: 'Event description and details',
    icon: 'info',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'description'],
  },
  tickets: {
    id: 'tickets',
    label: 'Tickets',
    description: 'Registration and ticket purchase CTA',
    icon: 'ticket',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText'],
  },
  schedule: {
    id: 'schedule',
    label: 'Schedule',
    description: 'Programme timeline and sessions',
    icon: 'calendar',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading'],
  },
  speakers: {
    id: 'speakers',
    label: 'Speakers',
    description: 'Speaker cards and profiles',
    icon: 'mic',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading'],
  },
  sponsors: {
    id: 'sponsors',
    label: 'Sponsors',
    description: 'Partner logos and sponsorship tiers',
    icon: 'users',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading'],
  },
  voting: {
    id: 'voting',
    label: 'Voting',
    description: 'Live polls and voting CTA',
    icon: 'vote',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText'],
  },
  merch: {
    id: 'merch',
    label: 'Merchandise',
    description: 'Event merchandise and shop link',
    icon: 'shopping-bag',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText'],
  },
  forms: {
    id: 'forms',
    label: 'Forms',
    description: 'Surveys and data collection',
    icon: 'file-text',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText'],
  },
  gallery: {
    id: 'gallery',
    label: 'Gallery',
    description: 'Event photos and media',
    icon: 'image',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading', 'buttonText'],
  },
  faq: {
    id: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: 'help-circle',
    canHide: true,
    hasOverrides: true,
    overrideFields: ['heading', 'subheading'],
  },
  footer: {
    id: 'footer',
    label: 'Footer',
    description: 'Links, social media, and credits',
    icon: 'layout',
    canHide: false,
    hasOverrides: false,
  },
  custom: {
    id: 'custom',
    label: 'Custom Blocks',
    description: 'Custom content blocks position marker',
    icon: 'layout-grid',
    canHide: true,
    hasOverrides: false,
  },
};

// ── Enhanced Template Definition ────────────────────────────────────────────

export interface EnhancedTemplateDefinition extends TemplateDefinition {
  /** Default theme for this template */
  defaultTheme: WebsiteTheme;
  /** Sections that are always visible/required in this template */
  requiredSections: SectionId[];
  /** Sections hidden by default in this template */
  hiddenByDefault: SectionId[];
  /** Preview thumbnail URL */
  thumbnailUrl?: string;
  /** Template version for migrations */
  version: string;
  /** Whether this template supports dark mode */
  supportsDarkMode: boolean;
  /** Component import path (for dynamic loading in future) */
  componentPath: string;
}

export const TEMPLATE_REGISTRY: EnhancedTemplateDefinition[] = [
  {
    id: 'horizon',
    name: 'Horizon',
    description: 'Clean, modern layout with elegant typography and generous white space.',
    category: 'Single Event',
    useCase: 'Ideal for conferences, product launches, corporate events, and professional gatherings.',
    supportedModules: ['tickets', 'schedule', 'speakers', 'sponsors', 'forms', 'gallery', 'voting', 'merch'],
    accentStyle: 'light',
    previewColors: {
      bg: '#f8fafc',
      header: '#1e293b',
      accent: '#6366f1',
      text: '#475569',
      card: '#ffffff',
    },
    defaultTheme: DEFAULT_THEME_HORIZON,
    requiredSections: ['hero', 'footer'],
    hiddenByDefault: ['voting', 'merch', 'forms', 'gallery', 'faq'],
    version: '2.0.0',
    supportsDarkMode: false,
    componentPath: './templates/HorizonTemplate',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Bold, high-energy design with vibrant colors and immersive full-bleed visuals.',
    category: 'Festival',
    useCase: 'Perfect for music festivals, award shows, entertainment events, and conferences.',
    supportedModules: ['tickets', 'schedule', 'speakers', 'sponsors', 'voting', 'merch', 'gallery', 'forms'],
    accentStyle: 'dark',
    previewColors: {
      bg: '#0f172a',
      header: '#0f172a',
      accent: '#f59e0b',
      text: '#cbd5e1',
      card: '#1e293b',
    },
    defaultTheme: DEFAULT_THEME_PULSE,
    requiredSections: ['hero', 'footer'],
    hiddenByDefault: ['voting', 'merch', 'forms', 'gallery', 'faq'],
    version: '2.0.0',
    supportsDarkMode: true,
    componentPath: './templates/PulseTemplate',
  },
];

// ── Registry Helper Functions ───────────────────────────────────────────────

/**
 * Get template definition by ID
 */
export const getTemplateById = (id: string): EnhancedTemplateDefinition =>
  TEMPLATE_REGISTRY.find((t) => t.id === id) ?? TEMPLATE_REGISTRY[0];

/**
 * Get all available templates
 */
export const getAllTemplates = (): EnhancedTemplateDefinition[] => TEMPLATE_REGISTRY;

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): EnhancedTemplateDefinition[] =>
  TEMPLATE_REGISTRY.filter((t) => t.category === category);

/**
 * Get default theme for a template
 */
export const getDefaultThemeForTemplate = (templateId: string): WebsiteTheme => {
  const template = getTemplateById(templateId);
  return template.defaultTheme;
};

/**
 * Get section metadata by ID
 */
export const getSectionMeta = (sectionId: SectionId): SectionMeta =>
  SECTION_METADATA[sectionId];

/**
 * Get all section metadata
 */
export const getAllSectionMeta = (): SectionMeta[] =>
  Object.values(SECTION_METADATA);

/**
 * Check if a section can be hidden in a template
 */
export const canHideSection = (sectionId: SectionId, templateId: string): boolean => {
  const template = getTemplateById(templateId);
  const meta = getSectionMeta(sectionId);
  return meta.canHide && !template.requiredSections.includes(sectionId);
};

/**
 * Register a new template (for plugin system in future)
 */
export const registerTemplate = (template: EnhancedTemplateDefinition): void => {
  const existingIndex = TEMPLATE_REGISTRY.findIndex((t) => t.id === template.id);
  if (existingIndex >= 0) {
    TEMPLATE_REGISTRY[existingIndex] = template;
  } else {
    TEMPLATE_REGISTRY.push(template);
  }
};
