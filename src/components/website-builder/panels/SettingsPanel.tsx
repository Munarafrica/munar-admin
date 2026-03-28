// Settings Panel
// Website settings: SEO, URL slug, access control, and feature toggles

import React from 'react';
import { Globe, Lock, Users, Search, Link, AlertCircle, Share2 } from 'lucide-react';
import { WebsiteConfig, AccessControl } from '../../../modules/website/types';
import { cn } from '../../ui/utils';

interface SettingsPanelProps {
  config: WebsiteConfig;
  eventSlug: string;
  onUpdateConfig: (updates: Partial<WebsiteConfig>) => void;
}

interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  helpText?: string;
  onChange: (value: string) => void;
  maxLength?: number;
  monospace?: boolean;
}

function TextField({ label, value, placeholder, helpText, onChange, maxLength, monospace }: TextFieldProps) {
  return (
    <div className="py-3">
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all',
          monospace && 'font-mono text-xs'
        )}
      />
      {helpText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{helpText}</p>
      )}
      {maxLength && (
        <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  helpText?: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}

function TextAreaField({ label, value, placeholder, helpText, onChange, maxLength, rows = 3 }: TextAreaFieldProps) {
  return (
    <div className="py-3">
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
      />
      {helpText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{helpText}</p>
      )}
      {maxLength && (
        <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

const ACCESS_OPTIONS: { value: AccessControl; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can view',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    value: 'password',
    label: 'Password Protected',
    description: 'Requires a password',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Invite only',
    icon: <Users className="w-4 h-4" />,
  },
];

export function SettingsPanel({ config, eventSlug, onUpdateConfig }: SettingsPanelProps) {
  const publicUrl = `${window.location.origin}/e/${config.slug || eventSlug}`;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Settings</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">SEO, URL, and access control</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* URL section */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Link className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Website URL
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 mb-3">
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">{publicUrl}</p>
          </div>

          <TextField
            label="Custom Slug"
            value={config.slug || eventSlug}
            placeholder={eventSlug}
            helpText="Customise the URL slug for your event website. Use only lowercase letters, numbers, and hyphens."
            onChange={(v) => {
              const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-');
              onUpdateConfig({ slug: clean });
            }}
            monospace
          />
        </div>

        {/* SEO section */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              SEO
            </p>
          </div>

          <TextField
            label="Page Title"
            value={config.seo.title}
            placeholder="My Event 2026 — Official Website"
            helpText="Appears in browser tabs and search results. Keep under 60 characters."
            onChange={(v) => onUpdateConfig({ seo: { ...config.seo, title: v } })}
            maxLength={60}
          />

          <TextAreaField
            label="Meta Description"
            value={config.seo.description}
            placeholder="Join us for an unforgettable event..."
            helpText="Shown in search results. Keep under 160 characters."
            onChange={(v) => onUpdateConfig({ seo: { ...config.seo, description: v } })}
            maxLength={160}
            rows={3}
          />
        </div>

        {/* Access Control */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Access Control
          </p>
          <div className="space-y-2">
            {ACCESS_OPTIONS.map((option) => {
              const isSelected = config.accessControl === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onUpdateConfig({ accessControl: option.value })}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  )}>
                    {option.icon}
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300')}>
                      {option.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {config.accessControl === 'password' && (
            <div className="mt-3">
              <TextField
                label="Password"
                value={config.password || ''}
                placeholder="Enter a password for your website"
                helpText="Attendees will need this password to view the site."
                onChange={(v) => onUpdateConfig({ password: v })}
              />
            </div>
          )}

          {config.accessControl === 'private' && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Private mode is managed through your event attendee list. Only invited users can access the site.
              </p>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Social Links
            </p>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
            Add social media links to display in the website footer.
          </p>

          {(['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'] as const).map((platform) => (
            <TextField
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              value={config.socialLinks?.[platform] || ''}
              placeholder={`https://${platform}.com/...`}
              onChange={(v) => onUpdateConfig({ socialLinks: { ...config.socialLinks, [platform]: v } })}
            />
          ))}
        </div>

        {/* Status */}
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Status
          </p>
          <div className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium',
            config.status === 'published'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              config.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
            )} />
            {config.status === 'published' ? 'Published — Live' : 'Draft — Not published'}
          </div>
          {config.lastSaved && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center">
              Last saved {new Date(config.lastSaved).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
