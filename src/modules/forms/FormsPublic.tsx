import React, { useEffect, useState } from 'react';
import { useAuth, useEvent } from '../../contexts';
import { Button } from '../../components/ui/button';
import { FileText, ArrowLeft, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { formsService } from '../../services';
import { Form } from '../../components/event-dashboard/types';
import { ApiException } from '../../types/api';

export function FormsPublic() {
  const { currentEvent } = useEvent();
  const { isAuthenticated } = useAuth();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const slug = currentEvent?.slug || eventSlug || '';

  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventName, setEventName] = useState(currentEvent?.name || 'Event forms');

  useEffect(() => {
    if (!slug) {
      return;
    }
    setIsLoading(true);
    setError(null);
    formsService
      .getPublicForms(slug)
      .then((data) => {
        setForms(data.forms || []);
        setEventName(data.event?.name || currentEvent?.name || 'Event forms');
      })
      .catch(async (err) => {
        if (isAuthenticated && currentEvent?.id) {
          try {
            setForms((await formsService.getForms(currentEvent.id)).filter((form) => form.status === 'published'));
            setEventName(currentEvent?.name || 'Event forms');
            setError(null);
            return;
          } catch {
            // Fall through to the public error message below.
          }
        }

        setForms([]);
        if (err instanceof ApiException && err.statusCode === 404) {
          setError('No public forms are currently available for this event. This can happen if the forms module is disabled, the event slug is incorrect, or no forms have been published yet.');
          return;
        }

        const message = err instanceof Error ? err.message.trim() : '';
        setError(message || 'Unable to load forms.');
      })
      .finally(() => setIsLoading(false));
  }, [currentEvent?.id, currentEvent?.name, isAuthenticated, slug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            to={`/e/${slug}`}
            className="inline-flex items-center gap-1.5 mt-6 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to event
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forms & Surveys</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{eventName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/60 dark:bg-red-950/30">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Unable to load public forms
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        {!isLoading && !error && forms.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No published forms available</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Published forms for this event will appear here once they are ready.
            </p>
          </div>
        )}

        {!isLoading && !error && forms.length > 0 && (
          <div className="space-y-4">
            {forms.map((form) => (
              <Link
                key={form.id}
                to={`/e/${slug}/forms/${form.id}`}
                className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {form.title || 'Untitled Form'}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{form.description}</p>
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
                  Open Form
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">Powered by Munar</div>
    </div>
  );
}
