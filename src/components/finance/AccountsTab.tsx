// Accounts Tab - manage bank payout accounts
import React, { useState } from 'react';
import {
  Plus,
  Building2,
  CheckCircle2,
  Star,
  Trash2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useBankAccounts } from '../../hooks/useFinance';
import type { BankAccount, Bank } from '../../types/finance';
import { toast } from 'sonner';

export const AccountsTab: React.FC = () => {
  const {
    accounts,
    banks,
    isLoading,
    error,
    addAccount,
    setDefault,
    removeAccount,
    verifyAccount,
    refetch,
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

  const handleDelete = async (account: BankAccount) => {
    if (account.isDefault) {
      toast.error('Cannot delete the default payout account');
      return;
    }
    if (!window.confirm(`Remove ${account.bankName} account ending in ${account.accountNumber.slice(-4)}?`)) {
      return;
    }
    try {
      await removeAccount(account.id);
      toast.success('Bank account removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove account');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Bank accounts are verified via Paystack
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            All payout accounts must be verified before they can receive transfers. Changes to bank accounts may require additional verification.
          </p>
        </div>
      </div>

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
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
        <div className="space-y-3">
          {accounts.map(account => (
            <div
              key={account.id}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-xl border p-5 transition-colors',
                account.isDefault
                  ? 'border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-100 dark:ring-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {account.bankName}
                      </p>
                      {account.isDefault && (
                        <Badge className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs">
                          Default
                        </Badge>
                      )}
                      {account.status === 'verified' && (
                        <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-xs gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {account.accountName} · ****{account.accountNumber.slice(-4)}
                    </p>
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
                  {!account.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isAddModalOpen && (
        <AddBankAccountModal
          banks={banks}
          onClose={() => setIsAddModalOpen(false)}
          onVerify={verifyAccount}
          onAdd={async (data) => {
            try {
              await addAccount(data);
              toast.success('Bank account added successfully');
              setIsAddModalOpen(false);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to add account');
            }
          }}
        />
      )}
    </div>
  );
};

// ─── Add Bank Account Modal ──────────────────────────────────────────────────

function AddBankAccountModal({
  banks,
  onClose,
  onVerify,
  onAdd,
}: {
  banks: Bank[];
  onClose: () => void;
  onVerify: (accountNumber: string, bankCode: string) => Promise<{ accountName: string; accountNumber: string; bankName: string; bankCode: string }>;
  onAdd: (data: { accountNumber: string; bankCode: string; bankName: string }) => Promise<void>;
}) {
  const [step, setStep] = useState<'input' | 'verify' | 'submitting'>('input');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [verifiedBankName, setVerifiedBankName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const selectedBank = banks.find(b => b.code === bankCode);

  const handleVerify = async () => {
    if (!bankCode || accountNumber.length < 10) return;
    setIsVerifying(true);
    setVerifyError('');
    try {
      const result = await onVerify(accountNumber, bankCode);
      setVerifiedName(result.accountName);
      setVerifiedBankName(result.bankName);
      setStep('verify');
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Account could not be verified. Check your details and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirm = async () => {
    setStep('submitting');
    await onAdd({
      accountNumber,
      bankCode,
      bankName: verifiedBankName || selectedBank?.name || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Payout Account</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'input' || step === 'verify' ? (
            <>
              {/* Bank Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Bank Name
                </label>
                <div className="relative">
                  <select
                    value={bankCode}
                    onChange={e => {
                      setBankCode(e.target.value);
                      setStep('input');
                      setVerifyError('');
                    }}
                    disabled={step === 'verify'}
                    className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="">Select a bank</option>
                    {banks.map(bank => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  value={accountNumber}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAccountNumber(value);
                    setStep('input');
                    setVerifyError('');
                  }}
                  disabled={step === 'verify'}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              {/* Verify Error */}
              {verifyError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{verifyError}</p>
                </div>
              )}

              {/* Verified Result */}
              {step === 'verify' && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      Account Verified
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    <strong>Account Holder:</strong> {verifiedName}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    <strong>Bank:</strong> {verifiedBankName}
                  </p>
                </div>
              )}
            </>
          ) : null}

          {/* Loading state for submit */}
          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Adding account...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'submitting' && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step === 'input' ? (
              <Button
                onClick={handleVerify}
                disabled={!bankCode || accountNumber.length < 10 || isVerifying}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Account'
                )}
              </Button>
            ) : step === 'verify' ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('input');
                    setVerifyError('');
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Add Account
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
