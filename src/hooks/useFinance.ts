import { useCallback, useEffect, useMemo, useState } from 'react';
import { financeService } from '../services';
import { FinanceSummaryResponse, PaymentTransaction } from '../types/api';

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
