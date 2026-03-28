import React from 'react';
import { Sponsor } from '../../types/sponsors';
import { cn } from '../ui/utils';
import { Link2 } from 'lucide-react';

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  title?: string;
  subtitle?: string;
  grayscale?: boolean;
  className?: string;
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({
  sponsors,
  title = 'Our Sponsors',
  subtitle = 'We are proud to partner with these amazing brands.',
  grayscale = false,
  className,
}) => {
  const visibleSponsors = sponsors.filter((sponsor) => sponsor.visible);

  return (
    <section className={cn('space-y-4', className)}>
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">{subtitle}</p>
      </div>

      {visibleSponsors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400">
          No sponsors added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleSponsors.map((sponsor) => {
            const content = (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 h-full flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
                <div className="h-20 w-full flex items-center justify-center overflow-hidden">
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className={cn('max-h-full object-contain', grayscale && 'grayscale')}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{sponsor.name}</p>
                  {sponsor.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{sponsor.description}</p>
                  )}
                </div>
              </div>
            );

            if (sponsor.websiteUrl) {
              return (
                <a
                  key={sponsor.id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group"
                  aria-label={`Open ${sponsor.name} website`}
                >
                  {content}
                  <span className="sr-only">
                    <Link2 className="w-4 h-4" />
                  </span>
                </a>
              );
            }

            return (
              <div key={sponsor.id}>{content}</div>
            );
          })}
        </div>
      )}
    </section>
  );
};
