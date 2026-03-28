import React, { useMemo, useState, useRef } from "react";
import { TopBar } from "../components/dashboard/TopBar";
import { XIcon, MapPinIcon, UploadIcon } from "../components/icons";
import { Calendar, Clock, MapPin, Video, Monitor } from "lucide-react";
import { Page } from "../App";
import { cn } from "../components/ui/utils";
import { RichTextEditor } from "../components/ui/RichTextEditor";
import { eventsService } from "../services";
import { setCurrentEventId } from "../lib/event-storage";

interface CreateEventProps {
  onClose?: () => void;
  onContinue?: () => void;
  onNavigate?: (page: Page) => void;
}

export interface EventFormData {
  eventName: string;
  eventType: "Physical" | "Virtual" | "Hybrid" | null;
  domainType: "subdomain" | "custom";
  subdomain: string;
  customDomain: string;
  coverImage: File | null;
  coverImageUrl?: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isRecurring: boolean;
  recurringStartDate: string;
  frequency: string;
  customDates: string[];
  recurringStartTime: string;
  recurringEndTime: string;
  recurringEndType: "date" | "occurrences";
  recurringEndDate: string;
  recurringOccurrences: number;
  country: string;
  venueLocation: string;
  currency: "NGN" | "GHS" | "ZAR" | "";
  categories: string[];
}

export const CreateEvent = ({ onClose, onContinue, onNavigate }: CreateEventProps) => {
  const initialDraft = useMemo(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("munar_event_form");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Partial<EventFormData> & { id?: string };
    } catch {
      return null;
    }
  }, []);

  const [formData, setFormData] = useState<EventFormData>({
    eventName: initialDraft?.eventName || "",
    eventType: initialDraft?.eventType || null,
    domainType: initialDraft?.domainType || "subdomain",
    subdomain: initialDraft?.subdomain || "",
    customDomain: initialDraft?.customDomain || "",
    coverImage: null,
    coverImageUrl: initialDraft?.coverImageUrl || "",
    description: initialDraft?.description || "",
    startDate: initialDraft?.startDate || "",
    startTime: initialDraft?.startTime || "",
    endDate: initialDraft?.endDate || "",
    endTime: initialDraft?.endTime || "",
    isRecurring: initialDraft?.isRecurring || false,
    recurringStartDate: initialDraft?.recurringStartDate || "",
    frequency: initialDraft?.frequency || "",
    customDates: initialDraft?.customDates || [],
    recurringStartTime: initialDraft?.recurringStartTime || "",
    recurringEndTime: initialDraft?.recurringEndTime || "",
    recurringEndType: initialDraft?.recurringEndType || "date",
    recurringEndDate: initialDraft?.recurringEndDate || "",
    recurringOccurrences: initialDraft?.recurringOccurrences || 1,
    country: initialDraft?.country || "",
    venueLocation: initialDraft?.venueLocation || "",
    currency: initialDraft?.currency || "NGN",
    categories: initialDraft?.categories || [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [categoryInput, setCategoryInput] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const popularTags = ["Conference", "Workshop", "Networking", "Tech", "Music", "Sports", "Art", "Food"];

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange("coverImage", file);
      handleInputChange("coverImageUrl", "");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleInputChange("coverImage", file);
      handleInputChange("coverImageUrl", "");
    }
  };

  const addCategory = (category: string) => {
    if (category && !formData.categories.includes(category)) {
      handleInputChange("categories", [...formData.categories, category]);
      setCategoryInput("");
    }
  };

  const removeCategory = (category: string) => {
    handleInputChange("categories", formData.categories.filter(c => c !== category));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required";
    }

    if (!formData.eventType) {
      newErrors.eventType = "Please select an event type";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    if (formData.eventType === "Physical" || formData.eventType === "Hybrid") {
      if (!formData.venueLocation) {
        newErrors.venueLocation = "Venue location is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const readCoverImage = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read cover image"));
      reader.readAsDataURL(file);
    });
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    setSubmitError(null);
    setIsSubmitting(true);

    const coverImageUrl = formData.coverImage
      ? await readCoverImage(formData.coverImage)
      : formData.coverImageUrl || undefined;

    try {
      if (initialDraft?.id) {
        const updated = await eventsService.updateEvent(initialDraft.id, {
          name: formData.eventName,
          type: formData.eventType || "Hybrid",
          description: formData.description,
          startDate: formData.startDate,
          startTime: formData.startTime,
          endDate: formData.endDate,
          endTime: formData.endTime,
          subdomain: formData.subdomain,
          customDomain: formData.customDomain,
          coverImageUrl,
          country: formData.country,
          venueLocation: formData.venueLocation,
          categories: formData.categories,
          currency: formData.currency || "NGN",
        });
        setCurrentEventId(updated.id);
      } else {
        const created = await eventsService.createEvent({
          name: formData.eventName,
          type: formData.eventType || "Hybrid",
          description: formData.description,
          startDate: formData.startDate,
          startTime: formData.startTime,
          endDate: formData.endDate,
          endTime: formData.endTime,
          subdomain: formData.subdomain,
          customDomain: formData.customDomain,
          coverImageUrl,
          country: formData.country,
          venueLocation: formData.venueLocation,
          categories: formData.categories,
          currency: formData.currency || "NGN",
        });
        setCurrentEventId(created.id);
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("munar_event_form");
      }

      onContinue?.();
    } catch (error: any) {
      console.error("Failed to save event", error);
      const message =
        error?.error?.message ||
        error?.message ||
        "Failed to save event. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />
      
      <div className="flex-1 w-full max-w-[920px] mx-auto px-4 md:px-10 py-8 bg-white dark:bg-slate-900 shadow-sm border border-transparent dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-[#e5e5e5] dark:border-slate-800 mb-8">
          <div className="flex-1">
            <h1 className="text-[21px] font-bold text-black dark:text-white mb-2">Create a new event</h1>
            <p className="text-[13px] text-[rgba(15,23,42,0.68)] dark:text-slate-400">let us set up your event</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-500 dark:text-slate-400">
            <XIcon className="size-6" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6">
          {/* Event Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Name*</label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) => handleInputChange("eventName", e.target.value)}
              placeholder="Enter event name"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 focus:outline-none focus:border-[#8b5cf6] dark:focus:border-[#8b5cf6] transition-colors"
            />
            {errors.eventName && <p className="text-[12px] text-red-500">{errors.eventName}</p>}
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Type*</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: "Physical" as const, icon: MapPin, description: "Live, in-person gathering at a venue." },
                { type: "Virtual" as const, icon: Video, description: "Online only event via streaming." },
                { type: "Hybrid" as const, icon: Monitor, description: "Both in-person and online access." }
              ].map(({ type, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => handleInputChange("eventType", type)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-left",
                    formData.eventType === type
                      ? "bg-[#e7ddff] border-[#8b5cf6] dark:bg-indigo-900/30 dark:border-indigo-500"
                      : "bg-white dark:bg-slate-950 border-[#cbd5e1] dark:border-slate-800 hover:bg-[#f5f3ff] dark:hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "size-11 rounded-lg flex items-center justify-center mb-4",
                    formData.eventType === type 
                        ? "bg-[#d7c6fe] dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-200" 
                        : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#262626] dark:text-slate-100 mb-2">{type}</h3>
                  <p className="text-[14px] text-[#737373] dark:text-slate-400">{description}</p>
                </button>
              ))}
            </div>
            {errors.eventType && <p className="text-[12px] text-red-500">{errors.eventType}</p>}
          </div>

          {/* Cover Image Upload */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Add a cover Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {!formData.coverImage && !formData.coverImageUrl ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#e5e7eb] dark:border-slate-700 rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-[#8b5cf6] dark:hover:border-[#8b5cf6] transition-colors bg-white dark:bg-slate-950/50"
              >
                <UploadIcon className="size-8 text-[#8E8E8E] dark:text-slate-500" />
                <p className="text-[14px] text-[#1f2937] dark:text-slate-300">
                  Drop your file here or <span className="text-[#2563eb] dark:text-[#60a5fa] font-semibold">browse</span>
                </p>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#e5e7eb] dark:border-slate-700">
                <img
                  src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    handleInputChange("coverImage", null);
                    handleInputChange("coverImageUrl", "");
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <XIcon className="size-4 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Event Description */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Description*</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Describe your event..."
              error={!!errors.description}
            />
            {errors.description && <p className="text-[12px] text-red-500">{errors.description}</p>}
          </div>

          {/* Event Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Starts */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Starts*</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
                  {errors.startDate && <p className="text-[12px] text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
                  {errors.startTime && <p className="text-[12px] text-red-500 mt-1">{errors.startTime}</p>}
                </div>
              </div>
            </div>

            {/* Event Ends */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Ends*</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
                  {errors.endDate && <p className="text-[12px] text-red-500 mt-1">{errors.endDate}</p>}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 pointer-events-none" />
                  {errors.endTime && <p className="text-[12px] text-red-500 mt-1">{errors.endTime}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Event */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
                className="size-4 accent-[#8b5cf6]"
              />
              <span className="text-[16px] text-[#1e1e1e] dark:text-slate-200">Recurring Event</span>
            </label>

            {/* Recurring Fields - Accordion */}
            {formData.isRecurring && (
              <div className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-800 rounded-lg p-6 space-y-4 animate-fadeIn">
                {/* Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange("frequency", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Every Day</option>
                    <option value="weekly">Every Week</option>
                    <option value="biweekly">Every Two Weeks</option>
                    <option value="monthly">Every Month</option>
                    <option value="custom">Custom Dates</option>
                  </select>
                </div>

                {/* Recurring Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Recurrence Start Date</label>
                  <input
                    type="date"
                    value={formData.recurringStartDate}
                    onChange={(e) => handleInputChange("recurringStartDate", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Start Time</label>
                    <input
                      type="time"
                      value={formData.recurringStartTime}
                      onChange={(e) => handleInputChange("recurringStartTime", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">End Time</label>
                    <input
                      type="time"
                      value={formData.recurringEndTime}
                      onChange={(e) => handleInputChange("recurringEndTime", e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                    />
                  </div>
                </div>

                {/* Recurrence End */}
                <div className="flex flex-col gap-3">
                  <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Recurrence Ends</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={formData.recurringEndType === "date"}
                        onChange={() => handleInputChange("recurringEndType", "date")}
                        className="size-4 accent-[#8b5cf6]"
                      />
                      <span className="text-[14px] text-[#1e1e1e] dark:text-slate-300">On a specific date</span>
                    </label>
                    {formData.recurringEndType === "date" && (
                      <input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => handleInputChange("recurringEndDate", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors ml-7"
                      />
                    )}

                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={formData.recurringEndType === "occurrences"}
                        onChange={() => handleInputChange("recurringEndType", "occurrences")}
                        className="size-4 accent-[#8b5cf6]"
                      />
                      <span className="text-[14px] text-[#1e1e1e] dark:text-slate-300">After number of occurrences</span>
                    </label>
                    {formData.recurringEndType === "occurrences" && (
                      <input
                        type="number"
                        min="1"
                        value={formData.recurringOccurrences}
                        onChange={(e) => handleInputChange("recurringOccurrences", parseInt(e.target.value))}
                        placeholder="Number of occurrences"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#8b5cf6] transition-colors ml-7"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Country*</label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#8b5cf6] transition-colors text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
            {errors.country && <p className="text-[12px] text-red-500">{errors.country}</p>}
          </div>

          {/* Venue Location - Only show for Physical and Hybrid */}
          {(formData.eventType === "Physical" || formData.eventType === "Hybrid") && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Venue Location of Event*</label>
                <input
                  type="text"
                  value={formData.venueLocation}
                  onChange={(e) => handleInputChange("venueLocation", e.target.value)}
                  placeholder="Search address or venue"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-[#94a3b8] dark:placeholder:text-slate-600 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
                {errors.venueLocation && <p className="text-[12px] text-red-500">{errors.venueLocation}</p>}
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-[140px] bg-[rgba(0,0,0,0.2)] dark:bg-black/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-900 opacity-50" />
                <button
                  onClick={() => setShowMapModal(true)}
                  className="relative z-10 flex items-center gap-3 px-6 py-4 border-2 border-white dark:border-slate-600 rounded-xl text-white dark:text-slate-200 hover:bg-white/10 transition-all"
                >
                  <MapPinIcon className="size-6" />
                  <span className="text-[14px] font-medium">Edit location on map</span>
                </button>
              </div>
            </>
          )}

          {/* Currency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Default Currency*</label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] focus:outline-none focus:border-[#8b5cf6] transition-colors text-slate-900 dark:text-slate-100"
            >
              <option value="">Select currency</option>
              <option value="NGN">Naira (₦)</option>
              <option value="GHS">Cedis (₵)</option>
              <option value="ZAR">Rands (R)</option>
            </select>
            {errors.currency && <p className="text-[12px] text-red-500">{errors.currency}</p>}
          </div>

          {/* Event Domain/Subdomain */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Website*</label>
            
            {/* Domain Type Selection */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.domainType === "subdomain"}
                  onChange={() => handleInputChange("domainType", "subdomain")}
                  className="size-4 accent-[#8b5cf6]"
                />
                <span className="text-[14px] text-[#1e1e1e] dark:text-slate-300">Use Munar subdomain</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.domainType === "custom"}
                  onChange={() => handleInputChange("domainType", "custom")}
                  className="size-4 accent-[#8b5cf6]"
                />
                <span className="text-[14px] text-[#1e1e1e] dark:text-slate-300">I have my own domain</span>
              </label>
            </div>

            {/* Subdomain Input */}
            {formData.domainType === "subdomain" && (
              <div className="flex items-center gap-0 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md overflow-hidden focus-within:border-[#8b5cf6] transition-colors">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    handleInputChange("subdomain", value);
                  }}
                  placeholder="your-event-name"
                  className="flex-1 px-3 py-2 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none border-none bg-transparent"
                />
                <span className="px-3 py-2 text-[14px] text-[#737373] dark:text-slate-400 bg-[#f8fafc] dark:bg-slate-900 border-l border-[#cbd5e1] dark:border-slate-800">.munar.site</span>
              </div>
            )}

            {/* Custom Domain Input */}
            {formData.domainType === "custom" && (
              <div>
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => handleInputChange("customDomain", e.target.value)}
                  placeholder="www.yourdomain.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
                <p className="text-[12px] text-[#737373] dark:text-slate-400 mt-1.5">You'll need to configure DNS settings after event creation</p>
              </div>
            )}

            {/* Preview */}
            {formData.domainType === "subdomain" && formData.subdomain && (
              <div className="bg-[#f5f3ff] dark:bg-indigo-950/30 border border-[#e7ddff] dark:border-indigo-900/50 rounded-md p-3">
                <p className="text-[12px] text-[#737373] dark:text-slate-400 mb-1">Your event URL will be:</p>
                <p className="text-[14px] font-medium text-[#8b5cf6] dark:text-indigo-400">
                  https://{formData.subdomain}.munar.site
                </p>
              </div>
            )}
            
            {errors.subdomain && <p className="text-[12px] text-red-500">{errors.subdomain}</p>}
            {errors.customDomain && <p className="text-[12px] text-red-500">{errors.customDomain}</p>}
          </div>

          {/* Event Category */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] font-medium text-[#0f172a] dark:text-slate-200">Event Category</label>
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory(categoryInput);
                }
              }}
              placeholder="Enter category"
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-[#cbd5e1] dark:border-slate-800 rounded-md text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-[#94a3b8] focus:outline-none focus:border-[#8b5cf6] transition-colors"
            />

            {/* Selected Categories */}
            {formData.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e5e5e5] dark:bg-slate-800 rounded-lg text-[11px] text-[#030213] dark:text-slate-200"
                  >
                    {category}
                    <button onClick={() => removeCategory(category)} className="hover:bg-black/10 dark:hover:bg-white/10 rounded">
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular Tags */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] text-[#64748b] dark:text-slate-400">Popular tags:</span>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addCategory(tag)}
                    className="px-3 py-1 bg-[#f1f5f9] dark:bg-slate-800 rounded-full text-[12px] text-[#475569] dark:text-slate-300 hover:bg-[#e2e8f0] dark:hover:bg-slate-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 pt-6 mt-8 border-t border-[#e5e5e5] dark:border-slate-800">
          {submitError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-[#64748b] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-slate-200 font-medium text-[14px] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-[14px] rounded-lg shadow-sm shadow-purple-200 dark:shadow-none transition-all"
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
