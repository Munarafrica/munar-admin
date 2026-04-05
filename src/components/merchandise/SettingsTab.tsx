import React, { useEffect, useMemo, useState } from 'react';
import type { MerchandiseSettings } from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

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
  const [enabled, setEnabled] = useState(false);
  const [headline, setHeadline] = useState('');
  const [shippingPolicyText, setShippingPolicyText] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setEnabled(settings.enabled);
    setHeadline(String(settings.merchandisingJson.storeHeadline ?? ''));
    setShippingPolicyText(String(settings.merchandisingJson.shippingPolicyText ?? ''));
    setPickupInstructions(String(settings.merchandisingJson.pickupInstructions ?? ''));
    setSaveMessage(null);
    setSaveError(null);
  }, [settings]);

  const hasChanges = useMemo(() => {
    if (!settings) {
      return (
        enabled !== false ||
        headline.trim() !== '' ||
        shippingPolicyText.trim() !== '' ||
        pickupInstructions.trim() !== ''
      );
    }

    return (
      enabled !== settings.enabled ||
      headline.trim() !== String(settings.merchandisingJson.storeHeadline ?? '') ||
      shippingPolicyText.trim() !== String(settings.merchandisingJson.shippingPolicyText ?? '') ||
      pickupInstructions.trim() !== String(settings.merchandisingJson.pickupInstructions ?? '')
    );
  }, [enabled, headline, pickupInstructions, settings, shippingPolicyText]);

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading merch settings...</p>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      await onSave({
        enabled,
        merchandisingJson: {
          storeHeadline: headline.trim(),
          shippingPolicyText: shippingPolicyText.trim(),
          pickupInstructions: pickupInstructions.trim(),
        },
      });
      setSaveMessage('Merch settings saved successfully.');
      toast.success('Merch settings saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save merch settings right now.';
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
          {saveMessage}
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
          {saveError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Turn on merchandise</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Switch this on when you are ready to add products and accept merchandise orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((value) => !value)}
            className={`relative h-6 w-12 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${enabled ? 'left-7' : 'left-1'}`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Store copy</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This is the customer-facing text for your merchandise experience. Use it to describe your merch store,
          explain delivery expectations, and tell buyers how pickup works.
        </p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Headline</label>
            <Input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Official event merchandise"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shipping policy text</label>
            <Textarea
              value={shippingPolicyText}
              onChange={(event) => setShippingPolicyText(event.target.value)}
              placeholder="Shipping fees are not yet calculated by the merch backend."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pickup instructions</label>
            <Textarea
              value={pickupInstructions}
              onChange={(event) => setPickupInstructions(event.target.value)}
              placeholder="Pick up your order at the registration desk."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300 bg-amber-50/95 p-5 text-sm text-amber-950 shadow-sm shadow-amber-100/40 dark:border-amber-700/60 dark:bg-amber-500/12 dark:text-amber-50">
        <p className="font-semibold text-amber-950 dark:text-amber-50">Before you launch merch</p>
        <p className="mt-2 leading-6 text-amber-900 dark:text-amber-100/90">
          A few parts of the merchandise experience are still limited right now, so it is best to use this for
          product setup and order management from your dashboard.
        </p>
        <ul className="mt-4 space-y-3 text-amber-900 dark:text-amber-100/90">
          <li className="flex items-start gap-3 rounded-xl bg-amber-100/70 px-3 py-2 dark:bg-amber-400/10">
            <span className="mt-0.5 text-base font-bold leading-none text-amber-800 dark:text-amber-300">•</span>
            <span>Customers cannot browse merchandise on a public store page yet.</span>
          </li>
          <li className="flex items-start gap-3 rounded-xl bg-amber-100/70 px-3 py-2 dark:bg-amber-400/10">
            <span className="mt-0.5 text-base font-bold leading-none text-amber-800 dark:text-amber-300">•</span>
            <span>Online payment for merchandise is not fully available yet.</span>
          </li>
          <li className="flex items-start gap-3 rounded-xl bg-amber-100/70 px-3 py-2 dark:bg-amber-400/10">
            <span className="mt-0.5 text-base font-bold leading-none text-amber-800 dark:text-amber-300">•</span>
            <span>Merch orders currently work best for signed-in users.</span>
          </li>
          <li className="flex items-start gap-3 rounded-xl bg-amber-100/70 px-3 py-2 dark:bg-amber-400/10">
            <span className="mt-0.5 text-base font-bold leading-none text-amber-800 dark:text-amber-300">•</span>
            <span>Customer email is collected during checkout, but may not appear again later in order details.</span>
          </li>
        </ul>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? 'Saving...' : hasChanges ? 'Save merch settings' : 'No changes to save'}
        </Button>
      </div>
    </div>
  );
};
