// Settings service — only calls settings-related endpoints that exist today.
import { config } from '../config';
import { unwrap } from '../helpers/auth.helpers';
import { apiClient } from '../lib/api-client';
import { ApiResponse, TenantSummary, User } from '../types/api';
import {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  NotificationSettings,
  ActiveSession,
  SecuritySettings,
  ExportRequest,
  ExportRecord,
} from '../types/settings';
import {
  getMockOrganizations,
  getMockOrganization,
  addMockOrganization,
  updateMockOrganization,
  deleteMockOrganization,
  getMockNotificationSettings,
  updateMockNotificationSettings,
  getMockSessions,
  getMockSecuritySettings,
  updateMockSecuritySettings,
  getMockExports,
  addMockExport,
  getMockEventsForExport,
  delay,
} from './mock/settings-data';

type ApiEnvelope<T> = ApiResponse<T> | T;
type TwoFactorChannel = 'EMAIL' | 'PHONE';

type TwoFactorSettingsResponse = {
  enabled: boolean;
  channel: TwoFactorChannel | null;
};

type TenantResponse = TenantSummary & {
  members?: unknown[];
  eventsCount?: number;
};

const COMING_SOON_MESSAGE = 'This settings action needs a backend endpoint before it can be saved.';
const NOTIFICATION_SETTINGS_KEY = 'munar_notification_settings_draft';

function activeTenantId(): string | null {
  return localStorage.getItem(config.auth.activeTenantKey);
}

function tenantToOrganization(tenant: TenantSummary | TenantResponse): Organization {
  const branding = tenant.brandingJson ?? {};
  const settings = tenant.settingsJson ?? {};

  return {
    id: tenant.id,
    name: tenant.name,
    type: tenant.tenantType === 'INDIVIDUAL' ? 'individual' : 'organization',
    logoUrl: typeof branding.logoUrl === 'string' ? branding.logoUrl : undefined,
    country: typeof settings.country === 'string' ? settings.country : undefined,
    website: typeof settings.website === 'string' ? settings.website : undefined,
    businessAddress: typeof settings.businessAddress === 'string' ? settings.businessAddress : undefined,
    primaryColor: typeof branding.primaryColor === 'string' ? branding.primaryColor : '#6366F1',
    secondaryColor: typeof branding.secondaryColor === 'string' ? branding.secondaryColor : '#8B5CF6',
    defaultEmailSenderName: typeof settings.defaultEmailSenderName === 'string' ? settings.defaultEmailSenderName : tenant.name,
    eventsCount: typeof (tenant as TenantResponse).eventsCount === 'number' ? (tenant as TenantResponse).eventsCount! : 0,
    createdAt: tenant.createdAt ?? new Date().toISOString(),
    updatedAt: tenant.updatedAt ?? tenant.createdAt ?? new Date().toISOString(),
  };
}

function organizationToTenantPayload(data: UpdateOrganizationRequest, existing?: TenantResponse) {
  const brandingJson: Record<string, unknown> = { ...(existing?.brandingJson ?? {}) };
  const settingsJson: Record<string, unknown> = { ...(existing?.settingsJson ?? {}) };
  const hasBrandingUpdate = data.logoUrl !== undefined || data.primaryColor !== undefined || data.secondaryColor !== undefined;
  const hasSettingsUpdate = data.country !== undefined || data.website !== undefined || data.businessAddress !== undefined || data.defaultEmailSenderName !== undefined;

  if (data.logoUrl !== undefined) brandingJson.logoUrl = data.logoUrl;
  if (data.primaryColor !== undefined) brandingJson.primaryColor = data.primaryColor;
  if (data.secondaryColor !== undefined) brandingJson.secondaryColor = data.secondaryColor;
  if (data.country !== undefined) settingsJson.country = data.country;
  if (data.website !== undefined) settingsJson.website = data.website;
  if (data.businessAddress !== undefined) settingsJson.businessAddress = data.businessAddress;
  if (data.defaultEmailSenderName !== undefined) settingsJson.defaultEmailSenderName = data.defaultEmailSenderName;

  return {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(hasBrandingUpdate ? { brandingJson } : {}),
    ...(hasSettingsUpdate ? { settingsJson } : {}),
  };
}

// ─── Organizations ───────────────────────────────────────────────────────────

export async function getOrganizations(): Promise<Organization[]> {
  if (config.features.useMockData) {
    await delay(400);
    return getMockOrganizations();
  }

  const user = unwrap(await apiClient.get<ApiEnvelope<User>>('/auth/me'));
  const memberships = user.memberships ?? [];
  const selectedTenantId = activeTenantId() ?? memberships[0]?.tenant.id;

  if (!selectedTenantId) {
    return [];
  }

  const tenant = unwrap(await apiClient.get<ApiEnvelope<TenantResponse>>(`/tenants/${selectedTenantId}`));
  return [tenantToOrganization(tenant)];
}

export async function getOrganization(id: string): Promise<Organization> {
  if (config.features.useMockData) {
    await delay(300);
    const org = getMockOrganization(id);
    if (!org) throw new Error('Organization not found');
    return org;
  }

  const tenant = unwrap(await apiClient.get<ApiEnvelope<TenantResponse>>(`/tenants/${id}`));
  return tenantToOrganization(tenant);
}

export async function createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
  if (config.features.useMockData) {
    await delay(500);
    return addMockOrganization({
      ...data,
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
    });
  }

  throw new Error('Organization creation is not available from Settings yet. Use onboarding to create a workspace.');
}

export async function updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
  if (config.features.useMockData) {
    await delay(400);
    const updated = updateMockOrganization(id, data);
    if (!updated) throw new Error('Organization not found');
    return updated;
  }

  const existing = unwrap(await apiClient.get<ApiEnvelope<TenantResponse>>(`/tenants/${id}`));
  const tenant = unwrap(
    await apiClient.patch<ApiEnvelope<TenantResponse>>(`/tenants/${id}`, organizationToTenantPayload(data, existing)),
  );
  return tenantToOrganization(tenant);
}

export async function deleteOrganization(id: string): Promise<void> {
  if (config.features.useMockData) {
    await delay(400);
    deleteMockOrganization(id);
    return;
  }

  throw new Error('Organization deletion is not available from Settings yet.');
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotificationSettings(): Promise<NotificationSettings> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockNotificationSettings();
  }

  const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return saved ? JSON.parse(saved) as NotificationSettings : getMockNotificationSettings();
}

export async function saveNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
  if (config.features.useMockData) {
    await delay(400);
    return updateMockNotificationSettings(data);
  }

  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(data));
  throw new Error('Notification preference saving needs GET/PUT /settings/notifications on the backend.');
}

// ─── Security ────────────────────────────────────────────────────────────────

export async function getActiveSessions(): Promise<ActiveSession[]> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockSessions();
  }

  return [];
}

export async function revokeSession(_sessionId: string): Promise<void> {
  throw new Error(COMING_SOON_MESSAGE);
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  if (config.features.useMockData) {
    await delay(200);
    return getMockSecuritySettings();
  }

  const twoFactor = unwrap(
    await apiClient.get<ApiEnvelope<TwoFactorSettingsResponse>>('/auth/2fa-settings'),
  );

  return {
    loginAlerts: true,
    twoFactorEnabled: twoFactor.enabled,
    twoFactorChannel: twoFactor.channel,
  };
}

export async function saveSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
  if (config.features.useMockData) {
    await delay(300);
    return updateMockSecuritySettings(data);
  }

  if (data.twoFactorEnabled === undefined) {
    throw new Error('Login alert saving needs PATCH /settings/security/login-alerts on the backend.');
  }

  const twoFactor = unwrap(
    await apiClient.patch<ApiEnvelope<TwoFactorSettingsResponse>>('/auth/2fa-settings', {
      enabled: data.twoFactorEnabled,
      channel: data.twoFactorChannel ?? 'EMAIL',
    }),
  );

  return {
    loginAlerts: data.loginAlerts ?? true,
    twoFactorEnabled: twoFactor.enabled,
    twoFactorChannel: twoFactor.channel,
  };
}

// ─── Data & Exports ──────────────────────────────────────────────────────────

export async function getEventsForExport(): Promise<{ id: string; name: string }[]> {
  if (config.features.useMockData) {
    await delay(200);
    return getMockEventsForExport();
  }

  const tenantId = activeTenantId();
  if (!tenantId) return [];

  const response = await apiClient.get<ApiEnvelope<Array<{ id: string; name: string }>>>(`/tenants/${tenantId}/events`);
  const events = unwrap(response);
  return events.map(event => ({ id: event.id, name: event.name }));
}

export async function requestExport(data: ExportRequest): Promise<ExportRecord> {
  if (config.features.useMockData) {
    await delay(800);
    const events = getMockEventsForExport();
    const event = events.find(e => e.id === data.eventId);
    return addMockExport({
      eventId: data.eventId,
      eventName: event?.name || 'Unknown Event',
      exportType: data.exportType,
      format: data.format,
      status: 'completed',
      fileUrl: '#',
      rowCount: Math.floor(Math.random() * 2000) + 100,
      fileSizeBytes: Math.floor(Math.random() * 500_000) + 50_000,
    });
  }

  throw new Error('Data export generation needs the backend data export endpoint before it can run.');
}

export async function getExportHistory(): Promise<ExportRecord[]> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockExports();
  }

  return [];
}

// ─── Account Deletion ────────────────────────────────────────────────────────

export async function deleteAccount(): Promise<void> {
  throw new Error('Account deletion needs the backend account deletion flow before it can run.');
}
