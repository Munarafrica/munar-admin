import React from 'react';
import type { MerchandiseAnalytics } from '../../types/merchandise';
import { BarChart3, Package, ShoppingBag, Wallet } from 'lucide-react';

interface AnalyticsTabProps {
  analytics: MerchandiseAnalytics | null;
  isLoading: boolean;
  currency?: string;
}

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analytics,
  isLoading,
  currency = 'NGN',
}) => {
  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading analytics...</p>;
  }

  if (!analytics) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No merch analytics yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: 'Revenue',
            value: formatMoney(analytics.totalRevenueMinor, currency),
            icon: Wallet,
          },
          {
            label: 'Orders',
            value: analytics.ordersCount.toString(),
            icon: ShoppingBag,
          },
          {
            label: 'Paid Orders',
            value: analytics.paidOrdersCount.toString(),
            icon: BarChart3,
          },
          {
            label: 'Items Sold',
            value: analytics.itemsSold.toString(),
            icon: Package,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top products</p>
          <div className="mt-4 space-y-3">
            {analytics.topProducts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No paid merch orders yet.</p>
            ) : (
              analytics.topProducts.map((product) => (
                <div key={product.productId} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{product.productName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{product.unitsSold} units sold</p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatMoney(product.revenueMinor, currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fulfillment breakdown</p>
          <div className="mt-4 space-y-3">
            {analytics.fulfillmentBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No order fulfillment data yet.</p>
            ) : (
              analytics.fulfillmentBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.status}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.count}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Low stock products</p>
        <div className="mt-4 space-y-3">
          {analytics.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No low-stock alerts based on tracked inventory.
            </p>
          ) : (
            analytics.lowStockProducts.map((product) => (
              <div key={product.productId} className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-700 dark:text-slate-200">{product.productName}</p>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-300">
                  {product.currentStock} left
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
