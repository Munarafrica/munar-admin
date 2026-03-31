// Security settings tab — password, sessions, login alerts, account deletion
import React, { useState, useEffect, useCallback } from 'react';
import { ActiveSession, SecuritySettings } from '../../types/settings';
import * as settingsService from '../../services/settings.service';
import { useAuth } from '../../contexts';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  Shield,
  Key,
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react';

// ─── Toggle switch (reused pattern) ─────────────────────────────────────────
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
      checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700',
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
);

// ─── Device icon helper ──────────────────────────────────────────────────────
function getDeviceIcon(device: string): React.ElementType {
  const d = device.toLowerCase();
  if (d.includes('iphone') || d.includes('android') || d.includes('mobile')) return Smartphone;
  if (d.includes('macbook') || d.includes('laptop')) return Laptop;
  return Monitor;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ─── Main component ──────────────────────────────────────────────────────────
export const SecurityTab: React.FC = () => {
  const { changePassword } = useAuth();

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Security settings
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // General
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const [sessionsData, securityData] = await Promise.all([
        settingsService.getActiveSessions(),
        settingsService.getSecuritySettings(),
      ]);
      setSessions(sessionsData);
      setLoginAlerts(securityData.loginAlerts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await settingsService.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleToggleLoginAlerts = async (value: boolean) => {
    setLoginAlerts(value);
    setIsSavingSecurity(true);
    try {
      await settingsService.saveSecuritySettings({ loginAlerts: value });
    } catch {
      setLoginAlerts(!value);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await settingsService.deleteAccount();
      setDeleteMessage('Account deletion has been initiated. You will receive a confirmation email.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      setTimeout(() => setDeleteMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Security</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your password, sessions, and account security
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Change Password</h3>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <Button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing…
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Active Sessions</h3>
        </div>

        {isLoadingSessions ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-1">
            {sessions.map(session => {
              const DeviceIcon = getDeviceIcon(session.device);
              return (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-lg mx-1',
                    session.isCurrent && 'bg-indigo-50/50 dark:bg-indigo-900/10',
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-lg shrink-0',
                    session.isCurrent
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                  )}>
                    <DeviceIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {session.device} &middot; {session.browser}
                      </p>
                      {session.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shrink-0">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(session.lastActive)}
                      </span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingSessionId === session.id}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                      {revokingSessionId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-1" />
                          Sign Out
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Login Alerts */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Login Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get notified when a new device logs into your account
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={loginAlerts}
            onChange={handleToggleLoginAlerts}
            label="Toggle login alerts"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {deleteMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {deleteMessage}
          </div>
        )}

        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              This will permanently delete:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 ml-4 list-disc">
              <li>All your organizations</li>
              <li>All events and their data</li>
              <li>All attendee records</li>
              <li>All financial reports</li>
            </ul>
            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="max-w-xs"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Permanently Delete Account'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
