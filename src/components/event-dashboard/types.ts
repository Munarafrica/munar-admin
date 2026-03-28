export type EventPhase = 'setup' | 'live' | 'post-event';
export type EventStatus = 'draft' | 'published' | 'unpublished';
export type Page = 'dashboard' | 'event-dashboard' | 'tickets' | 'program' | 'forms';

export interface Metric {
  id: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  context: EventPhase;
}

export interface ChecklistItem {
  id: string;
  label: string;
  status: 'not-started' | 'in-progress' | 'completed';
  actionLabel: string;
  phase: EventPhase;
  count?: number;
}

export type ModuleCategory = 'Core' | 'Growth' | 'Operations';

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  status: 'active' | 'not-started';
  actionLabel: string;
  category?: ModuleCategory;
  iconColor?: string;
  count?: number;
}

export type ActivityType = 'ticket' | 'check-in' | 'vote' | 'merch' | 'form' | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string; // ISO string
  isHighPriority: boolean;
  module?: string; // module name
  icon?: string; // optional icon name
}

export interface EventData {
  id: string;
  name: string;
  /** URL-safe event slug for routing (e.g., 'lagos-tech-summit-2026') */
  slug: string;
  description?: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  type: 'Physical' | 'Virtual' | 'Hybrid';
  websiteUrl: string;
  coverImageUrl?: string;
  country?: string;
  venueLocation?: string;
  categories?: string[];
  currency?: 'NGN' | 'GHS' | 'ZAR';
  status: EventStatus;
  phase: EventPhase;

  // ─── Modular Architecture Fields ────────────────────────────────────
  /** Enabled modules and their configuration */
  enabledModules?: import('../../types/modules').ModuleConfig[];
  /** Event branding inherited by all modules */
  branding?: import('../../types/modules').EventBranding;
  /** Unified event wallet for all module transactions */
  wallet?: import('../../types/modules').EventWallet;
  /** Owner user ID */
  ownerId?: string;
  /** Event creation timestamp */
  createdAt?: string;
}

// --- Ticket Management Types ---

export type TicketStatus = 'Draft' | 'On Sale' | 'Sold Out' | 'Hidden';
export type TicketTypeType = 'Single' | 'Group';
export type TicketVisibility = 'Public' | 'Hidden' | 'Invite Only';

export interface Perk {
  id: string;
  name: string;
}

export interface TicketType {
  eventId?: string;
  id: string;
  name: string;
  type: TicketTypeType;
  groupSize?: number; // Only for Group tickets
  isFree: boolean;
  price?: number;
  quantitySold: number;
  quantityTotal: number;
  quantityUnlimited?: boolean;
  status: TicketStatus;
  salesStart: string; // ISO string
  salesEnd: string; // ISO string
  minPerOrder: number;
  maxPerOrder: number;
  visibility: TicketVisibility;
  description?: string;
  perks?: Perk[];
  // Advanced options
  allowTransfer: boolean;
  allowResale: boolean;
  transferFeesToGuest?: boolean;
  refundPolicy: 'Refundable' | 'Non-refundable';
  requireAttendeeInfo: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticketTypeId: string;
  ticketTypeName: string;
  purchaseDate: string;
  status: 'Confirmed' | 'Checked In' | 'Cancelled' | 'Pending';
  checkedIn: boolean;
  checkedInAt?: string | null;
  orderReference?: string;
  qrCode?: string;
  questionAnswers?: Array<{ questionId: string; questionLabel: string; answer: string }>;
  metadata?: any;
}

// --- Speakers & Schedule Types ---

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization?: string;
  bio: string;
  imageUrl?: string;
  email?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  categories: string[]; // e.g., 'Keynote', 'Panelist'
  isFeatured: boolean;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  track?: string; // e.g., 'Main Stage', 'Workshop Room A'
  trackColor?: string; // hex code
  speakerIds: string[];
  capacity?: number;
}

// --- Forms & Surveys Types ---

export type FormType = 'registration' | 'survey' | 'feedback' | 'custom';
export type FormStatus = 'draft' | 'published' | 'closed' | 'scheduled';
export type FormFieldType = 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'rating' | 'file';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[]; // For choice fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormSettings {
  isPaid: boolean;
  price?: number;
  currency?: string;
  allowAnonymous: boolean;
  oneResponsePerUser: boolean;
  closeDate?: string;
  confirmationMessage?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  type: FormType;
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentName?: string;
  respondentEmail?: string;
  submittedAt: string;
  answers: Record<string, any>; // fieldId -> value
  status: 'completed' | 'partial';
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'n/a';
}

// --- Custom DP Maker Types ---

export type PlaceholderShape = 'circle' | 'square' | 'rounded-square' | 'hexagon' | 'star' | 'heart';
export type TextAlignment = 'left' | 'center' | 'right';

export interface PhotoPlaceholder {
  x: number; // Position from left (percentage or pixels)
  y: number; // Position from top
  width: number;
  height: number;
  shape: PlaceholderShape;
  rotation: number; // degrees
}

export interface TextPlaceholder {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: TextAlignment;
  maxWidth?: number;
}

export interface DPFrame {
  id: string;
  eventId: string;
  name: string;
  frameImageUrl: string; // Uploaded frame/banner
  frameWidth: number; // Canvas dimensions
  frameHeight: number;
  photoPlaceholder?: PhotoPlaceholder;
  textPlaceholder?: TextPlaceholder;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  generationCount?: number; // Analytics
  shareCount?: number;
}

export interface GeneratedDP {
  id: string;
  frameId: string;
  attendeeName: string;
  attendeePhotoUrl?: string;
  generatedImageUrl?: string;
  createdAt: string;
}