// Forms Service
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  MutationResponse,
  BackendFormResponse,
  CreateBackendFormRequest,
  FormSubmissionResponse,
  SubmitFormRequest,
} from '../types/api';
import { Form, FormField, FormResponse, FormSettings } from '../components/event-dashboard/types';
import { delay, mockForms, mockFormResponses, generateId } from './mock/data';

export interface CreateFormRequest {
  title: string;
  description?: string;
  type: 'registration' | 'survey' | 'feedback' | 'custom';
  fields: FormField[];
  settings?: Partial<FormSettings>;
}

export interface PublicFormSubmitRequest {
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, any>;
  /** Optional: pass elapsed seconds so analytics can compute avg time */
  metadata?: { timeToComplete?: number; [key: string]: any };
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  status?: 'draft' | 'published' | 'closed' | 'scheduled';
}

function mapFormType(type: string): Form['type'] {
  switch (type) {
    case 'REGISTRATION':
      return 'registration';
    case 'SURVEY':
      return 'survey';
    case 'CUSTOM':
      return 'custom';
    default:
      return 'custom';
  }
}

function mapFormStatus(status: string): Form['status'] {
  switch (status) {
    case 'PUBLISHED':
      return 'published';
    case 'CLOSED':
      return 'closed';
    case 'ARCHIVED':
      return 'closed';
    case 'DRAFT':
    default:
      return 'draft';
  }
}

function inferFieldType(value: unknown): FormField['type'] {
  if (Array.isArray(value)) return 'checkbox';
  if (typeof value === 'number') return 'number';
  return 'text';
}

function formFromBackend(form: BackendFormResponse): Form {
  const schema = form.schemaJson || {};
  const properties = (schema.properties || {}) as Record<string, any>;
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  const fields: FormField[] = Object.entries(properties).map(([id, field]) => ({
    id,
    type: field['x-fieldType'] || inferFieldType(field.default),
    label: field.title || id,
    placeholder: field.placeholder,
    helpText: field.description,
    required: required.has(id),
    options: Array.isArray(field.enum) ? field.enum : undefined,
    validation: {
      min: field.minimum,
      max: field.maximum,
      pattern: field.pattern,
    },
  }));

  const schedule = (form.scheduleJson || {}) as Record<string, any>;
  const payment = (form.paymentConfigJson || {}) as Record<string, any>;

  return {
    id: form.id,
    title: form.title,
    description: (form.brandingJson?.description as string) || '',
    type: mapFormType(form.formType),
    status: mapFormStatus(form.status),
    fields,
    settings: {
      isPaid: !!payment.enabled,
      price: typeof payment.amountMinor === 'number' ? payment.amountMinor / 100 : undefined,
      currency: payment.currency as string | undefined,
      allowAnonymous: !!(form.accessControlJson as Record<string, any> | null)?.allowAnonymous,
      oneResponsePerUser: !((form.accessControlJson as Record<string, any> | null)?.allowMultipleSubmissions),
      closeDate: schedule.closesAt,
      confirmationMessage: (form.brandingJson?.confirmationMessage as string) || undefined,
    },
    responseCount: 0,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  };
}

function toBackendFormPayload(data: CreateFormRequest | UpdateFormRequest): CreateBackendFormRequest {
  const schemaJson = {
    type: 'object',
    properties: Object.fromEntries(
      (data.fields || []).map((field) => [
        field.id,
        {
          title: field.label,
          description: field.helpText,
          placeholder: field.placeholder,
          enum: field.options,
          minimum: field.validation?.min,
          maximum: field.validation?.max,
          pattern: field.validation?.pattern,
          default: field.type === 'checkbox' ? [] : '',
          'x-fieldType': field.type,
        },
      ]),
    ),
    required: (data.fields || []).filter((field) => field.required).map((field) => field.id),
  };

  return {
    title: data.title || 'Untitled Form',
    formType: data.type === 'registration' ? 'REGISTRATION' : data.type === 'survey' ? 'SURVEY' : 'CUSTOM',
    schemaJson,
    scheduleJson: data.settings?.closeDate ? { closesAt: data.settings.closeDate } : undefined,
    accessControlJson: {
      allowAnonymous: data.settings?.allowAnonymous ?? false,
      allowMultipleSubmissions: !(data.settings?.oneResponsePerUser ?? true),
    },
    brandingJson: {
      description: data.description || '',
      confirmationMessage: data.settings?.confirmationMessage,
    },
    paymentConfigJson: data.settings?.isPaid
      ? {
          enabled: true,
          amountMinor: Math.round((data.settings.price || 0) * 100),
          currency: data.settings.currency || 'NGN',
        }
      : undefined,
  };
}

function submissionToFormResponse(response: FormSubmissionResponse): FormResponse {
  return {
    id: response.id,
    formId: response.formId,
    submittedAt: response.createdAt,
    answers: response.answersJson,
    status: response.status?.toLowerCase() === 'partial' ? 'partial' : 'completed',
    paymentStatus: response.paymentStatus ? response.paymentStatus.toLowerCase() as FormResponse['paymentStatus'] : 'n/a',
  };
}

class FormsService {
  // Get all forms for an event
  async getForms(eventId: string, params?: SearchParams): Promise<Form[]> {
    if (config.features.useMockData) {
      await delay(400);
      return mockForms;
    }

    const response = await apiClient.get<ApiResponse<BackendFormResponse[]>>(`/events/${eventId}/forms`, { params });
    return response.data.map(formFromBackend);
  }

  // Get single form
  async getForm(eventId: string, formId: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(300);
      const form = mockForms.find(f => f.id === formId);
      if (!form) throw new Error('Form not found');
      return form;
    }

    const response = await apiClient.get<ApiResponse<BackendFormResponse>>(`/forms/${formId}`);
    return formFromBackend(response.data);
  }

  // Create form
  async createForm(eventId: string, data: CreateFormRequest): Promise<Form> {
    if (config.features.useMockData) {
      await delay(600);
      
      const newForm: Form = {
        id: generateId('form'),
        title: data.title,
        description: data.description || '',
        type: data.type,
        status: 'draft',
        fields: data.fields,
        settings: {
          isPaid: false,
          allowAnonymous: false,
          oneResponsePerUser: true,
          ...data.settings,
        },
        responseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockForms.push(newForm);
      return newForm;
    }

    const response = await apiClient.post<ApiResponse<BackendFormResponse>>(
      `/events/${eventId}/forms`,
      toBackendFormPayload(data),
    );
    return formFromBackend(response.data);
  }

  // Update form
  async updateForm(eventId: string, formId: string, data: UpdateFormRequest): Promise<Form> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockForms.findIndex(f => f.id === formId);
      if (index === -1) throw new Error('Form not found');
      
      mockForms[index] = { 
        ...mockForms[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      } as Form;
      return mockForms[index];
    }

    const response = await apiClient.patch<ApiResponse<BackendFormResponse>>(
      `/forms/${formId}`,
      toBackendFormPayload(data),
    );
    return formFromBackend(response.data);
  }

  // Delete form
  async deleteForm(eventId: string, formId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(400);
      
      const index = mockForms.findIndex(f => f.id === formId);
      if (index !== -1) mockForms.splice(index, 1);
      
      return { success: true, message: 'Form deleted successfully' };
    }

    return apiClient.delete<MutationResponse>(`/forms/${formId}`);
  }

  // Duplicate form
  async duplicateForm(eventId: string, formId: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(500);
      
      const original = mockForms.find(f => f.id === formId);
      if (!original) throw new Error('Form not found');
      
      const duplicated: Form = {
        ...original,
        id: generateId('form'),
        title: `${original.title} (Copy)`,
        status: 'draft',
        responseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockForms.push(duplicated);
      return duplicated;
    }

    const form = await this.getForm(eventId, formId);
    return this.createForm(eventId, {
      title: `${form.title} (Copy)`,
      description: form.description,
      type: form.type,
      fields: form.fields,
      settings: form.settings,
    });
  }

  // Publish form
  async publishForm(eventId: string, formId: string): Promise<Form> {
    const response = await apiClient.post<ApiResponse<BackendFormResponse>>(`/forms/${formId}/publish`);
    return formFromBackend(response.data);
  }

  // Close form
  async closeForm(eventId: string, formId: string): Promise<Form> {
    const response = await apiClient.post<ApiResponse<BackendFormResponse>>(`/forms/${formId}/close`);
    return formFromBackend(response.data);
  }

  // ========== RESPONSES ==========

  // Get form responses
  async getResponses(eventId: string, formId: string, params?: SearchParams): Promise<PaginatedResponse<FormResponse>> {
    if (config.features.useMockData) {
      await delay(500);
      
      const responses = mockFormResponses.filter(r => r.formId === formId);
      
      return {
        data: responses,
        meta: {
          currentPage: params?.page || 1,
          totalPages: 1,
          totalItems: responses.length,
          itemsPerPage: params?.limit || 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const response = await apiClient.get<ApiResponse<FormSubmissionResponse[]>>(`/forms/${formId}/submissions`, { params });
    const data = response.data.map(submissionToFormResponse);
    return {
      data,
      meta: {
        currentPage: params?.page || 1,
        totalPages: 1,
        totalItems: data.length,
        itemsPerPage: data.length || params?.limit || 20,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  // Get single response
  async getResponse(eventId: string, formId: string, responseId: string): Promise<FormResponse> {
    if (config.features.useMockData) {
      await delay(300);
      const response = mockFormResponses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      return response;
    }

    const response = await apiClient.get<ApiResponse<FormSubmissionResponse>>(`/forms/${formId}/submissions/${responseId}`);
    return submissionToFormResponse(response.data);
  }

  // Delete response
  async deleteResponse(eventId: string, formId: string, responseId: string): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(300);
      
      const index = mockFormResponses.findIndex(r => r.id === responseId);
      if (index !== -1) mockFormResponses.splice(index, 1);
      
      return { success: true, message: 'Response deleted successfully' };
    }

    return apiClient.delete<MutationResponse>(`/forms/${formId}/submissions/${responseId}`);
  }

  // Export responses
  async exportResponses(eventId: string, formId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    if (config.features.useMockData) {
      await delay(800);
      
      const form = mockForms.find(f => f.id === formId);
      const responses = mockFormResponses.filter(r => r.formId === formId);
      
      // Create mock CSV
      const headers = ['Submitted At', 'Name', 'Email', ...(form?.fields.map(f => f.label) || [])].join(',');
      const rows = responses.map(r => {
        const answers = form?.fields.map(f => r.answers[f.id] || '').join(',') || '';
        return `${r.submittedAt},${r.respondentName || ''},${r.respondentEmail || ''},${answers}`;
      }).join('\n');
      
      return new Blob([headers + '\n' + rows], { type: 'text/csv' });
    }

    const response = await fetch(`${config.api.baseUrl}/events/${eventId}/forms/${formId}/responses/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
      },
    });
    
    return response.blob();
  }

  // Get form analytics
  async getFormAnalytics(eventId: string, formId: string): Promise<{
    totalResponses: number;
    completionRate: number;
    averageTimeToComplete: number;
    responsesByDay: Array<{ date: string; count: number }>;
  }> {
    if (config.features.useMockData) {
      await delay(400);
      
      const form = mockForms.find(f => f.id === formId);
      
      return {
        totalResponses: form?.responseCount || 0,
        completionRate: 87.5,
        averageTimeToComplete: 180, // seconds
        responsesByDay: [
          { date: '2026-01-20', count: 45 },
          { date: '2026-01-21', count: 32 },
          { date: '2026-01-22', count: 28 },
          { date: '2026-01-23', count: 51 },
        ],
      };
    }

    const response = await apiClient.get<ApiResponse<any>>(`/events/${eventId}/forms/${formId}/analytics`);
    return response.data;
  }

  // ========== PUBLIC (no-auth) ==========

  /** List published forms for an event by its public slug */
  async getPublicForms(slug: string): Promise<{ event: { id: string; name: string }; forms: Form[] }> {
    if (config.features.useMockData) {
      await delay(400);
      return { event: { id: 'mock-event', name: 'Mock Event' }, forms: mockForms.filter(f => f.status === 'published') };
    }
    const website = await apiClient.get<ApiResponse<any>>(`/public/events/${slug}/website`);
    const eventId = website.data.event.id;
    const forms = await this.getForms(eventId, { status: 'PUBLISHED' });
    return { event: { id: eventId, name: website.data.event.title }, forms };
  }

  /** Get a single published form by event slug + form ID */
  async getPublicFormBySlug(slug: string, formId: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(300);
      const form = mockForms.find(f => f.id === formId);
      if (!form) throw new Error('Form not found');
      return form;
    }
    const website = await apiClient.get<ApiResponse<any>>(`/public/events/${slug}/website`);
    if (!website.data?.event?.id) {
      throw new Error('Event not found');
    }
    return this.getForm(website.data.event.id, formId);
  }

  /** Submit a response by event slug + form ID (no auth required) */
  async submitPublicForm(slug: string, formId: string, data: PublicFormSubmitRequest): Promise<FormResponse> {
    if (config.features.useMockData) {
      await delay(600);
      const form = mockForms.find(f => f.id === formId);
      if (!form) throw new Error('Form not found');
      const newResponse = {
        id: generateId('resp'),
        formId,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        answers: data.answers,
        submittedAt: new Date().toISOString(),
      } as FormResponse;
      mockFormResponses.push(newResponse);
      return newResponse;
    }
    const payload: SubmitFormRequest = {
      answersJson: {
        ...data.answers,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        metadata: data.metadata,
      },
    };
    const response = await apiClient.post<ApiResponse<FormSubmissionResponse>>(`/forms/${formId}/submissions`, payload);
    return submissionToFormResponse(response.data);
  }

  /** Get a published form by its share token */
  async getPublicFormByToken(token: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(300);
      const form = mockForms[0];
      if (!form) throw new Error('Form not found');
      return form;
    }
    const response = await apiClient.get<ApiResponse<BackendFormResponse>>(`/public/forms/${token}`);
    return formFromBackend(response.data);
  }

  /** Submit a response via share token */
  async submitByToken(token: string, data: PublicFormSubmitRequest): Promise<FormResponse> {
    if (config.features.useMockData) {
      await delay(600);
      const newResponse = {
        id: generateId('resp'),
        formId: 'mock-form',
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        answers: data.answers,
        submittedAt: new Date().toISOString(),
      } as FormResponse;
      mockFormResponses.push(newResponse);
      return newResponse;
    }
    const response = await apiClient.post<ApiResponse<FormSubmissionResponse>>(`/public/forms/${token}/submit`, {
      answersJson: data.answers,
    });
    return submissionToFormResponse(response.data);
  }
}

export const formsService = new FormsService();
