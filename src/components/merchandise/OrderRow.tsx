import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Order } from '../../types/merchandise';
import { Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface OrderRowProps {
  order: Order;
  onView?: (order: Order) => void;
}

const statusTone: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  RESERVED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  EXPIRED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  REFUNDED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  FULFILLED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const fulfillmentTone: Record<Order['fulfillmentStatus'], string> = {
  UNFULFILLED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  READY: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  SHIPPED: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

export const OrderRow: React.FC<OrderRowProps> = ({ order, onView }) => {
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <tr className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
      <td className="px-4 py-4">
        <div className="space-y-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">{order.orderNumber ?? order.id}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(order.createdAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {order.displayEmail ?? 'Email required on create only'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{order.items.length} line item(s)</p>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{totalUnits}</td>
      <td className="px-4 py-4">
        <Badge className={`border-0 ${statusTone[order.status]}`}>{order.status}</Badge>
      </td>
      <td className="px-4 py-4">
        <Badge className={`border-0 ${fulfillmentTone[order.fulfillmentStatus]}`}>
          {order.fulfillmentStatus}
        </Badge>
      </td>
      <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {formatMoney(order.totalMinor, order.currency)}
      </td>
      <td className="px-4 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(order)} className="gap-2">
              <Eye className="h-4 w-4" />
              View order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
