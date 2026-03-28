import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { ApiResponse, CreateTenantRequest, CreateTenantResponse } from '../types/api';

type ApiEnvelope<T> = ApiResponse<T> | T;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

class TenantService {
  async createTenant(data: CreateTenantRequest): Promise<CreateTenantResponse> {
    const response = unwrap(
      await apiClient.post<ApiEnvelope<CreateTenantResponse>>('/tenants', data)
    );

    localStorage.setItem(config.auth.activeTenantKey, response.id);
    return response;
  }
}

export const tenantService = new TenantService();
