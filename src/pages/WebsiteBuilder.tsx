// Website Builder Page
// Route: /events/:eventId/website
// Full-screen builder with live iframe preview, section/design/settings panels, and publish flow

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEvent } from '../contexts';
import { websiteService } from '../services/website.service';
import {
  WebsiteConfig,
  WebsiteTheme,
  SectionId,
  DEFAULT_WEBSITE_CONFIG,
  DEFAULT_SECTIONS,
  DEFAULT_THEME_HORIZON,
  DEFAULT_THEME_PULSE,
  WebsiteTemplateId,
  WebsitePreviewEditableSelectMessage,
} from '../modules/website/types';
import { BuilderTopBar } from '../components/website-builder/BuilderTopBar';
import { BuilderCanvas } from '../components/website-builder/BuilderCanvas';
import { BuilderConfigPanel } from '../components/website-builder/BuilderConfigPanel';
import { PreviewInspector } from '../components/website-builder/PreviewInspector';
import { AssetLibraryHost, AssetLibraryRequestDetail } from '../components/website-builder/SingleImageField';
import { TemplatePicker } from '../components/website-builder/modals/TemplatePicker';
import { PublishModal } from '../components/website-builder/modals/PublishModal';
import type { ConfigPanelTab } from '../components/website-builder/BuilderConfigPanel';
import type { PreviewMode } from '../components/website-builder/BuilderCanvas';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

export function WebsiteBuilder() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEvent, loadEvent } = useEvent();

  // ── State ──────────────────────────────────────────────────────────────
  const [config, setConfig] = useState<WebsiteConfig>(() => ({
    ...DEFAULT_WEBSITE_CONFIG,
    sections: [...DEFAULT_SECTIONS],
  }));

  const [activeTab, setActiveTab] = useState<ConfigPanelTab>('sections');
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedEditable, setSelectedEditable] = useState<WebsitePreviewEditableSelectMessage['selection'] | null>(null);
  const [assetLibraryRequest, setAssetLibraryRequest] = useState<AssetLibraryRequestDetail | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // ── Load event and saved config ─────────────────────────────────────────
  useEffect(() => {
    if (eventId && !currentEvent) {
      loadEvent(eventId);
    }
  }, [eventId, currentEvent, loadEvent]);

  useEffect(() => {
    if (!eventId) return;
    websiteService.loadConfig(eventId).then((saved) => {
      setConfig(saved);
      isInitialLoad.current = false;
    });
  }, [eventId]);

  // ── Auto-save (debounced 1.5s) ──────────────────────────────────────────
  const scheduleAutoSave = useCallback((newConfig: WebsiteConfig) => {
    if (isInitialLoad.current) return;
    setSaveState('unsaved');

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (!eventId) return;
      setSaveState('saving');
      websiteService.saveConfig(eventId, newConfig)
        .then((updated) => {
          setConfig(updated);
          setSaveState('saved');
        })
        .catch(() => {
          setSaveState('error');
        });
    }, 1500);
  }, [eventId]);

  // ── Config mutation helpers ──────────────────────────────────────────────
  const updateConfig = useCallback((updates: Partial<WebsiteConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  const updateTheme = useCallback((themeUpdates: Partial<WebsiteTheme>) => {
    setConfig((prev) => {
      const next = { ...prev, theme: { ...prev.theme, ...themeUpdates } };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  const resetTheme = useCallback(() => {
    setConfig((prev) => {
      const defaultTheme = prev.templateId === 'pulse' ? DEFAULT_THEME_PULSE : DEFAULT_THEME_HORIZON;
      const next = { ...prev, theme: defaultTheme };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  const toggleSection = useCallback((id: SectionId) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  const swapSections = useCallback((aId: SectionId, bId: SectionId) => {
    setConfig((prev) => {
      const aS = prev.sections.find((s) => s.id === aId);
      const bS = prev.sections.find((s) => s.id === bId);
      if (!aS || !bS) return prev;
      const next = {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id === aId) return { ...s, order: bS.order };
          if (s.id === bId) return { ...s, order: aS.order };
          return s;
        }),
      };
      scheduleAutoSave(next);
      return next;
    });
  }, [scheduleAutoSave]);

  const selectTemplate = useCallback((templateId: WebsiteTemplateId) => {
    const defaultTheme = templateId === 'pulse' ? DEFAULT_THEME_PULSE : DEFAULT_THEME_HORIZON;
    setConfig((prev) => {
      // Only reset theme if switching to a different template
      const next = {
        ...prev,
        templateId,
        theme: prev.templateId !== templateId ? defaultTheme : prev.theme,
      };
      scheduleAutoSave(next);
      return next;
    });
    setIsPreviewReady(false); // Reload iframe
    setShowTemplatePicker(false);
  }, [scheduleAutoSave]);

  // ── Publish / Unpublish ──────────────────────────────────────────────────
  const handlePublish = useCallback(() => {
    if (!eventId) return;
    setIsPublishing(true);
    websiteService.publish(eventId, config)
      .then((updated) => {
        setConfig(updated);
        setSaveState('saved');
      })
      .finally(() => {
        setIsPublishing(false);
        setShowPublishModal(false);
      });
  }, [eventId, config]);

  const handleUnpublish = useCallback(() => {
    if (!eventId) return;
    setIsPublishing(true);
    websiteService.unpublish(eventId, config)
      .then((updated) => {
        setConfig(updated);
        setSaveState('saved');
      })
      .finally(() => {
        setIsPublishing(false);
        setShowPublishModal(false);
      });
  }, [eventId, config]);

  const eventSlug = currentEvent?.slug || eventId || 'event';
  const eventName = currentEvent?.name || 'Event Website';

  return (
    <div
      className="fixed inset-0 flex flex-col bg-slate-50 dark:bg-slate-950 font-['Raleway'] overflow-hidden"
      style={{ zIndex: 40 }}
    >
      {/* ── Top Action Bar ─────────────────────────────────────────────── */}
      <BuilderTopBar
        config={config}
        eventId={eventId || ''}
        eventSlug={eventSlug}
        eventName={eventName}
        previewMode={previewMode}
        saveState={saveState}
        onPreviewModeChange={setPreviewMode}
        onOpenTemplatePicker={() => setShowTemplatePicker(true)}
        onOpenPublishModal={() => setShowPublishModal(true)}
      />

      {/* ── Main workspace ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Config panel (left) */}
        <BuilderConfigPanel
          config={config}
          activeTab={activeTab}
          selectedSection={selectedSection}
          eventSlug={eventSlug}
          eventId={eventId}
          onOpenAssetLibrary={setAssetLibraryRequest}
          onTabChange={setActiveTab}
          onSelectSection={(id) => {
            setSelectedSection(id);
            setActiveTab('sections');
          }}
          onToggleSection={toggleSection}
          onSwapSections={swapSections}
          onUpdateTheme={updateTheme}
          onResetTheme={resetTheme}
          onUpdateConfig={updateConfig}
        />

        {/* Canvas (centre) */}
        <BuilderCanvas
          eventId={eventId || ''}
          eventSlug={eventSlug}
          config={config}
          previewMode={previewMode}
          isReady={isPreviewReady}
          selectedSectionId={selectedSection}
          onIframeReady={() => setIsPreviewReady(true)}
          onConfigChange={updateConfig}
          onSectionClick={(id) => {
            setSelectedEditable(null);
            setSelectedSection(id);
            setActiveTab('sections');
          }}
          onEditableSelect={(selection) => {
            setSelectedEditable(selection);
            setSelectedSection(selection.sectionId);
          }}
        />

        <PreviewInspector
          config={config}
          previewMode={previewMode}
          selection={selectedEditable}
          onUpdateConfig={updateConfig}
          onClearSelection={() => setSelectedEditable(null)}
        />
      </div>

      {/* ── Template Picker Modal ──────────────────────────────────────── */}
      {showTemplatePicker && (
        <TemplatePicker
          currentTemplateId={config.templateId}
          onSelect={selectTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* ── Publish Modal ─────────────────────────────────────────────── */}
      {showPublishModal && (
        <PublishModal
          config={config}
          eventSlug={eventSlug}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onClose={() => setShowPublishModal(false)}
          isLoading={isPublishing}
        />
      )}

      <AssetLibraryHost
        request={assetLibraryRequest}
        onClose={() => setAssetLibraryRequest(null)}
      />
    </div>
  );
}
