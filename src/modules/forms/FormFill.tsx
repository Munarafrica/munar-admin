import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { formsService, PublicFormSubmitRequest } from "../../services";
import { useAuth, useEvent } from "../../contexts";
import { Form, FormField } from "../../components/event-dashboard/types";
import { Button } from "../../components/ui/button";
import { cn } from "../../components/ui/utils";
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";

function validateField(field: FormField, value: unknown): string | null {
  if (
    field.required &&
    (value === undefined || value === null || value === "")
  ) {
    return `${field.label} is required`;
  }
  if (field.type === "email" && value) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(value)))
      return "Please enter a valid email address";
  }
  if (field.type === "phone" && value) {
    const phoneRe = /^[+\d][\d\s\-().]{6,}$/;
    if (!phoneRe.test(String(value)))
      return "Please enter a valid phone number";
  }
  if (field.type === "number" && value !== "" && value !== undefined) {
    if (Number.isNaN(Number(value))) return "Please enter a valid number";
    if (
      field.validation?.min !== undefined &&
      Number(value) < field.validation.min
    )
      return `Minimum value is ${field.validation.min}`;
    if (
      field.validation?.max !== undefined &&
      Number(value) > field.validation.max
    )
      return `Maximum value is ${field.validation.max}`;
  }
  if (
    field.required &&
    field.type === "checkbox" &&
    Array.isArray(value) &&
    value.length === 0
  ) {
    return "Please select at least one option";
  }
  if (field.required && field.type === "rating" && (!value || value === 0)) {
    return "Please provide a rating";
  }
  return null;
}

function initializeAnswers(fields: FormField[]) {
  const initial: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (field.type === "checkbox" || field.type === "multiselect")
      initial[field.id] = [];
    else if (field.type === "rating") initial[field.id] = 0;
    else initial[field.id] = "";
  });
  return initial;
}

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
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
              "w-7 h-7 transition-colors",
              (hovered || value) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300 dark:text-slate-600",
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
          {value}/5
        </span>
      )}
    </div>
  );
}

export function FormFill() {
  const { eventSlug, formId } = useParams<{
    eventSlug: string;
    formId: string;
  }>();
  const { isAuthenticated, user } = useAuth();
  const { currentEvent } = useEvent();

  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (user?.firstName || user?.lastName) {
      setRespondentName(
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      );
    }
    if (user?.email) {
      setRespondentEmail(user.email);
    }
  }, [user?.email, user?.firstName, user?.lastName]);

  useEffect(() => {
    if (!formId || !eventSlug) return;

    setIsLoading(true);
    setError(null);
    formsService
      .getPublicFormBySlug(eventSlug, formId)
      .then((data) => {
        if (data.status !== "published") {
          throw new Error("This form is not currently published.");
        }
        setForm(data);
        setAnswers(initializeAnswers(data.fields || []));
      })
      .catch(async (err) => {
        if (isAuthenticated && currentEvent?.id) {
          try {
            const adminForm = await formsService.getForm(
              currentEvent.id,
              formId,
            );
            if (adminForm.status === "published") {
              setForm(adminForm);
              setAnswers(initializeAnswers(adminForm.fields || []));
              setError(null);
              return;
            }
          } catch {
            // Keep the original public-form error below.
          }
        }

        setError(
          err instanceof Error
            ? err.message
            : "This form is not available or does not exist.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [currentEvent?.id, eventSlug, formId, isAuthenticated]);

  const handleChange = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
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
      const current = Array.isArray(prev[fieldId])
        ? (prev[fieldId] as string[])
        : [];
      return {
        ...prev,
        [fieldId]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const validate = (): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    if (!form.settings?.allowAnonymous) {
      if (!respondentEmail.trim()) {
        errors.__email = "Email is required";
      } else {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(respondentEmail))
          errors.__email = "Please enter a valid email";
      }
    }

    form.fields.forEach((field) => {
      const fieldError = validateField(field, answers[field.id]);
      if (fieldError) errors[field.id] = fieldError;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !formId) return;

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload: PublicFormSubmitRequest = {
        respondentName: respondentName.trim() || undefined,
        respondentEmail: respondentEmail.trim() || undefined,
        answers,
        metadata: { timeToComplete: elapsed },
      };
      await formsService.submitPublicForm(eventSlug || "", formId, payload);
      setIsSubmitted(true);
    } catch (err) {
      setFieldErrors({
        __global:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Form unavailable
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm mb-6">
          {error ||
            "The form you are looking for does not exist or is no longer accepting responses."}
        </p>
        {eventSlug && (
          <Link
            to={`/e/${eventSlug}/forms`}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
          >
            Back to forms
          </Link>
        )}
      </div>
    );
  }

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
            {form.settings?.confirmationMessage ||
              "Thank you for your submission. Your response has been recorded."}
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
                setAnswers(initializeAnswers(form.fields));
                setFieldErrors({});
                startTimeRef.current = Date.now();
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Raleway']">
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

      <div className="flex-1 flex justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="h-2 bg-indigo-600 w-full" />

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
          </div>

          {fieldErrors.__global && (
            <div className="mx-6 sm:mx-8 mt-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fieldErrors.__global}
            </div>
          )}

          {!form.settings?.allowAnonymous && (
            <div className="px-6 sm:px-8 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {/* <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
                  />
                </div> */}

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
                      "w-full px-3 py-2.5 mt-2 rounded-lg border bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors",
                      fieldErrors.__email
                        ? "border-red-400 dark:border-red-600"
                        : "border-slate-200 dark:border-slate-700",
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

          <div className="px-6 sm:px-8 py-6 space-y-6 mt-4">
            {form.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[field.id]}
                onChange={(value) => handleChange(field.id, value)}
                onCheckboxToggle={(option) =>
                  handleCheckboxToggle(field.id, option)
                }
                error={fieldErrors[field.id]}
              />
            ))}
          </div>

          <div className="px-6 sm:px-8 pb-8 mt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base rounded-xl gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  onCheckboxToggle: (option: string) => void;
  error?: string;
}

function FieldRenderer({
  field,
  value,
  onChange,
  onCheckboxToggle,
  error,
}: FieldRendererProps) {
  const inputBase = cn(
    "w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors",
    error
      ? "border-red-400 dark:border-red-600"
      : "border-slate-200 dark:border-slate-700",
  );

  const renderInput = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputBase}
          />
        );
      case "email":
        return (
          <input
            type="email"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "you@example.com"}
            className={inputBase}
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "+1 234 567 890"}
            className={inputBase}
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "0"}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputBase}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={cn(inputBase, "min-h-[120px] resize-y")}
          />
        );
      case "select":
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputBase}
          >
            <option value="">{field.placeholder || "Select an option"}</option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
      case "multiselect":
        return (
          <div className="space-y-2">
            {(field.options || []).map((option) => {
              const checked = Array.isArray(value)
                ? value.includes(option)
                : false;
              return (
                <label
                  key={option}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCheckboxToggle(option)}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        );
      case "rating":
        return (
          <RatingInput
            value={typeof value === "number" ? value : 0}
            onChange={onChange as (value: number) => void}
          />
        );
      case "file":
        return (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
            File uploads are not available in this backend iteration yet.
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className={inputBase}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      {field.helpText && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {field.helpText}
        </p>
      )}
      {renderInput()}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
