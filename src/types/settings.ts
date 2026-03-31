// Settings module types

// ─── Settings Tab IDs ────────────────────────────────────────────────────────
export type SettingsTab =
  | 'account'
  | 'organizations'
  | 'notifications'
  | 'security'
  | 'data-exports'
  | 'appearance';

// ─── Organization ────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  type: 'individual' | 'organization';
  logoUrl?: string;
  country?: string;
  website?: string;
  businessAddress?: string;
  primaryColor: string;
  secondaryColor: string;
  defaultEmailSenderName?: string;
  eventsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: 'individual' | 'organization';
  logoUrl?: string;
  country?: string;
  website?: string;
  businessAddress?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  logoUrl?: string;
  country?: string;
  website?: string;
  businessAddress?: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultEmailSenderName?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'ticket_sold'
  | 'new_attendee'
  | 'event_published'
  | 'refund_processed'
  | 'payout_completed'
  | 'event_reminder'
  | 'product_updates'
  | 'marketing_tips';

export type DigestFrequency = 'instant' | 'daily' | 'weekly';

export interface NotificationPreference {
  type: NotificationType;
  label: string;
  description: string;
  emailEnabled: boolean;
}

export interface NotificationSettings {
  preferences: NotificationPreference[];
  digestFrequency: DigestFrequency;
}

// ─── Security ────────────────────────────────────────────────────────────────
export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  loginAlerts: boolean;
  twoFactorEnabled: boolean;
}

// ─── Data & Exports ──────────────────────────────────────────────────────────
export type ExportType =
  | 'attendees'
  | 'ticket_sales'
  | 'financial_report'
  | 'checkin_records';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportRequest {
  eventId: string;
  exportType: ExportType;
  format: ExportFormat;
}

export interface ExportRecord {
  id: string;
  eventId: string;
  eventName: string;
  exportType: ExportType;
  format: ExportFormat;
  status: 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  createdAt: string;
  rowCount?: number;
  fileSizeBytes?: number;
}

// ─── Appearance ──────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
