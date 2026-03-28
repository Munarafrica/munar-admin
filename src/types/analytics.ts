export type DateRangePreset = '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsFilters {
  [key: string]: string | number | boolean | undefined;
  dateRange: DateRangePreset;
  startDate?: string;
  endDate?: string;
  ticketType?: string;
  channel?: string;
  location?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsKpi {
  id: string;
  label: string;
  value: number;
  changePercent: number;
  sparkline: TimeSeriesPoint[];
}

export interface AnalyticsSummary {
  ticketsSold: AnalyticsKpi;
  totalRevenue: AnalyticsKpi;
  totalCheckedIn: AnalyticsKpi;
  revenuePerAttendee: AnalyticsKpi;
  nps: AnalyticsKpi;
  engagementScore: AnalyticsKpi;
}

export interface TicketSalesBreakdown {
  type: string;
  revenue: number;
  sold: number;
  remaining: number;
  conversionRate: number;
}

export interface SalesChannelBreakdown {
  channel: string;
  revenue: number;
  tickets: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface TicketSalesAnalytics {
  totalRevenue: number;
  salesTrend: TimeSeriesPoint[];
  revenueByType: TicketSalesBreakdown[];
  salesByChannel: SalesChannelBreakdown[];
  funnel: FunnelStage[];
  inventoryWarnings: { type: string; remaining: number; status: 'ok' | 'low' | 'critical' }[];
}

export interface AttendanceSessionMetric {
  session: string;
  attendees: number;
  capacity: number;
  checkInRate: number;
  averageDurationMins: number;
}

export interface AttendanceHeatmapCell {
  day: string;
  hour: string;
  value: number;
}

export interface AttendanceAnalytics {
  registered: number;
  checkedIn: number;
  checkInRate: number;
  noShowRate: number;
  peakArrivalTimes: { time: string; count: number }[];
  sessionMetrics: AttendanceSessionMetric[];
  heatmap: AttendanceHeatmapCell[];
}

export interface EngagementMetric {
  label: string;
  value: number;
}

export interface EngagementAnalytics {
  pollParticipation: number;
  voteCount: number;
  chatMessages: number;
  qnaQuestions: number;
  engagementRate: number;
  interactions: EngagementMetric[];
  sessionBookmarks: { session: string; count: number }[];
  speakerQna: { topic: string; count: number }[];
  websiteClicks: { section: string; clicks: number }[];
}

export interface FinancialStream {
  source: string;
  amount: number;
}

export interface CostItem {
  category: string;
  amount: number;
}

export interface CpaMetric {
  channel: string;
  cpa: number;
}

export interface FinancialAnalytics {
  revenueStreams: FinancialStream[];
  costBreakdown: CostItem[];
  totalRevenue: number;
  totalCost: number;
  roiPercent: number;
  revenuePerAttendee: number;
  cpaByChannel: CpaMetric[];
}

export interface CampaignAttributionMetric {
  campaign: string;
  channel: string;
  visitors: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface LandingPageMetric {
  page: string;
  visitors: number;
  dropOffRate: number;
}

export interface CampaignAnalytics {
  campaigns: CampaignAttributionMetric[];
  landingPages: LandingPageMetric[];
  channelPerformance: { channel: string; revenue: number }[];
}

export interface ContentSessionMetric {
  title: string;
  views: number;
  avgWatchMins: number;
  downloads: number;
}

export interface ContentAnalytics {
  viewTrend: TimeSeriesPoint[];
  sessions: ContentSessionMetric[];
}

export interface NetworkingAnalytics {
  leadsCaptured: number;
  leadQualificationRate: number;
  conversions: number;
  meetingsSent: number;
  meetingsAccepted: number;
  messagesExchanged: number;
  topPairs: { from: string; to: string; count: number }[];
}

export type ExportFormat = 'csv' | 'pdf';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  cadence: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun: string;
  format: ExportFormat;
}

export interface ReportsAnalytics {
  templates: ReportTemplate[];
  scheduled: ScheduledReport[];
  exportFormats: ExportFormat[];
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
}

export interface PrivacySettings {
  consentRequired: boolean;
  behavioralTracking: boolean;
  dataRetentionDays: number;
  anonymizePublicData: boolean;
}

export interface AlertSettings {
  inApp: boolean;
  email: boolean;
}

export interface AlertsPrivacyAnalytics {
  alerts: AlertItem[];
  notificationSettings: AlertSettings;
  privacy: PrivacySettings;
}

export interface ComparisonMetric {
  year: string;
  ticketsSold: number;
  revenue: number;
  engagementScore: number;
  checkedIn: number;
  nps: number;
}

export interface ComparisonAnalytics {
  timeline: TimeSeriesPoint[];
  comparisons: ComparisonMetric[];
}

export interface AnalyticsFilterOptions {
  ticketTypes: string[];
  channels: string[];
  locations: string[];
}

export interface EventAnalytics {
  eventId: string;
  currency: string;
  summary: AnalyticsSummary;
  ticketSales: TicketSalesAnalytics;
  attendance: AttendanceAnalytics;
  engagement: EngagementAnalytics;
  financial: FinancialAnalytics;
  campaigns: CampaignAnalytics;
  content: ContentAnalytics;
  networking: NetworkingAnalytics;
  reports: ReportsAnalytics;
  alertsPrivacy: AlertsPrivacyAnalytics;
  comparisons: ComparisonAnalytics;
  filters: AnalyticsFilterOptions;
}

export interface ExportRequest {
  format: ExportFormat;
  reportId?: string;
  filters: AnalyticsFilters;
}

export interface ScheduleReportRequest {
  templateId: string;
  cadence: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: ExportFormat;
  filters: AnalyticsFilters;
}
