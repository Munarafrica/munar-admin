// Settings sidebar navigation — responsive left panel
import React from 'react';
import { cn } from '../ui/utils';
import { SettingsTab } from '../../types/settings';
import {
  User,
  Building2,
  Bell,
  Shield,
  Download,
  Palette,
  ChevronRight,
} from 'lucide-react';

interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  description: string;
  icon: React.ElementType;
}

const NAV_ITEMS: SettingsNavItem[] = [
  { id: 'account', label: 'Account Profile', description: 'Personal information', icon: User },
  { id: 'organizations', label: 'Organizations', description: 'Manage your orgs', icon: Building2 },
  { id: 'notifications', label: 'Notifications', description: 'Email preferences', icon: Bell },
  { id: 'security', label: 'Security', description: 'Password & sessions', icon: Shield },
  { id: 'data-exports', label: 'Data & Exports', description: 'Download your data', icon: Download },
  { id: 'appearance', label: 'Appearance', description: 'Theme & display', icon: Palette },
];

interface SettingsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  className?: string;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Settings navigation"
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden',
        className,
      )}
    >
      <div className="py-1.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-600 dark:border-indigo-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-transparent',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300',
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isActive
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300',
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-indigo-500 dark:text-indigo-400'
                      : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500',
                  )}
                />
              </button>
            );
          })}
        </div>
    </nav>
  );
};
