// Data & Exports settings tab
import React, { useState, useEffect, useCallback } from 'react';
import { ExportType, ExportFormat, ExportRecord } from '../../types/settings';
import * as settingsService from '../../services/settings.service';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Ticket,
  DollarSign,
  ClipboardCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Clock,
  HardDrive,
  ExternalLink,
} from 'lucide-react';

// ─── Export type config ──────────────────────────────────────────────────────
const EXPORT_TYPES: { type: ExportType; label: string; description: string; icon: React.ElementType }[] = [
  { type: 'attendees', label: 'Export Attendees', description: 'Names, emails, ticket types, registration dates', icon: Users },
  { type: 'ticket_sales', label: 'Export Ticket Sales', description: 'Sales data, revenue, payment status', icon: Ticket },
  { type: 'financial_report', label: 'Export Financial Report', description: 'Revenue, fees, payouts, refunds', icon: DollarSign },
  { type: 'checkin_records', label: 'Export Check-in Records', description: 'Check-in times, validation logs', icon: ClipboardCheck },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
  { value: 'csv', label: 'CSV', icon: FileText },
  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EXPORT_TYPE_LABELS: Record<ExportType, string> = {
  attendees: 'Attendees',
  ticket_sales: 'Ticket Sales',
  financial_report: 'Financial Report',
  checkin_records: 'Check-in Records',
};

// ─── Main component ──────────────────────────────────────────────────────────
export const DataExportsTab: React.FC = () => {
  // Events for selector
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Export state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Export history
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      setIsLoadingHistory(true);
      const [eventsData, historyData] = await Promise.all([
        settingsService.getEventsForExport(),
        settingsService.getExportHistory(),
      ]);
      setEvents(eventsData);
      if (eventsData.length > 0) setSelectedEventId(eventsData[0].id);
      setExportHistory(historyData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoadingEvents(false);
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async (exportType: ExportType) => {
    if (!selectedEventId) {
      setError('Please select an event first');
      return;
    }

    setExportingType(exportType);
    setError(null);
    setSuccessMessage(null);

    try {
      const record = await settingsService.requestExport({
        eventId: selectedEventId,
        exportType,
        format: selectedFormat,
      });
      setExportHistory(prev => [record, ...prev]);
      setSuccessMessage(`${EXPORT_TYPE_LABELS[exportType]} export completed`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Data & Exports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export your event data in CSV or Excel format
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Event selector + Format */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Export Configuration</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Event selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Select Event</label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                disabled={isLoadingEvents}
                className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              >
                {isLoadingEvents && <option>Loading events…</option>}
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Format selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Export Format</label>
            <div className="flex gap-3">
              {FORMAT_OPTIONS.map(fmt => (
                <button
                  key={fmt.value}
                  onClick={() => setSelectedFormat(fmt.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    selectedFormat === fmt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
                  )}
                >
                  <fmt.icon className="w-4 h-4" />
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EXPORT_TYPES.map(exp => (
          <button
            key={exp.type}
            onClick={() => handleExport(exp.type)}
            disabled={!selectedEventId || exportingType !== null}
            className={cn(
              'flex items-center gap-4 p-5 rounded-xl border text-left transition-all',
              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              'hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-slate-800 disabled:hover:bg-white dark:disabled:hover:bg-slate-900',
              'group',
            )}
          >
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
              {exportingType === exp.type ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <exp.icon className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{exp.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{exp.description}</p>
            </div>
            <Download className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto shrink-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Export history */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Exports</h3>

        {isLoadingHistory ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : exportHistory.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <Download className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No exports yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {exportHistory.map(record => (
              <div key={record.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={cn(
                  'p-2 rounded-lg shrink-0',
                  record.format === 'csv'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                )}>
                  {record.format === 'csv' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {EXPORT_TYPE_LABELS[record.exportType]} — {record.eventName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(record.createdAt)}
                    </span>
                    {record.rowCount != null && (
                      <span>{record.rowCount.toLocaleString()} rows</span>
                    )}
                    {record.fileSizeBytes != null && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(record.fileSizeBytes)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0',
                  record.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : record.status === 'processing'
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                )}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
