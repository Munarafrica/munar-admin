// AppShell - Top-level application shell
// Implements the layered architecture: Platform → Event → Module
// 
// Architecture diagram:
// <AppShell>
//   <EventResolver>
//     <BrandProvider>
//       <EventLayout>
//         <RouteRenderer />
//       </EventLayout>
//     </BrandProvider>
//   </EventResolver>
// </AppShell>

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from '../contexts';

interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * AppShell is the outermost wrapper for the entire Munar application.
 * Handles platform-level concerns:
 * - Theme management (dark/light mode)
 * - Authentication state
 * - Global error boundaries
 * 
 * Children are rendered via React Router's <Outlet /> or passed explicitly.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <div className="text-slate-900 dark:text-foreground bg-background antialiased selection:bg-purple-100 selection:text-purple-900">
          {children || <Outlet />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * EventLayout wraps event-scoped pages with shared chrome.
 * This is where shared event UI elements (header, nav) would go.
 * Currently passes through to children — ready for future expansion.
 */
export function EventLayout({ children }: { children?: React.ReactNode }) {
  return <>{children || <Outlet />}</>;
}

/**
 * PublicLayout wraps public-facing module pages.
 * Uses minimal branding and skips admin chrome.
 * Suitable for embedded module views as well.
 */
export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      {children || <Outlet />}
    </div>
  );
}
