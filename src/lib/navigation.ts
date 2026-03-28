// Navigation compatibility layer
// Bridges the old onNavigate(page) pattern with React Router's useNavigate()
// This allows existing page components to work unchanged during the migration

import { useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { getCurrentEventId } from './event-storage';

// Legacy page type (kept for backward compatibility)
export type LegacyPage =
  | 'login'
  | 'signup'
  | 'verification'
  | 'account-type'
  | 'profile-setup'
  | 'forgot-password'
  | 'reset-password'
  | 'my-events'
  | 'create-event'
  | 'event-dashboard'
  | 'ticket-management'
  | 'program-management'
  | 'form-management'
  | 'merchandise-management'
  | 'voting-management'
  | 'public-vote'
  | 'dp-maker-admin'
  | 'dp-maker-public'
  | 'gallery-admin'
  | 'gallery-public'
  | 'sponsors-management'
  | 'event-analytics'
  | 'website-builder'
  | 'change-password';

/**
 * Maps old page names to new React Router paths.
 * Event-scoped pages are relative to /events/:eventId/
 */
function getRoutePath(page: LegacyPage, eventId?: string): string {
  // Never fall back to mock ID 'evt-1' in real API mode
  const eid = eventId || getCurrentEventId() || 'evt-1';

  const routeMap: Record<LegacyPage, string> = {
    // Auth routes
    'login': '/login',
    'signup': '/signup',
    'verification': '/verify-email',
    'account-type': '/account-type',
    'profile-setup': '/profile-setup',
    'forgot-password': '/forgot-password',
    'reset-password': '/reset-password',
    'change-password': '/change-password',

    // Platform routes
    'my-events': '/events',
    'create-event': '/events/create',

    // Event admin routes
    'event-dashboard': `/events/${eid}`,
    'website-builder': `/events/${eid}/website`,
    'ticket-management': `/events/${eid}/tickets`,
    'program-management': `/events/${eid}/program`,
    'form-management': `/events/${eid}/forms`,
    'merchandise-management': `/events/${eid}/merchandise`,
    'voting-management': `/events/${eid}/voting`,
    'sponsors-management': `/events/${eid}/sponsors`,
    'dp-maker-admin': `/events/${eid}/dp-maker`,
    'gallery-admin': `/events/${eid}/gallery`,
    'event-analytics': `/events/${eid}/analytics`,

    // Public routes
    'public-vote': `/e/${eid}/voting`,
    'dp-maker-public': `/e/${eid}/dp-maker`,
    'gallery-public': `/e/${eid}/gallery`,
  };

  return routeMap[page] || '/events';
}

/**
 * Hook that returns an onNavigate function compatible with existing page components.
 * Internally uses React Router's useNavigate().
 * 
 * Usage:
 * ```tsx
 * function TicketRoute() {
 *   const onNavigate = useAppNavigate();
 *   return <TicketManagement onNavigate={onNavigate} />;
 * }
 * ```
 */
export function useAppNavigate(): (page: LegacyPage) => void {
  const navigate = useNavigate();
  const params = useParams<{ eventId?: string }>();

  return useCallback(
    (page: LegacyPage) => {
      const path = getRoutePath(page, params.eventId);
      navigate(path);
    },
    [navigate, params.eventId]
  );
}

/**
 * Hook to get the current event ID from URL params.
 * Replaces direct calls to getCurrentEventId() in route-aware components.
 */
export function useEventId(): string {
  const params = useParams<{ eventId?: string; eventSlug?: string }>();
  return params.eventId || params.eventSlug || getCurrentEventId() || '';
}

export { getRoutePath };
