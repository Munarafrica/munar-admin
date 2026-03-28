import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { EventAnalytics } from '../../../types/analytics';
import { SectionCard } from './SectionCard';

interface TicketSalesTabProps {
  analytics: EventAnalytics;
  currency: string;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export const TicketSalesTab: React.FC<TicketSalesTabProps> = ({ analytics, currency }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Ticket revenue" description="Sales performance and trends">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.ticketSales.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Revenue by ticket tier"
          description="Conversion and revenue split"
          action={
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-4 h-4" />
              Revenue
            </div>
          }
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ticketSales.revenueByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Conversion funnel" description="Visitors to purchase">
          <div className="space-y-3">
            {analytics.ticketSales.funnel.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stage.stage}</span>
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{stage.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Inventory warnings"
        description="Low stock tickets and sell-out alerts"
        action={
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
            Action needed
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.ticketSales.inventoryWarnings.map((warning) => (
            <div key={warning.type} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{warning.type}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Remaining</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{warning.remaining}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
