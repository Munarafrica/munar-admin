// Merchandise Context - manages merchandise state for an event
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, Order, MerchandiseAnalytics, FulfilmentConfig, MerchandiseSettings } from '../types/merchandise';
import { merchandiseService } from '../services';

interface MerchandiseContextState {
  products: Product[];
  orders: Order[];
  analytics: MerchandiseAnalytics | null;
  fulfilmentConfig: FulfilmentConfig | null;
  settings: MerchandiseSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface MerchandiseContextValue extends MerchandiseContextState {
  loadMerchandise: (eventId: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  updateSettings: (settings: Partial<MerchandiseSettings>) => Promise<void>;
  clearMerchandise: () => void;
}

const MerchandiseContext = createContext<MerchandiseContextValue | undefined>(undefined);

interface MerchandiseProviderProps {
  children: React.ReactNode;
  eventId: string;
  autoLoad?: boolean;
}

export function MerchandiseProvider({ children, eventId, autoLoad = true }: MerchandiseProviderProps) {
  const [state, setState] = useState<MerchandiseContextState>({
    products: [],
    orders: [],
    analytics: null,
    fulfilmentConfig: null,
    settings: null,
    isLoading: false,
    error: null,
  });

  const loadMerchandise = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load all merchandise data in parallel
      const [products, ordersResponse, analytics, fulfilmentConfig, settings] = await Promise.all([
        merchandiseService.getProducts(id),
        merchandiseService.getOrders(id),
        merchandiseService.getMerchandiseAnalytics(id),
        merchandiseService.getFulfilmentConfig(id),
        merchandiseService.getMerchandiseSettings(id),
      ]);
      
      setState({
        products,
        orders: ordersResponse.data,
        analytics,
        fulfilmentConfig,
        settings,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load merchandise',
      }));
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const products = await merchandiseService.getProducts(eventId);
      setState(prev => ({ ...prev, products }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to refresh products',
      }));
    }
  }, [eventId]);

  const refreshOrders = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const ordersResponse = await merchandiseService.getOrders(eventId);
      setState(prev => ({ ...prev, orders: ordersResponse.data }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to refresh orders',
      }));
    }
  }, [eventId]);

  const refreshAnalytics = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const analytics = await merchandiseService.getMerchandiseAnalytics(eventId);
      setState(prev => ({ ...prev, analytics }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to refresh analytics',
      }));
    }
  }, [eventId]);

  const clearMerchandise = useCallback(() => {
    setState({
      products: [],
      orders: [],
      analytics: null,
      fulfilmentConfig: null,
      settings: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<MerchandiseSettings>) => {
    if (!eventId) return;
    
    try {
      const updatedSettings = await merchandiseService.updateMerchandiseSettings(eventId, newSettings);
      setState(prev => ({ ...prev, settings: updatedSettings }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update settings',
      }));
      throw err;
    }
  }, [eventId]);

  // Auto-load on mount or eventId change
  useEffect(() => {
    if (autoLoad && eventId) {
      loadMerchandise(eventId);
    }
  }, [eventId, autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: MerchandiseContextValue = {
    ...state,
    loadMerchandise,
    refreshProducts,
    refreshOrders,
    refreshAnalytics,
    updateSettings,
    clearMerchandise,
  };

  return (
    <MerchandiseContext.Provider value={value}>
      {children}
    </MerchandiseContext.Provider>
  );
}

// Hook to use merchandise context
export function useMerchandise() {
  const context = useContext(MerchandiseContext);
  if (context === undefined) {
    throw new Error('useMerchandise must be used within a MerchandiseProvider');
  }
  return context;
}

// HOC to wrap components with merchandise provider
export function withMerchandise<P extends object>(
  Component: React.ComponentType<P>,
  eventId: string
) {
  return function MerchandiseComponent(props: P) {
    return (
      <MerchandiseProvider eventId={eventId}>
        <Component {...props} />
      </MerchandiseProvider>
    );
  };
}
