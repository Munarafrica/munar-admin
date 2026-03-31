// Transactions Tab - complete ledger of all financial events
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
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useTransactions } from '../../hooks/useFinance';
import type { TransactionType, TransactionStatus } from '../../types/finance';
import { TRANSACTION_TYPE_LABELS } from '../../types/finance';

interface TransactionsTabProps {
  events: { id: string; name: string }[];
}

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

const STATUS_STYLES: Record<TransactionStatus, string> = {
  completed: 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
  pending: 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
  failed: 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20',
  refunded: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800',
};

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
  } = useTransactions();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ search: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transactions</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} transaction{total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, event, name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto min-w-[160px]"
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
              className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto min-w-[140px]"
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Transaction
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Event
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Type
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Amount
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Fee
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Net
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 px-4">
                    Date
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
                      <td className="py-3.5 px-4">
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
                          <div>
                            <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                              {txn.id}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{txn.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                        {txn.eventName}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {TRANSACTION_TYPE_LABELS[txn.source]}
                      </td>
                      <td className={cn(
                        'py-3.5 px-4 text-sm font-semibold text-right',
                        txn.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                      )}>
                        {txn.amount < 0 ? `−${formatCurrency(Math.abs(txn.amount))}` : formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400 text-right">
                        {formatCurrency(txn.platformFee + txn.gatewayFee)}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-right text-slate-900 dark:text-slate-100">
                        {txn.netAmount < 0
                          ? `−${formatCurrency(Math.abs(txn.netAmount))}`
                          : formatCurrency(txn.netAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={cn('font-medium capitalize', STATUS_STYLES[txn.status])}>
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                        {formatDate(txn.createdAt)}
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
                    <Badge variant="outline" className={cn('text-xs font-medium capitalize', STATUS_STYLES[txn.status])}>
                      {txn.status}
                    </Badge>
                  </div>
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
