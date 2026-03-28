// Event Resolver - Resolves event data from URL params
// Core architectural component: parses event ID/slug and loads event core data

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EventProvider, useEvent } from '../contexts/EventContext';
import { BrandProvider } from '../contexts/BrandContext';
import { setCurrentEventId } from '../lib/event-storage';
import { EventNotFound } from '../pages/NotFound';

interface EventResolverProps {
  children: React.ReactNode;
  /** If true, uses eventSlug param instead of eventId */
  useSlug?: boolean;
}

/**
 * EventResolver extracts the event identifier from URL parameters,
 * wraps children in EventProvider + BrandProvider, and handles
 * the "event not found" case.
 * 
 * Architecture:
 * ```
 * EventResolver
 *   → EventProvider (fetches event core data)
 *     → BrandProvider (injects event branding)
 *       → children (module content)
 * ```
 * 
 * Supports both:
 * - `/events/:eventId/...` (admin routes)
 * - `/e/:eventSlug/...` (public routes, future subdomain)
 */
export function EventResolver({ children, useSlug }: EventResolverProps) {
  const params = useParams<{ eventId?: string; eventSlug?: string }>();
  const eventIdentifier = useSlug ? params.eventSlug : params.eventId;

  // Sync event ID to localStorage for backward compatibility
  useEffect(() => {
    if (eventIdentifier) {
      setCurrentEventId(eventIdentifier);
    }
  }, [eventIdentifier]);

  if (!eventIdentifier) {
    return <EventNotFound />;
  }

  return (
    <EventProvider eventId={eventIdentifier}>
      <EventResolverInner>
        {children}
      </EventResolverInner>
    </EventProvider>
  );
}

/**
 * Inner component that accesses EventContext to provide
 * branding and handle loading/error states.
 */
function EventResolverInner({ children }: { children: React.ReactNode }) {
  const { currentEvent, isLoading, error } = useEvent();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-['Raleway']">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    // DEV: Show error message if available
    if (error) {
      const params = useParams<{ eventId?: string; eventSlug?: string }>();
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-lg mb-4">
            <h3 className="font-bold">Error Loading Event</h3>
            <pre className="mt-2 text-sm whitespace-pre-wrap break-words">{error}</pre>
            <details className="mt-2 text-xs">
              <summary>Debug Info</summary>
              <div className="mt-1 space-y-1 font-mono">
                <div>eventId param: {params.eventId || 'none'}</div>
                <div>eventSlug param: {params.eventSlug || 'none'}</div>
              </div>
            </details>
          </div>
          <EventNotFound />
        </div>
      );
    }
    return <EventNotFound />;
  }

  return (
    <BrandProvider branding={currentEvent.branding}>
      {children}
    </BrandProvider>
  );
}
