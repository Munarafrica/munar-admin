// Order Detail Modal - View and Fulfill Orders
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Order } from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import {
  X,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  QrCode,
  CreditCard,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onFulfill: (orderId: string, verificationData: VerificationData) => Promise<void>;
  onCancel: (orderId: string) => Promise<void>;
  onRefund: (orderId: string) => Promise<void>;
}

interface VerificationData {
  method: 'ticket' | 'id' | 'email' | 'qr';
  notes?: string;
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

const getFulfilmentStatusColor = (status: Order['fulfilmentStatus']) => {
  const colors = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    ready: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  };
  return colors[status];
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onFulfill,
  onCancel,
  onRefund,
}) => {
  const [showFulfilment, setShowFulfilment] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<VerificationData['method']>('ticket');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [copiedPickupCode, setCopiedPickupCode] = useState(false);

  if (!isOpen || !order) return null;

  const canFulfill = order.status === 'paid' && order.fulfilmentStatus !== 'completed';
  const canCancel = order.status === 'pending' || order.status === 'paid';
  const canRefund = order.status === 'paid' || order.status === 'fulfilled';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: order.currency || 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleFulfill = async () => {
    setIsProcessing(true);
    try {
      await onFulfill(order.id, {
        method: verificationMethod,
        notes: verificationNotes || undefined,
      });
      setShowFulfilment(false);
      onClose();
    } catch (error) {
      console.error('Failed to fulfill order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await onCancel(order.id);
      setShowCancelConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    try {
      await onRefund(order.id);
      setShowRefundConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to refund order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPickupCode = () => {
    if (order.pickupCode) {
      navigator.clipboard.writeText(order.pickupCode);
      setCopiedPickupCode(true);
      setTimeout(() => setCopiedPickupCode(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Order {order.orderNumber}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(order.status)} border-0 capitalize`}>
              {order.status}
            </Badge>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fulfilment Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Fulfilment
              </h3>
              <Badge className={`${getFulfilmentStatusColor(order.fulfilmentStatus)} border-0 capitalize`}>
                {order.fulfilmentStatus}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                {order.fulfilmentType === 'pickup' ? '🏢 Event Pickup' : order.fulfilmentType === 'digital' ? '💾 Digital Delivery' : '🚚 Shipping'}
              </span>
            </div>

            {order.fulfilmentType === 'pickup' && order.pickupCode && (
              <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Pickup Code
                  </p>
                  <p className="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-100">
                    {order.pickupCode}
                  </p>
                </div>
                <button
                  onClick={copyPickupCode}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                >
                  {copiedPickupCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            )}

            {order.fulfilmentType === 'pickup' && order.pickupLocation && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="text-slate-500">Location:</span> {order.pickupLocation}
              </p>
            )}

            {order.verifiedAt && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Identity Verified
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {formatDate(order.verifiedAt)} via {order.verificationMethod}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items ({order.items.length})
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Discount</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax</span>
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-slate-900 dark:text-slate-100">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <CreditCard className="w-5 h-5 text-slate-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Payment {order.paymentStatus}
              </p>
              {order.paymentMethod && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  via {order.paymentMethod}
                </p>
              )}
            </div>
            {order.transactionId && (
              <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {order.transactionId}
              </code>
            )}
          </div>

          {/* Notes */}
          {(order.customerNotes || order.internalNotes) && (
            <div className="space-y-3">
              {order.customerNotes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Customer Note
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{order.customerNotes}</p>
                </div>
              )}
              {order.internalNotes && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                    Internal Note
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{order.internalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex gap-2">
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            {canRefund && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefundConfirm(true)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refund
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canFulfill && (
              <Button
                onClick={() => setShowFulfilment(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Fulfill Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fulfilment Modal */}
      {showFulfilment && (
        <>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFulfilment(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Verify & Fulfill Order
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Identity Verification Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'ticket' as const, label: 'Ticket QR', icon: QrCode },
                    { id: 'email' as const, label: 'Email Match', icon: Mail },
                    { id: 'id' as const, label: 'ID Check', icon: CreditCard },
                    { id: 'qr' as const, label: 'Pickup Code', icon: Phone },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setVerificationMethod(method.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-sm font-medium transition-all text-left flex items-center gap-2',
                        verificationMethod === method.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      )}
                    >
                      <method.icon className="w-4 h-4" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Notes (optional)
                </label>
                <Input
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g., Verified with driver's license"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Confirm that you have verified the customer's identity before fulfilling this order.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowFulfilment(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleFulfill}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isProcessing ? 'Processing...' : 'Confirm & Fulfill'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelConfirm(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Cancel Order?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This will cancel the order and notify the customer. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                Keep Order
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Refund Confirmation */}
      {showRefundConfirm && (
        <>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRefundConfirm(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <RefreshCw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Refund Order?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This will refund {formatCurrency(order.total)} to the customer. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowRefundConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isProcessing ? 'Processing...' : 'Process Refund'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  );
};
