// Mock data for settings module
import {
  Organization,
  NotificationSettings,
  ActiveSession,
  SecuritySettings,
  ExportRecord,
} from '../../types/settings';

// ─── Delay helper ────────────────────────────────────────────────────────────
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Organization mock data ─────────────────────────────────────────────────
let mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Tech Summit Africa',
    type: 'organization',
    logoUrl: undefined,
    country: 'Nigeria',
    website: 'https://techsummitafrica.com',
    businessAddress: '15 Admiralty Way, Lekki Phase 1, Lagos',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    defaultEmailSenderName: 'Tech Summit Africa',
    eventsCount: 5,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-10T14:30:00Z',
  },
  {
    id: 'org-2',
    name: 'Lagos Dev Conference',
    type: 'organization',
    logoUrl: undefined,
    country: 'Nigeria',
    website: 'https://lagosdevconf.io',
    businessAddress: '22 Broad Street, Lagos Island, Lagos',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    defaultEmailSenderName: 'Lagos Dev Conference',
    eventsCount: 3,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 'org-3',
    name: 'Fintech Expo',
    type: 'individual',
    logoUrl: undefined,
    country: 'Ghana',
    website: 'https://fintechexpo.africa',
    businessAddress: '5 Independence Ave, Accra',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    defaultEmailSenderName: 'Fintech Expo',
    eventsCount: 1,
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-12T08:00:00Z',
  },
];

export function getMockOrganizations(): Organization[] {
  return [...mockOrganizations];
}

export function getMockOrganization(id: string): Organization | undefined {
  return mockOrganizations.find(o => o.id === id);
}

export function addMockOrganization(org: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'eventsCount'>): Organization {
  const newOrg: Organization = {
    ...org,
    id: `org-${Date.now()}`,
    eventsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockOrganizations = [...mockOrganizations, newOrg];
  return newOrg;
}

export function updateMockOrganization(id: string, data: Partial<Organization>): Organization | undefined {
  const idx = mockOrganizations.findIndex(o => o.id === id);
  if (idx === -1) return undefined;
  mockOrganizations[idx] = { ...mockOrganizations[idx], ...data, updatedAt: new Date().toISOString() };
  return mockOrganizations[idx];
}

export function deleteMockOrganization(id: string): boolean {
  const len = mockOrganizations.length;
  mockOrganizations = mockOrganizations.filter(o => o.id !== id);
  return mockOrganizations.length < len;
}

// ─── Notification mock data ─────────────────────────────────────────────────
let mockNotificationSettings: NotificationSettings = {
  preferences: [
    { type: 'ticket_sold', label: 'Ticket Sold', description: 'When a ticket is purchased for your event', emailEnabled: true },
    { type: 'new_attendee', label: 'New Attendee Registered', description: 'When someone registers for your event', emailEnabled: true },
    { type: 'event_published', label: 'Event Published', description: 'Confirmation when your event goes live', emailEnabled: true },
    { type: 'refund_processed', label: 'Refund Processed', description: 'When a ticket refund is completed', emailEnabled: true },
    { type: 'payout_completed', label: 'Payout Completed', description: 'When funds are transferred to your account', emailEnabled: true },
    { type: 'event_reminder', label: 'Event Reminder', description: 'Reminders before your event starts', emailEnabled: false },
    { type: 'product_updates', label: 'Munar Product Updates', description: 'New features and platform improvements', emailEnabled: false },
    { type: 'marketing_tips', label: 'Marketing Tips', description: 'Tips to promote your events effectively', emailEnabled: false },
  ],
  digestFrequency: 'instant',
};

export function getMockNotificationSettings(): NotificationSettings {
  return JSON.parse(JSON.stringify(mockNotificationSettings));
}

export function updateMockNotificationSettings(update: Partial<NotificationSettings>): NotificationSettings {
  mockNotificationSettings = { ...mockNotificationSettings, ...update };
  if (update.preferences) {
    mockNotificationSettings.preferences = update.preferences;
  }
  return getMockNotificationSettings();
}

// ─── Security mock data ─────────────────────────────────────────────────────
const mockSessions: ActiveSession[] = [
  {
    id: 'session-1',
    device: 'Windows PC',
    browser: 'Chrome 122',
    location: 'Lagos, Nigeria',
    ipAddress: '102.89.xx.xx',
    lastActive: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isCurrent: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    location: 'Lagos, Nigeria',
    ipAddress: '102.89.xx.xx',
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
  {
    id: 'session-3',
    device: 'MacBook Pro',
    browser: 'Firefox 124',
    location: 'Accra, Ghana',
    ipAddress: '154.160.xx.xx',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
];

let mockSecuritySettings: SecuritySettings = {
  loginAlerts: true,
  twoFactorEnabled: false,
};

export function getMockSessions(): ActiveSession[] {
  return [...mockSessions];
}

export function getMockSecuritySettings(): SecuritySettings {
  return { ...mockSecuritySettings };
}

export function updateMockSecuritySettings(update: Partial<SecuritySettings>): SecuritySettings {
  mockSecuritySettings = { ...mockSecuritySettings, ...update };
  return getMockSecuritySettings();
}

// ─── Export mock data ────────────────────────────────────────────────────────
let mockExports: ExportRecord[] = [
  {
    id: 'exp-1',
    eventId: 'evt-1',
    eventName: 'Tech Summit 2026',
    exportType: 'attendees',
    format: 'csv',
    status: 'completed',
    fileUrl: '#',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rowCount: 1243,
    fileSizeBytes: 156_000,
  },
  {
    id: 'exp-2',
    eventId: 'evt-1',
    eventName: 'Tech Summit 2026',
    exportType: 'ticket_sales',
    format: 'xlsx',
    status: 'completed',
    fileUrl: '#',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    rowCount: 890,
    fileSizeBytes: 234_000,
  },
  {
    id: 'exp-3',
    eventId: 'evt-2',
    eventName: 'Lagos Dev Conference',
    exportType: 'financial_report',
    format: 'xlsx',
    status: 'completed',
    fileUrl: '#',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    rowCount: 156,
    fileSizeBytes: 89_000,
  },
];

export function getMockExports(): ExportRecord[] {
  return [...mockExports];
}

export function addMockExport(record: Omit<ExportRecord, 'id' | 'createdAt'>): ExportRecord {
  const newExport: ExportRecord = {
    ...record,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  mockExports = [newExport, ...mockExports];
  return newExport;
}

// ─── Mock events for export selector ─────────────────────────────────────────
export function getMockEventsForExport(): { id: string; name: string }[] {
  return [
    { id: 'evt-1', name: 'Tech Summit 2026' },
    { id: 'evt-2', name: 'Lagos Dev Conference' },
    { id: 'evt-3', name: 'Fintech Expo' },
  ];
}
