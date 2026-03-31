// Finance & Payout Management Page
// Top-level platform page (same level as /events)
// Contains 5 tabs: Overview, Payouts, Transactions, Accounts, Support

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { FinanceOverviewTab } from '../components/finance/FinanceOverviewTab';
import { PayoutsTab } from '../components/finance/PayoutsTab';
import { TransactionsTab } from '../components/finance/TransactionsTab';
import { AccountsTab } from '../components/finance/AccountsTab';
import { SupportTab } from '../components/finance/SupportTab';
import { FinanceNotificationPanel, NotificationBadge } from '../components/finance/FinanceNotificationPanel';
import { useFinanceNotifications } from '../hooks/useFinance';
import { eventsService } from '../services';
import { Page } from '../App';
import { cn } from '../components/ui/utils';
import {
  BarChart3,
  ArrowUpRight,
  Receipt,
  Building2,
  HelpCircle,
  Bell,
  Wallet,
} from 'lucide-react';

type FinanceTab = 'overview' | 'payouts' | 'transactions' | 'accounts' | 'support';

interface FinanceManagementProps {
  onNavigate?: (page: Page) => void;
}

const TABS: { id: FinanceTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'payouts', label: 'Payouts', icon: ArrowUpRight },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

export const FinanceManagement: React.FC<FinanceManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [disputePayoutId, setDisputePayoutId] = useState<string | undefined>();
  const { unreadCount } = useFinanceNotifications();

  // Load events for filters (reuse events service)
  useEffect(() => {
    eventsService.getEvents().then(response => {
      setEvents(response.data.map((e: any) => ({ id: e.id, name: e.name })));
    }).catch(() => {});
  }, []);

  // Navigate from overview quick actions
  const handleViewPayouts = useCallback(() => setActiveTab('payouts'), []);
  const handleViewTransactions = useCallback(() => setActiveTab('transactions'), []);

  // Open dispute from payout detail
  const handleOpenDispute = useCallback((payoutId: string) => {
    setDisputePayoutId(payoutId);
    setActiveTab('support');
  }, []);

  const handleClearDisputePayout = useCallback(() => {
    setDisputePayoutId(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Finance & Payouts</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 ml-12">
              Manage your earnings, payouts, and financial accounts
            </p>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            >
              <Bell className="w-5 h-5" />
              <NotificationBadge count={unreadCount} />
            </button>

            <FinanceNotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 -mx-4 sm:mx-0">
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-0">
            <nav className="flex gap-0 overflow-x-auto scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 sm:px-6 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0',
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <FinanceOverviewTab
              events={events}
              onViewPayouts={handleViewPayouts}
              onViewTransactions={handleViewTransactions}
            />
          )}
          {activeTab === 'payouts' && (
            <PayoutsTab onOpenDispute={handleOpenDispute} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsTab events={events} />
          )}
          {activeTab === 'accounts' && (
            <AccountsTab />
          )}
          {activeTab === 'support' && (
            <SupportTab
              initialPayoutId={disputePayoutId}
              onClearInitialPayout={handleClearDisputePayout}
            />
          )}
        </div>
      </main>
    </div>
  );
};
