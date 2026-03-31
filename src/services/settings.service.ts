// Settings service — manages organizations, notifications, security, and exports
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { ApiResponse } from '../types/api';
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

// ─── Organizations ───────────────────────────────────────────────────────────

export async function getOrganizations(): Promise<Organization[]> {
  if (config.features.useMockData) {
    await delay(400);
    return getMockOrganizations();
  }
  const res = await apiClient.get<ApiResponse<Organization[]>>('/organizations');
  return res.data;
}

export async function getOrganization(id: string): Promise<Organization> {
  if (config.features.useMockData) {
    await delay(300);
    const org = getMockOrganization(id);
    if (!org) throw new Error('Organization not found');
    return org;
  }
  const res = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`);
  return res.data;
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
  const res = await apiClient.post<ApiResponse<Organization>>('/organizations', data);
  return res.data;
}

export async function updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
  if (config.features.useMockData) {
    await delay(400);
    const updated = updateMockOrganization(id, data);
    if (!updated) throw new Error('Organization not found');
    return updated;
  }
  const res = await apiClient.patch<ApiResponse<Organization>>(`/organizations/${id}`, data);
  return res.data;
}

export async function deleteOrganization(id: string): Promise<void> {
  if (config.features.useMockData) {
    await delay(400);
    deleteMockOrganization(id);
    return;
  }
  await apiClient.delete(`/organizations/${id}`);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotificationSettings(): Promise<NotificationSettings> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockNotificationSettings();
  }
  const res = await apiClient.get<ApiResponse<NotificationSettings>>('/settings/notifications');
  return res.data;
}

export async function saveNotificationSettings(data: NotificationSettings): Promise<NotificationSettings> {
  if (config.features.useMockData) {
    await delay(400);
    return updateMockNotificationSettings(data);
  }
  const res = await apiClient.put<ApiResponse<NotificationSettings>>('/settings/notifications', data);
  return res.data;
}

// ─── Security ────────────────────────────────────────────────────────────────

export async function getActiveSessions(): Promise<ActiveSession[]> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockSessions();
  }
  const res = await apiClient.get<ApiResponse<ActiveSession[]>>('/settings/security/sessions');
  return res.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  if (config.features.useMockData) {
    await delay(400);
    return;
  }
  await apiClient.delete(`/settings/security/sessions/${sessionId}`);
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  if (config.features.useMockData) {
    await delay(200);
    return getMockSecuritySettings();
  }
  const res = await apiClient.get<ApiResponse<SecuritySettings>>('/settings/security');
  return res.data;
}

export async function saveSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
  if (config.features.useMockData) {
    await delay(300);
    return updateMockSecuritySettings(data);
  }
  const res = await apiClient.put<ApiResponse<SecuritySettings>>('/settings/security', data);
  return res.data;
}

// ─── Data & Exports ──────────────────────────────────────────────────────────

export async function getEventsForExport(): Promise<{ id: string; name: string }[]> {
  if (config.features.useMockData) {
    await delay(200);
    return getMockEventsForExport();
  }
  const res = await apiClient.get<ApiResponse<{ id: string; name: string }[]>>('/settings/exports/events');
  return res.data;
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
  const res = await apiClient.post<ApiResponse<ExportRecord>>('/settings/exports', data);
  return res.data;
}

export async function getExportHistory(): Promise<ExportRecord[]> {
  if (config.features.useMockData) {
    await delay(300);
    return getMockExports();
  }
  const res = await apiClient.get<ApiResponse<ExportRecord[]>>('/settings/exports');
  return res.data;
}

// ─── Account Deletion ────────────────────────────────────────────────────────

export async function deleteAccount(): Promise<void> {
  if (config.features.useMockData) {
    await delay(1000);
    return;
  }
  await apiClient.delete('/account');
}
