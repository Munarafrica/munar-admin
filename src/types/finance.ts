// Finance & Payout Types
// Covers earnings, payouts, transactions, bank accounts, and disputes

// ─── Enums & Constants ───────────────────────────────────────────────────────

export type PayoutStatus = 'scheduled' | 'processing' | 'completed' | 'failed';
export type TransactionType = 'ticket' | 'voting' | 'merch' | 'forms' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';
export type DisputeType = 'missing_payout' | 'incorrect_payout' | 'refund_error' | 'account_not_credited' | 'other';
export type GatewayFeeBearer = 'organiser' | 'attendee';
export type BankAccountStatus = 'verified' | 'pending' | 'failed';

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ticket: 'Ticket Purchase',
  voting: 'Voting Payment',
  merch: 'Merchandise Purchase',
  forms: 'Form Payment',
  refund: 'Refund',
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  scheduled: 'Scheduled',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Open',
  under_review: 'Under Review',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  missing_payout: 'Missing Payout',
  incorrect_payout: 'Incorrect Payout',
  refund_error: 'Refund Error',
  account_not_credited: 'Account Not Credited',
  other: 'Other',
};

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface FinanceOverview {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  nextPayoutDate: string | null;
  nextPayoutAmount: number | null;
  currency: string;
}

export interface EarningsBreakdown {
  source: TransactionType;
  label: string;
  revenue: number;
  count: number;
}

export interface EarningsSummary {
  breakdown: EarningsBreakdown[];
  totalRevenue: number;
  totalPlatformFees: number;
  totalGatewayFees: number;
  netEarnings: number;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  eventId: string;
  eventName: string;
  source: TransactionType;
  amount: number;
  platformFee: number;
  gatewayFee: number;
  netAmount: number;
  status: TransactionStatus;
  currency: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  description: string;
  createdAt: string;
}

export interface TransactionFilters {
  eventId?: string;
  source?: TransactionType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export interface Payout {
  id: string;
  amount: number;
  currency: string;
  destinationAccountId: string;
  destinationBankName: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
  status: PayoutStatus;
  scheduledDate: string;
  processedDate: string | null;
  reference: string;
  breakdown: PayoutBreakdown;
  createdAt: string;
}

export interface PayoutBreakdown {
  ticketRevenue: number;
  votingRevenue: number;
  merchRevenue: number;
  formsRevenue: number;
  platformFees: number;
  gatewayFees: number;
  refunds: number;
  netPayout: number;
}

export interface PayoutFilters {
  status?: PayoutStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ─── Bank Accounts ───────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: BankAccountStatus;
  isDefault: boolean;
  recipientCode: string | null;  // Paystack recipient code
  createdAt: string;
}

export interface AddBankAccountRequest {
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

export interface VerifyBankAccountResponse {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface Bank {
  name: string;
  code: string;
  slug: string;
}

// ─── Disputes ────────────────────────────────────────────────────────────────

export interface Dispute {
  id: string;
  payoutId: string;
  type: DisputeType;
  message: string;
  attachments: string[];
  status: DisputeStatus;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  payoutId: string;
  type: DisputeType;
  message: string;
  attachments?: File[];
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type FinanceNotificationType =
  | 'payout_scheduled'
  | 'payout_completed'
  | 'payout_failed'
  | 'bank_account_verified'
  | 'dispute_resolved'
  | 'refund_processed';

export interface FinanceNotification {
  id: string;
  type: FinanceNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, string>;
}

// ─── API Endpoints (for backend reference) ───────────────────────────────────
//
// GET    /api/finance/overview                  → FinanceOverview
// GET    /api/finance/earnings?eventId&dateFrom&dateTo → EarningsSummary
// GET    /api/finance/transactions?filters      → PaginatedResponse<Transaction>
// GET    /api/finance/transactions/:id          → Transaction
// GET    /api/finance/payouts?filters           → PaginatedResponse<Payout>
// GET    /api/finance/payouts/:id               → Payout
// GET    /api/finance/accounts                  → BankAccount[]
// POST   /api/finance/accounts                  → BankAccount (add new)
// POST   /api/finance/accounts/verify           → VerifyBankAccountResponse
// PUT    /api/finance/accounts/:id/default      → BankAccount (set default)
// DELETE /api/finance/accounts/:id              → void
// GET    /api/finance/banks                     → Bank[] (list supported banks)
// GET    /api/finance/disputes                  → Dispute[]
// POST   /api/finance/disputes                  → Dispute (create)
// GET    /api/finance/disputes/:id              → Dispute
// GET    /api/finance/notifications             → FinanceNotification[]
// PUT    /api/finance/notifications/:id/read    → void
