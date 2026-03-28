import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnalyticsKpi } from '../../../types/analytics';
import { cn } from '../../ui/utils';

interface KpiCardProps {
  kpi: AnalyticsKpi;
  currency?: string;
}

const formatValue = (value: number, currency?: string) => {
  if (currency && value >= 1000) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return value.toLocaleString();
};

export const KpiCard: React.FC<KpiCardProps> = ({ kpi, currency }) => {
  const isPositive = kpi.changePercent >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatValue(kpi.value, currency)}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
            isPositive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {Math.abs(kpi.changePercent).toFixed(1)}%
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">vs previous period</p>
    </div>
  );
};
