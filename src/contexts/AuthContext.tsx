import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { config } from '../config';
import { authService, tenantService } from '../services';
import {
  CreateTenantRequest,
  CreateTenantResponse,
  MessageResponse,
  MutationResponse,
  TenantSummary,
  TwoFactorResponse,
  User,
  UserType,
} from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  currentTenant: TenantSummary | null;
  memberships: User['memberships'];
  hasTenantAccess: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string, userType?: UserType) => Promise<User | TwoFactorResponse>;
  verifyTwoFactor: (challengeToken: string, code: string) => Promise<User>;
  signUp: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<MessageResponse>;
  verifyEmail: (token: string) => Promise<MessageResponse>;
  resendVerificationEmail: (email: string) => Promise<MessageResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  requestPasswordReset: (email: string) => Promise<MutationResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<MutationResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<MutationResponse>;
  createTenant: (data: CreateTenantRequest) => Promise<CreateTenantResponse>;
  selectTenant: (tenantId: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveCurrentTenant(user: User | null): TenantSummary | null {
  const memberships = user?.memberships ?? [];
  if (memberships.length === 0) {
    return null;
  }

  const storedTenantId = localStorage.getItem(config.auth.activeTenantKey);
  const matchingMembership = memberships.find(({ tenant }) => tenant.id === storedTenantId);
  const tenant = matchingMembership?.tenant ?? memberships[0].tenant;

  localStorage.setItem(config.auth.activeTenantKey, tenant.id);
  return tenant;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const syncUser = useCallback((user: User | null, error: string | null = null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error,
    });
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const user = await authService.getCurrentUser();
    syncUser(user);
    return user;
  }, [syncUser]);

  useEffect(() => {
    refreshUser().catch(() => {
      syncUser(null);
    });

    const handleLogout = () => {
      const message = 'Your session expired. Please log in again.';
      syncUser(null, message);
      toast.error(message, { id: 'auth-session-expired' });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [refreshUser, syncUser]);

  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    const refreshInterval = window.setInterval(() => {
      authService.refreshToken().catch(() => {
        // The next protected request will trigger logout if refresh stays invalid.
      });
    }, 90 * 60 * 1000);

    return () => window.clearInterval(refreshInterval);
  }, [state.isAuthenticated]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await authService.login({ email, password });
      const user = (await authService.getCurrentUser()) ?? authResponse.user;
      syncUser(user);
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [syncUser]);

  const loginWithGoogle = useCallback(async (credential: string, userType?: UserType): Promise<User | TwoFactorResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const googleResponse = await authService.loginWithGoogle({ credential, userType });

      if ('requiresTwoFactor' in googleResponse) {
        setState(prev => ({ ...prev, isLoading: false, error: null }));
        return googleResponse;
      }

      const user = (await authService.getCurrentUser()) ?? googleResponse.user;
      syncUser(user);
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [syncUser]);

  const verifyTwoFactor = useCallback(async (challengeToken: string, code: string): Promise<User> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await authService.verifyTwoFactor({ challengeToken, code });
      const user = (await authService.getCurrentUser()) ?? authResponse.user;
      syncUser(user);
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Two-factor verification failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [syncUser]);

  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<MessageResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.signUp(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<MessageResponse> => {
    try {
      return await authService.verifyEmail(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email verification failed';
      setState(prev => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string): Promise<MessageResponse> => {
    try {
      return await authService.resendVerificationEmail(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email';
      setState(prev => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();
    } finally {
      syncUser(null);
    }
  }, [syncUser]);

  const requestPasswordReset = useCallback(async (email: string): Promise<MutationResponse> => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link';
      setState(prev => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<MutationResponse> => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setState(prev => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (_currentPassword: string, _newPassword: string): Promise<MutationResponse> => {
    try {
      return await authService.changePassword();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      setState(prev => ({ ...prev, error: message }));
      throw err;
    }
  }, []);

  const createTenant = useCallback(async (data: CreateTenantRequest): Promise<CreateTenantResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tenant = await tenantService.createTenant(data);
      const refreshedUser = await authService.getCurrentUser();
      syncUser(refreshedUser ?? state.user);
      return tenant;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, [state.user, syncUser]);

  const selectTenant = useCallback((tenantId: string) => {
    localStorage.setItem(config.auth.activeTenantKey, tenantId);
    setState(prev => ({ ...prev }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const currentTenant = useMemo(() => resolveCurrentTenant(state.user), [state.user]);
  const memberships = state.user?.memberships ?? [];
  const hasTenantAccess = memberships.length > 0;

  const value: AuthContextValue = {
    ...state,
    currentTenant,
    memberships,
    hasTenantAccess,
    login,
    loginWithGoogle,
    verifyTwoFactor,
    signUp,
    verifyEmail,
    resendVerificationEmail,
    logout,
    refreshUser,
    requestPasswordReset,
    resetPassword,
    changePassword,
    createTenant,
    selectTenant,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
