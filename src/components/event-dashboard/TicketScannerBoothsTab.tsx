import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clipboard, Loader2, Plus, QrCode, Smartphone, Trash2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { TicketScanRecord, TicketScannerBooth } from './types';

interface TicketScannerBoothsTabProps {
  booths: TicketScannerBooth[];
  scans: TicketScanRecord[];
  isLoadingBooths: boolean;
  isLoadingScans: boolean;
  onCreateBooth: () => Promise<TicketScannerBooth | null>;
  onDeleteBooth: (boothId: string) => Promise<boolean>;
  onRefreshScans: (boothId?: string) => Promise<void>;
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not yet';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBoothQrValue(booth: TicketScannerBooth) {
  return booth.pairingUrl || JSON.stringify({
    type: 'MUNAR_SCANNER_BOOTH_PAIRING',
    boothId: booth.id,
    eventId: booth.eventId,
    pairingToken: booth.pairingToken,
  });
}

export const TicketScannerBoothsTab: React.FC<TicketScannerBoothsTabProps> = ({
  booths,
  scans,
  isLoadingBooths,
  isLoadingScans,
  onCreateBooth,
  onDeleteBooth,
  onRefreshScans,
}) => {
  const [selectedBoothId, setSelectedBoothId] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [deletingBoothId, setDeletingBoothId] = useState<string | null>(null);

  const selectedBooth = booths.find((booth) => booth.id === selectedBoothId);
  const filteredScans = selectedBoothId === 'all'
    ? scans
    : scans.filter((scan) => scan.boothId === selectedBoothId);

  const stats = useMemo(() => {
    const activeBooths = booths.filter((booth) => booth.status === 'ACTIVE').length;
    const totalScans = booths.reduce((sum, booth) => sum + booth.totalScans, 0);
    const linkedBooths = booths.filter((booth) => booth.linkedAt).length;
    return { activeBooths, totalScans, linkedBooths };
  }, [booths]);

  const handleCreateBooth = async () => {
    setCreating(true);
    const booth = await onCreateBooth();
    setCreating(false);
    if (booth) {
      toast.success(`${booth.name} created`);
      setSelectedBoothId(booth.id);
    } else {
      toast.error('Failed to create booth');
    }
  };

  const handleDeleteBooth = async (booth: TicketScannerBooth) => {
    setDeletingBoothId(booth.id);
    const ok = await onDeleteBooth(booth.id);
    setDeletingBoothId(null);
    if (ok) {
      toast.success(`${booth.name} deleted`);
      if (selectedBoothId === booth.id) setSelectedBoothId('all');
    } else {
      toast.error('Failed to delete booth');
    }
  };

  const copyPairing = async (booth: TicketScannerBooth) => {
    try {
      await navigator.clipboard.writeText(getBoothQrValue(booth));
      toast.success('Booth QR payload copied');
    } catch {
      toast.error('Failed to copy QR payload');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Booths</p>
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
              <QrCode className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeBooths} / {booths.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Linked Operators</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.linkedBooths}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Scans</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalScans}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Scanner Booths</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create a booth QR, then the mobile scanner app can pair to that event booth.
          </p>
        </div>
        <Button
          onClick={handleCreateBooth}
          disabled={creating}
          className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Booth
        </Button>
      </div>

      {isLoadingBooths ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : booths.length === 0 ? (
        <div className="flex h-56 pt-6 pb-6 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center dark:border-slate-700">
          <QrCode className="mb-3 h-9 w-9 text-slate-300 dark:text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No booths yet</h4>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Create Booth 1 to generate a pairing QR for the mobile scanner app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {booths.map((booth) => (
            <div key={booth.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700">
                  <QRCodeSVG value={getBoothQrValue(booth)} size={132} level="M" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{booth.name}</h4>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          booth.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : booth.status === 'INACTIVE'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                        )}>
                          {booth.status === 'UNCLAIMED' ? 'Awaiting link' : booth.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Created {formatDateTime(booth.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteBooth(booth)}
                      disabled={deletingBoothId === booth.id}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title={`Delete ${booth.name}`}
                    >
                      {deletingBoothId === booth.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Scanner</p>
                      <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{booth.assignedScannerName || 'Not linked'}</p>
                      {booth.assignedScannerEmail && <p className="truncate text-xs text-slate-500">{booth.assignedScannerEmail}</p>}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Last scan</p>
                      <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{formatDateTime(booth.lastScanAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Scans</p>
                      <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{booth.totalScans}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">Linked</p>
                      <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{formatDateTime(booth.linkedAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyPairing(booth)} className="gap-2">
                      <Clipboard className="h-4 w-4" />
                      Copy QR payload
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedBoothId(booth.id);
                      void onRefreshScans(booth.id);
                    }}>
                      View scans
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Booth Scan Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tickets scanned by paired mobile operators.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedBoothId}
              onChange={(event) => {
                const boothId = event.target.value;
                setSelectedBoothId(boothId);
                void onRefreshScans(boothId === 'all' ? undefined : boothId);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All booths</option>
              {booths.map((booth) => (
                <option key={booth.id} value={booth.id}>{booth.name}</option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => void onRefreshScans(selectedBooth?.id)}
              disabled={isLoadingScans}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isLoadingScans ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Attendee</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Ticket</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Booth</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Scanner</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Result</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingScans ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading scans...
                  </td>
                </tr>
              ) : filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No scan activity yet.
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{scan.attendeeName}</p>
                      <p className="text-xs text-slate-500">{scan.attendeeEmail || scan.attendeeId}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{scan.ticketTypeName}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">{scan.boothName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{scan.scannerName || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        scan.result === 'VALID'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : scan.result === 'DUPLICATE'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                      )}>
                        {scan.result === 'VALID' && <CheckCircle2 className="h-3 w-3" />}
                        {scan.result.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDateTime(scan.scannedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
