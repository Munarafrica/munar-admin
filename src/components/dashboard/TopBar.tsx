import React, { useState, useRef, useEffect } from "react";
import { Logo } from "../ui/Logo";
import { HelpIcon, MenuIcon, NotificationIcon, SettingsIcon } from "../icons";
import { Page } from "../../App";
import { ModeToggle } from "../ui/mode-toggle";
import { useAuth } from "../../contexts";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../../hooks";

interface TopBarProps {
  onNavigate?: (page: Page) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate }) => {
  const { user, logout, currentTenant } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const isFinancePage = location.pathname.startsWith('/finance');
  const isSettingsPage = location.pathname.startsWith('/settings');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user
    ? `${(user.firstName || user.email[0] || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase()
    : "?";
  const displayName = user
    ? user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email
    : "Guest";
  const accountLabel = currentTenant?.name || user?.userType || "Organizer";

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate("/login");
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 h-[72px] flex items-center justify-between px-6 sticky top-0 z-50 border-b border-slate-100/80 dark:border-slate-800/80 backdrop-blur-sm bg-white/80 dark:bg-slate-950/80 transition-colors duration-300">
      {/* Left: Logo */}
      <div className="flex items-center gap-12">
        <div onClick={() => onNavigate?.('my-events')} className="cursor-pointer">
           <div className="dark:hidden">
             <Logo variant="dark" />
           </div>
           <div className="hidden dark:block">
             <Logo variant="light" />
           </div>
        </div>
        
        {/* Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <div 
            onClick={() => onNavigate?.('my-events')}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
          >
            <MenuIcon className="size-4" />
            <span className="font-semibold text-sm">Events</span>
          </div>
          <div
            onClick={() => navigate("/finance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors ${
              isFinancePage
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <MenuIcon className="size-4" />
            <span className={`text-sm ${isFinancePage ? 'font-semibold' : 'font-medium'}`}>Finance</span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 mr-2">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((current) => !current)}
                className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <NotificationIcon className="size-6" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50"
                  style={{ width: 324, maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 88px)' }}
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ticket confirmations, payment updates, and reminders.</p>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 162px)' }}>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => markRead(item.id)}
                          className="w-full px-4 py-3 text-left border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                            {(item.notification.payloadJson.title as string) || item.notification.templateKey}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                            {(item.notification.payloadJson.body as string) || 'Open to mark as read.'}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <HelpIcon className="size-5" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`p-2 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 ${isSettingsPage ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <SettingsIcon className="size-5" />
            </button>
            
            <div className="ml-1">
              <ModeToggle />
            </div>
        </div>
        
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

        {/* Profile Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-3 pl-2 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-md shadow-indigo-200 dark:shadow-none group-hover:shadow-lg transition-all">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">{accountLabel}</p>
            </div>
            <svg className="size-4 text-slate-400 dark:text-slate-500 hidden lg:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => { setShowDropdown(false); navigate("/profile-setup"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={() => { setShowDropdown(false); navigate("/change-password"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
