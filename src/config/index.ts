// Environment configuration for the application
// These values will be replaced with actual environment variables when connecting to backend

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  
  // Authentication
  auth: {
    tokenKey: 'munar_auth_token',
    refreshTokenKey: 'munar_refresh_token',
    userKey: 'munar_user',
    activeTenantKey: 'munar_active_tenant_id',
  },
  
  // Feature flags
  features: {
    // Set to true when backend is connected
    useMockData: import.meta.env.VITE_USE_MOCK_DATA !== 'false',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // App info
  app: {
    name: 'Munar',
    version: '0.1.0',
    defaultCurrency: 'NGN',
  },
} as const;

export type Config = typeof config;
