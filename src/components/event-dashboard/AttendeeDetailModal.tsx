// Attendee Detail Modal - Shows full attendee info, ticket details, QR code, and question responses
import React from 'react';
import { Attendee, TicketType } from './types';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { X, Ticket, Mail, Phone, Calendar, QrCode, ClipboardList, CheckCircle2, Clock, Hash, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AttendeeDetailModalProps {
  attendee: Attendee | null;
  onClose: () => void;
  tickets?: TicketType[];
}

export function AttendeeDetailModal({ attendee, onClose, tickets }: AttendeeDetailModalProps) {
  if (!attendee) return null;

  const ticket = tickets?.find(t => t.id === attendee.ticketTypeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{attendee.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{attendee.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Status & Check-in */}
          <div className="flex items-center gap-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
              attendee.status === 'Confirmed' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              attendee.status === 'Checked In' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              attendee.status === 'Cancelled' && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              attendee.status === 'Pending' && "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            )}>
              {attendee.checkedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {attendee.status}
            </span>
            {attendee.checkedInAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Checked in at {new Date(attendee.checkedInAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{attendee.email}</span>
            </div>
            {attendee.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{attendee.phone}</span>
              </div>
            )}
            {attendee.orderReference && (
              <div className="flex items-center gap-3 text-sm">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 font-mono">{attendee.orderReference}</span>
              </div>
            )}
            {attendee.purchaseDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  Registered {new Date(attendee.purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Ticket Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ticket</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{attendee.ticketTypeName || '—'}</p>
            {ticket && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <p>Type: {ticket.type}{ticket.groupSize ? ` (Group of ${ticket.groupSize})` : ''}</p>
                <p>Price: {ticket.isFree ? 'Free' : `₦${ticket.price?.toLocaleString()}`}</p>
              </div>
            )}
          </div>

          {/* QR Code */}
          {attendee.qrCode && (
            <div className="flex flex-col items-center bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">QR Code</span>
              </div>
              {attendee.qrCode.startsWith('data:') ? (
                <img src={attendee.qrCode} alt="Ticket QR" className="w-36 h-36 rounded-lg" />
              ) : (
                <QRCodeSVG value={attendee.qrCode} size={144} level="M" />
              )}
            </div>
          )}

          {/* Question Responses */}
          {attendee.questionAnswers && attendee.questionAnswers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Custom Question Responses</span>
              </div>
              <div className="space-y-2">
                {attendee.questionAnswers.map((qa, i) => (
                  <div key={qa.questionId || i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{qa.questionLabel}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{qa.answer || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:border-slate-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
