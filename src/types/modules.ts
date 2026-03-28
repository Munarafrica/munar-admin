// Module System Types - Defines the contract for Munar's modular architecture
// Every module is a first-class citizen that can be independently enabled/disabled

/**
 * All available module types in Munar.
 * Modules are self-contained features that only depend on the Event Core.
 */
export type ModuleType =
  | 'website'
  | 'tickets'
  | 'voting'
  | 'merch'
  | 'forms'
  | 'dp-maker'
  | 'gallery'
  | 'sponsors'
  | 'program'
  | 'analytics';

/**
 * Module categories for organizational grouping in the dashboard.
 */
export type ModuleCategory = 'Core' | 'Growth' | 'Operations';

/**
 * Visibility of a module on the event website and public routes.
 */
export type ModuleVisibility = 'public' | 'private' | 'hidden';

/**
 * The configuration for a single module instance within an event.
 */
export interface ModuleConfig {
  /** Module type identifier */
  type: ModuleType;
  /** Whether the module is currently enabled */
  enabled: boolean;
  /** Public visibility setting */
  visibility: ModuleVisibility;
  /** Module-specific configuration data (varies by module type) */
  config?: Record<string, unknown>;
  /** Whether analytics are active for this module */
  analyticsEnabled: boolean;
  /** Display order on dashboard */
  order: number;
}

/**
 * Module definition in the registry - describes a module's metadata.
 */
export interface ModuleDefinition {
  /** Unique module type */
  type: ModuleType;
  /** Human-readable name */
  name: string;
  /** Short description */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Icon color for dashboard display */
  iconColor: string;
  /** URL slug for routing (e.g., 'tickets', 'voting') */
  slug: string;
  /** Category grouping */
  category: ModuleCategory;
  /** Whether this module can operate as a standalone public page */
  isStandalone: boolean;
  /** Whether this module renders only as a section on the event website */
  isWebsiteOnly: boolean;
  /** Admin route path (relative to event) */
  adminRoute: string;
  /** Public route path (relative to event slug), null if not standalone */
  publicRoute: string | null;
  /** Whether this module supports paid transactions */
  supportsPaidTransactions: boolean;
}

/**
 * Module analytics data - each module tracks independently.
 */
export interface ModuleAnalytics {
  moduleType: ModuleType;
  views: number;
  conversions: number;
  revenue: number;
  period: 'day' | 'week' | 'month' | 'all-time';
}

/**
 * Event wallet - unified payment endpoint for all module transactions.
 */
export interface EventWallet {
  id: string;
  eventId: string;
  balance: number;
  currency: string;
  totalRevenue: number;
  totalCommission: number;
  pendingPayouts: number;
  lastUpdated: string;
}

/**
 * Event branding configuration inherited by all modules.
 */
export interface EventBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  darkMode: boolean;
}

// ─── Module Registry ─────────────────────────────────────────────────────────

/**
 * The canonical module registry. Every module in Munar is defined here.
 * New modules must be added to this registry to follow the module contract.
 */
export const MODULE_REGISTRY: Record<ModuleType, ModuleDefinition> = {
  website: {
    type: 'website',
    name: 'Event Website',
    description: 'Customizable marketing and information hub',
    icon: 'globe',
    iconColor: 'green',
    slug: '',
    category: 'Core',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'website',
    publicRoute: '',
    supportsPaidTransactions: false,
  },
  tickets: {
    type: 'tickets',
    name: 'Tickets',
    description: 'Sell and distribute event tickets',
    icon: 'ticket',
    iconColor: 'orange',
    slug: 'tickets',
    category: 'Core',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'tickets',
    publicRoute: 'tickets',
    supportsPaidTransactions: true,
  },
  voting: {
    type: 'voting',
    name: 'Voting',
    description: 'Enable audience voting and polls',
    icon: 'vote',
    iconColor: 'indigo',
    slug: 'voting',
    category: 'Growth',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'voting',
    publicRoute: 'voting',
    supportsPaidTransactions: true,
  },
  merch: {
    type: 'merch',
    name: 'Merchandise',
    description: 'Sell branded merchandise',
    icon: 'shopping-bag',
    iconColor: 'gray',
    slug: 'merch',
    category: 'Growth',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'merchandise',
    publicRoute: 'merch',
    supportsPaidTransactions: true,
  },
  forms: {
    type: 'forms',
    name: 'Forms & Surveys',
    description: 'Collect structured responses from attendees',
    icon: 'file-text',
    iconColor: 'pink',
    slug: 'forms',
    category: 'Core',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'forms',
    publicRoute: 'forms',
    supportsPaidTransactions: false,
  },
  'dp-maker': {
    type: 'dp-maker',
    name: 'DP & Cover Maker',
    description: 'Generate branded display pictures and covers',
    icon: 'image',
    iconColor: 'purple',
    slug: 'dp-maker',
    category: 'Growth',
    isStandalone: true,
    isWebsiteOnly: false,
    adminRoute: 'dp-maker',
    publicRoute: 'dp-maker',
    supportsPaidTransactions: false,
  },
  gallery: {
    type: 'gallery',
    name: 'Event Media & Gallery',
    description: 'Upload and publish event gallery',
    icon: 'image',
    iconColor: 'purple',
    slug: 'gallery',
    category: 'Operations',
    isStandalone: false,
    isWebsiteOnly: true,
    adminRoute: 'gallery',
    publicRoute: 'gallery',
    supportsPaidTransactions: false,
  },
  sponsors: {
    type: 'sponsors',
    name: 'Sponsors',
    description: 'Manage brand partners and sponsorships',
    icon: 'users',
    iconColor: 'blue',
    slug: 'sponsors',
    category: 'Growth',
    isStandalone: false,
    isWebsiteOnly: true,
    adminRoute: 'sponsors',
    publicRoute: null,
    supportsPaidTransactions: false,
  },
  program: {
    type: 'program',
    name: 'Schedule & Speakers',
    description: 'Manage sessions, speakers, and timeline',
    icon: 'calendar',
    iconColor: 'pink',
    slug: 'program',
    category: 'Core',
    isStandalone: false,
    isWebsiteOnly: true,
    adminRoute: 'program',
    publicRoute: null,
    supportsPaidTransactions: false,
  },
  analytics: {
    type: 'analytics',
    name: 'Analytics',
    description: 'Aggregated view across all enabled modules',
    icon: 'bar-chart-3',
    iconColor: 'indigo',
    slug: 'analytics',
    category: 'Operations',
    isStandalone: false,
    isWebsiteOnly: false,
    adminRoute: 'analytics',
    publicRoute: null,
    supportsPaidTransactions: false,
  },
};

// ─── Utility Functions ───────────────────────────────────────────────────────

/** Get all module definitions as an array */
export function getModuleDefinitions(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/** Get only standalone modules (can operate as public pages) */
export function getStandaloneModules(): ModuleDefinition[] {
  return getModuleDefinitions().filter((m) => m.isStandalone);
}

/** Get modules that render only on the event website */
export function getWebsiteOnlyModules(): ModuleDefinition[] {
  return getModuleDefinitions().filter((m) => m.isWebsiteOnly);
}

/** Get module definition by type */
export function getModuleByType(type: ModuleType): ModuleDefinition | undefined {
  return MODULE_REGISTRY[type];
}

/** Get module definition by slug */
export function getModuleBySlug(slug: string): ModuleDefinition | undefined {
  return getModuleDefinitions().find((m) => m.slug === slug);
}

/** Check if a module type is enabled in a list of module configs */
export function isModuleEnabled(
  moduleType: ModuleType,
  enabledModules: ModuleConfig[]
): boolean {
  const mod = enabledModules.find((m) => m.type === moduleType);
  return mod?.enabled ?? false;
}

/** Get default module configs for a new event (all disabled except analytics) */
export function getDefaultModuleConfigs(): ModuleConfig[] {
  return getModuleDefinitions().map((def, index) => ({
    type: def.type,
    enabled: def.type === 'analytics', // Analytics always enabled by default
    visibility: 'public' as ModuleVisibility,
    analyticsEnabled: true,
    order: index,
  }));
}

/** Get all module types that have public routes */
export function getPublicModuleTypes(): ModuleType[] {
  return getModuleDefinitions()
    .filter((m) => m.publicRoute !== null)
    .map((m) => m.type);
}
