import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Vote,
  ShoppingBag,
  FileText,
  RotateCcw,
  X,
  Download,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useTransactions } from '../../hooks/useFinance';
import type { TransactionType, TransactionStatus } from '../../types/finance';
import { TRANSACTION_TYPE_LABELS } from '../../types/finance';
import { toast } from 'sonner';

interface TransactionsTabProps {
  events: { id: string; name: string }[];
}

function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SOURCE_ICONS: Record<TransactionType, React.ElementType> = {
  ticket: Ticket,
  voting: Vote,
  merch: ShoppingBag,
  forms: FileText,
  refund: RotateCcw,
};

const SOURCE_COLORS: Record<TransactionType, string> = {
  ticket: 'indigo',
  voting: 'purple',
  merch: 'amber',
  forms: 'emerald',
  refund: 'red',
};

const STATUS_STYLES: Record<TransactionStatus, React.CSSProperties> = {
  completed: { backgroundColor: 'rgba(16, 185, 129, 0.16)', borderColor: 'rgba(16, 185, 129, 0.45)', color: '#6ee7b7' },
  pending: { backgroundColor: 'rgba(245, 158, 11, 0.16)', borderColor: 'rgba(245, 158, 11, 0.45)', color: '#fbbf24' },
  failed: { backgroundColor: 'rgba(239, 68, 68, 0.16)', borderColor: 'rgba(239, 68, 68, 0.45)', color: '#fca5a5' },
  refunded: { backgroundColor: 'rgba(148, 163, 184, 0.16)', borderColor: 'rgba(148, 163, 184, 0.45)', color: '#cbd5e1' },
};

function TransactionStatusBadge({ status, compact = false }: { status: TransactionStatus; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-semibold capitalize leading-none',
        compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
      )}
      style={STATUS_STYLES[status]}
    >
      {status}
    </span>
  );
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ events }) => {
  const [searchInput, setSearchInput] = useState('');
  const {
    transactions,
    total,
    page,
    totalPages,
    filters,
    isLoading,
    updateFilters,
    createRefund,
  } = useTransactions();

  const handleRefund = async (transactionId: string, amountMinor: number) => {
    if (!window.confirm('Refund this captured transaction?')) return;
    try {
      await createRefund(transactionId, amountMinor, 'Organizer refund from finance screen');
      toast.success('Refund created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create refund');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ search: undefined });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transactions</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} transaction{total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> */}
            <input
              type="text"
              placeholder="Search by ID, event, name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl ml-10 pl-4 pr-10 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Event Filter */}
          <div className="relative">
            <select
              value={filters.eventId || ''}
              onChange={e => updateFilters({ eventId: e.target.value || undefined })}
              className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full lg:w-auto min-w-[180px]"
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filters.source || ''}
              onChange={e => updateFilters({ source: (e.target.value as TransactionType) || undefined })}
              className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full lg:w-auto min-w-[160px]"
            >
              <option value="">All Types</option>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyTransactions />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-2">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <th className="text-left text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Transaction
                  </th>
                  <th className="text-left text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Event
                  </th>
                  <th className="text-left text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Type
                  </th>
                  <th className="text-right text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Amount
                  </th>
                  <th className="text-right text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Fee
                  </th>
                  <th className="text-right text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Net
                  </th>
                  <th className="text-left text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Status
                  </th>
                  <th className="text-right text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Date
                  </th>
                  <th className="text-right text-xs font-bold text-slate-700 dark:text-slate-100 uppercase tracking-wider py-4 px-5">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => {
                  const Icon = SOURCE_ICONS[txn.source];
                  const color = SOURCE_COLORS[txn.source];
                  return (
                    <tr
                      key={txn.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-1.5 rounded-lg',
                              color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                              color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                              color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
                              color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                              color === 'red' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                              {txn.id}
                            </p>
                            <p className="max-w-[260px] truncate text-xs text-slate-500 dark:text-slate-400 mt-1">{txn.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {txn.eventName}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-600 dark:text-slate-300">
                        {TRANSACTION_TYPE_LABELS[txn.source]}
                      </td>
                      <td className={cn(
                        'py-4 px-5 text-sm font-semibold text-right',
                        txn.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                      )}>
                        {txn.amount < 0 ? `−${formatCurrency(Math.abs(txn.amount))}` : formatCurrency(txn.amount)}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500 dark:text-slate-400 text-right">
                        {formatCurrency(txn.platformFee + txn.gatewayFee)}
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-right text-slate-900 dark:text-slate-100">
                        {txn.netAmount < 0
                          ? `−${formatCurrency(Math.abs(txn.netAmount))}`
                          : formatCurrency(txn.netAmount)}
                      </td>
                      <td className="py-4 px-5">
                        <TransactionStatusBadge status={txn.status} />
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={txn.backendStatus !== 'CAPTURED'}
                          onClick={() => handleRefund(txn.id, txn.amount)}
                          className="text-xs"
                        >
                          Refund
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map(txn => {
              const Icon = SOURCE_ICONS[txn.source];
              const color = SOURCE_COLORS[txn.source];
              return (
                <div key={txn.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg shrink-0',
                          color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                          color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                          color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
                          color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                          color === 'red' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{txn.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{txn.eventName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-sm font-bold',
                        txn.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                      )}>
                        {txn.amount < 0 ? `−${formatCurrency(Math.abs(txn.amount))}` : formatCurrency(txn.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {txn.id} · {formatDate(txn.createdAt)}
                    </span>
                    <TransactionStatusBadge status={txn.status} compact />
                  </div>
                  {txn.backendStatus === 'CAPTURED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefund(txn.id, txn.amount)}
                      className="mt-3 w-full text-xs"
                    >
                      Refund
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} · {total} total
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

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
        <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No transactions yet</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Transactions from ticket sales, voting, merch, and forms will appear here.
      </p>
    </div>
  );
}
