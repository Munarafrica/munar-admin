// Tickets Service – Full ticketing module API layer
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import {
  ApiResponse,
  PaginatedResponse,
  SearchParams,
  CreateTicketRequest,
  UpdateTicketRequest,
  MutationResponse,
  TicketQuestion,
  CreateQuestionRequest,
  TicketSettingsData,
  CreateTicketOrderRequest,
  InitializeCheckoutRequest,
  InitializeCheckoutResponse,
  TicketOrderResponse,
  BackendTicketTypeResponse,
  PublicTicketsResponse,
  PublicTicketTypesEndpointResponse,
  PublishedWebsiteOverviewResponse,
} from '../types/api';
import { TicketType, Attendee, TicketScannerBooth, TicketScanRecord } from '../components/event-dashboard/types';
import { delay, mockTickets, mockAttendees, mockTicketScannerBooths, mockTicketScanRecords, generateId } from './mock/data';

const TICKET_ORDER_STORAGE_KEY = 'munar_active_ticket_order_id';

function unwrapTicketListResponse(
  payload: ApiResponse<BackendTicketTypeResponse[]> | ApiResponse<{ data: BackendTicketTypeResponse[] }>
): BackendTicketTypeResponse[] {
  const data = payload.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray((data as { data?: BackendTicketTypeResponse[] }).data)) {
    return (data as { data: BackendTicketTypeResponse[] }).data;
  }

  return [];
}

function unwrapTicketResponse(
  payload: ApiResponse<BackendTicketTypeResponse> | ApiResponse<{ data: BackendTicketTypeResponse }>
): BackendTicketTypeResponse {
  const data = payload.data;

  if (data && typeof data === 'object' && 'id' in data) {
    return data as BackendTicketTypeResponse;
  }

  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: BackendTicketTypeResponse }).data;
  }

  throw new Error('Invalid ticket response payload');
}

function normalizeTicketStatus(status?: string): TicketType['status'] {
  switch (status) {
    case 'ACTIVE':
      return 'On Sale';
    case 'SOLD_OUT':
      return 'Sold Out';
    case 'PAUSED':
      return 'Pause';
    case 'CLOSED':
      return 'Pause';
    case 'DRAFT':
    default:
      return 'Draft';
  }
}

function toBackendTicketStatus(status?: TicketType['status']): 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'PAUSED' | undefined {
  switch (status) {
    case 'On Sale':
      return 'ACTIVE';
    case 'Sold Out':
      return 'SOLD_OUT';
    case 'Pause':
      return 'PAUSED';
    case 'Draft':
      return 'DRAFT';
    default:
      return undefined;
  }
}

function toBackendTicketVisibility(visibility?: TicketType['visibility']): 'PUBLIC' | 'HIDDEN' | 'INVITE_ONLY' | undefined {
  switch (visibility) {
    case 'Public':
      return 'PUBLIC';
    case 'Hidden':
      return 'HIDDEN';
    case 'Invite Only':
      return 'INVITE_ONLY';
    default:
      return undefined;
  }
}

function fromBackendTicketVisibility(
  visibility?: string,
  accessRules?: Record<string, any>,
): TicketType['visibility'] {
  switch (visibility) {
    case 'PUBLIC':
      return 'Public';
    case 'HIDDEN':
      return 'Hidden';
    case 'INVITE_ONLY':
      return 'Invite Only';
    default:
      return accessRules?.visibility === 'Hidden' || accessRules?.isHidden === true
        ? 'Hidden'
        : accessRules?.visibility === 'Invite Only'
          ? 'Invite Only'
          : accessRules?.allowedAudience === 'public' || accessRules?.allowedAudience == null
            ? 'Public'
            : 'Invite Only';
  }
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDateTime(value?: string): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function toBackendTicketPayload(data: Omit<CreateTicketRequest, 'eventId'> | UpdateTicketRequest): CreateBackendTicketTypeRequest {
  const capacity =
    typeof data.quantityTotal === 'number' && !data.quantityUnlimited
      ? data.quantityTotal
      : undefined;
  const ticketKind = data.ticketKind || (data.type === 'Group' ? 'GROUP' : 'SINGLE');
  const groupSize = ticketKind === 'GROUP' && typeof data.groupSize === 'number'
    ? data.groupSize
    : undefined;

  return {
    name: data.name,
    description: data.description,
    status: toBackendTicketStatus(data.status),
    visibility: toBackendTicketVisibility(data.visibility),
    ticketKind,
    ...(groupSize ? { groupSize } : {}),
    priceMinor: data.isFree ? 0 : Math.round((data.price || 0) * 100),
    capacity,
    minPerOrder: data.minPerOrder,
    maxPerOrder: data.maxPerOrder,
    saleStartsAt: toIsoDateTime(data.salesStart),
    saleEndsAt: toIsoDateTime(data.salesEnd),
    accessRulesJson: {
      visibility: data.visibility,
      allowTransfer: data.allowTransfer,
      allowResale: data.allowResale,
      refundPolicy: data.refundPolicy,
      perks: data.perks || [],
      requireAttendeeInfo: data.requireAttendeeInfo,
    },
    customQuestionsJson: undefined as Record<string, unknown> | undefined,
  };
}

function fromBackendTicket(ticket: BackendTicketTypeResponse): TicketType {
  const accessRules = (ticket.accessRulesJson || {}) as Record<string, any>;
  const quantityTotal = ticket.capacity ?? ticket.soldCount;
  const ticketKind = ticket.ticketKind === 'GROUP' ? 'GROUP' : 'SINGLE';
  const type: TicketType['type'] = ticketKind === 'GROUP' ? 'Group' : 'Single';
  const attendeesPerUnit = ticket.attendeesPerUnit ?? ticket.groupSize ?? 1;
  const visibility = fromBackendTicketVisibility(ticket.visibility, accessRules);
  const perks = Array.isArray(accessRules.perks)
    ? accessRules.perks
        .filter((perk): perk is { id?: unknown; name?: unknown } => Boolean(perk) && typeof perk === 'object')
        .map((perk, index) => ({
          id: typeof perk.id === 'string' && perk.id.length > 0 ? perk.id : `perk-${ticket.id}-${index}`,
          name: typeof perk.name === 'string' ? perk.name : '',
        }))
        .filter((perk) => perk.name.trim().length > 0)
    : [];

  return {
    eventId: ticket.eventId,
    id: ticket.id,
    name: ticket.name,
    type,
    ticketKind,
    groupSize: ticketKind === 'GROUP' ? (ticket.groupSize ?? attendeesPerUnit) : undefined,
    attendeesPerUnit,
    isFree: ticket.priceMinor === 0,
    price: ticket.priceMinor / 100,
    quantitySold: ticket.soldCount,
    quantityTotal,
    quantityUnlimited: ticket.capacity == null,
    status: normalizeTicketStatus(ticket.status),
    salesStart: toDateTimeLocalValue(ticket.saleStartsAt),
    salesEnd: toDateTimeLocalValue(ticket.saleEndsAt),
    minPerOrder: ticket.minPerOrder ?? 1,
    maxPerOrder: ticket.maxPerOrder ?? 10,
    visibility,
    description: ticket.description || undefined,
    perks,
    allowTransfer: accessRules.allowTransfer === true,
    allowResale: accessRules.allowResale === true,
    refundPolicy: accessRules.refundPolicy === 'Refundable' ? 'Refundable' : 'Non-refundable',
    requireAttendeeInfo: accessRules.requireAttendeeInfo === true,
  };
}

function normalizeAttendee(raw: any): Attendee {
  const status = raw.checkInStatus === 'CHECKED_IN'
    ? 'Checked In'
    : raw.checkInStatus === 'REVERSED'
      ? 'Cancelled'
      : raw.status === 'checked-in'
        ? 'Checked In'
        : raw.status === 'cancelled'
          ? 'Cancelled'
          : 'Confirmed';

  return {
    id: raw.id,
    name: raw.fullName || raw.name || 'Unnamed attendee',
    email: raw.email || '',
    phone: raw.phone || undefined,
    ticketTypeId: raw.ticketTypeId || raw.ticketId || raw.orderItemId || '',
    ticketTypeName: raw.ticketType?.name || raw.ticketTypeName || '',
    purchaseDate: raw.createdAt || '',
    status,
    checkedIn: raw.checkInStatus === 'CHECKED_IN' || raw.status === 'checked-in',
    checkedInAt: raw.checkedInAt || null,
    orderReference: raw.ticketOrderId || raw.orderReference || '',
    qrCode: raw.badgeCode || raw.qrCode || '',
    questionAnswers: raw.questionAnswers,
    metadata: raw.metadataJson || raw.metadata,
  };
}

function normalizeScannerBooth(raw: any, fallbackEventId?: string): TicketScannerBooth {
  const assignedScanner = raw.assignedScanner || raw.scanner || {};
  const status = raw.status === 'ACTIVE' || raw.status === 'INACTIVE' ? raw.status : 'UNCLAIMED';

  return {
    id: raw.id,
    eventId: raw.eventId || fallbackEventId || '',
    name: raw.name || 'Booth',
    status,
    pairingToken: raw.pairingToken || raw.token || '',
    pairingUrl: raw.pairingUrl || raw.qrCodeUrl || raw.qrUrl,
    assignedScannerName: raw.assignedScannerName || assignedScanner.name,
    assignedScannerEmail: raw.assignedScannerEmail || assignedScanner.email,
    assignedScannerPhone: raw.assignedScannerPhone || assignedScanner.phone,
    linkedAt: raw.linkedAt || raw.claimedAt || null,
    totalScans: raw.totalScans ?? raw.scanCount ?? 0,
    lastScanAt: raw.lastScanAt || null,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function normalizeScanRecord(raw: any, fallbackEventId?: string): TicketScanRecord {
  const attendee = raw.attendee || {};
  const booth = raw.booth || raw.scannerBooth || {};

  return {
    id: raw.id,
    eventId: raw.eventId || fallbackEventId || '',
    boothId: raw.boothId || raw.scannerBoothId || booth.id || '',
    boothName: raw.boothName || booth.name || 'Booth',
    attendeeId: raw.attendeeId || attendee.id || '',
    attendeeName: raw.attendeeName || attendee.fullName || attendee.name || 'Unnamed attendee',
    attendeeEmail: raw.attendeeEmail || attendee.email,
    ticketTypeName: raw.ticketTypeName || raw.ticketType?.name || attendee.ticketTypeName || '',
    scannedAt: raw.scannedAt || raw.createdAt || new Date().toISOString(),
    result: raw.result === 'DUPLICATE' || raw.result === 'INVALID' ? raw.result : 'VALID',
    scannerName: raw.scannerName || raw.assignedScannerName || raw.scanner?.name,
  };
}

function normalizeQuestionType(type?: string): TicketQuestion['type'] {
  switch (type?.toUpperCase()) {
    case 'SELECT':
    case 'DROPDOWN':
      return 'dropdown';
    case 'CHECKBOX':
    case 'BOOLEAN':
      return 'checkbox';
    case 'TEXT':
    default:
      return 'text';
  }
}

function normalizeTicketQuestion(raw: any, fallbackEventId?: string): TicketQuestion {
  const ticketTypeIds = Array.isArray(raw?.ticketTypeIds)
    ? raw.ticketTypeIds.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
    : [];
  const ticketIds = raw?.appliesToAll === true || ticketTypeIds.length === 0
    ? ['all']
    : ticketTypeIds;
  const options = Array.isArray(raw?.options)
    ? raw.options.filter((option: unknown): option is string => typeof option === 'string')
    : [];

  return {
    id: typeof raw?.id === 'string' ? raw.id : generateId('q'),
    eventId: typeof raw?.eventId === 'string' ? raw.eventId : fallbackEventId,
    label: typeof raw?.label === 'string' ? raw.label : '',
    type: normalizeQuestionType(typeof raw?.type === 'string' ? raw.type : undefined),
    required: raw?.required === true,
    description: typeof raw?.description === 'string' ? raw.description : undefined,
    placeholder: typeof raw?.placeholder === 'string' ? raw.placeholder : undefined,
    ticketIds,
    ticketTypeIds,
    appliesToAll: raw?.appliesToAll === true || ticketTypeIds.length === 0,
    options,
    configJson: raw?.configJson && typeof raw.configJson === 'object' ? raw.configJson : undefined,
    sortOrder: typeof raw?.sortOrder === 'number' ? raw.sortOrder : 0,
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

function unwrapQuestionListResponse(payload: ApiResponse<any[]> | any[]): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function unwrapQuestionResponse(payload: ApiResponse<any> | any): any {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<any>).data;
  }

  return payload;
}

function unwrapPayloadResponse<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiResponse<T>)) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

function buildPublicTicketsResponse(
  event: {
    id: string;
    slug?: string;
    name?: string;
    title?: string;
    date?: string;
    time?: string;
    venueLocation?: string;
    currency?: string;
    type?: string;
  },
  tickets: TicketType[],
): PublicTicketsResponse {
  return {
    event: {
      id: event.id,
      name: event.name || event.title || 'Event',
      slug: event.slug || event.id,
      date: event.date || '',
      time: event.time || '',
      type: event.type || 'Physical',
      currency: event.currency || 'NGN',
      venueLocation: event.venueLocation,
      summary: undefined,
    },
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      description: ticket.description,
      type: ticket.type,
      groupSize: ticket.groupSize,
      attendeesPerUnit: ticket.attendeesPerUnit,
      isFree: ticket.isFree,
      price: ticket.price || 0,
      available: Math.max(0, (ticket.quantityTotal || 0) - (ticket.quantitySold || 0)),
      quantityTotal: ticket.quantityTotal || 0,
      minPerOrder: ticket.minPerOrder,
      maxPerOrder: ticket.maxPerOrder,
      perks: ticket.perks,
      requireAttendeeInfo: ticket.requireAttendeeInfo,
      checkoutQuestions: [],
    })),
    questions: [],
  };
}

class TicketsService {
  // ══════════════════════════════════════════════════════════
  //  TICKET CRUD
  // ══════════════════════════════════════════════════════════

  async getTickets(eventId: string, params?: SearchParams): Promise<TicketType[]> {
    if (config.features.useMockData) {
      await delay(400);
      return mockTickets.filter(t => t.eventId === eventId);
    }
    const response = await apiClient.get<ApiResponse<BackendTicketTypeResponse[]> | ApiResponse<{ data: BackendTicketTypeResponse[] }>>(
      `/events/${eventId}/ticket-types`,
      { params: params as Record<string, string | number | boolean | undefined> },
    );
    return unwrapTicketListResponse(response).map(fromBackendTicket);
  }

  async getTicket(eventId: string, ticketId: string): Promise<TicketType> {
    if (config.features.useMockData) {
      await delay(300);
      const ticket = mockTickets.find(t => t.id === ticketId);
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }
    const response = await apiClient.get<ApiResponse<BackendTicketTypeResponse> | ApiResponse<{ data: BackendTicketTypeResponse }>>(`/ticket-types/${ticketId}`);
    return fromBackendTicket(unwrapTicketResponse(response));
  }

  async createTicket(eventId: string, data: Omit<CreateTicketRequest, 'eventId'>): Promise<TicketType> {
    if (config.features.useMockData) {
      await delay(600);
      const newTicket: TicketType = {
        eventId,
        id: generateId('t'),
        name: data.name,
        type: data.type,
        ticketKind: data.ticketKind,
        groupSize: data.groupSize,
        attendeesPerUnit: data.attendeesPerUnit,
        isFree: data.isFree,
        price: data.price,
        quantitySold: 0,
        quantityTotal: data.quantityTotal,
        status: (data.status as any) || 'Draft',
        salesStart: data.salesStart,
        salesEnd: data.salesEnd,
        minPerOrder: data.minPerOrder,
        maxPerOrder: data.maxPerOrder,
        visibility: data.visibility,
        description: data.description,
        perks: data.perks,
        allowTransfer: data.allowTransfer,
        allowResale: data.allowResale,
        refundPolicy: data.refundPolicy,
        requireAttendeeInfo: data.requireAttendeeInfo,
      };
      mockTickets.push(newTicket);
      return newTicket;
    }
    const response = await apiClient.post<ApiResponse<BackendTicketTypeResponse> | ApiResponse<{ data: BackendTicketTypeResponse }>>(
      `/events/${eventId}/ticket-types`,
      toBackendTicketPayload(data),
    );
    return fromBackendTicket(unwrapTicketResponse(response));
  }

  async updateTicket(eventId: string, ticketId: string, data: UpdateTicketRequest): Promise<TicketType> {
    if (config.features.useMockData) {
      await delay(400);
      const index = mockTickets.findIndex(t => t.id === ticketId);
      if (index === -1) throw new Error('Ticket not found');
      mockTickets[index] = { ...mockTickets[index], ...data } as TicketType;
      return mockTickets[index];
    }
    const response = await apiClient.patch<ApiResponse<BackendTicketTypeResponse> | ApiResponse<{ data: BackendTicketTypeResponse }>>(
      `/ticket-types/${ticketId}`,
      toBackendTicketPayload(data),
    );
    return fromBackendTicket(unwrapTicketResponse(response));
  }

  async deleteTicket(eventId: string, ticketId: string): Promise<TicketType> {
    if (config.features.useMockData) {
      await delay(400);
      const index = mockTickets.findIndex(t => t.id === ticketId);
      if (index === -1) throw new Error('Ticket not found');
      const [deletedTicket] = mockTickets.splice(index, 1);
      return deletedTicket;
    }
    const response = await apiClient.delete<ApiResponse<{ data: BackendTicketTypeResponse }>>(`/ticket-types/${ticketId}`);
    return fromBackendTicket(unwrapTicketResponse(response));
  }

  async duplicateTicket(eventId: string, ticketId: string): Promise<TicketType> {
    if (config.features.useMockData) {
      await delay(500);
      const original = mockTickets.find(t => t.id === ticketId);
      if (!original) throw new Error('Ticket not found');
      const duplicated: TicketType = {
        ...original,
        id: generateId('t'),
        name: `${original.name} (Copy)`,
        status: 'Draft',
        quantitySold: 0,
      };
      mockTickets.push(duplicated);
      return duplicated;
    }
    const ticket = await this.getTicket(eventId, ticketId);
    return this.createTicket(eventId, {
      name: `${ticket.name} (Copy)`,
      type: ticket.type,
      groupSize: ticket.groupSize,
      isFree: ticket.isFree,
      price: ticket.price,
      quantityTotal: ticket.quantityTotal,
      salesStart: ticket.salesStart,
      salesEnd: ticket.salesEnd,
      minPerOrder: ticket.minPerOrder,
      maxPerOrder: ticket.maxPerOrder,
      visibility: ticket.visibility,
      description: ticket.description,
      perks: ticket.perks,
      allowTransfer: ticket.allowTransfer,
      allowResale: ticket.allowResale,
      refundPolicy: ticket.refundPolicy,
      requireAttendeeInfo: ticket.requireAttendeeInfo,
    });
  }

  async reorderTickets(eventId: string, order: string[]): Promise<void> {
    if (config.features.useMockData) {
      await delay(300);
      return;
    }
    await Promise.all(order.map((ticketTypeId, index) =>
      apiClient.patch(`/ticket-types/${ticketTypeId}`, {
        accessRulesJson: { sortOrder: index },
      }),
    ));
  }

  // ══════════════════════════════════════════════════════════
  //  SCANNER BOOTHS
  // ══════════════════════════════════════════════════════════

  async getScannerBooths(eventId: string): Promise<TicketScannerBooth[]> {
    if (config.features.useMockData) {
      await delay(350);
      return mockTicketScannerBooths.filter((booth) => booth.eventId === eventId);
    }
    const response = await apiClient.get<ApiResponse<any[]> | any[]>(`/events/${eventId}/scanner-booths`);
    const data = Array.isArray(response) ? response : response.data;
    return (data || []).map((booth) => normalizeScannerBooth(booth, eventId));
  }

  async createScannerBooth(eventId: string): Promise<TicketScannerBooth> {
    if (config.features.useMockData) {
      await delay(500);
      const nextNumber = mockTicketScannerBooths
        .filter((booth) => booth.eventId === eventId)
        .reduce((max, booth) => {
          const match = booth.name.match(/^Booth\s+(\d+)$/i);
          return Math.max(max, match ? Number(match[1]) : 0);
        }, 0) + 1;
      const id = generateId('booth');
      const pairingToken = `${eventId}-${id}-pairing-token`;
      const booth: TicketScannerBooth = {
        id,
        eventId,
        name: `Booth ${nextNumber}`,
        status: 'UNCLAIMED',
        pairingToken,
        pairingUrl: `https://app.munar.co/scanner/pair/${pairingToken}`,
        linkedAt: null,
        totalScans: 0,
        lastScanAt: null,
        createdAt: new Date().toISOString(),
      };
      mockTicketScannerBooths.push(booth);
      return booth;
    }
    const response = await apiClient.post<ApiResponse<any> | any>(`/events/${eventId}/scanner-booths`, {});
    return normalizeScannerBooth(unwrapPayloadResponse(response), eventId);
  }

  async deleteScannerBooth(eventId: string, boothId: string): Promise<void> {
    if (config.features.useMockData) {
      await delay(350);
      const index = mockTicketScannerBooths.findIndex((booth) => booth.id === boothId && booth.eventId === eventId);
      if (index === -1) throw new Error('Booth not found');
      mockTicketScannerBooths.splice(index, 1);
      return;
    }
    await apiClient.delete(`/scanner-booths/${boothId}`);
  }

  async getScannerBoothScans(eventId: string, boothId?: string): Promise<TicketScanRecord[]> {
    if (config.features.useMockData) {
      await delay(350);
      return mockTicketScanRecords
        .filter((scan) => scan.eventId === eventId && (!boothId || scan.boothId === boothId))
        .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
    }
    const response = await apiClient.get<ApiResponse<any[]> | any[]>(`/events/${eventId}/scanner-booth-scans`, {
      params: boothId ? { boothId } : undefined,
    });
    const data = Array.isArray(response) ? response : response.data;
    return (data || []).map((scan) => normalizeScanRecord(scan, eventId));
  }

  // ══════════════════════════════════════════════════════════
  //  ATTENDEES
  // ══════════════════════════════════════════════════════════

  async getAttendees(eventId: string, params?: SearchParams & { ticketId?: string; status?: string }): Promise<PaginatedResponse<Attendee>> {
    if (config.features.useMockData) {
      await delay(500);
      let filtered = [...mockAttendees];
      if (params?.ticketId) filtered = filtered.filter(a => a.ticketTypeId === params.ticketId);
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(search) || a.email.toLowerCase().includes(search));
      }
      return {
        data: filtered,
        meta: {
          currentPage: params?.page || 1,
          totalPages: 1,
          totalItems: filtered.length,
          itemsPerPage: params?.limit || 50,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    const response = await apiClient.get<Attendee[] | ApiResponse<Attendee[]>>(`/events/${eventId}/attendees`, {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    const data = Array.isArray(response) ? response : response.data;
    return {
      data: (data || []).map(normalizeAttendee),
      meta: {
        currentPage: params?.page || 1,
        totalPages: 1,
        totalItems: data?.length || 0,
        itemsPerPage: data?.length || params?.limit || 50,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async checkInAttendee(eventId: string, attendeeId: string): Promise<Attendee> {
    if (config.features.useMockData) {
      await delay(300);
      const attendee = mockAttendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');
      attendee.checkedIn = true;
      return attendee;
    }
    const response = await apiClient.post<ApiResponse<any>>(`/attendees/${attendeeId}/check-in`);
    return normalizeAttendee(response.data);
  }

  async undoCheckIn(eventId: string, attendeeId: string): Promise<Attendee> {
    if (config.features.useMockData) {
      await delay(300);
      const attendee = mockAttendees.find(a => a.id === attendeeId);
      if (!attendee) throw new Error('Attendee not found');
      attendee.checkedIn = false;
      return attendee;
    }
    const attendee = await this.checkInAttendee(eventId, attendeeId);
    return { ...attendee, checkedIn: false, status: 'Cancelled' };
  }

  async exportAttendees(eventId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    if (config.features.useMockData) {
      await delay(800);
      const headers = 'Name,Email,Ticket Type,Status,Checked In\n';
      const rows = mockAttendees.map(a =>
        `${a.name},${a.email},${a.ticketTypeName},${a.status},${a.checkedIn ? 'Yes' : 'No'}`
      ).join('\n');
      return new Blob([headers + rows], { type: 'text/csv' });
    }
    const response = await fetch(`${config.api.baseUrl}/events/${eventId}/attendees/export?format=${format}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem(config.auth.tokenKey)}` },
    });
    return response.blob();
  }

  // ══════════════════════════════════════════════════════════
  //  ANALYTICS
  // ══════════════════════════════════════════════════════════

  async getTicketAnalytics(eventId: string) {
    if (config.features.useMockData) {
      await delay(400);
      const totalSold = mockTickets.reduce((sum, t) => sum + t.quantitySold, 0);
      const totalAvailable = mockTickets.reduce((sum, t) => sum + t.quantityTotal, 0);
      const totalRevenue = mockTickets.reduce((sum, t) => sum + (t.price || 0) * t.quantitySold, 0);
      return { totalRevenue, totalSold, totalAvailable, totalAttendees: mockAttendees.length, totalCheckedIn: mockAttendees.filter(a => a.checkedIn).length, salesByTicketType: mockTickets.map(t => ({ ticketId: t.id, ticketName: t.name, sold: t.quantitySold, total: t.quantityTotal, revenue: (t.price || 0) * t.quantitySold })) };
    }
    const response = await apiClient.get<ApiResponse<any>>(`/events/${eventId}/tickets/analytics`);
    return response.data;
  }

  // ══════════════════════════════════════════════════════════
  //  CHECKOUT QUESTIONS
  // ══════════════════════════════════════════════════════════

  async getQuestions(eventId: string): Promise<TicketQuestion[]> {
    if (config.features.useMockData) {
      await delay(300);
      return [];
    }
    const response = await apiClient.get<ApiResponse<any[]> | any[]>(`/events/${eventId}/ticket-questions`);
    return unwrapQuestionListResponse(response).map((question) => normalizeTicketQuestion(question, eventId));
  }

  async createQuestion(eventId: string, data: CreateQuestionRequest): Promise<TicketQuestion> {
    if (config.features.useMockData) {
      await delay(400);
      return { id: generateId('q'), eventId, sortOrder: 0, ...data } as TicketQuestion;
    }
    const payload = {
      label: data.label,
      type: data.type === 'dropdown' ? 'SELECT' : data.type.toUpperCase(),
      required: data.required,
      options: data.options || [],
      description: data.description,
      placeholder: data.placeholder,
      scope: {
        ticketTypeIds: !data.ticketIds || data.ticketIds.length === 0 || data.ticketIds.includes('all') ? 'all' : data.ticketIds,
      },
    };
    const response = await apiClient.post<ApiResponse<any> | any>(`/events/${eventId}/ticket-questions`, payload);
    return normalizeTicketQuestion(unwrapQuestionResponse(response), eventId);
  }

  async updateQuestion(eventId: string, questionId: string, data: Partial<CreateQuestionRequest>): Promise<TicketQuestion> {
    if (config.features.useMockData) {
      await delay(400);
      return { id: questionId, eventId, label: '', type: 'text', required: false, ticketIds: ['all'], sortOrder: 0, ...data } as TicketQuestion;
    }
    const payload = {
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(data.type !== undefined ? { type: data.type === 'dropdown' ? 'SELECT' : data.type.toUpperCase() } : {}),
      ...(data.required !== undefined ? { required: data.required } : {}),
      ...(data.options !== undefined ? { options: data.options } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.placeholder !== undefined ? { placeholder: data.placeholder } : {}),
      ...(data.ticketIds !== undefined
        ? {
            scope: {
              ticketTypeIds: data.ticketIds.length === 0 || data.ticketIds.includes('all') ? 'all' : data.ticketIds,
            },
          }
        : {}),
    };
    const response = await apiClient.put<ApiResponse<any> | any>(`/events/${eventId}/ticket-questions/${questionId}`, payload);
    return normalizeTicketQuestion(unwrapQuestionResponse(response), eventId);
  }

  async deleteQuestion(eventId: string, questionId: string): Promise<void> {
    if (config.features.useMockData) {
      await delay(300);
      return;
    }
    await apiClient.delete(`/events/${eventId}/ticket-questions/${questionId}`);
  }

  // ══════════════════════════════════════════════════════════
  //  TICKET SETTINGS
  // ══════════════════════════════════════════════════════════

  async getSettings(eventId: string): Promise<TicketSettingsData> {
    if (config.features.useMockData) {
      await delay(300);
      return { enableTransfers: true, enableResale: false, resaleCap: 10, refundPolicy: 'flexible', supportEmail: '' };
    }
    const response = await apiClient.get<ApiResponse<TicketSettingsData>>(`/events/${eventId}/ticket-settings`);
    return response.data;
  }

  async updateSettings(eventId: string, data: TicketSettingsData): Promise<TicketSettingsData> {
    if (config.features.useMockData) {
      await delay(400);
      return data;
    }
    const response = await apiClient.put<ApiResponse<TicketSettingsData>>(`/events/${eventId}/ticket-settings`, data);
    return response.data;
  }

  // ══════════════════════════════════════════════════════════
  //  PUBLIC (No Auth)
  // ══════════════════════════════════════════════════════════

  async getPublicTickets(slug: string): Promise<PublicTicketsResponse> {
    if (config.features.useMockData) {
      await delay(500);
      return buildPublicTicketsResponse(
        {
          id: 'evt-1',
          slug,
          name: 'Lagos Tech Summit 2026',
          date: '2026-06-12',
          time: '09:00',
          type: 'Physical',
          currency: 'NGN',
          venueLocation: 'Eko Convention Centre, Lagos',
        },
        mockTickets.filter((ticket) => ticket.eventId === 'evt-1'),
      );
    }
    const [publicTicketResponse, eventResponse] = await Promise.all([
      apiClient.get<PublicTicketTypesEndpointResponse>(`/public/events/${slug}/ticket-types`),
      apiClient.get<PublishedWebsiteOverviewResponse>(`/public/events/${slug}/website`).catch(() => null),
    ]);
    const event = publicTicketResponse.event;
    const fallbackEvent = eventResponse?.event;
    const questions = (publicTicketResponse.ticketQuestions || []).map((question) =>
      normalizeTicketQuestion(question, event.id),
    );

    return {
      event: {
        id: event.id,
        name: event.name || event.title || fallbackEvent?.title || 'Event',
        slug: event.slug,
        date: fallbackEvent?.startsAt || event.startsAt || '',
        time: fallbackEvent?.startsAt || event.startsAt || '',
        endDate: fallbackEvent?.endsAt || event.endsAt || undefined,
        endTime: fallbackEvent?.endsAt || event.endsAt || undefined,
        type: event.isOnline ? 'Virtual' : 'Physical',
        coverImageUrl: fallbackEvent?.coverImageUrl || undefined,
        venueLocation: fallbackEvent?.venueName || fallbackEvent?.venueAddress || event.venueName || event.venueAddress || undefined,
        currency: event.currency || 'NGN',
        summary: event.summary || fallbackEvent?.summary || undefined,
      },
      tickets: (publicTicketResponse.ticketTypes || []).map((ticket) => {
        const accessRules = (ticket.accessRulesJson || {}) as Record<string, unknown>;
        const checkoutQuestions = Array.isArray(ticket.checkoutQuestions)
          ? ticket.checkoutQuestions.map((question) => normalizeTicketQuestion(question, event.id))
          : questions.filter((question) =>
              question.ticketIds.includes('all') || question.ticketIds.includes(ticket.id),
            );
        const ticketKind = ticket.ticketKind === 'GROUP' ? 'Group' : 'Single';
        const attendeesPerUnit = ticket.attendeesPerUnit ?? ticket.groupSize ?? 1;

        return {
          id: ticket.id,
          name: ticket.name,
          description: ticket.description || undefined,
          type: ticketKind,
          groupSize: ticket.groupSize ?? undefined,
          attendeesPerUnit,
          isFree: (ticket.priceMinor || 0) === 0,
          price: (ticket.priceMinor || 0) / 100,
          available: ticket.capacity == null
            ? Number.MAX_SAFE_INTEGER
            : Math.max(0, ticket.capacity - (ticket.soldCount ?? 0)),
          quantityTotal: ticket.capacity ?? (ticket.soldCount ?? 0),
          minPerOrder: ticket.minPerOrder ?? 1,
          maxPerOrder: ticket.maxPerOrder ?? 10,
          perks: Array.isArray((accessRules as { perks?: unknown }).perks)
            ? ((accessRules as { perks: Array<{ id?: string; name?: string }> }).perks || [])
                .filter((perk) => perk && typeof perk.name === 'string')
                .map((perk, index) => ({ id: perk.id || `${ticket.id}-perk-${index}`, name: perk.name as string }))
            : [],
          requireAttendeeInfo: accessRules.requireAttendeeInfo === true,
          checkoutQuestions,
        };
      }),
      questions,
    };
  }

  saveActiveTicketOrderId(orderId: string | null) {
    if (typeof window === 'undefined') return;
    if (orderId) {
      window.localStorage.setItem(TICKET_ORDER_STORAGE_KEY, orderId);
    } else {
      window.localStorage.removeItem(TICKET_ORDER_STORAGE_KEY);
    }
  }

  getActiveTicketOrderId(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TICKET_ORDER_STORAGE_KEY);
  }

  async createOrder(eventId: string, data: CreateTicketOrderRequest): Promise<TicketOrderResponse> {
    if (config.features.useMockData) {
      await delay(800);
      return {
        id: 'ord-1',
        tenantId: 'tenant-1',
        eventId,
        buyerUserId: 'user-1',
        status: 'RESERVED',
        email: data.email,
        currency: 'NGN',
        subtotalMinor: 500000,
        vatMinor: 37500,
        feeMinor: 0,
        totalMinor: 537500,
        reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        metadataJson: data.metadataJson || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    }
    const response = await apiClient.post<ApiResponse<TicketOrderResponse> | TicketOrderResponse>(`/events/${eventId}/ticket-orders`, data);
    const order = unwrapPayloadResponse(response);
    this.saveActiveTicketOrderId(order.id);
    return order;
  }

  async initializeCheckout(
    ticketOrderId: string,
    data?: InitializeCheckoutRequest,
  ): Promise<InitializeCheckoutResponse> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        provider: 'paystack',
        providerReference: 'mock-ref',
        authorizationUrl: 'https://checkout.paystack.com/mock',
        paymentTransactionId: 'txn-1',
        status: 'PENDING',
        amountMinor: 500000,
        currency: 'NGN',
        ticketOrderId,
      };
    }
    const response = await apiClient.post<ApiResponse<InitializeCheckoutResponse> | InitializeCheckoutResponse>(
      `/payments/ticket-orders/${ticketOrderId}/checkout`,
      data,
    );
    return unwrapPayloadResponse(response);
  }

  async getOrder(ticketOrderId: string): Promise<TicketOrderResponse> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        id: ticketOrderId,
        tenantId: 'tenant-1',
        eventId: 'evt-1',
        buyerUserId: 'user-1',
        status: 'PAID',
        email: 'demo@example.com',
        currency: 'NGN',
        subtotalMinor: 500000,
        vatMinor: 37500,
        feeMinor: 0,
        totalMinor: 537500,
        reservationExpiresAt: null,
        metadataJson: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      };
    }
    const response = await apiClient.get<ApiResponse<TicketOrderResponse> | TicketOrderResponse>(`/ticket-orders/${ticketOrderId}`);
    return unwrapPayloadResponse(response);
  }

  async validateTicketQR(attendeeId: string, eventId: string) {
    if (config.features.useMockData) {
      await delay(500);
      return { id: attendeeId, name: 'Test User', status: 'checked-in', alreadyCheckedIn: false };
    }
    const response = await apiClient.post<ApiResponse<any>>(`/public/tickets/validate`, { attendeeId, eventId });
    return response.data;
  }
}

export const ticketsService = new TicketsService();
