// 404 Pages — Custom error pages per the Munar specification
// Event Not Found → global 404 for invalid subdomains/event IDs
// Module Not Found → custom 404 for disabled modules with optional redirect

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../components/ui/utils';

// ─── Event Not Found ─────────────────────────────────────────────────────────

interface EventNotFoundProps {
  className?: string;
}

/**
 * Rendered when an event slug or ID doesn't resolve to a valid event.
 * This is the "Munar global 404" from the spec.
 */
export function EventNotFound({ className }: EventNotFoundProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-['Raleway']",
        className
      )}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-slate-200 dark:text-slate-800 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Event Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The event you&apos;re looking for doesn&apos;t exist or may have been removed.
          Please check the URL and try again.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          Go to My Events
        </Link>
      </div>
      <div className="mt-12 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}

// ─── Module Not Found ────────────────────────────────────────────────────────

interface ModuleNotFoundProps {
  /** Name of the disabled module */
  moduleName?: string;
  /** Name of the parent event */
  eventName?: string;
  /** URL of the event website for redirect CTA */
  eventWebsiteUrl?: string;
  className?: string;
}

/**
 * Rendered when a user accesses a module that is disabled for the event.
 * Includes an optional redirect CTA to the event website, per the spec.
 */
export function ModuleNotFound({
  moduleName,
  eventName,
  eventWebsiteUrl,
  className,
}: ModuleNotFoundProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-['Raleway']",
        className
      )}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-slate-200 dark:text-slate-800 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {moduleName ? `${moduleName} Not Available` : 'Module Not Available'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {eventName ? (
            <>
              The {moduleName?.toLowerCase() || 'module'} for{' '}
              <strong className="text-slate-700 dark:text-slate-300">{eventName}</strong> is
              not currently available.
            </>
          ) : (
            <>This module is not currently enabled for this event.</>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {eventWebsiteUrl && (
            <a
              href={eventWebsiteUrl}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Visit Event Website
            </a>
          )}
          <Link
            to="/events"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </div>
      <div className="mt-12 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}

// ─── Generic Not Found (catch-all) ──────────────────────────────────────────

/**
 * Generic 404 page for any unmatched route.
 */
export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-['Raleway']">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-slate-200 dark:text-slate-800 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
