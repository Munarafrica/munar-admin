// Builder Top Bar
// Global actions: back, template switcher, preview mode, save state, publish

import React from 'react';
import {
  ChevronLeft, LayoutTemplate, Monitor, Tablet, Smartphone,
  Globe, Clock, CheckCheck, Loader2, ExternalLink
} from 'lucide-react';
import { WebsiteConfig } from '../../modules/website/types';
import { cn } from '../ui/utils';
import { PreviewMode } from './BuilderCanvas';
import { useNavigate } from 'react-router-dom';

interface BuilderTopBarProps {
  config: WebsiteConfig;
  eventId: string;
  eventSlug: string;
  eventName: string;
  previewMode: PreviewMode;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error';
  onPreviewModeChange: (mode: PreviewMode) => void;
  onOpenTemplatePicker: () => void;
  onOpenPublishModal: () => void;
}

const PREVIEW_MODES: { id: PreviewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
];

function SaveIndicator({ state }: { state: BuilderTopBarProps['saveState'] }) {
  switch (state) {
    case 'saving':
      return (
        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Saving…
        </span>
      );
    case 'saved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400">
          <CheckCheck className="w-3.5 h-3.5" />
          Saved
        </span>
      );
    case 'unsaved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          Unsaved changes
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
          ⚠ Save failed
        </span>
      );
  }
}

export function BuilderTopBar({
  config,
  eventId,
  eventSlug,
  eventName,
  previewMode,
  saveState,
  onPreviewModeChange,
  onOpenTemplatePicker,
  onOpenPublishModal,
}: BuilderTopBarProps) {
  const navigate = useNavigate();
  const publicUrl = `${window.location.origin}/e/${config.slug || eventSlug}`;
  const isPublished = config.status === 'published';

  return (
    <div className="flex items-center gap-3 px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 font-['Raleway']">
      {/* Back button */}
      <button
        onClick={() => navigate(`/events/${eventId}`)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium flex-shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
        Dashboard
      </button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

      {/* Event name + template */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[180px] truncate hidden sm:block">
          {eventName}
        </span>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:block">·</span>
        <button
          onClick={onOpenTemplatePicker}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          {config.templateId === 'horizon' ? 'Horizon' : 'Pulse'}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Preview mode toggle */}
      <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
        {PREVIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onPreviewModeChange(mode.id)}
            title={mode.label}
            className={cn(
              'w-8 h-7 rounded-lg flex items-center justify-center transition-all',
              previewMode === mode.id
                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
            )}
          >
            {mode.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

      {/* Save state */}
      <SaveIndicator state={saveState} />

      {/* View live site (only when published) */}
      {isPublished && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live
        </a>
      )}

      {/* Publish button */}
      <button
        onClick={onOpenPublishModal}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
          isPublished
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
        )}
      >
        <Globe className="w-4 h-4" />
        {isPublished ? 'Published' : 'Publish'}
      </button>
    </div>
  );
}
