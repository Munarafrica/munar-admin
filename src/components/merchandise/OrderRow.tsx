// Order Table Row Component
import React from 'react';
import { Order } from '../../types/merchandise';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical, Eye, CheckCircle, XCircle, RefreshCw, Package, MapPin, Truck, FileDigit } from 'lucide-react';

interface OrderRowProps {
  order: Order;
  onView?: (order: Order) => void;
  onMarkFulfilled?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onRefund?: (order: Order) => void;
}

const getStatusColor = (status: Order['status']) => {
  const colors = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    fulfilled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    refunded: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return colors[status];
};

const getFulfilmentIcon = (type: Order['fulfilmentType']) => {
  const icons = {
    pickup: <MapPin className="w-4 h-4" />,
    shipping: <Truck className="w-4 h-4" />,
    digital: <FileDigit className="w-4 h-4" />,
  };
  return icons[type];
};

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onView,
  onMarkFulfilled,
  onCancel,
  onRefund,
}) => {
  const canFulfil = order.status === 'paid' && order.fulfilmentStatus !== 'completed';
  const canCancel = order.status === 'pending' || order.status === 'paid';
  const canRefund = order.status === 'paid' || order.status === 'fulfilled';

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {/* Order Number */}
      <td className="px-6 py-4">
        <div className="font-medium text-slate-900 dark:text-slate-100">{order.orderNumber}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </td>

      {/* Customer */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{order.customerName}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{order.customerEmail}</div>
      </td>

      {/* Items */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} total units
        </div>
      </td>

      {/* Fulfilment */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span>{getFulfilmentIcon(order.fulfilmentType)}</span>
          <span className="text-sm capitalize text-slate-600 dark:text-slate-300">
            {order.fulfilmentType}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge className={`${getStatusColor(order.status)} border-0 text-xs font-medium capitalize`}>
          {order.status}
        </Badge>
      </td>

      {/* Total */}
      <td className="px-6 py-4">
        <div className="font-semibold text-slate-900 dark:text-slate-100">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: order.currency,
            minimumFractionDigits: 0,
          }).format(order.total)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onView && (
              <DropdownMenuItem onClick={() => onView(order)} className="gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </DropdownMenuItem>
            )}
            {canFulfil && onMarkFulfilled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onMarkFulfilled(order)}
                  className="gap-2 text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Fulfilled
                </DropdownMenuItem>
              </>
            )}
            {canCancel && onCancel && (
              <DropdownMenuItem onClick={() => onCancel(order)} className="gap-2">
                <XCircle className="w-4 h-4" />
                Cancel Order
              </DropdownMenuItem>
            )}
            {canRefund && onRefund && (
              <DropdownMenuItem
                onClick={() => onRefund(order)}
                className="gap-2 text-red-600 dark:text-red-400"
              >
                <RefreshCw className="w-4 h-4" />
                Refund Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
