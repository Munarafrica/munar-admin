import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShoppingBag } from 'lucide-react';
import { useEvent } from '../../contexts';

export function MerchPublic() {
  const { currentEvent } = useEvent();

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Raleway'] dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            to={`/e/${currentEvent.slug || currentEvent.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <ShoppingBag className="h-7 w-7 text-slate-700 dark:text-slate-200" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-slate-900 dark:text-slate-100">Merchandise coming soon</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The current backend does not expose a public merch storefront endpoint yet, so this event’s
            merchandise can only be managed from the organizer dashboard for now.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Public product discovery, guest checkout, and merch payment initialization still require backend
                support before this page can become a live storefront.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
