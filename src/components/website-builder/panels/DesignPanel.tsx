// Design Panel
// Global theme controls: colors, typography, style settings, and logo

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { WebsiteConfig, WebsiteTheme, WebsiteTemplateId, DEFAULT_THEME_HORIZON, DEFAULT_THEME_PULSE } from '../../../modules/website/types';
import { cn } from '../../ui/utils';

interface DesignPanelProps {
  config: WebsiteConfig;
  onUpdateTheme: (theme: Partial<WebsiteTheme>) => void;
  onUpdateConfig: (updates: Partial<WebsiteConfig>) => void;
  onResetTheme: () => void;
}

interface ColorSwatchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{value}</span>
        <label className="cursor-pointer">
          <div
            className="w-7 h-7 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-transform"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[130px]"
        style={{ fontFamily: value }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

const PRESET_PALETTES = [
  { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#ec4899', accent: '#fb923c' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#f59e0b' },
  { name: 'Sky', primary: '#0ea5e9', secondary: '#6366f1', accent: '#f59e0b' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#ef4444', accent: '#06b6d4' },
  { name: 'Violet', primary: '#7c3aed', secondary: '#db2777', accent: '#10b981' },
];

const HEADING_FONTS = [
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Fraunces', label: 'Fraunces' },
  { value: 'Georgia', label: 'Georgia' },
];

const BODY_FONTS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'system-ui', label: 'System UI' },
];

export function DesignPanel({ config, onUpdateTheme, onUpdateConfig, onResetTheme }: DesignPanelProps) {
  const { theme } = config;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Design</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize look and feel</p>
        </div>
        <button
          onClick={onResetTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Reset to template defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Logo
          </p>
          <input
            type="url"
            placeholder="Paste image URL (https://...)"
            value={config.logoUrl || ''}
            onChange={(e) => onUpdateConfig({ logoUrl: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {config.logoUrl && (
            <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center h-12 overflow-hidden">
              <img src={config.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.navbarEnabled !== false}
              onChange={(e) => onUpdateConfig({ navbarEnabled: e.target.checked })}
              className="rounded accent-indigo-600"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">Show sticky navbar</span>
          </label>
        </div>

        {/* Color Presets */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Color Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_PALETTES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onUpdateTheme({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent,
                })}
                className={cn(
                  'rounded-xl p-2 border-2 transition-all hover:scale-105',
                  theme.primaryColor === preset.primary
                    ? 'border-indigo-500 shadow-sm'
                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                )}
                title={preset.name}
              >
                <div className="flex gap-1 justify-center mb-1.5">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: preset.accent }} />
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            Custom Colors
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ColorSwatch label="Primary" value={theme.primaryColor} onChange={(v) => onUpdateTheme({ primaryColor: v })} />
            <ColorSwatch label="Secondary" value={theme.secondaryColor} onChange={(v) => onUpdateTheme({ secondaryColor: v })} />
            <ColorSwatch label="Accent" value={theme.accentColor} onChange={(v) => onUpdateTheme({ accentColor: v })} />
            <ColorSwatch label="Background" value={theme.backgroundColor} onChange={(v) => onUpdateTheme({ backgroundColor: v })} />
          </div>
        </div>

        {/* Typography */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            Typography
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <SelectField
              label="Heading"
              value={theme.headingFont}
              options={HEADING_FONTS}
              onChange={(v) => onUpdateTheme({ headingFont: v })}
            />
            <SelectField
              label="Body"
              value={theme.bodyFont}
              options={BODY_FONTS}
              onChange={(v) => onUpdateTheme({ bodyFont: v })}
            />
          </div>
        </div>

        {/* Shape & Style */}
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            Shape &amp; Style
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <SelectField
              label="Border Radius"
              value={theme.borderRadius}
              options={[
                { value: 'sharp', label: 'Sharp' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'pill', label: 'Pill' },
              ]}
              onChange={(v) => onUpdateTheme({ borderRadius: v as WebsiteTheme['borderRadius'] })}
            />
            <SelectField
              label="Button Style"
              value={theme.buttonStyle}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' },
              ]}
              onChange={(v) => onUpdateTheme({ buttonStyle: v as WebsiteTheme['buttonStyle'] })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
