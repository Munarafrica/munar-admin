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
  SectionId,
  WebsitePreviewMessage,
  WebsitePreviewReadyMessage,
  WebsiteSectionClickMessage,
} from './types';
import { Speaker, Session } from '../../components/event-dashboard/types';
import { Sponsor } from '../../types/sponsors';
import { HorizonTemplate } from './templates/HorizonTemplate';
import { PulseTemplate } from './templates/PulseTemplate';

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
            sections: (page?.page.sectionsJson as WebsiteConfig['sections']) || prev.sections,
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
