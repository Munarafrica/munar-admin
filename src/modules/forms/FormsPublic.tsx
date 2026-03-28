// Public Forms Page - Attendee-facing form listing
// Route: /e/:eventSlug/forms

import React, { useState, useEffect } from 'react';
import { useAuth, useEvent } from '../../contexts';
import { useBrandSafe } from '../../contexts/BrandContext';
import { Button } from '../../components/ui/button';
import { FileText, ArrowLeft, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '../../components/ui/utils';
import { formsService } from '../../services';
import { Form } from '../../components/event-dashboard/types';

export function FormsPublic() {
  const { currentEvent } = useEvent();
  const { isAuthenticated } = useAuth();
  const { branding } = useBrandSafe();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const slug = currentEvent?.slug || eventSlug || '';

  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState(currentEvent?.name || '');

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    formsService
      .getPublicForms(slug)
      .then((data) => {
        setForms(data.forms || []);
        if (data.event?.name) setEventName(data.event.name);
      })
      .catch(() => setForms([]))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            to={`/e/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to event
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Forms & Surveys
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {eventName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && forms.length === 0 && (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            No forms available
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            There are no published forms for this event yet.
          </p>
        </div>
      )}

      {/* Form List */}
      {!isLoading && forms.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {forms.map((form) => (
              <Link
                key={form.id}
                to={`/e/${slug}/forms/${form.id}`}
                className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    Open
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{Math.max(2, Math.ceil((form.fields?.length || 3) * 0.8))} min
                  </span>
                  <span className="capitalize text-slate-400">{form.type}</span>
                </div>

                <Button
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white pointer-events-none"
                  tabIndex={-1}
                >
                  {isAuthenticated ? 'Open Form' : 'Sign In to Register'}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}
