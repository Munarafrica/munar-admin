import { config } from '../config';
import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  BackendFormResponse,
  CreateBackendFormRequest,
  FormSubmissionResponse,
  SubmitFormRequest,
} from '../types/api';
import { Form, FormField, FormFieldType, FormResponse, FormSettings } from '../components/event-dashboard/types';
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
  answers: Record<string, unknown>;
  metadata?: { timeToComplete?: number; [key: string]: unknown };
}

export interface FormAnalyticsSummary {
  totalSubmissions: number;
  completedSubmissions: number;
  partialSubmissions: number;
  completionRate: number;
  submissionsByDay: Array<{ date: string; count: number }>;
  paymentSummary?: {
    paid?: number;
    pending?: number;
    failed?: number;
    revenueMinor?: number;
    currency?: string;
  };
  fieldSummaries?: Array<{
    fieldId: string;
    label: string;
    valueCounts: Array<{ value: string; count: number }>;
  }>;
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  status?: 'draft' | 'published' | 'closed' | 'archived';
}

type BackendSchemaField = {
  id: string;
  type: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
};

type MaybeWrapped<T> = ApiResponse<T> | T;
type SubmissionListPayload =
  | FormSubmissionResponse[]
  | {
      data?: FormSubmissionResponse[];
      submissions?: FormSubmissionResponse[];
      items?: FormSubmissionResponse[];
      meta?: Partial<PaginatedResponse<FormResponse>['meta']>;
    };

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
      return 'archived';
    case 'DRAFT':
    default:
      return 'draft';
  }
}

function normalizeFieldType(type: string): FormFieldType {
  const normalized = type.toLowerCase();
  if (
    normalized === 'text' ||
    normalized === 'textarea' ||
    normalized === 'email' ||
    normalized === 'phone' ||
    normalized === 'number' ||
    normalized === 'date' ||
    normalized === 'select' ||
    normalized === 'multiselect' ||
    normalized === 'checkbox' ||
    normalized === 'radio' ||
    normalized === 'rating' ||
    normalized === 'file'
  ) {
    return normalized;
  }
  return 'text';
}

function inferFieldType(value: unknown): FormField['type'] {
  if (Array.isArray(value)) return 'checkbox';
  if (typeof value === 'number') return 'number';
  return 'text';
}

function schemaFieldsFromBackend(schemaJson: Record<string, unknown>): BackendSchemaField[] {
  const fields = schemaJson.fields;
  if (Array.isArray(fields)) {
    return fields
      .filter((field): field is BackendSchemaField => !!field && typeof field === 'object')
      .map((field) => ({
        id: String(field.id || ''),
        type: String(field.type || 'text'),
        label: typeof field.label === 'string' ? field.label : undefined,
        required: Boolean(field.required),
        placeholder: typeof field.placeholder === 'string' ? field.placeholder : undefined,
        helpText:
          typeof field.helpText === 'string'
            ? field.helpText
            : typeof field.description === 'string'
              ? field.description
              : undefined,
        options:
          Array.isArray(field.options) && field.options.every((option) => typeof option === 'string')
            ? (field.options as string[])
            : undefined,
        validation:
          field.validation && typeof field.validation === 'object'
            ? {
                min: typeof field.validation.min === 'number' ? field.validation.min : undefined,
                max: typeof field.validation.max === 'number' ? field.validation.max : undefined,
                pattern: typeof field.validation.pattern === 'string' ? field.validation.pattern : undefined,
              }
            : undefined,
      }))
      .filter((field) => field.id);
  }

  const properties = (schemaJson.properties || {}) as Record<string, Record<string, unknown>>;
  const required = new Set(Array.isArray(schemaJson.required) ? schemaJson.required.map(String) : []);
  return Object.entries(properties).map(([id, field]) => ({
    id,
    type: typeof field['x-fieldType'] === 'string' ? String(field['x-fieldType']) : inferFieldType(field.default),
    label: typeof field.title === 'string' ? field.title : id,
    placeholder: typeof field.placeholder === 'string' ? field.placeholder : undefined,
    helpText: typeof field.description === 'string' ? field.description : undefined,
    required: required.has(id),
    options:
      Array.isArray(field.enum) && field.enum.every((option) => typeof option === 'string')
        ? (field.enum as string[])
        : undefined,
    validation: {
      min: typeof field.minimum === 'number' ? field.minimum : undefined,
      max: typeof field.maximum === 'number' ? field.maximum : undefined,
      pattern: typeof field.pattern === 'string' ? field.pattern : undefined,
    },
  }));
}

function toIsoDateTime(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function inferRespondentDetails(answers: Record<string, unknown>) {
  const entries = Object.entries(answers);
  const nameEntry = entries.find(([key, value]) => {
    if (typeof value !== 'string' || !value.trim()) return false;
    const normalizedKey = key.toLowerCase();
    return normalizedKey.includes('name') || normalizedKey === 'respondentname';
  });
  const emailEntry = entries.find(([, value]) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

  return {
    respondentName: typeof nameEntry?.[1] === 'string' ? nameEntry[1] : undefined,
    respondentEmail: typeof emailEntry?.[1] === 'string' ? emailEntry[1] : undefined,
  };
}

function mapPaymentStatus(paymentStatus: FormSubmissionResponse['paymentStatus']): FormResponse['paymentStatus'] {
  switch (paymentStatus) {
    case 'AUTHORIZED':
    case 'CAPTURED':
      return 'paid';
    case 'PENDING':
      return 'pending';
    case 'FAILED':
    case 'REVERSED':
    case 'REFUNDED':
      return 'failed';
    default:
      return 'n/a';
  }
}

function formFromBackend(form: BackendFormResponse): Form {
  const schema = (form.schemaJson || {}) as Record<string, unknown>;
  const schedule = (form.scheduleJson || {}) as Record<string, unknown>;
  const payment = (form.paymentConfigJson || {}) as Record<string, unknown>;
  const access = (form.accessControlJson || {}) as Record<string, unknown>;
  const branding = (form.brandingJson || {}) as Record<string, unknown>;
  const fields = schemaFieldsFromBackend(schema).map<FormField>((field) => ({
    id: field.id,
    type: normalizeFieldType(field.type),
    label: field.label || field.id,
    placeholder: field.placeholder,
    helpText: field.helpText,
    required: Boolean(field.required),
    options: field.options,
    validation: field.validation,
  }));

  return {
    id: form.id,
    title: form.title,
    description: typeof branding.description === 'string' ? branding.description : '',
    type: mapFormType(form.formType),
    status: mapFormStatus(form.status),
    fields,
    settings: {
      isPaid: Boolean(payment.enabled),
      price: typeof payment.amountMinor === 'number' ? payment.amountMinor / 100 : undefined,
      currency: typeof payment.currency === 'string' ? payment.currency : undefined,
      allowAnonymous: Boolean(access.allowAnonymous),
      oneResponsePerUser: !Boolean(access.allowMultipleSubmissions),
      closeDate: typeof schedule.closesAt === 'string' ? schedule.closesAt : undefined,
      confirmationMessage:
        typeof branding.confirmationMessage === 'string' ? branding.confirmationMessage : undefined,
    },
    responseCount: 0,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  };
}

function toBackendFormPayload(data: CreateFormRequest | UpdateFormRequest): CreateBackendFormRequest {
  const fields = (data.fields || []).map((field) => ({
    id: field.id,
    type: field.type,
    label: field.label,
    required: field.required,
    placeholder: field.placeholder,
    helpText: field.helpText,
    options: field.options?.filter(Boolean),
    validation: {
      min: field.validation?.min,
      max: field.validation?.max,
      pattern: field.validation?.pattern,
    },
  }));

  const closeDate = toIsoDateTime(data.settings?.closeDate);
  const allowAnonymous = data.settings?.allowAnonymous ?? false;
  const oneResponsePerUser = data.settings?.oneResponsePerUser ?? true;
  const isPaid = data.settings?.isPaid ?? false;

  return {
    title: data.title || 'Untitled Form',
    formType:
      data.type === 'registration'
        ? 'REGISTRATION'
        : data.type === 'survey'
          ? 'SURVEY'
          : 'CUSTOM',
    schemaJson: {
      fields,
    },
    logicJson: {
      version: 1,
    },
    paymentConfigJson: isPaid
      ? {
          enabled: true,
          amountMinor: Math.round((data.settings?.price || 0) * 100),
          currency: data.settings?.currency || 'NGN',
        }
      : {
          enabled: false,
        },
    scheduleJson: closeDate
      ? {
          closesAt: closeDate,
        }
      : undefined,
    accessControlJson: {
      allowAnonymous,
      allowMultipleSubmissions: !oneResponsePerUser,
      requiresAuth: !allowAnonymous || oneResponsePerUser,
    },
    brandingJson: {
      description: data.description || '',
      confirmationMessage: data.settings?.confirmationMessage,
    },
  };
}

function submissionToFormResponse(response: FormSubmissionResponse): FormResponse {
  const inferred = inferRespondentDetails(response.answersJson || {});
  return {
    id: response.id,
    formId: response.formId,
    respondentName: inferred.respondentName,
    respondentEmail: inferred.respondentEmail,
    submittedAt: response.createdAt,
    answers: response.answersJson,
    status: response.status?.toLowerCase() === 'partial' ? 'partial' : 'completed',
    paymentStatus: mapPaymentStatus(response.paymentStatus),
  };
}

function unwrapApiData<T>(payload: MaybeWrapped<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

function normalizeSubmissionListPayload(payload: MaybeWrapped<SubmissionListPayload>) {
  const unwrapped = unwrapApiData(payload);

  if (Array.isArray(unwrapped)) {
    return {
      submissions: unwrapped,
      meta: null,
    };
  }

  if (unwrapped && typeof unwrapped === 'object') {
    const list = Array.isArray(unwrapped.submissions)
      ? unwrapped.submissions
      : Array.isArray(unwrapped.items)
        ? unwrapped.items
        : Array.isArray(unwrapped.data)
          ? unwrapped.data
          : [];

    return {
      submissions: list,
      meta: unwrapped.meta ?? null,
    };
  }

  return {
    submissions: [],
    meta: null,
  };
}

function extractAnalyticsPayload(payload: MaybeWrapped<FormAnalyticsSummary | { analytics?: FormAnalyticsSummary }>) {
  const unwrapped = unwrapApiData(payload);
  if (unwrapped && typeof unwrapped === 'object' && 'analytics' in unwrapped && unwrapped.analytics) {
    return unwrapped.analytics;
  }
  return unwrapped as FormAnalyticsSummary;
}

class FormsService {
  async getForms(eventId: string, params?: SearchParams): Promise<Form[]> {
    if (config.features.useMockData) {
      await delay(400);
      return mockForms;
    }

    const response = await apiClient.get<MaybeWrapped<BackendFormResponse[]>>(`/events/${eventId}/forms`, { params });
    return unwrapApiData(response).map(formFromBackend);
  }

  async getForm(eventId: string, formId: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(300);
      const form = mockForms.find((item) => item.id === formId);
      if (!form) throw new Error('Form not found');
      return form;
    }

    const response = await apiClient.get<MaybeWrapped<BackendFormResponse>>(`/forms/${formId}`);
    return formFromBackend(unwrapApiData(response));
  }

  async createForm(eventId: string, data: CreateFormRequest): Promise<Form> {
    if (config.features.useMockData) {
      await delay(600);

      const newForm: Form = {
        id: generateId('form'),
        title: data.title,
        description: data.description || '',
        type: data.type === 'feedback' ? 'custom' : data.type,
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

    const response = await apiClient.post<MaybeWrapped<BackendFormResponse>>(
      `/events/${eventId}/forms`,
      toBackendFormPayload(data),
    );
    return formFromBackend(unwrapApiData(response));
  }

  async updateForm(eventId: string, formId: string, data: UpdateFormRequest): Promise<Form> {
    if (config.features.useMockData) {
      await delay(400);

      const index = mockForms.findIndex((item) => item.id === formId);
      if (index === -1) throw new Error('Form not found');

      mockForms[index] = {
        ...mockForms[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Form;
      return mockForms[index];
    }

    const response = await apiClient.patch<MaybeWrapped<BackendFormResponse>>(
      `/forms/${formId}`,
      toBackendFormPayload(data),
    );
    return formFromBackend(unwrapApiData(response));
  }

  async deleteForm(eventId: string, formId: string) {
    if (config.features.useMockData) {
      await delay(400);
      const index = mockForms.findIndex((item) => item.id === formId);
      if (index !== -1) mockForms.splice(index, 1);
      return { success: true, message: 'Form deleted successfully' };
    }

    return apiClient.delete<{ success: boolean; deleted: boolean; id: string }>(`/forms/${formId}`);
  }

  async archiveForm(eventId: string, formId: string): Promise<Form> {
    if (config.features.useMockData) {
      await delay(300);
      const index = mockForms.findIndex((item) => item.id === formId);
      if (index === -1) throw new Error('Form not found');
      mockForms[index] = {
        ...mockForms[index],
        status: 'archived',
        updatedAt: new Date().toISOString(),
      };
      return mockForms[index];
    }

    const response = await apiClient.post<MaybeWrapped<BackendFormResponse>>(`/forms/${formId}/archive`);
    return formFromBackend(unwrapApiData(response));
  }

  async duplicateForm(eventId: string, formId: string): Promise<Form> {
    const form = await this.getForm(eventId, formId);
    return this.createForm(eventId, {
      title: `${form.title} (Copy)`,
      description: form.description,
      type: form.type,
      fields: form.fields,
      settings: form.settings,
    });
  }

  async publishForm(eventId: string, formId: string): Promise<Form> {
    const response = await apiClient.post<MaybeWrapped<BackendFormResponse>>(`/forms/${formId}/publish`);
    return formFromBackend(unwrapApiData(response));
  }

  async closeForm(eventId: string, formId: string): Promise<Form> {
    const response = await apiClient.post<MaybeWrapped<BackendFormResponse>>(`/forms/${formId}/close`);
    return formFromBackend(unwrapApiData(response));
  }

  async getResponses(eventId: string, formId: string, params?: SearchParams): Promise<PaginatedResponse<FormResponse>> {
    if (config.features.useMockData) {
      await delay(500);

      const responses = mockFormResponses.filter((item) => item.formId === formId);
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

    const submissionParams = {
      status: params?.search,
    };

    const response = await apiClient.get<MaybeWrapped<SubmissionListPayload>>(`/forms/${formId}/submissions`, {
      params: submissionParams,
    });
    const { submissions, meta } = normalizeSubmissionListPayload(response);
    const data = submissions.map(submissionToFormResponse);
    const requestedPage = params?.page || 1;
    const requestedLimit = params?.limit || data.length || 20;

    return {
      data,
      meta: {
        currentPage: meta?.currentPage || requestedPage,
        totalPages: meta?.totalPages || 1,
        totalItems: meta?.totalItems || data.length,
        itemsPerPage: meta?.itemsPerPage || requestedLimit,
        hasNextPage: meta?.hasNextPage || false,
        hasPreviousPage: meta?.hasPreviousPage || false,
      },
    };
  }

  async getResponse(eventId: string, formId: string, responseId: string): Promise<FormResponse> {
    if (config.features.useMockData) {
      await delay(300);
      const response = mockFormResponses.find((item) => item.id === responseId);
      if (!response) throw new Error('Response not found');
      return response;
    }

    const response = await apiClient.get<MaybeWrapped<FormSubmissionResponse>>(`/forms/${formId}/submissions/${responseId}`);
    return submissionToFormResponse(unwrapApiData(response));
  }

  async deleteResponse(eventId: string, formId: string, responseId: string) {
    if (config.features.useMockData) {
      await delay(300);
      const index = mockFormResponses.findIndex((item) => item.id === responseId);
      if (index !== -1) mockFormResponses.splice(index, 1);
      return { success: true, message: 'Response deleted successfully' };
    }

    return apiClient.delete<{ success?: boolean; message?: string }>(`/form-submissions/${responseId}`);
  }

  async exportResponses(eventId: string, formId: string, format: 'csv' | 'xlsx' = 'csv') {
    if (config.features.useMockData) {
      await delay(800);

      const form = mockForms.find((item) => item.id === formId);
      const responses = mockFormResponses.filter((item) => item.formId === formId);
      const headers = ['Submitted At', 'Name', 'Email', ...(form?.fields.map((field) => field.label) || [])].join(',');
      const rows = responses
        .map((response) => {
          const answers = form?.fields.map((field) => response.answers[field.id] || '').join(',') || '';
          return `${response.submittedAt},${response.respondentName || ''},${response.respondentEmail || ''},${answers}`;
        })
        .join('\n');

      return new Blob([headers + '\n' + rows], { type: 'text/csv' });
    }

    const token = localStorage.getItem(config.auth.tokenKey);
    const response = await fetch(`${config.api.baseUrl}/forms/${formId}/submissions/export?format=${format}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    if (!response.ok) {
      let message = `Failed to export responses (${response.status})`;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.message) {
          message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        }
      } else {
        const text = await response.text().catch(() => '');
        if (text) {
          message = text;
        }
      }

      throw new Error(message);
    }

    return response.blob();
  }

  async getFormAnalytics(eventId: string, formId: string): Promise<FormAnalyticsSummary> {
    if (config.features.useMockData) {
      await delay(400);
      const form = mockForms.find((item) => item.id === formId);

      return {
        totalSubmissions: form?.responseCount || 0,
        completedSubmissions: form?.responseCount || 0,
        partialSubmissions: 0,
        completionRate: 87.5,
        submissionsByDay: [
          { date: '2026-01-20', count: 45 },
          { date: '2026-01-21', count: 32 },
          { date: '2026-01-22', count: 28 },
          { date: '2026-01-23', count: 51 },
        ],
      };
    }

    const response = await apiClient.get<MaybeWrapped<FormAnalyticsSummary | { analytics?: FormAnalyticsSummary }>>(
      `/forms/${formId}/analytics`,
    );
    return extractAnalyticsPayload(response);
  }

  async submitAuthenticatedForm(formId: string, data: PublicFormSubmitRequest): Promise<FormResponse> {
    if (config.features.useMockData) {
      await delay(600);
      const form = mockForms.find((item) => item.id === formId);
      if (!form) throw new Error('Form not found');

      const newResponse: FormResponse = {
        id: generateId('resp'),
        formId,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        answers: data.answers,
        submittedAt: new Date().toISOString(),
        status: 'completed',
        paymentStatus: 'n/a',
      };
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
    const response = await apiClient.post<MaybeWrapped<FormSubmissionResponse>>(`/forms/${formId}/submissions`, payload);
    return submissionToFormResponse(unwrapApiData(response));
  }

  async getPublicForms(slug: string) {
    if (config.features.useMockData) {
      await delay(400);
      return {
        event: { id: 'mock-event', name: 'Mock Event' },
        forms: mockForms.filter((form) => form.status === 'published'),
      };
    }

    const response = await apiClient.get<MaybeWrapped<any>>(`/public/events/${slug}/forms`);
    const payload = unwrapApiData(response);
    return {
      event: {
        id: payload.event?.id || '',
        name: payload.event?.title || payload.event?.name || '',
      },
      forms: Array.isArray(payload.forms) ? payload.forms.map((form: BackendFormResponse) => formFromBackend(form)) : [],
    };
  }

  async getPublicFormBySlug(slug: string, formId: string) {
    if (config.features.useMockData) {
      await delay(300);
      const form = mockForms.find((item) => item.id === formId);
      if (!form) throw new Error('Form not found');
      return form;
    }

    const response = await apiClient.get<MaybeWrapped<any>>(`/public/events/${slug}/forms/${formId}`);
    const payload = unwrapApiData(response);
    return formFromBackend(payload.form || payload);
  }

  async submitPublicForm(slug: string, formId: string, data: PublicFormSubmitRequest) {
    if (config.features.useMockData) {
      return this.submitAuthenticatedForm(formId, data);
    }

    const payload: SubmitFormRequest = {
      answersJson: {
        ...data.answers,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        metadata: data.metadata,
      },
    };
    const response = await apiClient.post<MaybeWrapped<FormSubmissionResponse>>(`/forms/${formId}/submissions`, payload);
    return submissionToFormResponse(unwrapApiData(response));
  }
}

export const formsService = new FormsService();
