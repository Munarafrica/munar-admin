import { config } from "../config";
import { ApiEnvelope, normalizeUser, unwrap } from "../helpers/auth.helpers";
import { apiClient } from "../lib/api-client";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  MessageResponse,
  MutationResponse,
  SignUpRequest,
  User,
} from "../types/api";
import { delay, mockUsers } from "./mock/data";

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (config.features.useMockData) {
      await delay(500);
      const user = normalizeUser(mockUsers[0]);
      const response: AuthResponse = {
        user,
        accessToken: `mock-access-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
      };

      this.setAuthData(response);
      return response;
    }

    const response = unwrap(
      await apiClient.post<ApiEnvelope<AuthResponse>>(
        "/auth/login",
        credentials,
        {
          skipAuthRefresh: true,
        },
      ),
    );

    this.setAuthData(response);
    return response;
  }

  async signUp(data: SignUpRequest): Promise<MessageResponse> {
    if (config.features.useMockData) {
      await delay(700);
      return {
        message:
          "Registration successful. Please verify your email before logging in.",
      };
    }

    const response = unwrap(
      await apiClient.post<ApiEnvelope<MessageResponse>>("/auth/register", data, {
        skipAuthRefresh: true,
      }),
    );

    return response;
  }

  async verifyEmail(token: string): Promise<MessageResponse> {
    if (config.features.useMockData) {
      await delay(400);
      return { message: "Email verified successfully" };
    }

    return unwrap(
      await apiClient.post<ApiEnvelope<MessageResponse>>(
        "/auth/verify-email",
        { token },
        { skipAuthRefresh: true },
      ),
    );
  }

  async resendVerificationEmail(email: string): Promise<MessageResponse> {
    if (config.features.useMockData) {
      await delay(400);
      return {
        message:
          "If an account exists for that email, a verification email has been sent.",
      };
    }

    return unwrap(
      await apiClient.post<ApiEnvelope<MessageResponse>>(
        "/auth/resend-verification-email",
        { email },
        { skipAuthRefresh: true },
      ),
    );
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);

    if (config.features.useMockData) {
      await delay(200);
      this.clearAuthData();
      return;
    }

    try {
      if (refreshToken) {
        await apiClient.post(
          "/auth/logout",
          { refreshToken },
          { skipAuthRefresh: true },
        );
      }
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (!token) {
      return null;
    }

    if (config.features.useMockData) {
      await delay(200);
      const cachedUser = localStorage.getItem(config.auth.userKey);
      return cachedUser
        ? normalizeUser(JSON.parse(cachedUser) as User)
        : normalizeUser(mockUsers[0]);
    }

    try {
      const response = unwrap(
        await apiClient.get<ApiEnvelope<User>>("/auth/me"),
      );
      const user = normalizeUser(response);
      localStorage.setItem(config.auth.userKey, JSON.stringify(user));
      return user;
    } catch {
      this.clearAuthData();
      return null;
    }
  }

  async requestPasswordReset(email: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);
      return {
        success: true,
        message:
          "If an account exists for that email, a password reset link has been sent.",
      };
    }

    const response = unwrap(
      await apiClient.post<ApiEnvelope<{ message: string }>>(
        "/auth/forgot-password",
        { email },
        { skipAuthRefresh: true },
      ),
    );

    return {
      success: true,
      message: response.message,
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);
      return {
        success: true,
        message: "Password reset successfully",
      };
    }

    const response = unwrap(
      await apiClient.post<ApiEnvelope<{ message: string }>>(
        "/auth/reset-password",
        { token, newPassword },
        { skipAuthRefresh: true },
      ),
    );

    return {
      success: true,
      message: response.message,
    };
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    if (config.features.useMockData) {
      await delay(200);
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const response: AuthResponse = {
        user,
        accessToken: `mock-access-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
      };

      this.setAuthData(response);
      return response;
    }

    const response = unwrap(
      await apiClient.post<ApiEnvelope<AuthResponse>>(
        "/auth/refresh",
        { refreshToken },
        { skipAuthRefresh: true },
      ),
    );

    this.setAuthData(response);
    return response;
  }

  private setAuthData(auth: AuthResponse): void {
    localStorage.setItem(config.auth.tokenKey, auth.accessToken);
    localStorage.setItem(config.auth.refreshTokenKey, auth.refreshToken);
    localStorage.setItem(
      config.auth.userKey,
      JSON.stringify(normalizeUser(auth.user)),
    );
  }

  clearAuthData(): void {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.userKey);
    localStorage.removeItem(config.auth.activeTenantKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(config.auth.tokenKey);
  }
}

export const authService = new AuthService();
