// Settings Tab for Merchandise
import React, { useState, useEffect } from 'react';
import { MerchandiseSettings } from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  Settings,
  Bell,
  Package,
  MapPin,
  FileDigit,
  Mail,
  Save,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface SettingsTabProps {
  settings: MerchandiseSettings | null;
  onSave: (settings: Partial<MerchandiseSettings>) => Promise<void>;
  isLoading: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSave,
  isLoading,
}) => {
  // Local state for form
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [lowStockEmailNotify, setLowStockEmailNotify] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [requireIdentityVerification, setRequireIdentityVerification] = useState(true);
  const [digitalEnabled, setDigitalEnabled] = useState(true);
  const [autoDeliverDigital, setAutoDeliverDigital] = useState(true);
  const [orderConfirmationEmail, setOrderConfirmationEmail] = useState(true);
  const [fulfilmentNotificationEmail, setFulfilmentNotificationEmail] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from settings
  useEffect(() => {
    if (settings) {
      setLowStockAlertEnabled(settings.lowStockAlertEnabled);
      setLowStockThreshold(settings.lowStockThreshold);
      setLowStockEmailNotify(settings.lowStockEmailNotify);
      setPickupEnabled(settings.pickupEnabled);
      setPickupInstructions(settings.pickupInstructions || '');
      setRequireIdentityVerification(settings.requireIdentityVerification);
      setDigitalEnabled(settings.digitalEnabled);
      setAutoDeliverDigital(settings.autoDeliverDigital);
      setOrderConfirmationEmail(settings.orderConfirmationEmail);
      setFulfilmentNotificationEmail(settings.fulfilmentNotificationEmail);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed =
        lowStockAlertEnabled !== settings.lowStockAlertEnabled ||
        lowStockThreshold !== settings.lowStockThreshold ||
        lowStockEmailNotify !== settings.lowStockEmailNotify ||
        pickupEnabled !== settings.pickupEnabled ||
        pickupInstructions !== (settings.pickupInstructions || '') ||
        requireIdentityVerification !== settings.requireIdentityVerification ||
        digitalEnabled !== settings.digitalEnabled ||
        autoDeliverDigital !== settings.autoDeliverDigital ||
        orderConfirmationEmail !== settings.orderConfirmationEmail ||
        fulfilmentNotificationEmail !== settings.fulfilmentNotificationEmail;
      setHasChanges(changed);
    }
  }, [
    settings,
    lowStockAlertEnabled,
    lowStockThreshold,
    lowStockEmailNotify,
    pickupEnabled,
    pickupInstructions,
    requireIdentityVerification,
    digitalEnabled,
    autoDeliverDigital,
    orderConfirmationEmail,
    fulfilmentNotificationEmail,
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        lowStockAlertEnabled,
        lowStockThreshold,
        lowStockEmailNotify,
        pickupEnabled,
        pickupInstructions: pickupInstructions || undefined,
        requireIdentityVerification,
        digitalEnabled,
        autoDeliverDigital,
        orderConfirmationEmail,
        fulfilmentNotificationEmail,
      });
      setShowSaved(true);
      setHasChanges(false);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Saved indicator */}
      {showSaved && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg z-50 animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully
        </div>
      )}

      {/* Low Stock Alerts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Low Stock Alerts
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get notified when product inventory is running low
            </p>
          </div>
        </div>

        <div className="ml-12 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Enable low stock alerts
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track inventory and highlight low stock items
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLowStockAlertEnabled(!lowStockAlertEnabled)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                lowStockAlertEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  lowStockAlertEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          {lowStockAlertEnabled && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Alert Threshold
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    units remaining
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Products with stock below this number will be flagged
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Email notifications
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Send email when stock falls below threshold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLowStockEmailNotify(!lowStockEmailNotify)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    lowStockEmailNotify ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                      lowStockEmailNotify ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pickup Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Event Pickup
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure pickup fulfilment at the event venue
            </p>
          </div>
        </div>

        <div className="ml-12 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Enable event pickup
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Allow customers to collect orders at the event
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickupEnabled(!pickupEnabled)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                pickupEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  pickupEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          {pickupEnabled && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Pickup Instructions
                </label>
                <textarea
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g., Visit the merchandise booth near the main entrance..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Require identity verification
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Verify customer identity before handing over order
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireIdentityVerification(!requireIdentityVerification)}
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    requireIdentityVerification ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                      requireIdentityVerification ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </div>

              {requireIdentityVerification && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Staff must verify customer identity (ticket QR, email, or ID) before fulfilling pickup orders.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Digital Delivery Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FileDigit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Digital Delivery
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure automatic delivery for digital products
            </p>
          </div>
        </div>

        <div className="ml-12 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Enable digital products
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Allow selling digital files and downloads
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDigitalEnabled(!digitalEnabled)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                digitalEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  digitalEnabled ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          {digitalEnabled && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Auto-deliver on purchase
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Automatically send files via email after payment
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoDeliverDigital(!autoDeliverDigital)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  autoDeliverDigital ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    autoDeliverDigital ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Email Notifications */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Customer Emails
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure automated emails to customers
            </p>
          </div>
        </div>

        <div className="ml-12 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Order confirmation email
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Send confirmation when order is placed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOrderConfirmationEmail(!orderConfirmationEmail)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                orderConfirmationEmail ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  orderConfirmationEmail ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Fulfilment notification
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Notify customer when order is fulfilled
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFulfilmentNotificationEmail(!fulfilmentNotificationEmail)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                fulfilmentNotificationEmail ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  fulfilmentNotificationEmail ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            'gap-2',
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
