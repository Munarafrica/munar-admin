// Public Event Website - Dynamic template-driven marketing and information hub
// Route: /e/:eventSlug
// Reads website config from websiteService, renders the appropriate template.
// In preview mode (?preview=1), listens for postMessage from the builder canvas.

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Lock, EyeOff, Eye } from 'lucide-react';
import { useEvent } from '../../contexts';
import { websiteService } from '../../services/website.service';
import { programService } from '../../services/program.service';
import { getSponsors } from '../../services/sponsors.service';
import {
  WebsiteConfig,
  DEFAULT_WEBSITE_CONFIG,
  DEFAULT_SECTIONS,
  PreviewBreakpoint,
  SectionId,
  SectionOverrides,
  WebsitePreviewConfigUpdateMessage,
  WebsitePreviewMessage,
  WebsitePreviewReadyMessage,
  WebsiteSectionClickMessage,
} from './types';
import { Speaker, Session } from '../../components/event-dashboard/types';
import { Sponsor } from '../../types/sponsors';
import { HorizonTemplate } from './templates/HorizonTemplate';
import { PulseTemplate } from './templates/PulseTemplate';

function extractSections(sectionsJson?: Record<string, unknown> | null): WebsiteConfig['sections'] | null {
  if (!sectionsJson) return null;
  const rawSections = 'sections' in sectionsJson
    ? (sectionsJson.sections as unknown)
    : sectionsJson;
  if (!Array.isArray(rawSections)) return null;

  const normalized = rawSections
    .map((section, index) => {
      if (!section || typeof section !== 'object') return null;

      const raw = section as Record<string, unknown>;
      const props = (raw.props && typeof raw.props === 'object' ? raw.props : {}) as Record<string, unknown>;
      const id = typeof raw.id === 'string'
        ? raw.id
        : typeof raw.type === 'string'
          ? raw.type
          : null;

      if (!id) return null;

      return {
        id,
        label: typeof props.label === 'string' ? props.label : id,
        visible: typeof props.visible === 'boolean' ? props.visible : true,
        order: typeof props.order === 'number' ? props.order : index,
        variant: typeof props.variant === 'string' ? props.variant : undefined,
        overrides: (props.overrides && typeof props.overrides === 'object'
          ? props.overrides
          : undefined) as WebsiteConfig['sections'][number]['overrides'],
      };
    })
    .filter((section): section is WebsiteConfig['sections'][number] => !!section);

  return normalized.length ? normalized : null;
}

// ── Access Control Gates ────────────────────────────────────────────────────

function PrivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Raleway']">
      <div className="text-center max-w-sm px-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <EyeOff className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">This page is private</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          This event website is not publicly accessible. Contact the organiser for access.
        </p>
      </div>
    </div>
  );
}

function PasswordGate({ config, onUnlock }: { config: WebsiteConfig; onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === config.password) {
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Raleway']">
      <div className="w-full max-w-sm px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">Password Required</h1>
          <p className="text-slate-500 text-sm text-center mb-6">
            This event website is password-protected.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                placeholder="Enter password"
                autoFocus
                className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none transition-colors ${
                  error
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 bg-white focus:border-indigo-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium">Incorrect password. Please try again.</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Access Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function EventWebsitePublic() {
  const { currentEvent } = useEvent();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === '1';

  const [config, setConfig] = useState<WebsiteConfig>(() => ({
    ...DEFAULT_WEBSITE_CONFIG,
    sections: [...DEFAULT_SECTIONS],
  }));
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  const [activeBreakpoint, setActiveBreakpoint] = useState<PreviewBreakpoint>('desktop');
  const [passwordUnlocked, setPasswordUnlocked] = useState(() => {
    try { return sessionStorage.getItem('munar_pw_unlocked') === '1'; } catch { return false; }
  });
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Load saved config when event is available
  useEffect(() => {
    if (!currentEvent) return;

    if (isPreviewMode) {
      websiteService.loadConfig(currentEvent.id).then(setConfig);
      return;
    }

    if (eventSlug) {
      Promise.all([
        websiteService.loadPublishedWebsite(eventSlug).catch(() => null),
        websiteService.loadPublishedPage(eventSlug, 'home').catch(() => null),
      ]).then(([overview, page]) => {
        if (overview || page) {
          setConfig((prev) => ({
            ...prev,
            ...(overview?.websiteSettings as Partial<WebsiteConfig> | undefined),
            sections: extractSections(page?.page.sectionsJson) || prev.sections,
            seo: {
              ...prev.seo,
              ...(page?.page.seoJson as Record<string, string> | undefined),
            },
          }));
          return;
        }

        websiteService.loadConfig(currentEvent.id).then(setConfig);
      });
      return;
    }

    websiteService.loadConfig(currentEvent.id).then(setConfig);
  }, [currentEvent?.id, eventSlug, isPreviewMode]);

  // Load speakers, sessions, sponsors when event is available
  useEffect(() => {
    if (!currentEvent) return;
    Promise.all([
      programService.getSpeakers(currentEvent.id).catch(() => [] as Speaker[]),
      programService.getSessions(currentEvent.id).catch(() => [] as Session[]),
      getSponsors(currentEvent.id).catch(() => [] as Sponsor[]),
    ]).then(([sp, se, spon]) => {
      setSpeakers(sp);
      setSessions(se);
      setSponsors(spon.filter((s) => s.visible));
    });
  }, [currentEvent?.id]);

  // In preview mode: listen for postMessage config updates (config + selectedSection)
  useEffect(() => {
    if (!isPreviewMode) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WEBSITE_PREVIEW_CONFIG') {
        const msg = event.data as WebsitePreviewMessage;
        setConfig(msg.config);
        setActiveBreakpoint(msg.previewMode || 'desktop');
        if (msg.selectedSectionId !== undefined) {
          setSelectedSection(msg.selectedSectionId ?? null);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent builder that preview iframe is ready
    if (window.parent !== window) {
      const readyMsg: WebsitePreviewReadyMessage = { type: 'WEBSITE_PREVIEW_READY' };
      window.parent.postMessage(readyMsg, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [isPreviewMode]);

  // Handler: section clicked inside the template → notify builder
  const handleSectionClick = (id: SectionId) => {
    if (!isPreviewMode) return;
    const msg: WebsiteSectionClickMessage = { type: 'WEBSITE_SECTION_CLICK', sectionId: id };
    window.parent.postMessage(msg, '*');
  };

  const handleSectionOverrideUpdate = (sectionId: SectionId, overrides: SectionOverrides) => {
    setConfig((prev) => {
      const updates: Partial<WebsiteConfig> = {
        sections: prev.sections.map((section) =>
          section.id === sectionId ? { ...section, overrides } : section
        ),
      };

      if (window.parent !== window) {
        const msg: WebsitePreviewConfigUpdateMessage = {
          type: 'WEBSITE_PREVIEW_CONFIG_UPDATE',
          updates,
        };
        window.parent.postMessage(msg, '*');
      }

      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleSectionReorder = (sectionId: SectionId, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order);
      const index = sections.findIndex((section) => section.id === sectionId);
      if (index === -1) return prev;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sections.length) return prev;

      const current = sections[index];
      const target = sections[swapIndex];
      const nextSections = prev.sections.map((section) => {
        if (section.id === current.id) return { ...section, order: target.order };
        if (section.id === target.id) return { ...section, order: current.order };
        return section;
      });

      const updates: Partial<WebsiteConfig> = { sections: nextSections };

      if (window.parent !== window) {
        const msg: WebsitePreviewConfigUpdateMessage = {
          type: 'WEBSITE_PREVIEW_CONFIG_UPDATE',
          updates,
        };
        window.parent.postMessage(msg, '*');
      }

      return {
        ...prev,
        sections: nextSections,
      };
    });
  };

  if (!currentEvent) return null;

  // ── Access Control (bypass in preview mode) ─────────────────────────────
  if (!isPreviewMode) {
    if (config.accessControl === 'private') return <PrivatePage />;
    if (config.accessControl === 'password' && !passwordUnlocked) {
      return (
        <PasswordGate
          config={config}
          onUnlock={() => {
            setPasswordUnlocked(true);
            try { sessionStorage.setItem('munar_pw_unlocked', '1'); } catch { /* ignore */ }
          }}
        />
      );
    }
  }

  // ── Template render ──────────────────────────────────────────────────────
  const templateProps = {
    event: currentEvent,
    config,
    speakers,
    sessions,
    sponsors,
    onSectionClick: isPreviewMode ? handleSectionClick : undefined,
    selectedSection: isPreviewMode ? selectedSection : null,
    isPreviewMode,
    activeBreakpoint,
    onSectionOverrideUpdate: isPreviewMode ? handleSectionOverrideUpdate : undefined,
    onSectionReorder: isPreviewMode ? handleSectionReorder : undefined,
  };

  return (
    <>
      {config.templateId === 'pulse' ? (
        <PulseTemplate {...templateProps} />
      ) : (
        <HorizonTemplate {...templateProps} />
      )}
    </>
  );
}
