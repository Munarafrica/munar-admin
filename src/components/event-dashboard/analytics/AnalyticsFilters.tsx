import React from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { AnalyticsFilters, AnalyticsFilterOptions, DateRangePreset } from '../../../types/analytics';
import { cn } from '../../ui/utils';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  options?: AnalyticsFilterOptions;
  onChange: (next: AnalyticsFilters) => void;
  className?: string;
}

const dateRanges: { label: string; value: DateRangePreset }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (next: string) => void;
}) => (
  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
    {label}
    <select
      value={value || 'All'}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export const AnalyticsFiltersBar: React.FC<AnalyticsFiltersProps> = ({
  filters,
  options,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row lg:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Filter className="w-4 h-4 text-indigo-600" />
        Filters
      </div>
      <div className="flex flex-1 flex-col md:flex-row gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Date range
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.dateRange}
              onChange={(event) =>
                onChange({
                  ...filters,
                  dateRange: event.target.value as DateRangePreset,
                })
              }
              className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <SelectField
          label="Ticket type"
          value={filters.ticketType}
          options={options?.ticketTypes || ['All']}
          onChange={(ticketType) => onChange({ ...filters, ticketType })}
        />
        <SelectField
          label="Channel"
          value={filters.channel}
          options={options?.channels || ['All']}
          onChange={(channel) => onChange({ ...filters, channel })}
        />
        <SelectField
          label="Location"
          value={filters.location}
          options={options?.locations || ['All']}
          onChange={(location) => onChange({ ...filters, location })}
        />
      </div>
    </div>
  );
};
