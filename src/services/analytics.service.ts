import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { ApiResponse, MutationResponse } from '../types/api';
import {
  AnalyticsFilters,
  AnalyticsKpi,
  EventAnalytics,
  ExportRequest,
  ScheduleReportRequest,
  TimeSeriesPoint,
} from '../types/analytics';
import { delay } from './mock/data';

const buildSeries = (days: number, base: number, variance: number): TimeSeriesPoint[] => {
  const points: TimeSeriesPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const value = Math.max(0, Math.round(base + (Math.random() * variance - variance / 2)));
    points.push({ date: date.toISOString().slice(0, 10), value });
  }

  return points;
};

const randomBetween = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

const buildKpi = (id: string, label: string, value: number, sparkline: TimeSeriesPoint[] = []): AnalyticsKpi => ({
  id,
  label,
  value,
  changePercent: 0,
  sparkline,
});

const buildDefaultAnalytics = (eventId: string, currency: string): EventAnalytics => ({
  eventId,
  currency,
  summary: {
    registrations: buildKpi('registrations', 'Registrations', 0),
    websiteViews: buildKpi('website-views', 'Website Views', 0),
    ticketsSold: buildKpi('tickets-sold', 'Tickets Sold', 0),
    totalRevenue: buildKpi('total-revenue', 'Total Revenue', 0),
    checkIns: buildKpi('check-ins', 'Check-ins', 0),
    surveyResponses: buildKpi('survey-responses', 'Survey Responses', 0),
  },
  ticketSales: {
    totalRevenue: 0,
    salesTrend: [],
    revenueByType: [],
    salesByChannel: [],
    funnel: [],
    inventoryWarnings: [],
  },
  attendance: {
    registered: 0,
    checkedIn: 0,
    checkInRate: 0,
    noShowRate: 0,
    peakArrivalTimes: [],
    sessionMetrics: [],
    heatmap: [],
  },
  engagement: {
    pollParticipation: 0,
    voteCount: 0,
    chatMessages: 0,
    qnaQuestions: 0,
    engagementRate: 0,
    interactions: [],
    sessionBookmarks: [],
    speakerQna: [],
    websiteClicks: [],
  },
  financial: {
    revenueStreams: [],
    costBreakdown: [],
    totalRevenue: 0,
    totalCost: 0,
    roiPercent: 0,
    revenuePerAttendee: 0,
    cpaByChannel: [],
  },
  campaigns: {
    campaigns: [],
    landingPages: [],
    channelPerformance: [],
  },
  content: {
    viewTrend: [],
    sessions: [],
  },
  networking: {
    leadsCaptured: 0,
    leadQualificationRate: 0,
    conversions: 0,
    meetingsSent: 0,
    meetingsAccepted: 0,
    messagesExchanged: 0,
    topPairs: [],
  },
  reports: {
    templates: [],
    scheduled: [],
    exportFormats: ['csv', 'pdf'],
  },
  alertsPrivacy: {
    alerts: [],
    notificationSettings: {
      inApp: true,
      email: true,
    },
    privacy: {
      consentRequired: true,
      behavioralTracking: true,
      dataRetentionDays: 365,
      anonymizePublicData: true,
    },
  },
  comparisons: {
    timeline: [],
    comparisons: [],
  },
  filters: {
    ticketTypes: ['All'],
    channels: ['All'],
    locations: ['All'],
  },
});

type CanonicalSummaryResponse = {
  eventId: string;
  currency?: string;
  summary: Record<string, { value?: number; unit?: string; scope?: string }>;
  definitions?: Record<string, string>;
  source?: EventAnalytics['source'];
};

const hasDetailedAnalytics = (payload: unknown): payload is EventAnalytics =>
  Boolean(payload && typeof payload === 'object' && 'ticketSales' in payload && 'attendance' in payload);

const hasCanonicalSummary = (payload: unknown): payload is CanonicalSummaryResponse =>
  Boolean(payload && typeof payload === 'object' && 'summary' in payload);

const normalizeCanonicalSummary = (payload: CanonicalSummaryResponse): EventAnalytics => {
  const currency = payload.currency || config.app.defaultCurrency;
  const base = buildDefaultAnalytics(payload.eventId, currency);
  const registrations = Number(payload.summary.registrations?.value ?? 0);
  const websiteViews = Number(payload.summary.websiteViews?.value ?? 0);
  const ticketsSold = Number(payload.summary.ticketsSold?.value ?? 0);
  const totalRevenueRaw = Number(payload.summary.totalRevenue?.value ?? 0);
  const totalRevenue = payload.summary.totalRevenue?.unit === 'minor'
    ? totalRevenueRaw / 100
    : totalRevenueRaw;
  const checkIns = Number(payload.summary.checkIns?.value ?? 0);
  const surveyResponses = Number(payload.summary.surveyResponses?.value ?? 0);

  return {
    ...base,
    summary: {
      registrations: buildKpi('registrations', 'Registrations', registrations),
      websiteViews: buildKpi('website-views', 'Website Views', websiteViews),
      ticketsSold: buildKpi('tickets-sold', 'Tickets Sold', ticketsSold),
      totalRevenue: buildKpi('total-revenue', 'Gross Revenue', totalRevenue),
      checkIns: buildKpi('check-ins', 'Check-ins', checkIns),
      surveyResponses: buildKpi('survey-responses', 'Survey Responses', surveyResponses),
    },
    ticketSales: {
      ...base.ticketSales,
      totalRevenue,
    },
    attendance: {
      ...base.attendance,
      registered: registrations,
      checkedIn: checkIns,
      checkInRate: registrations > 0 ? checkIns / registrations : 0,
      noShowRate: registrations > 0 ? Math.max(registrations - checkIns, 0) / registrations : 0,
    },
    financial: {
      ...base.financial,
      totalRevenue,
    },
    comparisons: {
      ...base.comparisons,
      comparisons: [
        {
          year: new Date().getFullYear().toString(),
          ticketsSold,
          revenue: totalRevenue,
          engagementScore: 0,
          checkedIn: checkIns,
          nps: 0,
        },
      ],
    },
    definitions: payload.definitions,
    source: payload.source,
  };
};

const normalizeEventAnalytics = (payload: unknown, eventId: string): EventAnalytics => {
  if (hasDetailedAnalytics(payload)) {
    const base = buildDefaultAnalytics(payload.eventId || eventId, payload.currency || config.app.defaultCurrency);
    return {
      ...base,
      ...payload,
      summary: {
        ...base.summary,
        ...payload.summary,
      },
      filters: {
        ...base.filters,
        ...payload.filters,
      },
    };
  }

  if (hasCanonicalSummary(payload)) {
    return normalizeCanonicalSummary(payload);
  }

  return buildDefaultAnalytics(eventId, config.app.defaultCurrency);
};

const toApiParams = (filters: AnalyticsFilters) => {
  const params: Record<string, string> = {};
  const now = new Date();
  const toDate = (date: Date) => date.toISOString().slice(0, 10);

  if (filters.dateRange === 'custom') {
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return params;
  }

  const start = new Date(now);
  if (filters.dateRange === '30d') start.setDate(now.getDate() - 29);
  else if (filters.dateRange === '90d') start.setDate(now.getDate() - 89);
  else start.setDate(now.getDate() - 6);

  params.startDate = toDate(start);
  params.endDate = toDate(now);
  return params;
};

const buildMockAnalytics = (eventId: string, filters: AnalyticsFilters): EventAnalytics => {
  const days = filters.dateRange === '30d' ? 30 : filters.dateRange === '90d' ? 90 : 7;
  const revenueTrend = buildSeries(days, 180000, 60000);
  const ticketsTrend = buildSeries(days, 120, 40);
  const checkInTrend = buildSeries(days, 80, 25);
  const engagementTrend = buildSeries(days, 70, 20);

  const totalRevenue = revenueTrend.reduce((sum, p) => sum + p.value, 0);
  const totalTickets = ticketsTrend.reduce((sum, p) => sum + p.value, 0);
  const totalCheckedIn = checkInTrend.reduce((sum, p) => sum + p.value, 0);
  const totalWebsiteViews = engagementTrend.reduce((sum, p) => sum + p.value, 0);
  const totalSurveyResponses = randomBetween(10, 120);
  const revenuePerAttendee = totalCheckedIn ? totalRevenue / totalCheckedIn : 0;

  return {
    eventId,
    currency: config.app.defaultCurrency,
    summary: {
      registrations: buildKpi('registrations', 'Registrations', totalTickets, ticketsTrend),
      websiteViews: buildKpi('website-views', 'Website Views', totalWebsiteViews, engagementTrend),
      ticketsSold: buildKpi('tickets-sold', 'Tickets Sold', totalTickets, ticketsTrend),
      totalRevenue: buildKpi('total-revenue', 'Total Revenue', totalRevenue, revenueTrend),
      checkIns: buildKpi('check-ins', 'Check-ins', totalCheckedIn, checkInTrend),
      surveyResponses: buildKpi('survey-responses', 'Survey Responses', totalSurveyResponses, engagementTrend),
    },
    ticketSales: {
      totalRevenue,
      salesTrend: revenueTrend,
      revenueByType: [
        { type: 'Early Bird', revenue: 780000, sold: 210, remaining: 40, conversionRate: 0.28 },
        { type: 'Regular', revenue: 1240000, sold: 410, remaining: 120, conversionRate: 0.34 },
        { type: 'VIP', revenue: 950000, sold: 65, remaining: 15, conversionRate: 0.19 },
      ],
      salesByChannel: [
        { channel: 'Website', revenue: 1480000, tickets: 420 },
        { channel: 'Email', revenue: 540000, tickets: 130 },
        { channel: 'Promo', revenue: 430000, tickets: 95 },
      ],
      funnel: [
        { stage: 'Visitors', value: 12450 },
        { stage: 'Checkout', value: 3820 },
        { stage: 'Purchase', value: 645 },
      ],
      inventoryWarnings: [
        { type: 'Early Bird', remaining: 40, status: 'low' },
        { type: 'VIP', remaining: 15, status: 'critical' },
      ],
    },
    attendance: {
      registered: totalTickets,
      checkedIn: totalCheckedIn,
      checkInRate: totalTickets ? totalCheckedIn / totalTickets : 0,
      noShowRate: totalTickets ? (totalTickets - totalCheckedIn) / totalTickets : 0,
      peakArrivalTimes: [
        { time: '08:00', count: randomBetween(20, 60) },
        { time: '09:00', count: randomBetween(60, 120) },
        { time: '10:00', count: randomBetween(40, 90) },
        { time: '11:00', count: randomBetween(20, 50) },
      ],
      sessionMetrics: [
        {
          session: 'Opening Keynote',
          attendees: 420,
          capacity: 500,
          checkInRate: 0.84,
          averageDurationMins: 52,
        },
        {
          session: 'Fintech Panel',
          attendees: 315,
          capacity: 400,
          checkInRate: 0.78,
          averageDurationMins: 44,
        },
        {
          session: 'AI Workshop',
          attendees: 180,
          capacity: 220,
          checkInRate: 0.82,
          averageDurationMins: 63,
        },
      ],
      heatmap: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].flatMap((day) =>
        ['08:00', '10:00', '12:00', '14:00', '16:00'].map((hour) => ({
          day,
          hour,
          value: randomBetween(20, 120),
        })),
      ),
    },
    engagement: {
      pollParticipation: 0.62,
      voteCount: 1240,
      chatMessages: 840,
      qnaQuestions: 180,
      engagementRate: 0.58,
      interactions: [
        { label: 'Polls', value: 620 },
        { label: 'Chat', value: 840 },
        { label: 'Q&A', value: 180 },
        { label: 'Bookmarks', value: 210 },
      ],
      sessionBookmarks: [
        { session: 'Opening Keynote', count: 140 },
        { session: 'Growth Hacks', count: 86 },
        { session: 'Pitch Stage', count: 72 },
      ],
      speakerQna: [
        { topic: 'Fundraising', count: 46 },
        { topic: 'Product', count: 38 },
        { topic: 'Hiring', count: 27 },
      ],
      websiteClicks: [
        { section: 'Agenda', clicks: 430 },
        { section: 'Speakers', clicks: 310 },
        { section: 'Sponsors', clicks: 190 },
        { section: 'Tickets', clicks: 520 },
      ],
    },
    financial: {
      revenueStreams: [
        { source: 'Tickets', amount: 2470000 },
        { source: 'Merchandise', amount: 320000 },
        { source: 'Paid Voting', amount: 180000 },
        { source: 'Sponsorships', amount: 1250000 },
      ],
      costBreakdown: [
        { category: 'Venue', amount: 850000 },
        { category: 'Marketing', amount: 320000 },
        { category: 'Production', amount: 410000 },
      ],
      totalRevenue: 4220000,
      totalCost: 1580000,
      roiPercent: 167,
      revenuePerAttendee,
      cpaByChannel: [
        { channel: 'Paid Ads', cpa: 3800 },
        { channel: 'Email', cpa: 2100 },
        { channel: 'Social', cpa: 2600 },
      ],
    },
    campaigns: {
      campaigns: [
        { campaign: 'Launch Email', channel: 'Email', visitors: 2100, conversions: 280, revenue: 420000, conversionRate: 0.13 },
        { campaign: 'Meta Ads', channel: 'Paid Ads', visitors: 4600, conversions: 190, revenue: 310000, conversionRate: 0.04 },
        { campaign: 'Influencer Links', channel: 'Influencer', visitors: 980, conversions: 120, revenue: 210000, conversionRate: 0.12 },
      ],
      landingPages: [
        { page: '/tickets', visitors: 5400, dropOffRate: 0.28 },
        { page: '/agenda', visitors: 3100, dropOffRate: 0.34 },
        { page: '/speakers', visitors: 2800, dropOffRate: 0.31 },
      ],
      channelPerformance: [
        { channel: 'Email', revenue: 620000 },
        { channel: 'Social', revenue: 410000 },
        { channel: 'Paid Ads', revenue: 310000 },
        { channel: 'Influencer', revenue: 210000 },
      ],
    },
    content: {
      viewTrend: buildSeries(days, 540, 180),
      sessions: [
        { title: 'Opening Keynote', views: 820, avgWatchMins: 48, downloads: 120 },
        { title: 'Fintech Panel', views: 640, avgWatchMins: 36, downloads: 72 },
        { title: 'AI Workshop', views: 410, avgWatchMins: 55, downloads: 48 },
      ],
    },
    networking: {
      leadsCaptured: 320,
      leadQualificationRate: 0.46,
      conversions: 110,
      meetingsSent: 280,
      meetingsAccepted: 190,
      messagesExchanged: 860,
      topPairs: [
        { from: 'A. Okonkwo', to: 'T. Bello', count: 12 },
        { from: 'Startup Hub', to: 'Investor Circle', count: 9 },
        { from: 'TechCorp', to: 'FinServe', count: 7 },
      ],
    },
    reports: {
      templates: [
        { id: 'tpl-1', name: 'Executive Summary', description: 'Top KPIs and revenue performance.' },
        { id: 'tpl-2', name: 'Marketing Impact', description: 'Campaign attribution and funnel insights.' },
        { id: 'tpl-3', name: 'Engagement Deep Dive', description: 'Session and interaction analytics.' },
      ],
      scheduled: [
        {
          id: 'sched-1',
          name: 'Weekly Stakeholder Update',
          cadence: 'weekly',
          recipients: ['team@munar.com', 'stakeholders@munar.com'],
          nextRun: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          format: 'pdf',
        },
      ],
      exportFormats: ['csv', 'pdf'],
    },
    alertsPrivacy: {
      alerts: [
        {
          id: 'alert-1',
          title: 'VIP tickets almost sold out',
          description: 'Only 15 VIP tickets remaining. Consider increasing price or adding supply.',
          severity: 'high',
          status: 'active',
        },
        {
          id: 'alert-2',
          title: 'Engagement dip in live polls',
          description: 'Poll participation has dropped 18% in the last 2 hours.',
          severity: 'medium',
          status: 'active',
        },
      ],
      notificationSettings: {
        inApp: true,
        email: true,
      },
      privacy: {
        consentRequired: true,
        behavioralTracking: true,
        dataRetentionDays: 365,
        anonymizePublicData: true,
      },
    },
    comparisons: {
      timeline: buildSeries(days, 220, 60),
      comparisons: [
        { year: '2024', ticketsSold: 980, revenue: 3200000, engagementScore: 68, checkedIn: 840, nps: 54 },
        { year: '2025', ticketsSold: 1240, revenue: 3900000, engagementScore: 72, checkedIn: 1020, nps: 58 },
        { year: '2026', ticketsSold: totalTickets, revenue: totalRevenue, engagementScore: 78, checkedIn: totalCheckedIn, nps: 62 },
      ],
    },
    filters: {
      ticketTypes: ['All', 'Early Bird', 'Regular', 'VIP'],
      channels: ['All', 'Website', 'Email', 'Promo', 'Paid Ads', 'Influencer'],
      locations: ['All', 'Main Hall', 'Workshops', 'Virtual'],
    },
  };
};

class AnalyticsService {
  async getEventAnalytics(eventId: string, filters: AnalyticsFilters): Promise<EventAnalytics> {
    if (config.features.useMockData) {
      await delay(500);
      return buildMockAnalytics(eventId, filters);
    }

    const response = await apiClient.get<ApiResponse<EventAnalytics | CanonicalSummaryResponse> | EventAnalytics | CanonicalSummaryResponse>(
      `/events/${eventId}/analytics`,
      {
        params: toApiParams(filters),
      },
    );
    const payload =
      response && typeof response === 'object' && 'data' in response
        ? response.data
        : response;

    return normalizeEventAnalytics(payload, eventId);
  }

  async exportReport(eventId: string, payload: ExportRequest): Promise<MutationResponse<{ url: string }>> {
    if (config.features.useMockData) {
      await delay(600);
      return {
        success: true,
        message: 'Export ready',
        data: { url: `https://munar.com/exports/${eventId}/${Date.now()}.${payload.format}` },
      };
    }

    return apiClient.post<MutationResponse<{ url: string }>>(`/events/${eventId}/analytics/export`, payload);
  }

  async scheduleReport(eventId: string, payload: ScheduleReportRequest): Promise<MutationResponse> {
    if (config.features.useMockData) {
      await delay(500);
      return {
        success: true,
        message: 'Report scheduled',
      };
    }

    return apiClient.post<MutationResponse>(`/events/${eventId}/analytics/schedule`, payload);
  }
}

export const analyticsService = new AnalyticsService();
