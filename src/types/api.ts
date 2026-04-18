// API Response and Error Types

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Error types
export interface ApiError {
  code: string;
  message: string | string[];
  details?: Record<string, string[]> | unknown;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
  requestId?: string;
}

export class ApiException extends Error {
  constructor(
    public error: ApiError,
    public statusCode: number = 500
  ) {
    super(Array.isArray(error.message) ? error.message.join(', ') : error.message);
    this.name = 'ApiException';
  }
}

// Request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// Auth types
export type UserType = 'ORGANISER' | 'ATTENDEE' | 'STAFF' | 'ADMIN';

export type TenantType = 'INDIVIDUAL' | 'ORGANISATION' | 'AGENCY';

export type MembershipRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EDITOR'
  | 'FINANCE'
  | 'STAFF'
  | 'VIEWER';

export type CurrencyCode =
  | 'NGN'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'KES'
  | 'ZAR';

export interface TenantSummary {
  id: string;
  slug: string;
  name: string;
  tenantType: TenantType;
  defaultCurrency: CurrencyCode;
  timezone: string;
  brandingJson?: Record<string, unknown> | null;
  settingsJson?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Membership {
  id: string;
  role: MembershipRole;
  acceptedAt: string | null;
  tenant: TenantSummary;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: UserType;
}

export interface GoogleAuthRequest {
  credential?: string;
  idToken?: string;
  userType?: UserType;
}

export interface TwoFactorResponse {
  requiresTwoFactor: true;
  challengeToken: string;
  channel: 'EMAIL' | 'PHONE';
  destination: string;
  expiresAt: string;
  message: string;
}

export interface TwoFactorVerifyRequest {
  challengeToken: string;
  code: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export type GoogleAuthResponse = AuthResponse | TwoFactorResponse;

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  userType?: UserType;
  isActive?: boolean;
  memberships?: Membership[];

  // Legacy compatibility fields retained while the rest of the app migrates.
  organization?: string;
  avatarUrl?: string;
  accountType?: 'individual' | 'organization';
  currency?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTenantRequest {
  name: string;
  slug?: string;
  tenantType?: TenantType;
  defaultCurrency?: CurrencyCode;
  timezone?: string;
}

export interface CreateTenantResponse extends TenantSummary {
  members: Array<{
    id: string;
    tenantId: string;
    userId: string;
    role: MembershipRole;
    invitedEmail: string | null;
    acceptedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: User;
  }>;
}

// Event types for API
export interface CreateEventRequest {
  name: string;
  type: 'Physical' | 'Virtual' | 'Hybrid';
  description?: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  subdomain?: string;
  customDomain?: string;
  coverImageUrl?: string;
  country?: string;
  venueLocation?: string;
  categories?: string[];
  isRecurring?: boolean;
  recurringConfig?: RecurringEventConfig;
  currency?: 'NGN' | 'GHS' | 'ZAR';
}

export interface RecurringEventConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDates?: string[];
  endDate?: string;
  occurrences?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: 'draft' | 'published' | 'unpublished';
}

// Ticket types for API
export interface CreateTicketRequest {
  eventId: string;
  name: string;
  type: 'Single' | 'Group';
  ticketKind?: 'SINGLE' | 'GROUP';
  groupSize?: number;
  attendeesPerUnit?: number;
  isFree: boolean;
  price?: number;
  quantityTotal: number;
  salesStart: string;
  salesEnd: string;
  minPerOrder: number;
  maxPerOrder: number;
  visibility: 'Public' | 'Hidden' | 'Invite Only';
  description?: string;
  perks?: Array<{ id: string; name: string }>;
  allowTransfer: boolean;
  allowResale: boolean;
  refundPolicy: 'Refundable' | 'Non-refundable';
  requireAttendeeInfo: boolean;
  color?: string;
  status?: 'Draft' | 'On Sale' | 'Sold Out' | 'Pause';
  sortOrder?: number;
}

export interface UpdateTicketRequest extends Partial<CreateTicketRequest> {}

// Checkout question types
export interface TicketQuestion {
  id: string;
  eventId?: string;
  label: string;
  type: 'text' | 'dropdown' | 'checkbox';
  required: boolean;
  description?: string;
  placeholder?: string;
  ticketIds: string[];
  ticketTypeIds?: string[];
  appliesToAll?: boolean;
  options?: string[];
  configJson?: Record<string, unknown>;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionRequest {
  label: string;
  type: 'text' | 'dropdown' | 'checkbox';
  required: boolean;
  ticketIds: string[];
  options?: string[];
  description?: string;
  placeholder?: string;
  sortOrder?: number;
}

// Ticket settings types
export interface TicketSettingsData {
  id?: string;
  eventId?: string;
  enableTransfers: boolean;
  enableResale: boolean;
  resaleCap?: number;
  refundPolicy: string;
  supportEmail?: string;
}

// Ticket order / checkout types
export interface CheckoutRequest {
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  items: Array<{ ticketId: string; quantity: number }>;
  attendees?: Array<{ ticketId: string; name: string; email: string; phone?: string }>;
  questionAnswers?: Array<{ questionId: string; questionLabel: string; answer: string }>;
}

export interface TicketOrderItem {
  ticketId: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
}

export interface TicketOrder {
  id: string;
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  items: TicketOrderItem[];
  createdAt: string;
}

export interface CheckoutAttendee {
  id: string;
  name: string;
  email: string;
  ticketName: string;
  orderReference: string;
  qrCode: string;
}

export interface CheckoutResponse {
  order: TicketOrder;
  attendees: CheckoutAttendee[];
  event: {
    name: string;
    date: string;
    time: string;
    venueLocation?: string;
  };
}

export interface PublicTicket {
  id: string;
  name: string;
  description?: string;
  type: 'Single' | 'Group';
  groupSize?: number;
  attendeesPerUnit?: number;
  isFree: boolean;
  price: number;
  available: number;
  quantityTotal: number;
  minPerOrder: number;
  maxPerOrder: number;
  perks?: Array<{ id: string; name: string }>;
  requireAttendeeInfo: boolean;
  checkoutQuestions?: TicketQuestion[];
}

export interface PublicTicketsResponse {
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    time: string;
    endDate?: string;
    endTime?: string;
    type: string;
    coverImageUrl?: string;
    venueLocation?: string;
    currency: string;
    summary?: string;
  };
  tickets: PublicTicket[];
  questions: TicketQuestion[];
}

export interface PublicTicketTypesEndpointResponse {
  event: {
    id: string;
    slug: string;
    title?: string;
    name?: string;
    summary?: string | null;
    currency?: string;
    startsAt?: string | null;
    endsAt?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    isOnline?: boolean;
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    description?: string | null;
    status?: string;
    ticketKind?: 'SINGLE' | 'GROUP';
    groupSize?: number | null;
    attendeesPerUnit?: number | null;
    priceMinor?: number;
    capacity?: number | null;
    soldCount?: number;
    minPerOrder?: number | null;
    maxPerOrder?: number | null;
    accessRulesJson?: Record<string, unknown> | null;
    checkoutQuestions?: TicketQuestion[];
  }>;
  ticketQuestions?: TicketQuestion[];
}

// File upload
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Generic mutation response
export interface MutationResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

// Backend-aligned event operations and conversion flow contracts

export type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export type BackendEventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type TicketTypeStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SOLD_OUT'
  | 'PAUSED'
  | 'CLOSED';

export type OrderStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'FULFILLED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REVERSED'
  | 'REFUNDED';

export type BackendFormType = 'REGISTRATION' | 'SURVEY' | 'CUSTOM';

export type BackendFormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type ProductType = 'PHYSICAL' | 'DIGITAL';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface EventSettings {
  id: string;
  eventId: string;
  modulesEnabledJson: Record<string, unknown> | null;
  brandingJson: Record<string, unknown> | null;
  websiteSettingsJson: Record<string, unknown> | null;
  ticketingSettingsJson: Record<string, unknown> | null;
  formSettingsJson: Record<string, unknown> | null;
  merchandisingJson: Record<string, unknown> | null;
  financeSettingsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendEventResponse {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  status: BackendEventStatus;
  visibility: Visibility;
  category: string | null;
  eventType: string | null;
  startsAt: string | null;
  endsAt: string | null;
  timezone: string;
  currency: CurrencyCode;
  venueName: string | null;
  venueAddress: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  websitePublished: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: TenantSummary;
  settings?: EventSettings | null;
}

export interface UpdateEventSettingsRequest {
  modulesEnabledJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
  websiteSettingsJson?: Record<string, unknown>;
  ticketingSettingsJson?: Record<string, unknown>;
  formSettingsJson?: Record<string, unknown>;
  merchandisingJson?: Record<string, unknown>;
  financeSettingsJson?: Record<string, unknown>;
}

export interface BackendTicketTypeResponse {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  status: TicketTypeStatus;
  visibility?: 'PUBLIC' | 'HIDDEN' | 'INVITE_ONLY';
  ticketKind?: 'SINGLE' | 'GROUP';
  groupSize?: number | null;
  attendeesPerUnit?: number | null;
  priceMinor: number;
  currency: CurrencyCode;
  capacity: number | null;
  soldCount: number;
  minPerOrder: number | null;
  maxPerOrder: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  accessRulesJson: Record<string, unknown> | null;
  customQuestionsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBackendTicketTypeRequest {
  name: string;
  description?: string;
  status?: TicketTypeStatus;
  visibility?: 'PUBLIC' | 'HIDDEN' | 'INVITE_ONLY';
  ticketKind?: 'SINGLE' | 'GROUP';
  groupSize?: number;
  priceMinor: number;
  capacity?: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  saleStartsAt?: string;
  saleEndsAt?: string;
  accessRulesJson?: Record<string, unknown>;
  customQuestionsJson?: Record<string, unknown>;
}

export interface AttendeeResponse {
  id: string;
  eventId: string;
  ticketTypeId: string | null;
  orderItemId: string | null;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'REVERSED';
  checkedInAt: string | null;
  badgeCode: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketOrderItemResponse {
  id: string;
  ticketOrderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
  attendeePayloadJson: Array<Record<string, unknown>> | null;
  createdAt: string;
  ticketType: BackendTicketTypeResponse;
  attendees: AttendeeResponse[];
}

export interface TicketOrderResponse {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  status: OrderStatus;
  email: string | null;
  currency: CurrencyCode;
  subtotalMinor: number;
  vatMinor: number;
  feeMinor: number;
  totalMinor: number;
  reservationExpiresAt: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  event?: BackendEventResponse;
  items: TicketOrderItemResponse[];
}

export interface CreateTicketOrderRequest {
  email: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    attendeePayloads?: Array<Record<string, unknown>>;
  }>;
  metadataJson?: Record<string, unknown>;
}

export interface InitializeCheckoutRequest {
  callbackUrl?: string;
  metadataJson?: Record<string, unknown>;
}

export interface InitializeCheckoutResponse {
  provider: 'paystack' | string;
  providerReference: string;
  authorizationUrl: string;
  accessCode?: string;
  paymentTransactionId: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: CurrencyCode;
  ticketOrderId: string;
  message?: string;
}

export interface BackendFormResponse {
  id: string;
  eventId: string;
  title: string;
  formType: BackendFormType;
  status: BackendFormStatus;
  schemaJson: Record<string, unknown>;
  logicJson: Record<string, unknown> | null;
  paymentConfigJson: Record<string, unknown> | null;
  scheduleJson: Record<string, unknown> | null;
  accessControlJson: Record<string, unknown> | null;
  brandingJson: Record<string, unknown> | null;
  responseCount?: number;
  responsesCount?: number;
  submissionCount?: number;
  submissionsCount?: number;
  totalSubmissions?: number;
  stats?: {
    totalSubmissions?: number;
  } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBackendFormRequest {
  title: string;
  formType: BackendFormType;
  schemaJson: Record<string, unknown>;
  logicJson?: Record<string, unknown>;
  paymentConfigJson?: Record<string, unknown>;
  scheduleJson?: Record<string, unknown>;
  accessControlJson?: Record<string, unknown>;
  brandingJson?: Record<string, unknown>;
}

export interface FormSubmissionResponse {
  id: string;
  formId: string;
  eventId: string;
  submittedByUserId: string | null;
  status: string;
  answersJson: Record<string, unknown>;
  scoringJson: Record<string, unknown> | null;
  paymentStatus: PaymentStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFormRequest {
  answersJson: Record<string, unknown>;
}

export interface ProductVariantResponse {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  priceMinor: number;
  inventoryCount: number | null;
  attributesJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: string;
  eventId: string;
  name: string;
  productType: ProductType;
  description: string | null;
  status: ProductStatus;
  basePriceMinor: number;
  currency: CurrencyCode;
  inventoryTracked: boolean;
  inventoryCount: number | null;
  imageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariantResponse[];
}

export interface CreateBackendProductRequest {
  name: string;
  productType: ProductType;
  description?: string;
  basePriceMinor: number;
  inventoryTracked?: boolean;
  inventoryCount?: number;
  imageUrl?: string;
  metadataJson?: Record<string, unknown>;
}

export interface FinanceSummaryBucket {
  grossCapturedMinor: number;
  netCapturedMinor: number;
  refundedMinor: number;
  queuedPayoutMinor: number;
  processingPayoutMinor: number;
  paidOutMinor: number;
  availableMinor: number;
}

export type FinanceSummaryResponse = Partial<Record<CurrencyCode, FinanceSummaryBucket>>;

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  eventId: string | null;
  ticketOrderId: string | null;
  merchOrderId: string | null;
  provider: string;
  providerReference: string;
  transactionType:
    | 'TICKET_ORDER'
    | 'MERCH_ORDER'
    | 'FORM_PAYMENT'
    | 'PAYOUT_REVERSAL'
    | 'ADJUSTMENT';
  status: PaymentStatus;
  currency: CurrencyCode;
  amountMinor: number;
  platformFeeMinor: number;
  gatewayFeeMinor: number;
  netAmountMinor: number;
  metadataJson: Record<string, unknown> | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  userId: string | null;
  email: string | null;
  phone: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  notification: {
    id: string;
    tenantId: string;
    eventId: string | null;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK';
    templateKey: string;
    payloadJson: Record<string, unknown>;
    status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
    scheduledFor: string | null;
    sentAt: string | null;
    createdAt: string;
  };
}

export interface WebsitePageResponse {
  id: string;
  eventId: string;
  pageKey: string;
  title: string;
  sectionsJson: Record<string, unknown>;
  seoJson: Record<string, unknown> | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsitePageRequest {
  pageKey: string;
  title: string;
  sectionsJson: Record<string, unknown>;
  seoJson?: Record<string, unknown>;
  isPublished?: boolean;
}

export interface PublishedWebsiteOverviewResponse {
  event: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    description: string | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
    startsAt: string | null;
    endsAt: string | null;
    timezone: string;
    venueName: string | null;
    venueAddress: string | null;
    isOnline: boolean;
    onlineUrl: string | null;
  };
  websiteSettings: Record<string, unknown> | null;
  branding: Record<string, unknown> | null;
  pages: Array<{
    pageKey: string;
    title: string;
  }>;
}

export interface PublishedWebsitePageResponse {
  event: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    coverImageUrl: string | null;
    logoUrl: string | null;
  };
  page: {
    id: string;
    pageKey: string;
    title: string;
    sectionsJson: Record<string, unknown>;
    seoJson: Record<string, unknown> | null;
  };
}

export interface PublicWebsiteViewRequest {
  pageKey: string;
  sessionId: string;
  path: string;
}
