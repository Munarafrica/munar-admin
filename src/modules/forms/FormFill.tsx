// Public Form Fill Page – Attendee-facing form for submitting responses
// Route: /e/:eventSlug/forms/:formId

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formsService, PublicFormSubmitRequest } from '../../services';
import { useAuth } from '../../contexts';
import { Form, FormField } from '../../components/event-dashboard/types';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Star,
  Upload,
  X,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────── */

function validateField(field: FormField, value: any): string | null {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }
  if (field.type === 'email' && value) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(value)) return 'Please enter a valid email address';
  }
  if (field.type === 'phone' && value) {
    const phoneRe = /^[+\d][\d\s\-().]{6,}$/;
    if (!phoneRe.test(value)) return 'Please enter a valid phone number';
  }
  if (field.type === 'number' && value !== '' && value !== undefined) {
    if (isNaN(Number(value))) return 'Please enter a valid number';
    if (field.validation?.min !== undefined && Number(value) < field.validation.min) return `Minimum value is ${field.validation.min}`;
    if (field.validation?.max !== undefined && Number(value) > field.validation.max) return `Maximum value is ${field.validation.max}`;
  }
  if (field.required && field.type === 'checkbox' && Array.isArray(value) && value.length === 0) {
    return `Please select at least one option`;
  }
  if (field.required && field.type === 'rating' && (!value || value === 0)) {
    return `Please provide a rating`;
  }
  return null;
}

/* ─── Rating Stars Component ──────────────────────────── */

function RatingInput({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="p-0.5 transition-colors disabled:cursor-not-allowed"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              'w-7 h-7 transition-colors',
              (hovered || value) >= star
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{value}/5</span>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────── */

export function FormFill() {
  const { eventSlug, formId } = useParams<{ eventSlug: string; formId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track how long the user spends on the form
  const startTimeRef = useRef(Date.now());

  // Fetch the form
  useEffect(() => {
    if (!eventSlug || !formId) return;
    setIsLoading(true);
    formsService
      .getPublicFormBySlug(eventSlug, formId)
      .then((data) => {
        setForm(data);
        // Initialise answers with empty values
        const initial: Record<string, any> = {};
        (data.fields || []).forEach((f) => {
          if (f.type === 'checkbox' || f.type === 'multiselect') initial[f.id] = [];
          else if (f.type === 'rating') initial[f.id] = 0;
          else initial[f.id] = '';
        });
        setAnswers(initial);
      })
      .catch(() => setError('This form is not available or does not exist.'))
      .finally(() => setIsLoading(false));
  }, [eventSlug, formId]);

  useEffect(() => {
    if (user?.firstName || user?.lastName) {
      setRespondentName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
    if (user?.email) {
      setRespondentEmail(user.email);
    }
  }, [user?.email, user?.firstName, user?.lastName]);

  /* ── Value change handlers ───────────────────────────── */

  const handleChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error on change
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    setAnswers((prev) => {
      const current: string[] = prev[fieldId] || [];
      return {
        ...prev,
        [fieldId]: current.includes(option)
          ? current.filter((o: string) => o !== option)
          : [...current, option],
      };
    });
  };

  /* ── Validation ──────────────────────────────────────── */

  const validate = (): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    // Validate respondent fields if not anonymous
    if (!form.settings?.allowAnonymous) {
      if (!respondentEmail.trim()) {
        errors['__email'] = 'Email is required';
      } else {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(respondentEmail)) errors['__email'] = 'Please enter a valid email';
      }
    }

    form.fields.forEach((field) => {
      const err = validateField(field, answers[field.id]);
      if (err) errors[field.id] = err;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ── Submit ──────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && eventSlug) {
      navigate('/login', { state: { from: { pathname: `/e/${eventSlug}/forms/${formId}` } } });
      return;
    }
    if (!validate() || !eventSlug || !formId) return;

    setIsSubmitting(true);
    try {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload: PublicFormSubmitRequest = {
        respondentName: respondentName.trim() || undefined,
        respondentEmail: respondentEmail.trim() || undefined,
        answers,
        metadata: { timeToComplete: elapsed },
      };
      await formsService.submitPublicForm(eventSlug, formId, payload);
      setIsSubmitted(true);
    } catch {
      setFieldErrors({ __global: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Render: Loading / Error ─────────────────────────── */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Form not found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm mb-6">
          {error || 'The form you are looking for does not exist or is no longer accepting responses.'}
        </p>
        {eventSlug && (
          <Link
            to={`/e/${eventSlug}`}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
          >
            Back to event
          </Link>
        )}
      </div>
    );
  }

  /* ── Render: Success / Thank You ─────────────────────── */

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-['Raleway']">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Response Submitted!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {form.settings?.confirmationMessage || 'Thank you for your submission. Your response has been recorded.'}
          </p>
          <div className="flex flex-col gap-3">
            {eventSlug && (
              <Link
                to={`/e/${eventSlug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Event
              </Link>
            )}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setAnswers({});
                setRespondentName('');
                setRespondentEmail('');
                startTimeRef.current = Date.now();
                // Re-initialise default answers
                const initial: Record<string, any> = {};
                form.fields.forEach((f) => {
                  if (f.type === 'checkbox' || f.type === 'multiselect') initial[f.id] = [];
                  else if (f.type === 'rating') initial[f.id] = 0;
                  else initial[f.id] = '';
                });
                setAnswers(initial);
              }}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Submit another response
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Form ────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Raleway']">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {eventSlug && (
            <Link
              to={`/e/${eventSlug}/forms`}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Forms
            </Link>
          )}
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          {/* Accent bar */}
          <div className="h-2 bg-indigo-600 w-full" />

          {/* Title section */}
          <div className="p-6 sm:p-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {form.description}
              </p>
            )}
            {!isAuthenticated && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You need to sign in before submitting this registration form.
              </div>
            )}
          </div>

          {/* Global error */}
          {fieldErrors.__global && (
            <div className="mx-6 sm:mx-8 mt-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fieldErrors.__global}
            </div>
          )}

          {/* Respondent info (when not anonymous) */}
          {!form.settings?.allowAnonymous && (
            <div className="px-6 sm:px-8 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={respondentEmail}
                    onChange={(e) => {
                      setRespondentEmail(e.target.value);
                      if (fieldErrors.__email) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.__email;
                          return next;
                        });
                      }
                    }}
                    placeholder="you@example.com"
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors',
                      fieldErrors.__email
                        ? 'border-red-400 dark:border-red-600'
                        : 'border-slate-200 dark:border-slate-700'
                    )}
                  />
                  {fieldErrors.__email && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {fieldErrors.__email}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800" />
            </div>
          )}

          {/* Form fields */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {form.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[field.id]}
                onChange={(v) => handleChange(field.id, v)}
                onCheckboxToggle={(opt) => handleCheckboxToggle(field.id, opt)}
                error={fieldErrors[field.id]}
              />
            ))}
          </div>

          {/* Submit */}
          <div className="px-6 sm:px-8 pb-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base rounded-xl gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Response'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}

/* ─── Field Renderer ──────────────────────────────────── */

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  onCheckboxToggle: (option: string) => void;
  error?: string;
}

function FieldRenderer({ field, value, onChange, onCheckboxToggle, error }: FieldRendererProps) {
  const inputBase = cn(
    'w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors',
    error ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'
  );

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={inputBase}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'you@example.com'}
            className={inputBase}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '+1 234 567 890'}
            className={inputBase}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '0'}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputBase}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'Type your answer here...'}
            rows={4}
            className={cn(inputBase, 'resize-none')}
          />
        );

      case 'select':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <label
                  key={i}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                    checked
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCheckboxToggle(opt)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <label
                  key={i}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                    checked
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCheckboxToggle(opt)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, i) => (
              <label
                key={i}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors',
                  value === opt
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <input
                  type="radio"
                  name={field.id}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{opt}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return <RatingInput value={value || 0} onChange={onChange} />;

      case 'file':
        return (
          <div
            className={cn(
              'flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
              error
                ? 'border-red-300 dark:border-red-700'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
            )}
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-slate-400 mt-1">File upload is not yet supported in public forms</p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={inputBase}
          />
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {renderInput()}
      {field.helpText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{field.helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
