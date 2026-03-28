import { config } from "../config";
import { ApiError, ApiException, ApiResponse } from "../types/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  skipAuthRefresh?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.defaultTimeout = config.api.timeout;
  }

  // Get auth token from storage
  private getAuthToken(): string | null {
    return localStorage.getItem(config.auth.tokenKey);
  }

  // Build URL with query params
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Build headers with auth token
  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...customHeaders,
    });

    const token = this.getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  // Handle response
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle no content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      let error: ApiError;

      if (isJson) {
        const errorData = await response.json();
        error = {
          code: errorData.code || "UNKNOWN_ERROR",
          message: errorData.message || "An unexpected error occurred",
          details: errorData.details,
          statusCode: response.status,
          error: errorData.error,
          timestamp: errorData.timestamp,
          path: errorData.path,
          requestId: errorData.requestId,
        };
      } else {
        error = {
          code: "NETWORK_ERROR",
          message: response.statusText || "Network error occurred",
          statusCode: response.status,
        };
      }

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401) {
        // Don't try to refresh if this IS the refresh request
        if (!isJson) {
          error = {
            code: "UNAUTHORIZED",
            message: response.statusText || "Unauthorized",
            statusCode: response.status,
          };
        }
        throw new ApiException(error, response.status);
      }

      throw new ApiException(error, response.status);
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // Refresh the access token using the stored refresh token
  private async tryRefreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
    if (!refreshToken) return false;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const result = await response.json();
        const data = result.data || result;

        if (data.accessToken) {
          localStorage.setItem(config.auth.tokenKey, data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem(
              config.auth.refreshTokenKey,
              data.refreshToken,
            );
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Force logout - clear tokens and dispatch event
  private forceLogout(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
    localStorage.removeItem(config.auth.activeTenantKey);
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  // Make request with timeout
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    requestConfig?: RequestConfig,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = requestConfig?.timeout || this.defaultTimeout;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = this.buildUrl(endpoint, requestConfig?.params);
      const headers = this.buildHeaders(requestConfig?.headers);

      const fetchConfig: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && method !== "GET") {
        fetchConfig.body = JSON.stringify(data);
      }

      const response = await fetch(url, fetchConfig);
      return this.handleResponse<T>(response);
    } catch (error) {
      // If 401 and not already a refresh-skip request, try refreshing
      if (
        error instanceof ApiException &&
        error.statusCode === 401 &&
        !requestConfig?.skipAuthRefresh &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/login")
      ) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry the original request with the new token
          clearTimeout(timeoutId);
          return this.request<T>(method, endpoint, data, {
            ...requestConfig,
            skipAuthRefresh: true,
          });
        } else {
          // Refresh failed, force logout
          this.forceLogout();
          throw error;
        }
      }

      if (error instanceof ApiException) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiException({
            code: "TIMEOUT",
            message: "Request timed out",
            statusCode: 408,
          });
        }

        throw new ApiException({
          code: "NETWORK_ERROR",
          message: error.message || "Network error occurred",
          statusCode: 0,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Public methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, config);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, config);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, config);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, config);
  }

  // File upload method
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
