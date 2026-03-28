// Orders Hook - fetch and manage orders
import { useState, useEffect, useCallback } from 'react';
import { merchandiseService } from '../services';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../types/merchandise';
import { PaginatedResponse, SearchParams } from '../types/api';

interface UseOrdersOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
  meta: PaginatedResponse<Order>['meta'] | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: (params?: SearchParams) => Promise<void>;
  searchOrders: (query: string) => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order | null>;
  updateOrder: (orderId: string, data: UpdateOrderRequest) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  refundOrder: (orderId: string) => Promise<boolean>;
  markFulfilled: (orderId: string) => Promise<boolean>;
  exportOrders: (format?: 'csv' | 'xlsx') => Promise<void>;
}

export function useOrders({ eventId, autoFetch = true }: UseOrdersOptions): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Order>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async (params?: SearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await merchandiseService.getOrders(eventId, params);
      setOrders(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Search orders
  const searchOrders = useCallback(async (query: string) => {
    await fetchOrders({ search: query });
  }, [fetchOrders]);

  // Create order
  const createOrder = useCallback(async (data: CreateOrderRequest): Promise<Order | null> => {
    try {
      const newOrder = await merchandiseService.createOrder(eventId, data);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    }
  }, [eventId]);

  // Update order
  const updateOrder = useCallback(async (
    orderId: string,
    data: UpdateOrderRequest
  ): Promise<Order | null> => {
    try {
      const updated = await merchandiseService.updateOrder(eventId, orderId, data);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      return null;
    }
  }, [eventId]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const updated = await merchandiseService.cancelOrder(eventId, orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
      return false;
    }
  }, [eventId]);

  // Refund order
  const refundOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const updated = await merchandiseService.refundOrder(eventId, orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refund order');
      return false;
    }
  }, [eventId]);

  // Mark order as fulfilled
  const markFulfilled = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const updated = await merchandiseService.updateOrder(eventId, orderId, {
        status: 'fulfilled',
        fulfilmentStatus: 'completed',
      });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark order as fulfilled');
      return false;
    }
  }, [eventId]);

  // Export orders
  const exportOrders = useCallback(async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await merchandiseService.exportOrders(eventId, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${eventId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export orders');
    }
  }, [eventId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchOrders();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    orders,
    meta,
    isLoading,
    error,
    fetchOrders,
    searchOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    refundOrder,
    markFulfilled,
    exportOrders,
  };
}
