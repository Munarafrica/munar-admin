// Builder Config Panel
// Left sidebar with tabs: Sections | Design | Settings

import React from 'react';
import { Layers, Palette, Settings } from 'lucide-react';
import { WebsiteConfig, WebsiteTheme, SectionId, AccessControl } from '../../modules/website/types';
import { SectionsPanel } from './panels/SectionsPanelV2';
import { DesignPanel } from './panels/DesignPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { DEFAULT_THEME_HORIZON, DEFAULT_THEME_PULSE } from '../../modules/website/types';
import { cn } from '../ui/utils';

export type ConfigPanelTab = 'sections' | 'design' | 'settings';

interface BuilderConfigPanelProps {
  config: WebsiteConfig;
  activeTab: ConfigPanelTab;
  selectedSection: SectionId | null;
  eventSlug: string;
  eventId?: string;
  onTabChange: (tab: ConfigPanelTab) => void;
  onSelectSection: (id: SectionId) => void;
  onToggleSection: (id: SectionId) => void;
  onSwapSections: (fromId: SectionId, toId: SectionId) => void;
  onUpdateTheme: (theme: Partial<WebsiteTheme>) => void;
  onResetTheme: () => void;
  onUpdateConfig: (updates: Partial<WebsiteConfig>) => void;
}

const TABS: { id: ConfigPanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'sections', label: 'Sections', icon: <Layers className="w-4 h-4" /> },
  { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export function BuilderConfigPanel({
  config,
  activeTab,
  selectedSection,
  eventSlug,
  eventId,
  onTabChange,
  onSelectSection,
  onToggleSection,
  onSwapSections,
  onUpdateTheme,
  onResetTheme,
  onUpdateConfig,
}: BuilderConfigPanelProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'sections' && (
          <SectionsPanel
            config={config}
            selectedSection={selectedSection}
            eventId={eventId}
            onSelectSection={onSelectSection}
            onToggleSection={onToggleSection}
            onSwapSections={onSwapSections}
            onUpdateConfig={onUpdateConfig}
          />
        )}
        {activeTab === 'design' && (
          <DesignPanel
            config={config}
            onUpdateTheme={onUpdateTheme}
            onUpdateConfig={onUpdateConfig}
            onResetTheme={onResetTheme}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel
            config={config}
            eventSlug={eventSlug}
            onUpdateConfig={onUpdateConfig}
          />
        )}
      </div>
    </aside>
  );
}
