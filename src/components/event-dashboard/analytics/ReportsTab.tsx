import React, { useState } from 'react';
import { Download, Mail, FileText } from 'lucide-react';
import { EventAnalytics, ExportFormat } from '../../../types/analytics';
import { Button } from '../../ui/button';
import { SectionCard } from './SectionCard';

interface ReportsTabProps {
  analytics: EventAnalytics;
  onExport: (format: ExportFormat) => Promise<void>;
  onSchedule: (format: ExportFormat, recipients: string[], cadence: 'daily' | 'weekly' | 'monthly') => Promise<void>;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ analytics, onExport, onSchedule }) => {
  const [recipients, setRecipients] = useState('team@munar.com');
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [format, setFormat] = useState<ExportFormat>('pdf');

  const handleSchedule = async () => {
    const list = recipients.split(',').map((email) => email.trim()).filter(Boolean);
    if (!list.length) return;
    await onSchedule(format, list, cadence);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Export reports" description="Download CSV or PDF reports for stakeholders">
        <div className="flex flex-wrap gap-3">
          {analytics.reports.exportFormats.map((type) => (
            <Button key={type} variant={type === 'pdf' ? 'default' : 'outline'} onClick={() => onExport(type)}>
              <Download className="mr-2 h-4 w-4" />
              Export {type.toUpperCase()}
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Scheduled reports" description="Deliver analytics to your inbox">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Recipients
              <input
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
                placeholder="team@company.com, ceo@company.com"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cadence
              <select
                value={cadence}
                onChange={(event) => setCadence(event.target.value as typeof cadence)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Format
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as ExportFormat)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSchedule}>
              <Mail className="mr-2 h-4 w-4" />
              Schedule report
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Report templates" description="Reusable analytics bundles">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.reports.templates.map((template) => (
            <div key={template.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <FileText className="h-5 w-5 text-indigo-500" />
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{template.name}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
