// Payouts Tab - view past and upcoming payouts with detail modal
import React, { useState } from 'react';
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  X,
  Ticket,
  Vote,
  ShoppingBag,
  FileText,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { usePayouts } from '../../hooks/useFinance';
import type { Payout, PayoutStatus } from '../../types/finance';
import { PAYOUT_STATUS_LABELS } from '../../types/finance';

interface PayoutsTabProps {
  onOpenDispute: (payoutId: string) => void;
}

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

const STATUS_CONFIG: Record<PayoutStatus, { icon: React.ElementType; color: string }> = {
  scheduled: { icon: Calendar, color: 'blue' },
  processing: { icon: Loader2, color: 'amber' },
  completed: { icon: CheckCircle2, color: 'emerald' },
  failed: { icon: XCircle, color: 'red' },
};

function StatusBadge({ status }: { status: PayoutStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        config.color === 'blue' && 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20',
        config.color === 'amber' && 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
        config.color === 'emerald' && 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
        config.color === 'red' && 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
      )}
    >
      <Icon className={cn('w-3 h-3', status === 'processing' && 'animate-spin')} />
      {PAYOUT_STATUS_LABELS[status]}
    </Badge>
  );
}

export const PayoutsTab: React.FC<PayoutsTabProps> = ({ onOpenDispute }) => {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const { payouts, isLoading, total, page, totalPages, updateFilters } = usePayouts();

  const handleStatusFilter = (status: PayoutStatus | '') => {
    setStatusFilter(status);
    updateFilters({ status: status || undefined });
  };

  if (selectedPayout) {
    return (
      <PayoutDetail
        payout={selectedPayout}
        onBack={() => setSelectedPayout(null)}
        onDispute={() => {
          onOpenDispute(selectedPayout.id);
          setSelectedPayout(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payouts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} payout{total !== 1 ? 's' : ''} total
          </p>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => handleStatusFilter(e.target.value as PayoutStatus | '')}
            className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(PAYOUT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Payout List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : payouts.length === 0 ? (
        <EmptyPayouts />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Payout ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Destination
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(payout => (
                  <tr
                    key={payout.id}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPayout(payout)}
                  >
                    <td className="py-3.5 px-4 text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                      {payout.id}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(payout.scheduledDate)}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {payout.destinationBankName} {payout.destinationAccountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-indigo-600">
                        <Eye className="w-4 h-4" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {payouts.map(payout => (
              <button
                key={payout.id}
                className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setSelectedPayout(payout)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                    {payout.id}
                  </span>
                  <StatusBadge status={payout.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(payout.scheduledDate)} · {payout.destinationBankName}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(payout.amount)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: page - 1 })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: page + 1 })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Payout Detail View ──────────────────────────────────────────────────────

function PayoutDetail({
  payout,
  onBack,
  onDispute,
}: {
  payout: Payout;
  onBack: () => void;
  onDispute: () => void;
}) {
  const bd = payout.breakdown;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Payouts
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{payout.id}</h3>
              <StatusBadge status={payout.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {payout.destinationBankName} · {payout.destinationAccountNumber} · {payout.destinationAccountName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(payout.amount)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {payout.processedDate
                ? `Processed ${formatDate(payout.processedDate)}`
                : `Scheduled for ${formatDate(payout.scheduledDate)}`}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Breakdown
          </h4>

          <div className="space-y-2">
            <BreakdownRow icon={Ticket} label="Tickets" amount={bd.ticketRevenue} color="indigo" />
            <BreakdownRow icon={Vote} label="Voting" amount={bd.votingRevenue} color="purple" />
            <BreakdownRow icon={ShoppingBag} label="Merchandise" amount={bd.merchRevenue} color="amber" />
            <BreakdownRow icon={FileText} label="Forms" amount={bd.formsRevenue} color="emerald" />

            <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
              <BreakdownRow label="Platform Fees" amount={bd.platformFees} isDeduction />
              <BreakdownRow label="Gateway Fees" amount={bd.gatewayFees} isDeduction />
              {bd.refunds !== 0 && (
                <BreakdownRow label="Refunds" amount={bd.refunds} isDeduction />
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">Net Payout</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(bd.netPayout)}
              </span>
            </div>
          </div>
        </div>

        {/* Report Issue */}
        {payout.status === 'completed' || payout.status === 'failed' ? (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onDispute}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report an issue with this payout
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BreakdownRow({
  icon: Icon,
  label,
  amount,
  color,
  isDeduction,
}: {
  icon?: React.ElementType;
  label: string;
  amount: number;
  color?: string;
  isDeduction?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={cn(
              'p-1 rounded',
              color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
              color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
              color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
              color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <span className={cn('text-sm', isDeduction ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300')}>
          {label}
        </span>
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          isDeduction ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
        )}
      >
        {isDeduction ? `−${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </span>
    </div>
  );
}

function EmptyPayouts() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
        <ArrowUpRight className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No payouts yet</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Payouts will appear here after your first payout cycle. Funds are transferred weekly.
      </p>
    </div>
  );
}
