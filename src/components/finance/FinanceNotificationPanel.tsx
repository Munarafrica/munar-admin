// Finance Notification Panel - in-app notification bell for finance events
import React from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  ShieldCheck,
  RotateCcw,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useFinanceNotifications } from '../../hooks/useFinance';
import type { FinanceNotificationType } from '../../types/finance';

const NOTIFICATION_ICONS: Record<FinanceNotificationType, React.ElementType> = {
  payout_scheduled: Calendar,
  payout_completed: CheckCircle2,
  payout_failed: XCircle,
  bank_account_verified: Building2,
  dispute_resolved: ShieldCheck,
  refund_processed: RotateCcw,
};

const NOTIFICATION_COLORS: Record<FinanceNotificationType, string> = {
  payout_scheduled: 'blue',
  payout_completed: 'emerald',
  payout_failed: 'red',
  bank_account_verified: 'indigo',
  dispute_resolved: 'purple',
  refund_processed: 'amber',
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

interface FinanceNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinanceNotificationPanel: React.FC<FinanceNotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, unreadCount, markRead } = useFinanceNotifications();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {notifications.map(notification => {
                const Icon = NOTIFICATION_ICONS[notification.type];
                const color = NOTIFICATION_COLORS[notification.type];

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) markRead(notification.id);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                      !notification.read && 'bg-indigo-50/50 dark:bg-indigo-900/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg shrink-0 mt-0.5',
                          color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                          color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
                          color === 'red' && 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                          color === 'indigo' && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
                          color === 'purple' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                          color === 'amber' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            !notification.read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Small notification badge for the TopBar bell icon
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}
