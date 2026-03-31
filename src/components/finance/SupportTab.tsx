// Support & Disputes Tab - report and track payout issues
import React, { useState } from 'react';
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  ChevronDown,
  ChevronLeft,
  X,
  Loader2,
  Paperclip,
  Send,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useDisputes, usePayouts } from '../../hooks/useFinance';
import type { Dispute, DisputeStatus, DisputeType, CreateDisputeRequest } from '../../types/finance';
import { DISPUTE_STATUS_LABELS, DISPUTE_TYPE_LABELS } from '../../types/finance';
import { toast } from 'sonner';

interface SupportTabProps {
  initialPayoutId?: string;
  onClearInitialPayout: () => void;
}

const STATUS_CONFIG: Record<DisputeStatus, { icon: React.ElementType; color: string }> = {
  open: { icon: AlertTriangle, color: 'amber' },
  under_review: { icon: Clock, color: 'blue' },
  resolved: { icon: CheckCircle2, color: 'emerald' },
  rejected: { icon: XCircle, color: 'red' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        config.color === 'amber' && 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
        config.color === 'blue' && 'border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20',
        config.color === 'emerald' && 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
        config.color === 'red' && 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
      )}
    >
      <Icon className="w-3 h-3" />
      {DISPUTE_STATUS_LABELS[status]}
    </Badge>
  );
}

export const SupportTab: React.FC<SupportTabProps> = ({
  initialPayoutId,
  onClearInitialPayout,
}) => {
  const { disputes, isLoading, submitDispute, refetch } = useDisputes();
  const { payouts } = usePayouts();
  const [isFormOpen, setIsFormOpen] = useState(!!initialPayoutId);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    onClearInitialPayout();
  };

  const handleSubmit = async (data: CreateDisputeRequest) => {
    try {
      await submitDispute(data);
      toast.success('Dispute submitted successfully. We\'ll review it shortly.');
      handleCloseForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit dispute');
    }
  };

  if (selectedDispute) {
    return (
      <DisputeDetail
        dispute={selectedDispute}
        onBack={() => setSelectedDispute(null)}
      />
    );
  }

  if (isFormOpen) {
    return (
      <DisputeForm
        payouts={payouts}
        initialPayoutId={initialPayoutId}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Support & Disputes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Report and track payout issues
          </p>
        </div>
        <Button
          onClick={handleOpenForm}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Payout Issue
        </Button>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No disputes</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            If you experience any issues with your payouts, you can report them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map(dispute => (
            <button
              key={dispute.id}
              onClick={() => setSelectedDispute(dispute)}
              className="w-full text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                    {dispute.id}
                  </span>
                  <DisputeStatusBadge status={dispute.status} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(dispute.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {DISPUTE_TYPE_LABELS[dispute.type]}
                </Badge>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Payout: {dispute.payoutId}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                {dispute.message}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Dispute Detail View ─────────────────────────────────────────────────────

function DisputeDetail({ dispute, onBack }: { dispute: Dispute; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Disputes
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{dispute.id}</h3>
              <DisputeStatusBadge status={dispute.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Filed on {formatDateTime(dispute.createdAt)} · Payout: {dispute.payoutId}
            </p>
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Issue Type
          </h4>
          <Badge variant="outline" className="font-medium">
            {DISPUTE_TYPE_LABELS[dispute.type]}
          </Badge>
        </div>

        {/* Message */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Description
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {dispute.message}
          </p>
        </div>

        {/* Resolution */}
        {dispute.resolution && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Resolution
              </span>
              {dispute.resolvedAt && (
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  · {formatDate(dispute.resolvedAt)}
                </span>
              )}
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap">
              {dispute.resolution}
            </p>
          </div>
        )}

        {/* Status: Under Review notice */}
        {dispute.status === 'under_review' && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Under Review
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Our team is currently reviewing your dispute. You'll be notified once it's resolved. This typically takes 1-3 business days.
            </p>
          </div>
        )}

        {dispute.status === 'open' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Pending Review
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your dispute has been received and will be reviewed by our support team shortly.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Timeline
          </h4>
          <div className="space-y-3">
            <TimelineItem
              label="Dispute filed"
              date={dispute.createdAt}
              icon={AlertTriangle}
              color="amber"
            />
            {dispute.status !== 'open' && (
              <TimelineItem
                label="Under review"
                date={dispute.updatedAt}
                icon={Clock}
                color="blue"
              />
            )}
            {dispute.resolvedAt && (
              <TimelineItem
                label={dispute.status === 'resolved' ? 'Resolved' : 'Rejected'}
                date={dispute.resolvedAt}
                icon={dispute.status === 'resolved' ? CheckCircle2 : XCircle}
                color={dispute.status === 'resolved' ? 'emerald' : 'red'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  icon: Icon,
  color,
}: {
  label: string;
  date: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'p-1.5 rounded-full',
          color === 'amber' && 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
          color === 'blue' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
          color === 'emerald' && 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
          color === 'red' && 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        )}
      >
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(date)}</span>
      </div>
    </div>
  );
}

// ─── Dispute Form ────────────────────────────────────────────────────────────

function DisputeForm({
  payouts,
  initialPayoutId,
  onClose,
  onSubmit,
}: {
  payouts: { id: string; status: string }[];
  initialPayoutId?: string;
  onClose: () => void;
  onSubmit: (data: CreateDisputeRequest) => Promise<void>;
}) {
  const [payoutId, setPayoutId] = useState(initialPayoutId || '');
  const [type, setType] = useState<DisputeType | ''>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = payoutId && type && message.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !type) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ payoutId, type, message: message.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Disputes
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Report Payout Issue</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Describe the issue and our team will investigate. We typically respond within 1-3 business days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Payout ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Payout
            </label>
            <div className="relative">
              <select
                value={payoutId}
                onChange={e => setPayoutId(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a payout</option>
                {payouts
                  .filter(p => p.status === 'completed' || p.status === 'failed')
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.id}</option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Type
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={e => setType(e.target.value as DisputeType)}
                className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select issue type</option>
                {Object.entries(DISPUTE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe the issue in detail. Include any relevant transaction IDs, dates, and amounts..."
              rows={5}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Minimum 10 characters. Be as specific as possible.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Dispute
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
