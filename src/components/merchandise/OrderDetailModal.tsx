import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { FulfillmentStatus, Order } from '../../types/merchandise';
import { ExternalLink, Package, X } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateFulfillment: (orderId: string, status: FulfillmentStatus) => Promise<void>;
}

const FULFILLMENT_OPTIONS: FulfillmentStatus[] = [
  'UNFULFILLED',
  'PROCESSING',
  'READY',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
];

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateFulfillment,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !order) {
    return null;
  }

  const shipping = order.shippingAddressJson as Record<string, unknown> | null;

  const handleUpdateFulfillment = async (status: FulfillmentStatus) => {
    setIsSaving(true);
    try {
      await onUpdateFulfillment(order.id, status);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Merch order</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {order.orderNumber ?? order.id}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{order.status}</Badge>
              <Badge variant="outline">{order.fulfillmentStatus}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order summary</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Buyer email</dt>
                  <dd className="text-right text-slate-900 dark:text-slate-100">
                    {order.displayEmail ?? 'Not returned by backend'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Subtotal</dt>
                  <dd className="text-right text-slate-900 dark:text-slate-100">
                    {formatMoney(order.subtotalMinor, order.currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">VAT (7.5%)</dt>
                  <dd className="text-right text-slate-900 dark:text-slate-100">
                    {formatMoney(order.vatMinor ?? 0, order.currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Shipping</dt>
                  <dd className="text-right text-slate-900 dark:text-slate-100">
                    {formatMoney(order.shippingMinor, order.currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">Total</dt>
                  <dd className="text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatMoney(order.totalMinor, order.currency)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shipping address</p>
              {shipping ? (
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {['fullName', 'phone', 'line1', 'line2', 'city', 'state', 'postalCode', 'country'].map((key) =>
                    shipping[key] ? <p key={key}>{String(shipping[key])}</p> : null,
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No shipping address was stored on this order.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fulfillment</p>
              <div className="flex flex-wrap gap-2">
                {FULFILLMENT_OPTIONS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={status === order.fulfillmentStatus ? 'default' : 'outline'}
                    size="sm"
                    disabled={isSaving || status === order.fulfillmentStatus}
                    onClick={() => handleUpdateFulfillment(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              The backend currently validates enum membership only, so this UI exposes the allowed statuses directly.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Items</p>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Package className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{item.product.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.productVariant ? <span>{item.productVariant.name}</span> : null}
                        <span>Qty {item.quantity}</span>
                        <span>{formatMoney(item.unitPriceMinor, order.currency)} each</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatMoney(item.totalPriceMinor, order.currency)}
                    </p>
                    <a
                      href={`/events/${order.eventId}/merchandise`}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Product dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <button className="absolute inset-0 -z-10" onClick={onClose} aria-label="Close order details" />
    </div>,
    document.body,
  );
};
