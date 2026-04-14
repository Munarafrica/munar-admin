// Accounts Tab - manage bank payout accounts
import React, { useState } from 'react';
import {
  Plus,
  Building2,
  CheckCircle2,
  Star,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useBankAccounts } from '../../hooks/useFinance';
import type { AddBankAccountRequest } from '../../types/finance';
import { toast } from 'sonner';

export const AccountsTab: React.FC = () => {
  const {
    accounts,
    isLoading,
    addAccount,
    setDefault,
  } = useBankAccounts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSetDefault = async (accountId: string) => {
    try {
      await setDefault(accountId);
      toast.success('Default payout account updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update default account');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payout Accounts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your bank accounts for receiving payouts
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Add Payout Account
        </Button>
      </div>

      <div className="flex items-start gap-4 p-5 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/40 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-300 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-sky-950 dark:text-slate-100">
            Bank accounts are verified via Paystack
          </p>
          <p className="text-xs text-sky-700 dark:text-slate-300 mt-0.5">
            Bank verification is not connected in this frontend yet. Add only already verified Paystack recipient details.
          </p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <Building2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No payout accounts</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Add a bank account to receive payouts from your events.
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payout Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(account => (
            <div
              key={account.id}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-xl border p-6 transition-colors',
                account.isDefault
                  ? 'border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {account.bankName}
                      </p>
                      {account.isDefault && (
                        <Badge className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs">
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-xs gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {account.accountName} · {account.accountNumber}
                    </p>
                    {account.recipientCode && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Recipient: {account.recipientCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  {!account.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(account.id)}
                      className="gap-1 text-sm"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddBankAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={async (data) => {
            try {
              await addAccount(data);
              toast.success('Payout account added successfully');
              setIsAddModalOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to add payout account');
            }
          }}
        />
      )}
    </div>
  );
};

function AddBankAccountModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: AddBankAccountRequest) => Promise<void>;
}) {
  const [provider, setProvider] = useState('paystack');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumberLast4, setAccountNumberLast4] = useState('');
  const [recipientCode, setRecipientCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = provider.trim() && bankName.trim() && accountName.trim() && accountNumberLast4.length === 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        provider: provider.trim(),
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumberLast4,
        recipientCode: recipientCode.trim() || undefined,
        isDefault,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Payout Account</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Manual metadata entry
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Enter details for an account already verified outside this screen.
              </p>
            </div>

            <TextField label="Provider" value={provider} onChange={setProvider} placeholder="paystack" />
            <TextField label="Bank Name" value={bankName} onChange={setBankName} placeholder="GTBank" />
            <TextField label="Account Name" value={accountName} onChange={setAccountName} placeholder="Munar Events Ltd" />
            <TextField
              label="Account Number Last 4"
              value={accountNumberLast4}
              onChange={value => setAccountNumberLast4(value.replace(/\D/g, '').slice(0, 4))}
              placeholder="6789"
              inputMode="numeric"
            />
            <TextField
              label="Recipient Code"
              value={recipientCode}
              onChange={setRecipientCode}
              placeholder="Optional Paystack recipient code"
            />

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Make this the default payout account
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
