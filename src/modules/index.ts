// Modules Index - Central export for all Munar modules
// Each module is independently importable and follows the module contract

// Core modules
export * from './website';
export * from './tickets';
export * from './forms';
export * from './program';

// Growth modules
export * from './voting';
export * from './merch';
export * from './dp-maker';
export * from './sponsors';

// Operations modules
export * from './gallery';
export * from './analytics';

// Re-export module types and registry
export {
  MODULE_REGISTRY,
  getModuleDefinitions,
  getStandaloneModules,
  getWebsiteOnlyModules,
  getModuleByType,
  getModuleBySlug,
  isModuleEnabled,
  getDefaultModuleConfigs,
} from '../types/modules';

export type {
  ModuleType,
  ModuleCategory,
  ModuleVisibility,
  ModuleConfig,
  ModuleDefinition,
  ModuleAnalytics,
  EventWallet,
  EventBranding,
} from '../types/modules';
