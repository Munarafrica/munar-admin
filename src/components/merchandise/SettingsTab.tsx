import React, { useEffect, useState } from 'react';
import type { MerchandiseSettings } from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

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

  useEffect(() => {
    if (!settings) {
      return;
    }

    setEnabled(settings.enabled);
    setHeadline(String(settings.merchandisingJson.storeHeadline ?? ''));
    setShippingPolicyText(String(settings.merchandisingJson.shippingPolicyText ?? ''));
    setPickupInstructions(String(settings.merchandisingJson.pickupInstructions ?? ''));
  }, [settings]);

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading merch settings...</p>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        enabled,
        merchandisingJson: {
          storeHeadline: headline.trim(),
          shippingPolicyText: shippingPolicyText.trim(),
          pickupInstructions: pickupInstructions.trim(),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Enable merchandise</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Frontend visibility should follow `modulesEnabledJson.merchandising`.
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

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
        <p className="font-semibold">Current backend limits</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>No public merch storefront endpoints yet.</li>
          <li>No merch payment initialization endpoint yet.</li>
          <li>Merch order creation still requires auth in practice.</li>
          <li>`email` is required on create but not returned on later reads.</li>
          <li>`metadataJson` on order create should not be relied on for persistence.</li>
        </ul>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save merch settings'}
        </Button>
      </div>
    </div>
  );
};
