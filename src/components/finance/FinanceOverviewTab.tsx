// Finance Overview Tab - high-level financial snapshot
import React, { useMemo, useState } from 'react';
import {
  DollarSign,
  Wallet,
  Clock,
  CalendarDays,
  TrendingUp,
  Ticket,
  Vote,
  ShoppingBag,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useFinanceOverview, useEarnings } from '../../hooks/useFinance';
import { Skeleton } from '../ui/skeleton';
import type { EarningsBreakdown } from '../../types/finance';

interface FinanceOverviewTabProps {
  events: { id: string; name: string }[];
  onViewPayouts: () => void;
  onViewTransactions: () => void;
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
  ticket: Ticket,
  voting: Vote,
  merch: ShoppingBag,
  forms: FileText,
};

const SOURCE_COLORS: Record<string, string> = {
  ticket: 'indigo',
  voting: 'purple',
  merch: 'amber',
  forms: 'emerald',
};

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export const FinanceOverviewTab: React.FC<FinanceOverviewTabProps> = ({
  events,
  onViewPayouts,
  onViewTransactions,
}) => {
  const { overview, isLoading: overviewLoading } = useFinanceOverview();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const earningsParams = useMemo(
    () => (selectedEventId ? { eventId: selectedEventId } : undefined),
    [selectedEventId]
  );
  const { earnings, isLoading: earningsLoading } = useEarnings(earningsParams);

  if (overviewLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Earnings"
          value={formatCurrency(overview?.totalEarnings || 0)}
          icon={DollarSign}
          color="indigo"
          description="Lifetime revenue across all events"
        />
        <SummaryCard
          label="Available Balance"
          value={formatCurrency(overview?.availableBalance || 0)}
          icon={Wallet}
          color="emerald"
          description="Ready for next payout"
        />
        <SummaryCard
          label="Pending Balance"
          value={formatCurrency(overview?.pendingBalance || 0)}
          icon={Clock}
          color="amber"
          description="Processing or in refund window"
        />
        <SummaryCard
          label="Next Payout"
          value={overview?.nextPayoutDate ? formatDate(overview.nextPayoutDate) : 'No payout scheduled'}
          icon={CalendarDays}
          color="blue"
          description={
            overview?.nextPayoutAmount
              ? formatCurrency(overview.nextPayoutAmount)
              : 'Add a bank account to get started'
          }
        />
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Earnings Breakdown
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Revenue performance by source
            </p>
          </div>

          {/* Event Filter */}
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {earningsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : earnings ? (
          <>
            {/* Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pl-3">
                      Source
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">
                      Transactions
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-3">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-3 hidden sm:table-cell">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.breakdown.map(item => (
                    <EarningsRow key={item.source} item={item} total={earnings.totalRevenue} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fee Summary */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Revenue</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(earnings.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Platform Fees (6%)</span>
                <span className="text-red-500 dark:text-red-400">
                  −{formatCurrency(earnings.totalPlatformFees)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Gateway Fees (Paystack)</span>
                <span className="text-red-500 dark:text-red-400">
                  −{formatCurrency(earnings.totalGatewayFees)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-slate-100">Net Earnings</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(earnings.netEarnings)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={TrendingUp}
            title="No earnings yet"
            description="Earnings from tickets, voting, and merchandise will appear here."
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onViewPayouts}
          className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">View Payouts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track your payout history and schedule
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </button>

        <button
          onClick={onViewTransactions}
          className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">View Transactions</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                See all incoming payments and refunds
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </div>
  );
};

// ─── Sub Components ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
            color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
            color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function EarningsRow({ item, total }: { item: EarningsBreakdown; total: number }) {
  const Icon = SOURCE_ICONS[item.source] || FileText;
  const color = SOURCE_COLORS[item.source] || 'slate';
  const percentage = total > 0 ? ((item.revenue / total) * 100).toFixed(1) : '0';

  return (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="py-3.5 pl-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-1.5 rounded-lg',
              color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
              color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
              color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
              color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
        </div>
      </td>
      <td className="py-3.5 text-right text-sm text-slate-600 dark:text-slate-300">{item.count}</td>
      <td className="py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-slate-100 pr-3">
        {formatCurrency(item.revenue)}
      </td>
      <td className="py-3.5 text-right text-sm text-slate-500 dark:text-slate-400 pr-3 hidden sm:table-cell">
        {percentage}%
      </td>
    </tr>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[130px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-xl" />
    </div>
  );
}
