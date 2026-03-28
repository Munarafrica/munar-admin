// Generic async state hook
import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAsyncReturn<T, Args extends unknown[] = []> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  setData: (data: T | null) => void;
  reset: () => void;
}

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [asyncFunction]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, setData, reset };
}
