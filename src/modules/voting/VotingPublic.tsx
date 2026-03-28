// Public Voting Page - Attendee-facing voting interface
// Route: /e/:eventSlug/voting
// This page is accessible directly via URL even if the event website is unpublished

import React, { useState } from 'react';
import { useEvent } from '../../contexts';
import { useBrandSafe } from '../../contexts/BrandContext';
import { cn } from '../../components/ui/utils';
import { Button } from '../../components/ui/button';
import { Trophy, Vote, Timer, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VotingPublic() {
  const { currentEvent } = useEvent();
  const { branding } = useBrandSafe();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentEvent) return null;

  // Mock campaign data for stub — will come from votingService
  const campaigns = [
    {
      id: 'c1',
      name: 'Best Startup Award 2026',
      description: 'Vote for the most innovative startup at the summit',
      status: 'active' as const,
      categoriesCount: 5,
      endDate: '2026-06-12',
      isPaid: false,
    },
    {
      id: 'c2',
      name: 'People\'s Choice Speaker',
      description: 'Pick your favourite keynote speaker',
      status: 'active' as const,
      categoriesCount: 1,
      endDate: '2026-06-12',
      isPaid: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            to={`/e/${currentEvent.slug || currentEvent.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to event
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Voting
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {currentEvent.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-4">
          {campaigns
            .filter(
              (c) =>
                !searchQuery ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {campaign.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      campaign.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {campaign.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Vote className="w-3.5 h-3.5" />
                    {campaign.categoriesCount} categories
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    Ends {new Date(campaign.endDate).toLocaleDateString()}
                  </span>
                  {campaign.isPaid && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                      Paid voting
                    </span>
                  )}
                </div>

                <Button
                  variant="default"
                  size="sm"
                  className="mt-4 rounded-xl"
                >
                  Vote Now
                </Button>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}
