// Products Hook - fetch and manage products
import { useState, useEffect, useCallback } from 'react';
import { merchandiseService } from '../services';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/merchandise';

interface UseProductsOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductRequest) => Promise<Product | null>;
  updateProduct: (productId: string, data: UpdateProductRequest) => Promise<Product | null>;
  deleteProduct: (productId: string) => Promise<boolean>;
  duplicateProduct: (productId: string) => Promise<Product | null>;
  publishProduct: (productId: string) => Promise<Product | null>;
  archiveProduct: (productId: string) => Promise<Product | null>;
  adjustInventory: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
    reason?: string
  ) => Promise<boolean>;
}

export function useProducts({ eventId, autoFetch = true }: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await merchandiseService.getProducts(eventId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Create product
  const createProduct = useCallback(async (data: CreateProductRequest): Promise<Product | null> => {
    try {
      const newProduct = await merchandiseService.createProduct(eventId, data);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      return null;
    }
  }, [eventId]);

  // Update product
  const updateProduct = useCallback(async (
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product | null> => {
    try {
      const updated = await merchandiseService.updateProduct(eventId, productId, data);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return null;
    }
  }, [eventId]);

  // Delete product
  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      await merchandiseService.deleteProduct(eventId, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  }, [eventId]);

  // Duplicate product
  const duplicateProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const duplicated = await merchandiseService.duplicateProduct(eventId, productId);
      setProducts(prev => [...prev, duplicated]);
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate product');
      return null;
    }
  }, [eventId]);

  // Publish product
  const publishProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const updated = await merchandiseService.publishProduct(eventId, productId);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish product');
      return null;
    }
  }, [eventId]);

  // Archive product
  const archiveProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const updated = await merchandiseService.archiveProduct(eventId, productId);
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive product');
      return null;
    }
  }, [eventId]);

  // Adjust inventory
  const adjustInventory = useCallback(async (
    productId: string,
    variantId: string | undefined,
    quantity: number,
    reason?: string
  ): Promise<boolean> => {
    try {
      const updated = await merchandiseService.adjustInventory(eventId, productId, variantId, {
        type: 'adjustment',
        quantity,
        reason,
      });
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory');
      return false;
    }
  }, [eventId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchProducts();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    publishProduct,
    archiveProduct,
    adjustInventory,
  };
}
