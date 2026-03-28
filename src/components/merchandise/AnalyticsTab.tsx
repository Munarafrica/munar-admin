// Analytics Tab for Merchandise
import React from 'react';
import { MerchandiseAnalytics } from '../../types/merchandise';
import { cn } from '../ui/utils';
import {
  AlertTriangle,
  BarChart3,
  PieChart,
  MapPin,
  Truck,
  FileDigit,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsTabProps {
  analytics: MerchandiseAnalytics | null;
  isLoading: boolean;
  currency?: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analytics,
  isLoading,
  currency = 'NGN',
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No Analytics Data
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Analytics will appear once you have some orders.
        </p>
      </div>
    );
  }

  // Get max revenue for chart scaling
  const maxRevenue = Math.max(...analytics.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Revenue Over Time
          </h3>
          
          {analytics.revenueByDay.length > 0 ? (
            <div className="space-y-3">
              {/* Simple bar chart */}
              <div className="flex items-end gap-1 h-32">
                {analytics.revenueByDay.slice(-14).map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className={cn(
                        'w-full rounded-t transition-all hover:opacity-80',
                        index === analytics.revenueByDay.length - 1
                          ? 'bg-indigo-500'
                          : 'bg-indigo-200 dark:bg-indigo-900/50'
                      )}
                      style={{
                        height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%`,
                      }}
                      title={`${new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${formatCurrency(day.revenue)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {new Date(analytics.revenueByDay[Math.max(0, analytics.revenueByDay.length - 14)].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <span>
                  {new Date(analytics.revenueByDay[analytics.revenueByDay.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Fulfilment Breakdown */}
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Fulfilment Breakdown
          </h3>
          
          {analytics.fulfilmentBreakdown.length > 0 ? (
            <div className="space-y-3">
              {analytics.fulfilmentBreakdown.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className="w-8 flex justify-center text-slate-400 dark:text-slate-500">
                    {item.type === 'pickup' ? <MapPin className="w-4 h-4" /> : item.type === 'digital' ? <FileDigit className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {item.type}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.count} ({formatPercent(item.percentage)})
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.type === 'pickup'
                            ? 'bg-blue-500'
                            : item.type === 'digital'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        )}
                        style={{ width: `${item.percentage * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
              No fulfilment data yet
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Top Selling Products
        </h3>
        
        {analytics.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    #
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Product
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Units Sold
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <tr key={product.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 text-sm">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          index === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : index === 1
                            ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {product.productName}
                    </td>
                    <td className="py-3 text-sm text-slate-600 dark:text-slate-300 text-right">
                      {product.unitsSold}
                    </td>
                    <td className="py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500">
            No product data yet
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {analytics.lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Low Stock Alerts ({analytics.lowStockProducts.length})
          </h3>
          
          <div className="space-y-3">
            {analytics.lowStockProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {product.productName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Alert threshold: {product.alertThreshold} units
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-lg font-bold',
                      product.currentStock === 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {product.currentStock}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Order Value */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
          Average Order Value
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(analytics.averageOrderValue)}
        </p>
      </div>
    </div>
  );
};
