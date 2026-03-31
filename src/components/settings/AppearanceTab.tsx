// Appearance settings tab — theme selection
import React from 'react';
import { useTheme } from '../theme-provider';
import { ThemeMode } from '../../types/settings';
import { cn } from '../ui/utils';
import {
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  Palette,
} from 'lucide-react';

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light Mode', description: 'Clean and bright interface', icon: Sun },
  { value: 'dark', label: 'Dark Mode', description: 'Easier on the eyes at night', icon: Moon },
  { value: 'system', label: 'System Default', description: 'Follows your OS preference', icon: Monitor },
];

export const AppearanceTab: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Appearance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize the look and feel of your dashboard
        </p>
      </div>

      {/* Theme selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {THEME_OPTIONS.map(opt => {
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'relative flex sm:flex-col items-center gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border-2 transition-all group text-left sm:text-center',
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900',
                )}
                aria-pressed={isActive}
                aria-label={`Select ${opt.label}`}
              >
                {/* Preview — desktop only */}
                <div
                  className={cn(
                    'hidden sm:block w-full aspect-[2/1] rounded-lg overflow-hidden border',
                    isActive
                      ? 'border-indigo-300 dark:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700',
                  )}
                >
                  {opt.value === 'light' && (
                    <div className="w-full h-full bg-slate-50 p-1.5">
                      <div className="w-full h-1.5 bg-white rounded mb-1 border border-slate-100" />
                      <div className="flex gap-1 h-[calc(100%-10px)]">
                        <div className="w-1/4 bg-white rounded border border-slate-100" />
                        <div className="flex-1 space-y-0.5">
                          <div className="h-1/2 bg-white rounded border border-slate-100" />
                          <div className="h-1/2 bg-white rounded border border-slate-100" />
                        </div>
                      </div>
                    </div>
                  )}
                  {opt.value === 'dark' && (
                    <div className="w-full h-full bg-slate-900 p-1.5">
                      <div className="w-full h-1.5 bg-slate-800 rounded mb-1" />
                      <div className="flex gap-1 h-[calc(100%-10px)]">
                        <div className="w-1/4 bg-slate-800 rounded" />
                        <div className="flex-1 space-y-0.5">
                          <div className="h-1/2 bg-slate-800 rounded" />
                          <div className="h-1/2 bg-slate-800 rounded" />
                        </div>
                      </div>
                    </div>
                  )}
                  {opt.value === 'system' && (
                    <div className="w-full h-full flex">
                      <div className="w-1/2 bg-slate-50 p-1">
                        <div className="w-full h-1 bg-white rounded mb-0.5 border border-slate-100" />
                        <div className="h-[calc(100%-6px)] bg-white rounded border border-slate-100" />
                      </div>
                      <div className="w-1/2 bg-slate-900 p-1">
                        <div className="w-full h-1 bg-slate-800 rounded mb-0.5" />
                        <div className="h-[calc(100%-6px)] bg-slate-800 rounded" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile-only icon */}
                <div
                  className={cn(
                    'sm:hidden p-2.5 rounded-lg shrink-0',
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                  )}
                >
                  <opt.icon className="w-5 h-5" />
                </div>

                {/* Label + description */}
                <div className="flex-1 sm:flex-initial min-w-0">
                  <div className="flex items-center gap-1.5 sm:justify-center">
                    <opt.icon
                      className={cn(
                        'w-3.5 h-3.5 hidden sm:block',
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-slate-400',
                      )}
                    />
                    <p
                      className={cn(
                        'text-sm font-semibold truncate',
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {opt.label}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{opt.description}</p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="sm:absolute sm:top-2 sm:right-2 shrink-0">
                    <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info about scope */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
          <Monitor className="w-3.5 h-3.5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme applies everywhere</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your preference will apply across the dashboard, event management, and report pages.
          </p>
        </div>
      </div>
    </div>
  );
};
