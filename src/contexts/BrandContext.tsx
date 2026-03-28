// Brand Context - Provides event branding to all modules
// Ensures visual consistency across standalone module pages
import React, { createContext, useContext, useMemo } from 'react';
import { EventBranding } from '../types/modules';

interface BrandContextValue {
  /** Current event branding */
  branding: EventBranding;
  /** CSS custom properties derived from branding */
  cssVariables: Record<string, string>;
  /** Whether custom branding is applied (vs default Munar branding) */
  isCustomBranded: boolean;
}

const defaultBranding: EventBranding = {
  primaryColor: '#030213',
  secondaryColor: '#6366f1',
  accentColor: '#8b5cf6',
  fontFamily: 'Raleway',
  darkMode: false,
};

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

interface BrandProviderProps {
  children: React.ReactNode;
  /** Event branding configuration. Falls back to Munar defaults if not provided. */
  branding?: Partial<EventBranding>;
}

/**
 * BrandProvider wraps module content and injects event branding.
 * All modules inherit the event's logo, colors, and typography through this provider.
 * 
 * Usage:
 * ```tsx
 * <BrandProvider branding={event.branding}>
 *   <TicketModule />
 * </BrandProvider>
 * ```
 */
export function BrandProvider({ children, branding: brandingOverrides }: BrandProviderProps) {
  const branding = useMemo<EventBranding>(
    () => ({
      ...defaultBranding,
      ...brandingOverrides,
    }),
    [brandingOverrides]
  );

  const cssVariables = useMemo<Record<string, string>>(
    () => ({
      '--event-primary': branding.primaryColor,
      '--event-secondary': branding.secondaryColor,
      '--event-accent': branding.accentColor,
      '--event-font': branding.fontFamily,
    }),
    [branding]
  );

  const isCustomBranded = !!brandingOverrides?.primaryColor || !!brandingOverrides?.logo;

  const value: BrandContextValue = {
    branding,
    cssVariables,
    isCustomBranded,
  };

  return (
    <BrandContext.Provider value={value}>
      <div style={cssVariables as React.CSSProperties}>
        {children}
      </div>
    </BrandContext.Provider>
  );
}

/**
 * Hook to access event branding in any module component.
 * Must be used within a BrandProvider.
 */
export function useBrand(): BrandContextValue {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}

/**
 * Hook that returns branding if available, or defaults if outside BrandProvider.
 * Safe to use in components that may or may not be wrapped in a BrandProvider.
 */
export function useBrandSafe(): BrandContextValue {
  const context = useContext(BrandContext);
  if (!context) {
    return {
      branding: defaultBranding,
      cssVariables: {
        '--event-primary': defaultBranding.primaryColor,
        '--event-secondary': defaultBranding.secondaryColor,
        '--event-accent': defaultBranding.accentColor,
        '--event-font': defaultBranding.fontFamily,
      },
      isCustomBranded: false,
    };
  }
  return context;
}

export { defaultBranding };
