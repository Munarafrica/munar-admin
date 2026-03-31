import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { CurrencyCode, FinanceSummaryResponse, PaymentTransaction } from '../types/api';
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
  VerifyBankAccountResponse,
  Dispute,
  CreateDisputeRequest,
  FinanceNotification,
} from '../types/finance';
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

  async getFinanceOverview(): Promise<FinanceOverview> {
    if (config.features.useMockData) {
      await delay(300);
      return {
        totalEarnings: 12500000,
        availableBalance: 3200000,
        pendingBalance: 800000,
        nextPayoutDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        nextPayoutAmount: 2400000,
        currency: 'NGN',
      };
    }
    return apiClient.get<FinanceOverview>('/finance/overview');
  }

  async getEarnings(params?: { eventId?: string; dateFrom?: string; dateTo?: string }): Promise<EarningsSummary> {
    if (config.features.useMockData) {
      await delay(300);
      return {
        breakdown: [
          { source: 'ticket', label: 'Ticket Purchases', revenue: 8000000, count: 120 },
          { source: 'voting', label: 'Voting Payments', revenue: 2000000, count: 400 },
          { source: 'merch', label: 'Merchandise', revenue: 1500000, count: 30 },
          { source: 'forms', label: 'Form Payments', revenue: 500000, count: 10 },
        ],
        totalRevenue: 12000000,
        totalPlatformFees: 600000,
        totalGatewayFees: 240000,
        netEarnings: 11160000,
      };
    }
    return apiClient.get<EarningsSummary>('/finance/earnings', {
      params: params as Record<string, string | undefined>,
    });
  }

  async getPayouts(params?: PayoutFilters): Promise<PaginatedResponse<Payout>> {
    if (config.features.useMockData) {
      await delay(300);
      const mockPayouts: Payout[] = [
        {
          id: 'payout-1',
          amount: 2400000,
          currency: 'NGN',
          destinationAccountId: 'acct-1',
          destinationBankName: 'GTBank',
          destinationAccountNumber: '0123456789',
          destinationAccountName: 'Munar Events Ltd',
          status: 'completed',
          scheduledDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          processedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
          reference: 'PAY-REF-001',
          breakdown: {
            ticketRevenue: 2000000,
            votingRevenue: 600000,
            merchRevenue: 200000,
            formsRevenue: 0,
            platformFees: 140000,
            gatewayFees: 40000,
            refunds: 0,
            netPayout: 2620000,
          },
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          id: 'payout-2',
          amount: 1800000,
          currency: 'NGN',
          destinationAccountId: 'acct-1',
          destinationBankName: 'GTBank',
          destinationAccountNumber: '0123456789',
          destinationAccountName: 'Munar Events Ltd',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          processedDate: null,
          reference: 'PAY-REF-002',
          breakdown: {
            ticketRevenue: 1500000,
            votingRevenue: 400000,
            merchRevenue: 100000,
            formsRevenue: 0,
            platformFees: 100000,
            gatewayFees: 30000,
            refunds: 0,
            netPayout: 1870000,
          },
          createdAt: new Date().toISOString(),
        },
      ];
      const filtered = params?.status ? mockPayouts.filter(p => p.status === params.status) : mockPayouts;
      return { data: filtered, total: filtered.length, page: params?.page ?? 1, limit: params?.limit ?? 20, totalPages: 1 };
    }
    return apiClient.get<PaginatedResponse<Payout>>('/finance/payouts', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getTransactions(params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    if (config.features.useMockData) {
      await delay(300);
      const mock: Transaction[] = [
        {
          id: 'txn-f1',
          eventId: 'event-1',
          eventName: 'Tech Summit 2026',
          source: 'ticket',
          amount: 50000,
          platformFee: 2500,
          gatewayFee: 500,
          netAmount: 47000,
          status: 'completed',
          currency: 'NGN',
          reference: 'TXN-001',
          customerName: 'Amara Osei',
          customerEmail: 'amara@example.com',
          description: 'VIP Ticket x1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'txn-f2',
          eventId: 'event-1',
          eventName: 'Tech Summit 2026',
          source: 'voting',
          amount: 5000,
          platformFee: 250,
          gatewayFee: 50,
          netAmount: 4700,
          status: 'completed',
          currency: 'NGN',
          reference: 'TXN-002',
          customerName: 'David Eze',
          customerEmail: 'david@example.com',
          description: 'Voting credits x100',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      const filtered = params?.search
        ? mock.filter(t => t.customerName.toLowerCase().includes(params.search!.toLowerCase()) || t.reference.includes(params.search!))
        : mock;
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      return { data: filtered, total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) || 1 };
    }
    return apiClient.get<PaginatedResponse<Transaction>>('/finance/transactions', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    if (config.features.useMockData) {
      await delay(300);
      return [
        {
          id: 'acct-1',
          bankName: 'GTBank',
          bankCode: '058',
          accountNumber: '0123456789',
          accountName: 'Munar Events Ltd',
          status: 'verified',
          isDefault: true,
          recipientCode: 'RCP_mock001',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
      ];
    }
    return apiClient.get<BankAccount[]>('/finance/accounts');
  }

  async getBanks(): Promise<Bank[]> {
    if (config.features.useMockData) {
      await delay(200);
      return [
        { name: 'Access Bank', code: '044', slug: 'access-bank' },
        { name: 'GTBank', code: '058', slug: 'guaranty-trust-bank' },
        { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
        { name: 'First Bank', code: '011', slug: 'first-bank-of-nigeria' },
        { name: 'UBA', code: '033', slug: 'united-bank-for-africa' },
      ];
    }
    return apiClient.get<Bank[]>('/finance/banks');
  }

  async addBankAccount(req: AddBankAccountRequest): Promise<BankAccount> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        id: `acct-${Date.now()}`,
        bankName: req.bankName,
        bankCode: req.bankCode,
        accountNumber: req.accountNumber,
        accountName: 'Mock Account Name',
        status: 'pending',
        isDefault: false,
        recipientCode: null,
        createdAt: new Date().toISOString(),
      };
    }
    return apiClient.post<BankAccount>('/finance/accounts', req);
  }

  async verifyBankAccountName(accountNumber: string, bankCode: string): Promise<VerifyBankAccountResponse> {
    if (config.features.useMockData) {
      await delay(400);
      return { accountName: 'Mock Account Name', accountNumber, bankName: 'Mock Bank', bankCode };
    }
    return apiClient.post<VerifyBankAccountResponse>('/finance/accounts/verify', { accountNumber, bankCode });
  }

  async setDefaultBankAccount(accountId: string): Promise<BankAccount> {
    if (config.features.useMockData) {
      await delay(300);
      return {
        id: accountId,
        bankName: 'GTBank',
        bankCode: '058',
        accountNumber: '0123456789',
        accountName: 'Munar Events Ltd',
        status: 'verified',
        isDefault: true,
        recipientCode: 'RCP_mock001',
        createdAt: new Date().toISOString(),
      };
    }
    return apiClient.put<BankAccount>(`/finance/accounts/${accountId}/default`, {});
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    if (config.features.useMockData) {
      await delay(300);
      return;
    }
    return apiClient.delete<void>(`/finance/accounts/${accountId}`);
  }

  async getDisputes(): Promise<Dispute[]> {
    if (config.features.useMockData) {
      await delay(300);
      return [
        {
          id: 'dispute-1',
          payoutId: 'payout-1',
          type: 'missing_payout',
          message: 'Payout was scheduled but funds not received.',
          attachments: [],
          status: 'under_review',
          resolution: null,
          resolvedAt: null,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }
    return apiClient.get<Dispute[]>('/finance/disputes');
  }

  async createDispute(req: Omit<CreateDisputeRequest, 'attachments'>): Promise<Dispute> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        id: `dispute-${Date.now()}`,
        payoutId: req.payoutId,
        type: req.type,
        message: req.message,
        attachments: [],
        status: 'open',
        resolution: null,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return apiClient.post<Dispute>('/finance/disputes', req);
  }

  async getFinanceNotifications(): Promise<FinanceNotification[]> {
    if (config.features.useMockData) {
      await delay(200);
      return [
        {
          id: 'notif-1',
          type: 'payout_completed',
          title: 'Payout Completed',
          message: '₦2,400,000 has been sent to your GTBank account.',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-2',
          type: 'payout_scheduled',
          title: 'Payout Scheduled',
          message: 'Your next payout of ₦1,800,000 is scheduled for next week.',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }
    return apiClient.get<FinanceNotification[]>('/finance/notifications');
  }

  async markFinanceNotificationRead(id: string): Promise<void> {
    if (config.features.useMockData) {
      await delay(100);
      return;
    }
    return apiClient.put<void>(`/finance/notifications/${id}/read`, {});
  }
}

export const financeService = new FinanceService();
