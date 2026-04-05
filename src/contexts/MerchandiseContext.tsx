import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { MerchandiseAnalytics, MerchandiseSettings, Order, Product } from '../types/merchandise';
import { merchandiseService } from '../services';

interface MerchandiseContextState {
  products: Product[];
  orders: Order[];
  analytics: MerchandiseAnalytics | null;
  settings: MerchandiseSettings | null;
  isLoading: boolean;
  error: string | null;
}

interface MerchandiseContextValue extends MerchandiseContextState {
  loadMerchandise: (eventId: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshSettings: () => Promise<void>;
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
    settings: null,
    isLoading: false,
    error: null,
  });

  const loadMerchandise = useCallback(async (id: string) => {
    if (!id) {
      return;
    }

    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const [products, ordersResponse, analytics, settings] = await Promise.all([
        merchandiseService.getProducts(id),
        merchandiseService.getOrders(id),
        merchandiseService.getMerchandiseAnalytics(id),
        merchandiseService.getMerchandiseSettings(id),
      ]);

      setState({
        products,
        orders: ordersResponse.data,
        analytics,
        settings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load merchandise',
      }));
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    if (!eventId) {
      return;
    }

    const products = await merchandiseService.getProducts(eventId);
    setState((previous) => ({ ...previous, products }));
  }, [eventId]);

  const refreshOrders = useCallback(async () => {
    if (!eventId) {
      return;
    }

    const orders = await merchandiseService.getOrders(eventId);
    setState((previous) => ({ ...previous, orders: orders.data }));
  }, [eventId]);

  const refreshAnalytics = useCallback(async () => {
    if (!eventId) {
      return;
    }

    const analytics = await merchandiseService.getMerchandiseAnalytics(eventId);
    setState((previous) => ({ ...previous, analytics }));
  }, [eventId]);

  const refreshSettings = useCallback(async () => {
    if (!eventId) {
      return;
    }

    const settings = await merchandiseService.getMerchandiseSettings(eventId);
    setState((previous) => ({ ...previous, settings }));
  }, [eventId]);

  const updateSettings = useCallback(
    async (nextSettings: Partial<MerchandiseSettings>) => {
      if (!eventId) {
        return;
      }

      const settings = await merchandiseService.updateMerchandiseSettings(eventId, nextSettings);
      setState((previous) => ({ ...previous, settings }));
    },
    [eventId],
  );

  const clearMerchandise = useCallback(() => {
    setState({
      products: [],
      orders: [],
      analytics: null,
      settings: null,
      isLoading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (autoLoad && eventId) {
      loadMerchandise(eventId);
    }
  }, [autoLoad, eventId, loadMerchandise]);

  return (
    <MerchandiseContext.Provider
      value={{
        ...state,
        loadMerchandise,
        refreshProducts,
        refreshOrders,
        refreshAnalytics,
        refreshSettings,
        updateSettings,
        clearMerchandise,
      }}
    >
      {children}
    </MerchandiseContext.Provider>
  );
}

export function useMerchandise() {
  const context = useContext(MerchandiseContext);

  if (!context) {
    throw new Error('useMerchandise must be used within a MerchandiseProvider');
  }

  return context;
}

export function withMerchandise<P extends object>(Component: React.ComponentType<P>, eventId: string) {
  return function MerchandiseComponent(props: P) {
    return (
      <MerchandiseProvider eventId={eventId}>
        <Component {...props} />
      </MerchandiseProvider>
    );
  };
}
