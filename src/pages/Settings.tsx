// Settings Page — top-level route at /settings
// Two-panel layout: navigation sidebar + content area
// Responsive: sidebar becomes slide-over on mobile

import React, { useState } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { SettingsNav } from '../components/settings/SettingsNav';
import { AccountProfileTab } from '../components/settings/AccountProfileTab';
import { OrganizationsTab } from '../components/settings/OrganizationsTab';
import { NotificationsTab } from '../components/settings/NotificationsTab';
import { SecurityTab } from '../components/settings/SecurityTab';
import { DataExportsTab } from '../components/settings/DataExportsTab';
import { AppearanceTab } from '../components/settings/AppearanceTab';
import { SettingsTab } from '../types/settings';
import { Page } from '../App';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';

interface SettingsProps {
  onNavigate?: (page: Page) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [mobileShowContent, setMobileShowContent] = useState(false);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setMobileShowContent(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountProfileTab />;
      case 'organizations':
        return <OrganizationsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'security':
        return <SecurityTab />;
      case 'data-exports':
        return <DataExportsTab />;
      case 'appearance':
        return <AppearanceTab />;
      default:
        return <AccountProfileTab />;
    }
  };

  const TAB_LABELS: Record<SettingsTab, string> = {
    account: 'Account Profile',
    organizations: 'Organizations',
    notifications: 'Notifications',
    security: 'Security',
    'data-exports': 'Data & Exports',
    appearance: 'Appearance',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your account, organization, and platform preferences
            </p>
          </div>
        </div>

        {/* Mobile view — settings list or content, never both */}
        <div className="lg:hidden">
          {!mobileShowContent ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
              </div>
              <SettingsNav activeTab={activeTab} onTabChange={handleTabChange} />
            </>
          ) : (
            <>
              <button
                onClick={() => setMobileShowContent(false)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 -ml-0.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Settings</span>
              </button>
              {renderContent()}
            </>
          )}
        </div>

        {/* Desktop view — two-panel side-by-side */}
        <div className="hidden lg:flex gap-6 items-start">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} className="w-72 shrink-0" />
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};
