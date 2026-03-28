import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { CurrencyCode, FinanceSummaryResponse, PaymentTransaction } from '../types/api';
import { delay } from './mock/data';

class FinanceService {
  async getEventFinanceSummary(eventId: string): Promise<FinanceSummaryResponse> {
    if (config.features.useMockData) {
      await delay(300);
      return {
        NGN: {
          grossCapturedMinor: 5000000,
          netCapturedMinor: 4700000,
          refundedMinor: 100000,
          queuedPayoutMinor: 800000,
          processingPayoutMinor: 500000,
          paidOutMinor: 2000000,
          availableMinor: 1400000,
        },
      };
    }

    return apiClient.get<FinanceSummaryResponse>(`/events/${eventId}/finance/summary`);
  }

  async getEventPaymentTransactions(
    eventId: string,
    params?: { status?: string; provider?: string; currency?: CurrencyCode },
  ): Promise<PaymentTransaction[]> {
    if (config.features.useMockData) {
      await delay(300);
      return [
        {
          id: 'txn-1',
          tenantId: 'tenant-1',
          eventId,
          ticketOrderId: 'ord-1',
          merchOrderId: null,
          provider: 'paystack',
          providerReference: 'PSK-123',
          transactionType: 'TICKET_ORDER',
          status: 'CAPTURED',
          currency: 'NGN',
          amountMinor: 500000,
          platformFeeMinor: 25000,
          gatewayFeeMinor: 5000,
          netAmountMinor: 470000,
          metadataJson: null,
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    return apiClient.get<PaymentTransaction[]>(`/events/${eventId}/payment-transactions`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  }
}

export const financeService = new FinanceService();
