// Template Picker Modal
// Full-screen modal for selecting a template

import React from 'react';
import { X, Check, Zap } from 'lucide-react';
import { WebsiteTemplateId } from '../../../modules/website/types';
import { TEMPLATE_REGISTRY, TemplateDefinition } from '../../../modules/website/templates/registry';
import { cn } from '../../ui/utils';

interface TemplatePickerProps {
  currentTemplateId: WebsiteTemplateId;
  onSelect: (templateId: WebsiteTemplateId) => void;
  onClose: () => void;
}

function TemplateThumbnail({ template, isSelected }: { template: TemplateDefinition; isSelected: boolean }) {
  const c = template.previewColors;
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group',
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      )}
      style={{ fontFamily: 'Raleway, sans-serif' }}
    >
      {/* Mini preview */}
      <div className="h-48 overflow-hidden relative" style={{ backgroundColor: c.bg }}>
        {/* Fake navbar */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: c.header }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md" style={{ backgroundColor: c.accent }} />
            <div className="w-20 h-2 rounded-full opacity-60" style={{ backgroundColor: c.text }} />
          </div>
          <div className="w-16 h-5 rounded-lg" style={{ backgroundColor: c.accent }} />
        </div>

        {/* Fake hero */}
        <div className="px-4 py-5" style={{ backgroundColor: c.header }}>
          <div className="w-8 h-3 rounded-full mb-2" style={{ backgroundColor: `${c.accent}88` }} />
          <div className="w-40 h-4 rounded-full mb-1.5" style={{ backgroundColor: '#ffffff55' }} />
          <div className="w-32 h-3 rounded-full mb-4" style={{ backgroundColor: '#ffffff33' }} />
          <div className="flex gap-2 mt-3">
            <div className="w-20 h-6 rounded-lg" style={{ backgroundColor: c.accent }} />
            <div className="w-16 h-6 rounded-lg border opacity-50" style={{ borderColor: c.accent }} />
          </div>
        </div>

        {/* Fake content rows */}
        <div className="px-4 py-3 space-y-1.5" style={{ backgroundColor: c.bg }}>
          {[0.9, 0.7, 0.5].map((op, i) => (
            <div key={i} className="h-2 rounded-full" style={{ width: `${70 + i * 10}%`, backgroundColor: c.text, opacity: op * 0.3 }} />
          ))}
        </div>

        {/* Fake cards */}
        <div className="px-4 py-2 flex gap-2">
          {[1, 1, 1].map((_, i) => (
            <div key={i} className="flex-1 h-10 rounded-xl" style={{ backgroundColor: c.card || c.bg, border: `1px solid ${c.accent}22` }} />
          ))}
        </div>

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">{template.name}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{template.category}</span>
          </div>
          {isSelected && (
            <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Current
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          {template.description}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          {template.useCase}
        </p>
      </div>
    </div>
  );
}

export function TemplatePicker({ currentTemplateId, onSelect, onClose }: TemplatePickerProps) {
  const [hovered, setHovered] = React.useState<WebsiteTemplateId | null>(null);
  const preview = hovered ? TEMPLATE_REGISTRY.find((t) => t.id === hovered) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 font-['Raleway']">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Choose a Template</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Templates define your website's layout. Your content is always preserved.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Safety notice */}
      <div className="px-8 py-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 flex items-center gap-2 flex-shrink-0">
        <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          Switching templates re-maps your content automatically. No data is ever lost.
        </p>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Category: Core */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
              Available Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TEMPLATE_REGISTRY.map((template) => (
                <div
                  key={template.id}
                  onMouseEnter={() => setHovered(template.id as WebsiteTemplateId)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSelect(template.id as WebsiteTemplateId)}
                >
                  <TemplateThumbnail
                    template={template}
                    isSelected={currentTemplateId === template.id}
                  />
                </div>
              ))}

              {/* "More coming soon" placeholder */}
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center min-h-[280px] opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">More templates</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 flex-shrink-0">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {TEMPLATE_REGISTRY.length} templates available · More being added
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
