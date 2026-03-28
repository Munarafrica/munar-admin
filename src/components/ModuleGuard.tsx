// Module Guard - Protects module routes based on enabled/disabled state
// Core architectural component from the Munar modular specification

import React from 'react';
import { useEvent } from '../contexts/EventContext';
import { ModuleType, isModuleEnabled, getModuleByType } from '../types/modules';
import { ModuleNotFound } from '../pages/NotFound';

interface ModuleGuardProps {
  /** The module type to check */
  moduleType: ModuleType;
  /** Content to render if the module is enabled */
  children: React.ReactNode;
  /** Optional custom fallback (defaults to ModuleNotFound) */
  fallback?: React.ReactNode;
}

/**
 * ModuleGuard wraps module content and checks if the module is enabled.
 * If disabled, renders a custom 404 with optional redirect to event website.
 * 
 * Usage:
 * ```tsx
 * <ModuleGuard moduleType="tickets">
 *   <TicketModule />
 * </ModuleGuard>
 * ```
 */
export function ModuleGuard({ moduleType, children, fallback }: ModuleGuardProps) {
  const { currentEvent, isLoading } = useEvent();

  // While loading, show nothing (or a loader)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  // If no event loaded, this is unexpected — event resolver should have caught it
  if (!currentEvent) {
    return fallback ? <>{fallback}</> : <ModuleNotFound />;
  }

  // Check if the module is enabled
  const moduleDef = getModuleByType(moduleType);
  const enabledModules = currentEvent.enabledModules || [];

  // If no enabledModules configured (legacy/mock data), allow all modules
  if (enabledModules.length === 0) {
    return <>{children}</>;
  }

  if (!isModuleEnabled(moduleType, enabledModules)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <ModuleNotFound
        moduleName={moduleDef?.name}
        eventName={currentEvent.name}
        eventWebsiteUrl={currentEvent.websiteUrl}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if a specific module is enabled for the current event.
 * Does not render a guard — useful for conditional UI elements.
 * 
 * Usage:
 * ```tsx
 * const { isEnabled, moduleDef } = useModuleGuard('tickets');
 * if (isEnabled) { ... }
 * ```
 */
export function useModuleGuard(moduleType: ModuleType) {
  const { currentEvent, isLoading } = useEvent();
  const moduleDef = getModuleByType(moduleType);
  const enabledModules = currentEvent?.enabledModules || [];

  // If no enabledModules configured (legacy/mock data), treat all as enabled
  const isEnabled =
    enabledModules.length === 0 || isModuleEnabled(moduleType, enabledModules);

  return {
    isEnabled,
    isLoading,
    moduleDef,
    moduleType,
  };
}
