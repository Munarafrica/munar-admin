// Pulse Template
// Bold, high-energy dark event website template
// Design: Dark background, vibrant accents, full-bleed sections, dramatic typography
// Features: Dynamic section ordering, theme-aware buttons, scroll animations, custom blocks

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Ticket, Vote, ShoppingBag, FileText,
  Image, Users, Mic, ChevronRight, ExternalLink, Zap, ChevronUp,
  Quote, ArrowRight,
} from 'lucide-react';
import { EventData, Speaker, Session } from '../../../components/event-dashboard/types';
import { Sponsor } from '../../../types/sponsors';
import { WebsiteConfig, SectionId, CustomBlock } from '../types';
import { cn } from '../../../components/ui/utils';
import {
  getRadius, getButtonStyle, getButtonClasses, sectionStyle,
  GALLERY_PLACEHOLDER_IMAGES,
} from './helpers';

// ── Social icons (inline SVG for footer) ────────────────────────────────────
const SocialIcon = ({ type, url, color }: { type: string; url: string; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    twitter: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    instagram: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    facebook: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    linkedin: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    youtube: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#000"/></svg>,
    tiktok: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  };
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all"
      style={{ color }}
    >
      {icons[type] || null}
    </a>
  );
};

// ── Scroll reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: isVisible ? 'animate-in' : 'animate-out' };
}

function AnimatedSection({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const reveal = useScrollReveal();
  return (
    <div ref={reveal.ref} className={cn(reveal.className, className)} {...props}>
      {children}
    </div>
  );
}

// ── Template props ──────────────────────────────────────────────────────────

interface PulseTemplateProps {
  event: EventData;
  config: WebsiteConfig;
  speakers?: Speaker[];
  sessions?: Session[];
  sponsors?: Sponsor[];
  onSectionClick?: (id: SectionId) => void;
  selectedSection?: SectionId | null;
}

// ── Main Template ───────────────────────────────────────────────────────────

export function PulseTemplate({
  event, config, speakers = [], sessions = [], sponsors = [],
  onSectionClick, selectedSection,
}: PulseTemplateProps) {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const slug = eventSlug || event.slug || event.id;
  const { theme } = config;
  const [showBackToTop, setShowBackToTop] = useState(false);

  const visibleSections = [...config.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const isVisible = (id: SectionId) => visibleSections.some((s) => s.id === id);

  const handleClick = (id: SectionId) => {
    if (onSectionClick) onSectionClick(id);
  };

  // Dark-theme button style: primary color bg, dark text
  const btnStyle = (color: string) => getButtonStyle(theme, color, theme.backgroundColor);
  const btnClasses = getButtonClasses(theme);

  // Back to top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Section renderers ─────────────────────────────────────────────────

  const renderAbout = () => (
    (event.description || event.type) ? (
      <AnimatedSection
        key="about"
        id="about"
        onClick={() => handleClick('about')}
        className={cn('py-20 max-w-6xl mx-auto px-6 sm:px-10', sectionStyle(selectedSection === 'about', 'dark'))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          <div>
            <div className="w-10 h-1 mb-6 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            <h2 className="text-4xl font-black mb-6 leading-tight" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
              About the <br />
              <span style={{ color: theme.primaryColor }}>Event</span>
            </h2>
            {event.description ? (
              <p className="text-slate-300 leading-relaxed text-base">{event.description}</p>
            ) : (
              <p className="text-slate-500 italic">Event description goes here.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Date', value: event.date || '—', icon: <Calendar className="w-5 h-5" /> },
              { label: 'Time', value: event.time || '—', icon: <Clock className="w-5 h-5" /> },
              { label: 'Type', value: event.type || '—', icon: <Zap className="w-5 h-5" /> },
              { label: 'Location', value: event.venueLocation || event.country || '—', icon: <MapPin className="w-5 h-5" /> },
            ].map((item) => (
              <div key={item.label} className="p-5" style={{ backgroundColor: `${theme.primaryColor}11`, border: `1px solid ${theme.primaryColor}22`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
                <div className="mb-2" style={{ color: theme.primaryColor }}>{item.icon}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{item.label}</div>
                <div className="font-bold text-white text-sm">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    ) : null
  );

  const renderTickets = () => (
    <AnimatedSection
      key="tickets"
      onClick={() => handleClick('tickets')}
      className={cn('py-20', sectionStyle(selectedSection === 'tickets', 'dark'))}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
            <h2 className="text-4xl font-black" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
              Get Your <span style={{ color: theme.primaryColor }}>Tickets</span>
            </h2>
          </div>
          <Link to={`/e/${slug}/tickets`} className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: theme.primaryColor }} onClick={(e) => e.stopPropagation()}>
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-hidden p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}33 0%, ${theme.secondaryColor}22 100%)`, border: `1px solid ${theme.primaryColor}44`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center shadow-lg flex-shrink-0" style={{ backgroundColor: theme.primaryColor, borderRadius: getRadius(theme.borderRadius) }}>
              <Ticket className="w-7 h-7" style={{ color: theme.backgroundColor }} />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Reserve Your Place</h3>
              <p className="text-slate-400 mt-1">Limited spots available — secure yours now</p>
            </div>
          </div>
          <Link to={`/e/${slug}/tickets`} className={cn('flex-shrink-0 px-8 py-4 shadow-lg', btnClasses)} style={btnStyle(theme.primaryColor)} onClick={(e) => e.stopPropagation()}>
            <Ticket className="w-4 h-4" /> Get Tickets
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );

  const renderSchedule = () => (
    <AnimatedSection
      key="schedule"
      id="schedule"
      onClick={() => handleClick('schedule')}
      className={cn('py-20', sectionStyle(selectedSection === 'schedule', 'dark'))}
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
        <h2 className="text-4xl font-black mb-10" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
          The <span style={{ color: theme.primaryColor }}>Programme</span>
        </h2>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-start gap-5 p-5" style={{ backgroundColor: `${theme.primaryColor}0d`, border: `1px solid ${theme.primaryColor}22`, borderRadius: getRadius(theme.borderRadius) }}>
                <div className="flex-shrink-0 text-center min-w-[64px]">
                  <div className="text-xs font-black uppercase tracking-widest" style={{ color: theme.primaryColor }}>{session.startTime}</div>
                  <div className="text-xs text-slate-500">&ndash;{session.endTime}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {session.track && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5" style={{ borderRadius: getRadius(theme.borderRadius, 'sm'), backgroundColor: `${session.trackColor || theme.primaryColor}22`, color: session.trackColor || theme.primaryColor }}>{session.track}</span>
                    )}
                    {session.location && <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>}
                  </div>
                  <p className="font-black text-white text-sm">{session.title}</p>
                  {session.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{session.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center" style={{ border: `1px solid ${theme.primaryColor}22`, backgroundColor: theme.backgroundColor, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.primaryColor}55` }} />
            <p className="font-black text-lg text-white">Schedule Coming Soon</p>
            <p className="text-slate-400 mt-2">The full lineup will be published before the event.</p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );

  const renderSpeakers = () => (
    <AnimatedSection
      key="speakers"
      id="speakers"
      onClick={() => handleClick('speakers')}
      className={cn('py-20', sectionStyle(selectedSection === 'speakers', 'dark'))}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
        <h2 className="text-4xl font-black mb-10" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
          Featured <span style={{ color: theme.primaryColor }}>Speakers</span>
        </h2>
        {speakers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {speakers.map((sp) => (
              <div key={sp.id} className="text-center p-4 flex flex-col items-center" style={{ backgroundColor: `${theme.primaryColor}0d`, border: `1px solid ${theme.primaryColor}22`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
                <div className="w-[120px] h-[120px] flex-shrink-0 mb-3 overflow-hidden" style={{ borderRadius: getRadius(theme.borderRadius, 'lg') }}>
                  {sp.imageUrl ? (
                    <img src={sp.imageUrl} alt={sp.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ backgroundColor: `${theme.primaryColor}33`, color: theme.primaryColor }}>
                      {sp.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="font-black text-white text-sm">{sp.name}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.primaryColor }}>{sp.role}</p>
                {sp.organization && <p className="text-slate-500 text-xs">{sp.organization}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center" style={{ border: `1px solid ${theme.primaryColor}22`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
            <Mic className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.primaryColor}55` }} />
            <p className="font-black text-lg text-white">Lineup Being Announced</p>
            <p className="text-slate-400 mt-2">Our incredible speakers will be revealed soon. Stay tuned!</p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );

  const renderSponsors = () => (
    <AnimatedSection
      key="sponsors"
      id="sponsors"
      onClick={() => handleClick('sponsors')}
      className={cn('py-20', sectionStyle(selectedSection === 'sponsors', 'dark'))}
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-10">
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: theme.primaryColor }} />
          <h2 className="text-4xl font-black" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
            Our <span style={{ color: theme.primaryColor }}>Sponsors</span>
          </h2>
          <p className="text-slate-400 mt-3">The organisations making this event possible</p>
        </div>
        {sponsors.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-5">
            {sponsors.map((sp) => (
              <a key={sp.id} href={sp.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center p-5 hover:scale-105 transition-all"
                style={{ borderRadius: getRadius(theme.borderRadius), border: `1px solid ${theme.primaryColor}33`, backgroundColor: `${theme.primaryColor}0d` }} title={sp.name}>
                {sp.logoUrl ? <img src={sp.logoUrl} alt={sp.name} className="h-10 max-w-[140px] object-contain filter brightness-150 contrast-75" /> : <span className="text-sm font-black" style={{ color: theme.primaryColor }}>{sp.name}</span>}
              </a>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center" style={{ border: `1px solid ${theme.primaryColor}22`, backgroundColor: theme.backgroundColor, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.primaryColor}55` }} />
            <p className="font-black text-lg text-white">Sponsors Being Confirmed</p>
            <p className="text-slate-400 mt-2">Our amazing partners will be announced soon.</p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );

  const renderVoting = () => (
    <AnimatedSection
      key="voting"
      onClick={() => handleClick('voting')}
      className={cn('py-20', sectionStyle(selectedSection === 'voting', 'dark'))}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="overflow-hidden p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ background: `linear-gradient(135deg, ${theme.secondaryColor}44 0%, ${theme.primaryColor}22 100%)`, border: `1px solid ${theme.primaryColor}44`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: theme.secondaryColor, borderRadius: getRadius(theme.borderRadius) }}>
              <Vote className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white">Cast Your Vote</h3>
              <p className="text-slate-300 mt-1">Have your say in live polls and awards</p>
            </div>
          </div>
          <Link to={`/e/${slug}/voting`} className={cn('flex-shrink-0 px-8 py-4', btnClasses)} style={btnStyle(theme.secondaryColor)} onClick={(e) => e.stopPropagation()}>
            <Vote className="w-4 h-4" /> Vote Now
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );

  const renderMerch = () => (
    <AnimatedSection
      key="merch"
      onClick={() => handleClick('merch')}
      className={cn('py-20', sectionStyle(selectedSection === 'merch', 'dark'))}
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
            Official <span style={{ color: theme.primaryColor }}>Merch</span>
          </h2>
          <Link to={`/e/${slug}/merch`} className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: theme.primaryColor }} onClick={(e) => e.stopPropagation()}>
            Shop all <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-hidden p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ background: `linear-gradient(135deg, ${theme.accentColor}22 0%, ${theme.primaryColor}11 100%)`, border: `1px solid ${theme.primaryColor}33`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center shadow-lg flex-shrink-0" style={{ backgroundColor: theme.accentColor, borderRadius: getRadius(theme.borderRadius) }}>
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">Event Merchandise</h3>
              <p className="text-slate-400 mt-1">Get exclusive event merch and collectibles</p>
            </div>
          </div>
          <Link to={`/e/${slug}/merch`} className={cn('flex-shrink-0 px-8 py-4 shadow-lg', btnClasses)} style={btnStyle(theme.primaryColor)} onClick={(e) => e.stopPropagation()}>
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );

  const renderForms = () => (
    <AnimatedSection
      key="forms"
      onClick={() => handleClick('forms')}
      className={cn('py-20', sectionStyle(selectedSection === 'forms', 'dark'))}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="overflow-hidden p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8" style={{ background: `linear-gradient(135deg, ${theme.accentColor}22 0%, ${theme.primaryColor}11 100%)`, border: `1px solid ${theme.accentColor}33`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: theme.accentColor, borderRadius: getRadius(theme.borderRadius) }}>
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-white">Forms & Surveys</h3>
              <p className="text-slate-300 mt-1">Share your thoughts and register interest</p>
            </div>
          </div>
          <Link to={`/e/${slug}/forms`} className={cn('flex-shrink-0 px-8 py-4', btnClasses)} style={btnStyle(theme.accentColor)} onClick={(e) => e.stopPropagation()}>
            <FileText className="w-4 h-4" /> Fill Forms
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );

  const renderGallery = () => (
    <AnimatedSection
      key="gallery"
      onClick={() => handleClick('gallery')}
      className={cn('py-20', sectionStyle(selectedSection === 'gallery', 'dark'))}
      style={{ backgroundColor: `${theme.primaryColor}08` }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
            <h2 className="text-4xl font-black" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
              <span style={{ color: theme.primaryColor }}>Gallery</span>
            </h2>
          </div>
          <Link to={`/e/${slug}/gallery`} className="flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: theme.primaryColor }} onClick={(e) => e.stopPropagation()}>
            View all <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GALLERY_PLACEHOLDER_IMAGES.map((img, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden group" style={{ borderRadius: getRadius(theme.borderRadius) }}>
              <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to={`/e/${slug}/gallery`} className={cn('px-8 py-3.5', btnClasses)} style={btnStyle(theme.primaryColor)} onClick={(e) => e.stopPropagation()}>
            <Image className="w-4 h-4" /> View All Photos
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );

  const renderFaq = () => (
    <AnimatedSection
      key="faq"
      onClick={() => handleClick('faq')}
      className={cn('py-20', sectionStyle(selectedSection === 'faq', 'dark'))}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: theme.primaryColor }} />
        <h2 className="text-4xl font-black mb-10" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
          <span style={{ color: theme.primaryColor }}>FAQ</span>
        </h2>
        <div className="space-y-3">
          {[
            { q: 'How do I get my ticket?', a: 'Tickets are delivered to your email after purchase. You can also find them in your Munar account.' },
            { q: 'Is there parking available?', a: 'Please check the venue details for parking information closer to the event date.' },
            { q: 'Can I transfer my ticket?', a: 'Ticket transfers may be available. Contact the organiser for details.' },
          ].map((item, i) => (
            <div key={i} className="p-5" style={{ backgroundColor: `${theme.primaryColor}11`, border: `1px solid ${theme.primaryColor}22`, borderRadius: getRadius(theme.borderRadius) }}>
              <p className="font-bold text-white mb-2">{item.q}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );

  const renderCustomBlock = (block: CustomBlock) => {
    switch (block.layout) {
      case 'text-image-left':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto px-6 sm:px-10">
            {block.imageUrl && (
              <div className="aspect-[4/3] overflow-hidden" style={{ borderRadius: getRadius(theme.borderRadius, 'lg') }}>
                <img src={block.imageUrl} alt={block.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-black text-white mb-4" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>{block.title}</h3>
              <p className="text-slate-300 leading-relaxed">{block.content}</p>
              {block.buttonText && (
                <a href={block.buttonUrl || '#'} className={cn('mt-6 px-8 py-3.5', btnClasses)} style={btnStyle(theme.primaryColor)}>
                  {block.buttonText} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      case 'text-image-right':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto px-6 sm:px-10">
            <div>
              <h3 className="text-2xl font-black text-white mb-4" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>{block.title}</h3>
              <p className="text-slate-300 leading-relaxed">{block.content}</p>
              {block.buttonText && (
                <a href={block.buttonUrl || '#'} className={cn('mt-6 px-8 py-3.5', btnClasses)} style={btnStyle(theme.primaryColor)}>
                  {block.buttonText} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
            {block.imageUrl && (
              <div className="aspect-[4/3] overflow-hidden" style={{ borderRadius: getRadius(theme.borderRadius, 'lg') }}>
                <img src={block.imageUrl} alt={block.title} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      case 'full-text':
        return (
          <div className="text-center max-w-3xl mx-auto px-6">
            <h3 className="text-3xl font-black text-white mb-5" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>{block.title}</h3>
            <p className="text-slate-300 leading-relaxed text-lg">{block.content}</p>
          </div>
        );
      case 'image-grid':
        return (
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            {block.title && <h3 className="text-2xl font-black text-white mb-6" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>{block.title}</h3>}
            <div className={cn('grid gap-4', (block.images?.length || 0) >= 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2')}>
              {(block.images || []).map((img, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden group" style={{ borderRadius: getRadius(theme.borderRadius) }}>
                  <img src={img} alt={`${block.title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'cta-banner':
        return (
          <div className="text-center max-w-6xl mx-auto px-6 sm:px-10">
            <div className="p-10" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}22, ${theme.secondaryColor}22)`, border: `1px solid ${theme.primaryColor}33`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
              <h3 className="text-3xl font-black text-white mb-3" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>{block.title}</h3>
              <p className="text-slate-300 mb-8 max-w-lg mx-auto">{block.content}</p>
              {block.buttonText && (
                <a href={block.buttonUrl || '#'} className={cn('px-10 py-4', btnClasses)} style={btnStyle(theme.primaryColor)}>
                  {block.buttonText} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        );
      case 'testimonial':
        return (
          <div className="text-center max-w-2xl mx-auto py-6 px-6">
            <Quote className="w-8 h-8 mx-auto mb-4" style={{ color: theme.primaryColor, opacity: 0.4 }} />
            <blockquote className="text-xl text-slate-200 leading-relaxed italic mb-6" style={{ fontFamily: theme.headingFont + ', sans-serif' }}>
              {block.content}
            </blockquote>
            {block.author && (
              <div>
                <p className="font-bold text-white">{block.author}</p>
                {block.authorRole && <p className="text-slate-400 text-sm">{block.authorRole}</p>}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderCustom = () => {
    const blocks = config.customBlocks || [];
    if (blocks.length === 0) return (
      <AnimatedSection
        key="custom"
        id="custom"
        onClick={() => handleClick('custom')}
        className={cn('py-20', sectionStyle(selectedSection === 'custom', 'dark'))}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="border-2 border-dashed p-12 text-center" style={{ borderColor: `${theme.primaryColor}44`, borderRadius: getRadius(theme.borderRadius, 'lg') }}>
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: `${theme.primaryColor}55` }} />
            <p className="font-black text-lg text-white">Custom Content Blocks</p>
            <p className="text-slate-400 mt-2">Add custom content blocks from the builder panel.</p>
          </div>
        </div>
      </AnimatedSection>
    );
    return (
      <div
        key="custom"
        id="custom"
        onClick={() => handleClick('custom')}
        className={cn(sectionStyle(selectedSection === 'custom', 'dark'))}
      >
        {blocks.map((block) => (
          <AnimatedSection key={block.id} className="py-12">
            {renderCustomBlock(block)}
          </AnimatedSection>
        ))}
      </div>
    );
  };

  // ── Section router ────────────────────────────────────────────────────

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    about: renderAbout,
    tickets: renderTickets,
    schedule: renderSchedule,
    speakers: renderSpeakers,
    sponsors: renderSponsors,
    voting: renderVoting,
    merch: renderMerch,
    forms: renderForms,
    gallery: renderGallery,
    faq: renderFaq,
    custom: renderCustom,
  };

  const middleSections = visibleSections.filter(
    (s) => s.id !== 'hero' && s.id !== 'footer'
  );

  // Social links for footer
  const socialEntries = config.socialLinks
    ? Object.entries(config.socialLinks).filter(([, url]) => url)
    : [];

  // CSS for scroll animations
  const animationCSS = `
    .animate-in { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .animate-out { opacity: 0; transform: translateY(24px); }
    html { scroll-behavior: smooth; }
  `;

  return (
    <div
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.bodyFont + ', sans-serif' }}
      className="min-h-screen text-white"
    >
      <style>{animationCSS}</style>

      {/* ── STICKY NAVBAR ──────────────────────────────────────────────── */}
      {config.navbarEnabled !== false && (
        <nav
          className="sticky top-0 z-50 backdrop-blur-sm border-b"
          style={{ backgroundColor: `${theme.backgroundColor}ee`, borderColor: `${theme.primaryColor}22`, fontFamily: theme.headingFont + ', sans-serif' }}
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 min-w-0">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-8 w-auto object-contain flex-shrink-0" />
              ) : event.branding?.logo ? (
                <img src={event.branding.logo} alt="Logo" className="h-8 w-auto object-contain flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: theme.primaryColor, borderRadius: getRadius(theme.borderRadius, 'sm') }}>
                  <Zap className="w-4 h-4 text-black" />
                </div>
              )}
              <span className="text-sm font-black text-white truncate hidden sm:block">{event.name}</span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-widest">
              {isVisible('about') && <a href="#about" className="text-slate-400 hover:text-white transition-colors">About</a>}
              {isVisible('schedule') && <a href="#schedule" className="text-slate-400 hover:text-white transition-colors">Schedule</a>}
              {isVisible('speakers') && <a href="#speakers" className="text-slate-400 hover:text-white transition-colors">Speakers</a>}
              {isVisible('sponsors') && <a href="#sponsors" className="text-slate-400 hover:text-white transition-colors">Sponsors</a>}
            </div>
            {isVisible('tickets') && (
              <Link to={`/e/${slug}/tickets`} className={cn('flex-shrink-0 px-5 py-2 text-xs font-bold', btnClasses)} style={btnStyle(theme.primaryColor)} onClick={(e) => e.stopPropagation()}>
                <Ticket className="w-3.5 h-3.5" /> Tickets
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      {isVisible('hero') && (
        <section
          onClick={() => handleClick('hero')}
          className={cn('relative', sectionStyle(selectedSection === 'hero', 'dark'))}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 580 }}>
            {event.coverImageUrl ? (
              <img src={event.coverImageUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover scale-105" style={{ filter: 'brightness(0.3)' }} />
            ) : (
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top left, ${theme.primaryColor}44 0%, ${theme.backgroundColor} 60%)` }} />
            )}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${theme.backgroundColor} 0%, ${theme.backgroundColor}88 30%, transparent 70%)` }} />
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: theme.primaryColor }} />

            <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 flex flex-col justify-end" style={{ minHeight: 580, paddingBottom: '5rem' }}>
              {event.branding?.logo && (
                <img src={event.branding.logo} alt="Logo" className="w-16 h-16 object-contain mb-6" style={{ borderRadius: getRadius(theme.borderRadius, 'lg') }} />
              )}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: theme.primaryColor, color: '#000' }}>
                  <Zap className="w-3 h-3" />
                  {event.status === 'published' ? 'Now Live' : 'Upcoming'}
                </div>
                <span className="text-slate-500 text-xs font-medium">{event.type}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-6 max-w-3xl" style={{ letterSpacing: '-0.02em', fontFamily: theme.headingFont + ', sans-serif' }}>
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-6 mb-10">
                {event.date && <span className="flex items-center gap-2 text-sm text-slate-300"><Calendar className="w-4 h-4" style={{ color: theme.primaryColor }} /><span className="font-medium">{event.date}</span></span>}
                {event.time && <span className="flex items-center gap-2 text-sm text-slate-300"><Clock className="w-4 h-4" style={{ color: theme.primaryColor }} /><span className="font-medium">{event.time}</span></span>}
                {(event.venueLocation || event.country) && <span className="flex items-center gap-2 text-sm text-slate-300"><MapPin className="w-4 h-4" style={{ color: theme.primaryColor }} /><span className="font-medium">{event.venueLocation || event.country}</span></span>}
              </div>
              <div className="flex gap-3 flex-wrap">
                {isVisible('tickets') && (
                  <Link to={`/e/${slug}/tickets`} className={cn('px-9 py-4 shadow-lg', btnClasses)} style={btnStyle(theme.primaryColor)} onClick={(e) => e.stopPropagation()}>
                    <Ticket className="w-4 h-4" /> Get Tickets
                  </Link>
                )}
                {isVisible('voting') && (
                  <Link to={`/e/${slug}/voting`} className="inline-flex items-center gap-2 px-8 py-4 font-bold text-sm border-2 hover:bg-white/5 transition-all" style={{ borderColor: theme.primaryColor, color: theme.primaryColor, borderRadius: getRadius(theme.borderRadius) }} onClick={(e) => e.stopPropagation()}>
                    <Vote className="w-4 h-4" /> Vote
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Divider after hero */}
      <div className="w-full h-px" style={{ backgroundColor: `${theme.primaryColor}22` }} />

      {/* ── DYNAMICALLY ORDERED CONTENT SECTIONS ──────────────────────── */}
      {middleSections.map((section) => {
        const renderer = sectionRenderers[section.id];
        return renderer ? <React.Fragment key={section.id}>{renderer()}</React.Fragment> : null;
      })}

      {/* ── FOOTER SECTION ────────────────────────────────────────────── */}
      {isVisible('footer') && (
        <footer
          onClick={() => handleClick('footer')}
          className={cn(sectionStyle(selectedSection === 'footer', 'dark'))}
          style={{ borderTop: `1px solid ${theme.primaryColor}22` }}
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                {event.branding?.logo ? (
                  <img src={event.branding.logo} alt="Logo" className="w-12 h-12 object-contain mb-3" style={{ borderRadius: getRadius(theme.borderRadius, 'lg') }} />
                ) : (
                  <div className="w-12 h-12 mb-3" style={{ backgroundColor: `${theme.primaryColor}33`, border: `2px solid ${theme.primaryColor}`, borderRadius: getRadius(theme.borderRadius, 'lg') }} />
                )}
                <h3 className="font-black text-lg text-white">{event.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{event.date} {event.venueLocation || event.country ? `· ${event.venueLocation || event.country}` : ''}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  {isVisible('tickets') && <Link to={`/e/${slug}/tickets`} className="font-bold hover:opacity-80 transition-opacity" style={{ color: theme.primaryColor }} onClick={(e) => e.stopPropagation()}>Tickets</Link>}
                  {isVisible('voting') && <Link to={`/e/${slug}/voting`} className="text-slate-400 hover:text-white transition-colors font-medium" onClick={(e) => e.stopPropagation()}>Vote</Link>}
                  {isVisible('merch') && <Link to={`/e/${slug}/merch`} className="text-slate-400 hover:text-white transition-colors font-medium" onClick={(e) => e.stopPropagation()}>Merch</Link>}
                  {isVisible('forms') && <Link to={`/e/${slug}/forms`} className="text-slate-400 hover:text-white transition-colors font-medium" onClick={(e) => e.stopPropagation()}>Forms</Link>}
                </div>
                {socialEntries.length > 0 && (
                  <div className="flex gap-1">
                    {socialEntries.map(([type, url]) => (
                      <SocialIcon key={type} type={type} url={url!} color={theme.primaryColor} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 pt-6 text-center text-xs text-slate-600" style={{ borderTop: `1px solid ${theme.primaryColor}11` }}>
              Powered by{' '}
              <span className="font-bold" style={{ color: theme.primaryColor }}>Munar</span>
            </div>
          </div>
        </footer>
      )}

      {/* ── BACK TO TOP ───────────────────────────────────────────────── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
          style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
