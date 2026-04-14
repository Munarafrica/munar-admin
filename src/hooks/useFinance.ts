import { useCallback, useEffect, useMemo, useState } from 'react';
import { financeService } from '../services';
import { FinanceSummaryResponse, PaymentTransaction } from '../types/api';
import {
  FinanceOverview,
  EarningsSummary,
  Transaction,
  TransactionFilters,
  Payout,
  PayoutFilters,
  PaginatedResponse,
  BankAccount,
  Bank,
  AddBankAccountRequest,
  CreatePayoutRequest,
  VerifyBankAccountResponse,
  Dispute,
  CreateDisputeRequest,
  FinanceNotification,
} from '../types/finance';

export function useFinance(eventId: string | null) {
  const [summary, setSummary] = useState<FinanceSummaryResponse>({});
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [summaryResponse, transactionsResponse] = await Promise.all([
        financeService.getEventFinanceSummary(eventId),
        financeService.getEventPaymentTransactions(eventId),
      ]);
      setSummary(summaryResponse);
      setTransactions(transactionsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const primaryCurrency = useMemo(
    () => Object.keys(summary)[0] || (transactions[0]?.currency ?? 'NGN'),
    [summary, transactions],
  );

  const primaryBucket = summary[primaryCurrency as keyof FinanceSummaryResponse];

  return {
    summary,
    transactions,
    primaryCurrency,
    primaryBucket,
    isLoading,
    error,
    refresh: load,
  };
}

// ─── Finance Overview ─────────────────────────────────────────────────────────

export function useFinanceOverview() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await financeService.getFinanceOverview();
      setOverview(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { overview, isLoading, refresh: load };
}

// ─── Earnings ─────────────────────────────────────────────────────────────────

export function useEarnings(params?: { eventId?: string; dateFrom?: string; dateTo?: string }) {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await financeService.getEarnings(params);
      setEarnings(data);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { load(); }, [load]);

  return { earnings, isLoading, refresh: load };
}

// ─── Payouts ──────────────────────────────────────────────────────────────────

export function usePayouts(initialFilters?: PayoutFilters) {
  const [result, setResult] = useState<PaginatedResponse<Payout>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState<PayoutFilters>(initialFilters ?? {});
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (f: PayoutFilters) => {
    setIsLoading(true);
    try {
      const data = await financeService.getPayouts(f);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(filters); }, [load, filters]);

  const updateFilters = useCallback((patch: Partial<PayoutFilters>) => {
    setFilters(prev => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const createPayout = useCallback(async (req: CreatePayoutRequest) => {
    const payout = await financeService.createPayout(req);
    await load(filters);
    return payout;
  }, [filters, load]);

  return {
    payouts: result.data,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    filters,
    isLoading,
    updateFilters,
    goToPage,
    refresh: () => load(filters),
    createPayout,
  };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(initialFilters?: TransactionFilters) {
  const [result, setResult] = useState<PaginatedResponse<Transaction>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters ?? {});
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (f: TransactionFilters) => {
    setIsLoading(true);
    try {
      const data = await financeService.getTransactions(f);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(filters); }, [load, filters]);

  const updateFilters = useCallback((patch: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const createRefund = useCallback(async (paymentTransactionId: string, amountMinor: number, reason?: string) => {
    await financeService.createRefund(paymentTransactionId, { amountMinor, reason });
    await load(filters);
  }, [filters, load]);

  return {
    transactions: result.data,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    filters,
    isLoading,
    updateFilters,
    goToPage,
    createRefund,
  };
}

// ─── Bank Accounts ────────────────────────────────────────────────────────────

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [accts, bankList] = await Promise.all([
        financeService.getBankAccounts(),
        financeService.getBanks(),
      ]);
      setAccounts(accts);
      setBanks(bankList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const verifyAccount = useCallback(
    (accountNumber: string, bankCode: string): Promise<VerifyBankAccountResponse> =>
      financeService.verifyBankAccountName(accountNumber, bankCode),
    [],
  );

  const addAccount = useCallback(async (req: AddBankAccountRequest) => {
    const account = await financeService.addBankAccount(req);
    setAccounts(prev => [...prev, account]);
    return account;
  }, []);

  const setDefault = useCallback(async (accountId: string) => {
    await financeService.setDefaultBankAccount(accountId);
    setAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === accountId })));
  }, []);

  const removeAccount = useCallback(async (accountId: string) => {
    await financeService.deleteBankAccount(accountId);
    setAccounts(prev => prev.filter(a => a.id !== accountId));
  }, []);

  return { accounts, banks, isLoading, error, addAccount, setDefault, removeAccount, verifyAccount, refetch };
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export function useDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await financeService.getDisputes();
      setDisputes(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const submitDispute = useCallback(async (req: Omit<CreateDisputeRequest, 'attachments'>) => {
    const dispute = await financeService.createDispute(req);
    setDisputes(prev => [dispute, ...prev]);
    return dispute;
  }, []);

  return { disputes, isLoading, submitDispute, refetch };
}

// ─── Finance Notifications ────────────────────────────────────────────────────

export function useFinanceNotifications() {
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await financeService.getFinanceNotifications();
      setNotifications(data);
    } catch {
      // non-critical — silently ignore
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await financeService.markFinanceNotificationRead(id);
  }, []);

  return { notifications, unreadCount, markRead };
}
