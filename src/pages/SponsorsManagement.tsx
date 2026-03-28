import React, { useMemo, useState } from 'react';
import { Page } from '../App';
import { TopBar } from '../components/dashboard/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import { SponsorCard } from '../components/sponsors/SponsorCard';
import { SponsorModal } from '../components/sponsors/SponsorModal';
import { SponsorsSection } from '../components/public/SponsorsSection';
import { useSponsors } from '../hooks';
import { Sponsor } from '../types/sponsors';
import { Plus, Search, Link as LinkIcon, ExternalLink, Copy, Filter, Loader2, ChevronLeft } from 'lucide-react';
import { eventsService } from '../services';
import { getCurrentEventId } from '../lib/event-storage';

interface SponsorsManagementProps {
  onNavigate: (page: Page) => void;
}

const MOCK_EVENT_NAME = 'Lagos Tech Summit 2026';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'event';

export const SponsorsManagement: React.FC<SponsorsManagementProps> = ({ onNavigate }) => {
  const eventId = getCurrentEventId();
  const { sponsors, isLoading, addSponsor, editSponsor, removeSponsor, reorderSponsor, toggleVisibility } = useSponsors({
    eventId,
  });

  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [grayscale, setGrayscale] = useState(true);

  const eventSlug = slugify(MOCK_EVENT_NAME);
  const publicUrl = `https://${eventSlug}.munar.com/sponsors`;

  const filteredSponsors = useMemo(() => {
    return sponsors
      .filter((sponsor) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          sponsor.name.toLowerCase().includes(query) ||
          sponsor.description?.toLowerCase().includes(query) ||
          sponsor.websiteUrl?.toLowerCase().includes(query)
        );
      })
      .filter((sponsor) => {
        if (visibilityFilter === 'visible') return sponsor.visible;
        if (visibilityFilter === 'hidden') return !sponsor.visible;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [sponsors, search, visibilityFilter]);

  const handleAddClick = () => {
    setEditingSponsor(null);
    setIsModalOpen(true);
  };

  const handleSaveSponsor = async (payload: { name: string; logoUrl: string; websiteUrl?: string; description?: string; visible?: boolean }) => {
    if (editingSponsor) {
      await editSponsor(editingSponsor.id, payload);
    } else {
      await addSponsor(payload);
      eventsService.updateModuleCount(
        eventId,
        'Sponsors',
        sponsors.length + 1,
        `Added sponsor "${payload.name}"`,
        'users'
      );
    }
    setEditingSponsor(null);
  };

  const handleDeleteSponsor = async (sponsor: Sponsor) => {
    const confirmed = window.confirm(`Delete ${sponsor.name}?`);
    if (!confirmed) return;
    await removeSponsor(sponsor.id);
    eventsService.updateModuleCount(
      eventId,
      'Sponsors',
      Math.max(sponsors.length - 1, 0),
      'Sponsor removed',
      'users'
    );
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              <button
                onClick={() => onNavigate?.('event-dashboard')}
                className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Sponsors</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Add sponsor logos, control visibility, and preview how they will appear on your event website.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">Reorder: Up/Down</Badge>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">Visibility toggle</Badge>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">Grayscale preview</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span className="truncate max-w-[220px]" title={publicUrl}>{publicUrl}</span>
              <button onClick={() => copyLink(publicUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                <Copy className="w-4 h-4" />
              </button>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <Button
              onClick={handleAddClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
              Add Sponsor
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
            <div className="flex flex-1 gap-3 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search sponsors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                <Filter className="w-4 h-4" />
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
                  className="bg-transparent focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Grayscale logos</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Applies to public section</span>
              </div>
              <Switch checked={grayscale} onCheckedChange={setGrayscale} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading sponsors...
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No sponsors yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Upload your first sponsor to highlight your partners on the event website.
              </p>
              <Button onClick={handleAddClick} className="mt-1 bg-indigo-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add sponsor
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSponsors.map((sponsor, index) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={(item) => {
                    setEditingSponsor(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteSponsor}
                  onToggleVisibility={(visible) => toggleVisibility(sponsor.id, visible)}
                  onMoveUp={() => reorderSponsor(sponsor.id, 'up')}
                  onMoveDown={() => reorderSponsor(sponsor.id, 'down')}
                  disableMoveUp={index === 0}
                  disableMoveDown={index === filteredSponsors.length - 1}
                  grayscale={grayscale}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Public preview</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Below is how sponsors will appear on your event page</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{grayscale ? 'Grayscale on' : 'Full color'}</span>
          </div>
          <SponsorsSection sponsors={sponsors} grayscale={grayscale} />
        </div>
      </main>

      <SponsorModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingSponsor(null);
        }}
        onSave={handleSaveSponsor}
        initialData={editingSponsor}
      />
    </div>
  );
};

export default SponsorsManagement;
