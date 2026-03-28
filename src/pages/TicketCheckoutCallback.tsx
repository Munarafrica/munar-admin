import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { ticketsService } from '../services';
import { TicketOrderResponse } from '../types/api';

type CallbackState = 'loading' | 'paid' | 'expired' | 'failed';

export function TicketCheckoutCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('loading');
  const [order, setOrder] = useState<TicketOrderResponse | null>(null);
  const [message, setMessage] = useState('Verifying your payment...');

  const eventPath = useMemo(() => {
    const slug = localStorage.getItem('munar_last_ticket_event_slug');
    return slug ? `/e/${slug}/tickets` : '/events';
  }, []);

  useEffect(() => {
    const ticketOrderId = ticketsService.getActiveTicketOrderId();

    if (!ticketOrderId) {
      setState('failed');
      setMessage('No pending ticket order was found to verify.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const response = await ticketsService.getOrder(ticketOrderId);
        setOrder(response);

        if (response.status === 'PAID') {
          setState('paid');
          ticketsService.saveActiveTicketOrderId(null);
          return;
        }

        if (response.status === 'EXPIRED') {
          setState('expired');
          return;
        }

        if (['FAILED', 'CANCELLED', 'REFUNDED'].includes(response.status)) {
          setState('failed');
          setMessage(`Payment could not be completed. Current order status: ${response.status}.`);
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          setState('failed');
          setMessage('Payment verification is taking longer than expected. Please check your tickets again shortly.');
          return;
        }

        window.setTimeout(poll, 2500);
      } catch (error) {
        setState('failed');
        setMessage(error instanceof Error ? error.message : 'Failed to verify payment.');
      }
    };

    poll();
  }, [navigate]);

  const content = {
    loading: {
      icon: <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />,
      title: 'Verifying payment',
      body: message,
    },
    paid: {
      icon: <CheckCircle2 className="w-10 h-10 text-green-600" />,
      title: 'Payment confirmed',
      body: 'Your ticket purchase has been confirmed successfully.',
    },
    expired: {
      icon: <AlertCircle className="w-10 h-10 text-amber-600" />,
      title: 'Reservation expired',
      body: 'This ticket reservation expired before payment was confirmed.',
    },
    failed: {
      icon: <AlertCircle className="w-10 h-10 text-red-600" />,
      title: 'Payment not confirmed',
      body: message,
    },
  }[state];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 font-['Raleway']">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{content.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{content.body}</p>

        {order && (
          <div className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400">Order</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{order.id}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to={eventPath}
            className="inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Back to tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
