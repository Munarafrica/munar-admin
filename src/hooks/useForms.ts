// Forms Hook - fetch and manage forms & responses
import { useState, useEffect, useCallback } from 'react';
import { formsService, CreateFormRequest, UpdateFormRequest } from '../services';
import { Form, FormResponse } from '../components/event-dashboard/types';
import { PaginatedResponse, SearchParams } from '../types/api';

interface UseFormsOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseFormsReturn {
  // Forms
  forms: Form[];
  isLoading: boolean;
  error: string | null;
  
  // Selected form responses
  responses: FormResponse[];
  responsesMeta: PaginatedResponse<FormResponse>['meta'] | null;
  isLoadingResponses: boolean;
  
  // Form Actions
  fetchForms: () => Promise<void>;
  createForm: (data: CreateFormRequest) => Promise<Form | null>;
  updateForm: (formId: string, data: UpdateFormRequest) => Promise<Form | null>;
  deleteForm: (formId: string) => Promise<boolean>;
  duplicateForm: (formId: string) => Promise<Form | null>;
  publishForm: (formId: string) => Promise<Form | null>;
  closeForm: (formId: string) => Promise<Form | null>;
  
  // Response Actions
  fetchResponses: (formId: string, params?: SearchParams) => Promise<void>;
  deleteResponse: (formId: string, responseId: string) => Promise<boolean>;
  exportResponses: (formId: string, format?: 'csv' | 'xlsx') => Promise<void>;
  
  // Analytics
  fetchFormAnalytics: (formId: string) => Promise<{
    totalResponses: number;
    completionRate: number;
    averageTimeToComplete: number;
    responsesByDay: Array<{ date: string; count: number }>;
  } | null>;
}

export function useForms({ eventId, autoFetch = true }: UseFormsOptions): UseFormsReturn {
  // Forms state
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  // Responses state
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [responsesMeta, setResponsesMeta] = useState<PaginatedResponse<FormResponse>['meta'] | null>(null);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Fetch forms
  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await formsService.getForms(eventId);
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forms');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  // Create form
  const createForm = useCallback(async (data: CreateFormRequest): Promise<Form | null> => {
    try {
      const newForm = await formsService.createForm(eventId, data);
      setForms(prev => [...prev, newForm]);
      return newForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      return null;
    }
  }, [eventId]);

  // Update form
  const updateForm = useCallback(async (formId: string, data: UpdateFormRequest): Promise<Form | null> => {
    try {
      const updated = await formsService.updateForm(eventId, formId, data);
      setForms(prev => prev.map(f => f.id === formId ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update form');
      return null;
    }
  }, [eventId]);

  // Delete form
  const deleteForm = useCallback(async (formId: string): Promise<boolean> => {
    try {
      await formsService.deleteForm(eventId, formId);
      setForms(prev => prev.filter(f => f.id !== formId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete form');
      return false;
    }
  }, [eventId]);

  // Duplicate form
  const duplicateForm = useCallback(async (formId: string): Promise<Form | null> => {
    try {
      const duplicated = await formsService.duplicateForm(eventId, formId);
      setForms(prev => [...prev, duplicated]);
      return duplicated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate form');
      return null;
    }
  }, [eventId]);

  // Publish form
  const publishForm = useCallback(async (formId: string): Promise<Form | null> => {
    try {
      const updated = await formsService.publishForm(eventId, formId);
      setForms(prev => prev.map(f => f.id === formId ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form');
      return null;
    }
  }, [eventId]);

  // Close form
  const closeForm = useCallback(async (formId: string): Promise<Form | null> => {
    try {
      const updated = await formsService.closeForm(eventId, formId);
      setForms(prev => prev.map(f => f.id === formId ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close form');
      return null;
    }
  }, [eventId]);

  // Fetch responses
  const fetchResponses = useCallback(async (formId: string, params?: SearchParams) => {
    setIsLoadingResponses(true);
    
    try {
      const response = await formsService.getResponses(eventId, formId, params);
      setResponses(response.data);
      setResponsesMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch responses');
    } finally {
      setIsLoadingResponses(false);
    }
  }, [eventId]);

  // Delete response
  const deleteResponse = useCallback(async (formId: string, responseId: string): Promise<boolean> => {
    try {
      await formsService.deleteResponse(eventId, formId, responseId);
      setResponses(prev => prev.filter(r => r.id !== responseId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete response');
      return false;
    }
  }, [eventId]);

  // Export responses
  const exportResponses = useCallback(async (formId: string, format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await formsService.exportResponses(eventId, formId, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-responses-${formId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export responses');
    }
  }, [eventId]);

  // Fetch analytics
  const fetchFormAnalytics = useCallback(async (formId: string) => {
    try {
      return await formsService.getFormAnalytics(eventId, formId);
    } catch {
      return null;
    }
  }, [eventId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && eventId) {
      fetchForms();
    }
  }, [autoFetch, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    forms,
    isLoading,
    error,
    responses,
    responsesMeta,
    isLoadingResponses,
    fetchForms,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
    publishForm,
    closeForm,
    fetchResponses,
    deleteResponse,
    exportResponses,
    fetchFormAnalytics,
  };
}
