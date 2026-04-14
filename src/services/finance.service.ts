import { config } from '../config';
import { unwrap, type ApiEnvelope } from '../helpers/auth.helpers';
import { apiClient } from '../lib/api-client';
import { CurrencyCode, FinanceSummaryBucket, FinanceSummaryResponse, PaymentStatus, PaymentTransaction } from '../types/api';
import {
  AddBankAccountRequest,
  Bank,
  BankAccount,
  CreateDisputeRequest,
  CreatePayoutRequest,
  Dispute,
  EarningsSummary,
  FinanceNotification,
  FinanceOverview,
  PaginatedResponse,
  Payout,
  PayoutFilters,
  Transaction,
  TransactionFilters,
  VerifyBankAccountResponse,
} from '../types/finance';
import { delay } from './mock/data';

type BackendPayoutStatus = 'QUEUED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';

type BackendPayoutAccount = {
  id: string;
  tenantId: string;
  provider: string;
  accountName: string;
  bankName: string;
  accountNumberLast4: string;
  recipientCode: string | null;
  isDefault: boolean;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type BackendPayout = {
  id: string;
  tenantId: string;
  eventId: string | null;
  payoutAccountId: string;
  status: BackendPayoutStatus;
  currency: CurrencyCode;
  amountMinor: number;
  scheduledFor: string;
  paidAt: string | null;
  failureReason: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  payoutAccount?: BackendPayoutAccount;
};

type TenantRequestParams = {
  status?: PaymentStatus;
  provider?: string;
  currency?: CurrencyCode;
};

function activeTenantId(): string {
  const tenantId = localStorage.getItem(config.auth.activeTenantKey);
  if (!tenantId) {
    throw new Error('Select a workspace before opening finance.');
  }
  return tenantId;
}

function formatTypeLabel(type: PaymentTransaction['transactionType']) {
  return type
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getMetadataText(metadata: Record<string, unknown> | null): string {
  if (!metadata) return '';
  return Object.values(metadata)
    .filter(value => ['string', 'number', 'boolean'].includes(typeof value))
    .join(' ');
}

function statusToTransactionStatus(status: PaymentStatus): Transaction['status'] {
  if (status === 'CAPTURED') return 'completed';
  if (status === 'FAILED') return 'failed';
  if (status === 'REFUNDED' || status === 'REVERSED') return 'refunded';
  return 'pending';
}

function sourceFromTransactionType(type: PaymentTransaction['transactionType']): Transaction['source'] {
  if (type === 'TICKET_ORDER') return 'ticket';
  if (type === 'MERCH_ORDER') return 'merch';
  if (type === 'FORM_PAYMENT') return 'forms';
  if (type === 'PAYOUT_REVERSAL') return 'refund';
  return 'forms';
}

function payoutStatusToUi(status: BackendPayoutStatus): Payout['status'] {
  if (status === 'QUEUED') return 'scheduled';
  if (status === 'PROCESSING') return 'processing';
  if (status === 'PAID') return 'completed';
  if (status === 'CANCELLED') return 'cancelled';
  return 'failed';
}

function toTransaction(txn: PaymentTransaction): Transaction {
  const metadataText = getMetadataText(txn.metadataJson);

  return {
    id: txn.id,
    eventId: txn.eventId ?? '',
    eventName: txn.eventId ? `Event ${txn.eventId.slice(0, 8)}` : 'Tenant payment',
    source: sourceFromTransactionType(txn.transactionType),
    amount: txn.amountMinor,
    platformFee: txn.platformFeeMinor,
    gatewayFee: txn.gatewayFeeMinor,
    netAmount: txn.netAmountMinor,
    status: statusToTransactionStatus(txn.status),
    currency: txn.currency,
    reference: txn.providerReference,
    customerName: metadataText,
    customerEmail: '',
    description: metadataText || `${formatTypeLabel(txn.transactionType)} via ${txn.provider}`,
    createdAt: txn.createdAt,
    backendStatus: txn.status,
    backendTransactionType: txn.transactionType,
    provider: txn.provider,
  };
}

function toBankAccount(account: BackendPayoutAccount): BankAccount {
  return {
    id: account.id,
    provider: account.provider,
    bankName: account.bankName,
    bankCode: typeof account.metadataJson?.bankCode === 'string' ? account.metadataJson.bankCode : '',
    accountNumber: `**** ${account.accountNumberLast4}`,
    accountNumberLast4: account.accountNumberLast4,
    accountName: account.accountName,
    status: 'verified',
    isDefault: account.isDefault,
    recipientCode: account.recipientCode,
    metadataJson: account.metadataJson,
    createdAt: account.createdAt,
  };
}

function toPayout(payout: BackendPayout): Payout {
  const account = payout.payoutAccount;

  return {
    id: payout.id,
    amount: payout.amountMinor,
    currency: payout.currency,
    destinationAccountId: payout.payoutAccountId,
    destinationBankName: account?.bankName ?? 'Payout account',
    destinationAccountNumber: account ? `**** ${account.accountNumberLast4}` : '',
    destinationAccountName: account?.accountName ?? 'Account unavailable',
    status: payoutStatusToUi(payout.status),
    scheduledDate: payout.scheduledFor,
    processedDate: payout.status === 'PAID' ? payout.paidAt : null,
    reference: payout.id,
    failureReason: payout.failureReason,
    breakdown: {
      ticketRevenue: 0,
      votingRevenue: 0,
      merchRevenue: 0,
      formsRevenue: 0,
      platformFees: 0,
      gatewayFees: 0,
      refunds: 0,
      netPayout: payout.amountMinor,
    },
    createdAt: payout.createdAt,
  };
}

const zeroBucket: FinanceSummaryBucket = {
  grossCapturedMinor: 0,
  netCapturedMinor: 0,
  refundedMinor: 0,
  queuedPayoutMinor: 0,
  processingPayoutMinor: 0,
  paidOutMinor: 0,
  availableMinor: 0,
};

function primarySummary(summary: FinanceSummaryResponse, fallbackCurrency: CurrencyCode = 'NGN') {
  const currency = (Object.keys(summary)[0] as CurrencyCode | undefined) ?? fallbackCurrency;
  return { currency, bucket: summary[currency] ?? zeroBucket };
}

class FinanceService {
  async getTenantFinanceSummary(tenantId = activeTenantId()): Promise<FinanceSummaryResponse> {
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

    return unwrap(await apiClient.get<ApiEnvelope<FinanceSummaryResponse>>(`/tenants/${tenantId}/finance/summary`));
  }

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

    return unwrap(await apiClient.get<ApiEnvelope<FinanceSummaryResponse>>(`/events/${eventId}/finance/summary`));
  }

  async getTenantPaymentTransactions(
    tenantId = activeTenantId(),
    params?: TenantRequestParams,
  ): Promise<PaymentTransaction[]> {
    if (config.features.useMockData) {
      await delay(300);
      return this.mockPaymentTransactions(null);
    }

    return unwrap(await apiClient.get<ApiEnvelope<PaymentTransaction[]>>(`/tenants/${tenantId}/payment-transactions`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }));
  }

  async getEventPaymentTransactions(
    eventId: string,
    params?: TenantRequestParams,
  ): Promise<PaymentTransaction[]> {
    if (config.features.useMockData) {
      await delay(300);
      return this.mockPaymentTransactions(eventId);
    }

    return unwrap(await apiClient.get<ApiEnvelope<PaymentTransaction[]>>(`/events/${eventId}/payment-transactions`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }));
  }

  async getFinanceOverview(): Promise<FinanceOverview> {
    const [summary, payouts] = await Promise.all([
      this.getTenantFinanceSummary(),
      this.listTenantPayouts(),
    ]);
    const { currency, bucket } = primarySummary(summary);
    const nextPayout = payouts
      .filter(payout => payout.status === 'QUEUED' || payout.status === 'PROCESSING')
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())[0];

    return {
      totalEarnings: bucket.netCapturedMinor,
      availableBalance: bucket.availableMinor,
      pendingBalance: bucket.queuedPayoutMinor + bucket.processingPayoutMinor,
      nextPayoutDate: nextPayout?.scheduledFor ?? null,
      nextPayoutAmount: nextPayout?.amountMinor ?? null,
      currency,
    };
  }

  async getEarnings(params?: { eventId?: string; dateFrom?: string; dateTo?: string }): Promise<EarningsSummary> {
    const transactions = params?.eventId
      ? await this.getEventPaymentTransactions(params.eventId)
      : await this.getTenantPaymentTransactions();
    const captured = transactions.filter(txn => txn.status === 'CAPTURED');
    const groups = new Map<Transaction['source'], { revenue: number; count: number }>();

    captured.forEach(txn => {
      const source = sourceFromTransactionType(txn.transactionType);
      const current = groups.get(source) ?? { revenue: 0, count: 0 };
      groups.set(source, {
        revenue: current.revenue + txn.netAmountMinor,
        count: current.count + 1,
      });
    });

    const breakdown = Array.from(groups.entries()).map(([source, value]) => ({
      source,
      label: {
        ticket: 'Ticket Purchases',
        voting: 'Voting Payments',
        merch: 'Merchandise',
        forms: 'Form Payments',
        refund: 'Refunds',
      }[source],
      revenue: value.revenue,
      count: value.count,
    }));

    return {
      breakdown,
      totalRevenue: captured.reduce((sum, txn) => sum + txn.amountMinor, 0),
      totalPlatformFees: captured.reduce((sum, txn) => sum + txn.platformFeeMinor, 0),
      totalGatewayFees: captured.reduce((sum, txn) => sum + txn.gatewayFeeMinor, 0),
      netEarnings: captured.reduce((sum, txn) => sum + txn.netAmountMinor, 0),
    };
  }

  async listTenantPayoutAccounts(tenantId = activeTenantId()): Promise<BackendPayoutAccount[]> {
    if (config.features.useMockData) {
      await delay(300);
      return [{
        id: 'acct-1',
        tenantId,
        provider: 'paystack',
        accountName: 'Munar Events Ltd',
        bankName: 'GTBank',
        accountNumberLast4: '6789',
        recipientCode: 'RCP_mock001',
        isDefault: true,
        metadataJson: { bankCode: '058' },
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      }];
    }

    return unwrap(await apiClient.get<ApiEnvelope<BackendPayoutAccount[]>>(`/tenants/${tenantId}/payout-accounts`));
  }

  async createTenantPayoutAccount(
    body: AddBankAccountRequest,
    tenantId = activeTenantId(),
  ): Promise<BackendPayoutAccount> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        id: `acct-${Date.now()}`,
        tenantId,
        provider: body.provider,
        accountName: body.accountName,
        bankName: body.bankName,
        accountNumberLast4: body.accountNumberLast4,
        recipientCode: body.recipientCode ?? null,
        isDefault: !!body.isDefault,
        metadataJson: body.metadataJson ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return unwrap(await apiClient.post<ApiEnvelope<BackendPayoutAccount>>(`/tenants/${tenantId}/payout-accounts`, body));
  }

  async updateTenantPayoutAccount(accountId: string, body: Partial<AddBankAccountRequest>): Promise<BackendPayoutAccount> {
    if (config.features.useMockData) {
      await delay(300);
      return {
        id: accountId,
        tenantId: activeTenantId(),
        provider: body.provider ?? 'paystack',
        accountName: body.accountName ?? 'Munar Events Ltd',
        bankName: body.bankName ?? 'GTBank',
        accountNumberLast4: body.accountNumberLast4 ?? '6789',
        recipientCode: body.recipientCode ?? null,
        isDefault: !!body.isDefault,
        metadataJson: body.metadataJson ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return unwrap(await apiClient.patch<ApiEnvelope<BackendPayoutAccount>>(`/payout-accounts/${accountId}`, body));
  }

  async listTenantPayouts(tenantId = activeTenantId()): Promise<BackendPayout[]> {
    if (config.features.useMockData) {
      await delay(300);
      const [account] = await this.listTenantPayoutAccounts(tenantId);
      return [{
        id: 'payout-1',
        tenantId,
        eventId: null,
        payoutAccountId: account.id,
        status: 'QUEUED',
        currency: 'NGN',
        amountMinor: 800000,
        scheduledFor: new Date(Date.now() + 7 * 86400000).toISOString(),
        paidAt: null,
        failureReason: null,
        metadataJson: null,
        payoutAccount: account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    }

    return unwrap(await apiClient.get<ApiEnvelope<BackendPayout[]>>(`/tenants/${tenantId}/payouts`));
  }

  async createTenantPayout(body: CreatePayoutRequest, tenantId = activeTenantId()): Promise<BackendPayout> {
    if (config.features.useMockData) {
      await delay(500);
      const accounts = await this.listTenantPayoutAccounts(tenantId);
      const account = accounts.find(item => item.id === body.payoutAccountId) ?? accounts[0];
      return {
        id: `payout-${Date.now()}`,
        tenantId,
        eventId: null,
        payoutAccountId: body.payoutAccountId,
        status: 'QUEUED',
        currency: body.currency,
        amountMinor: body.amountMinor,
        scheduledFor: body.scheduledFor ?? new Date().toISOString(),
        paidAt: null,
        failureReason: null,
        metadataJson: body.metadataJson ?? null,
        payoutAccount: account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return unwrap(await apiClient.post<ApiEnvelope<BackendPayout>>(`/tenants/${tenantId}/payouts`, body));
  }

  async createRefund(paymentTransactionId: string, body: { amountMinor: number; reason?: string }) {
    return unwrap(await apiClient.post<ApiEnvelope<unknown>>(`/payment-transactions/${paymentTransactionId}/refunds`, body));
  }

  async getPayouts(params?: PayoutFilters): Promise<PaginatedResponse<Payout>> {
    const payouts = (await this.listTenantPayouts()).map(toPayout);
    const filtered = params?.status ? payouts.filter(payout => payout.status === params.status) : payouts;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async createPayout(req: CreatePayoutRequest): Promise<Payout> {
    return toPayout(await this.createTenantPayout(req));
  }

  async getTransactions(params?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const backendFilters: TenantRequestParams = {};
    if (params?.currency) backendFilters.currency = params.currency;
    if (params?.provider) backendFilters.provider = params.provider;
    if (params?.backendStatus) backendFilters.status = params.backendStatus;

    const rows = params?.eventId
      ? await this.getEventPaymentTransactions(params.eventId, backendFilters)
      : await this.getTenantPaymentTransactions(undefined, backendFilters);

    const search = params?.search?.toLowerCase().trim();
    const transactions = rows
      .map(toTransaction)
      .filter(txn => !params?.source || txn.source === params.source)
      .filter(txn => !search || [
        txn.id,
        txn.reference,
        txn.provider,
        txn.backendTransactionType,
        txn.description,
        txn.customerName,
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(search)));

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    return {
      data: transactions.slice((page - 1) * limit, page * limit),
      total: transactions.length,
      page,
      limit,
      totalPages: Math.ceil(transactions.length / limit) || 1,
    };
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    return (await this.listTenantPayoutAccounts()).map(toBankAccount);
  }

  async getBanks(): Promise<Bank[]> {
    return [];
  }

  async addBankAccount(req: AddBankAccountRequest): Promise<BankAccount> {
    return toBankAccount(await this.createTenantPayoutAccount(req));
  }

  async verifyBankAccountName(accountNumber: string, bankCode: string): Promise<VerifyBankAccountResponse> {
    throw new Error('Bank verification is not connected yet. Enter verified Paystack recipient details manually.');
  }

  async setDefaultBankAccount(accountId: string): Promise<BankAccount> {
    return toBankAccount(await this.updateTenantPayoutAccount(accountId, { isDefault: true }));
  }

  async deleteBankAccount(): Promise<void> {
    throw new Error('Deleting payout accounts is not supported by the backend yet.');
  }

  async getDisputes(): Promise<Dispute[]> {
    return [];
  }

  async createDispute(_req: Omit<CreateDisputeRequest, 'attachments'>): Promise<Dispute> {
    throw new Error('Finance dispute reporting needs a backend endpoint before it can be submitted.');
  }

  async getFinanceNotifications(): Promise<FinanceNotification[]> {
    if (config.features.useMockData) {
      await delay(200);
      return [
        {
          id: 'notif-1',
          type: 'payout_scheduled',
          title: 'Payout Scheduled',
          message: 'Your next payout is scheduled for next week.',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }

    return [];
  }

  async markFinanceNotificationRead(_id: string): Promise<void> {
    return;
  }

  private mockPaymentTransactions(eventId: string | null): PaymentTransaction[] {
    return [{
      id: 'txn-1',
      tenantId: activeTenantId(),
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
      metadataJson: { customerName: 'Amara Osei', description: 'VIP Ticket x1' },
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];
  }
}

export const financeService = new FinanceService();
