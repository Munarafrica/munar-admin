import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Attendee } from './types';
import { Button } from '../ui/button';
import { Search, Filter, ScanLine, CheckCircle2, XCircle, RefreshCw, Camera, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { ticketsService } from '../../services';
import { toast } from 'sonner';

interface TicketValidationTabProps {
  attendees: Attendee[];
  onCheckIn: (attendeeId: string, status: boolean) => void;
  eventId: string;
}

export const TicketValidationTab: React.FC<TicketValidationTabProps> = ({ attendees, onCheckIn, eventId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'pending'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; attendeeName?: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const totalCount = attendees.length;
  const progress = totalCount > 0 ? (checkedInCount / totalCount) * 100 : 0;

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ? true : 
                          filterStatus === 'checked-in' ? a.checkedIn : !a.checkedIn;
    
    return matchesSearch && matchesFilter;
  });

  // Handle QR scan result
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (isScanning) return; // Prevent duplicate scans
    setIsScanning(true);
    
    try {
      // QR code may contain JSON object or plain attendee ID
      let attendeeId: string;
      try {
        const qrData = JSON.parse(decodedText);
        attendeeId = qrData.attendeeId || decodedText.trim();
      } catch {
        attendeeId = decodedText.trim();
      }
      const result = await ticketsService.validateTicketQR(attendeeId, eventId);
      
      if (result.alreadyCheckedIn) {
        setScanResult({ success: false, message: 'Already checked in', attendeeName: result.name });
      } else {
        setScanResult({ success: true, message: 'Check-in successful!', attendeeName: result.name });
        // Update the local attendees list
        onCheckIn(attendeeId, true);
      }
    } catch (err: any) {
      setScanResult({ success: false, message: err.message || 'Invalid QR code' });
    } finally {
      setIsScanning(false);
      // Clear result after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    }
  }, [eventId, isScanning, onCheckIn]);

  // Start QR scanner
  const startScanner = useCallback(async () => {
    if (!scannerContainerRef.current) return;
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScanSuccess(decodedText),
        () => {} // ignore errors during scanning
      );
      
      setIsScannerOpen(true);
    } catch (err) {
      toast.error('Could not access camera. Please check permissions.');
      console.error('QR scanner error:', err);
    }
  }, [handleScanSuccess]);

  // Stop QR scanner
  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
    } catch {
      // Ignore stop errors
    }
    setIsScannerOpen(false);
    setScanResult(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Check-ins</p>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <ScanLine className="w-5 h-5" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{checkedInCount} / {totalCount}</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Scan Status</p>
                <div className={cn(
                  "p-2 rounded-lg",
                  scanResult?.success ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : scanResult ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                )}>
                    {scanResult?.success ? <CheckCircle2 className="w-5 h-5" /> : scanResult ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
            </div>
            <div>
                 {scanResult ? (
                   <>
                     <p className={cn("text-sm font-medium", scanResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")}>{scanResult.message}</p>
                     {scanResult.attendeeName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{scanResult.attendeeName}</p>}
                   </>
                 ) : (
                   <p className="text-sm text-slate-500 dark:text-slate-400">Ready to scan</p>
                 )}
            </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 shadow-sm text-white flex flex-col items-center justify-center text-center">
            {isScannerOpen ? <CameraOff className="w-8 h-8 mb-2 opacity-90" /> : <Camera className="w-8 h-8 mb-2 opacity-90" />}
            <h3 className="text-lg font-bold">{isScannerOpen ? 'Scanner Active' : 'Open Scanner'}</h3>
            <p className="text-indigo-100 text-xs mt-1">{isScannerOpen ? 'Camera is active — point at QR' : 'Use camera to scan QR codes'}</p>
            <Button 
              size="sm" 
              variant="secondary" 
              className="mt-3 bg-white/10 hover:bg-white/20 text-white border-0"
              onClick={isScannerOpen ? stopScanner : startScanner}
            >
                {isScannerOpen ? 'Stop Scanner' : 'Launch Camera'}
            </Button>
        </div>
      </div>

      {/* QR Scanner Area */}
      {isScannerOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center">
          <div id="qr-reader" ref={scannerContainerRef} className="w-full max-w-md rounded-lg overflow-hidden" />
          {isScanning && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing scan...
            </div>
          )}
        </div>
      )}

      {/* Manual Validation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Manual Check-in</h3>
            
            <div className="flex gap-2">
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search name, email or ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setFilterStatus('all')}
                        className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors", filterStatus === 'all' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilterStatus('checked-in')}
                        className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors", filterStatus === 'checked-in' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}
                    >
                        Checked In
                    </button>
                    <button 
                        onClick={() => setFilterStatus('pending')}
                        className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors", filterStatus === 'pending' ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400")}
                    >
                        Pending
                    </button>
                </div>
            </div>
         </div>

         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 dark:bg-slate-800/50">
                     <tr>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Attendee</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ticket</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Order ID</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Action</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {filteredAttendees.length === 0 ? (
                         <tr>
                             <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                 No attendees found matching your search.
                             </td>
                         </tr>
                     ) : (
                         filteredAttendees.map(attendee => (
                             <tr key={attendee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                 <td className="py-3 px-4">
                                     <div className="flex flex-col">
                                         <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{attendee.name}</span>
                                         <span className="text-xs text-slate-500 dark:text-slate-400">{attendee.email}</span>
                                     </div>
                                 </td>
                                 <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{attendee.ticketTypeName}</td>
                                 <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-500 font-mono">#{attendee.id.toUpperCase().substring(0, 8)}</td>
                                 <td className="py-3 px-4">
                                     {attendee.checkedIn ? (
                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                             <CheckCircle2 className="w-3 h-3" />
                                             Checked In
                                         </span>
                                     ) : (
                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                             Pending
                                         </span>
                                     )}
                                 </td>
                                 <td className="py-3 px-4 text-right">
                                     {attendee.checkedIn ? (
                                         <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => onCheckIn(attendee.id, false)}
                                            className="h-8 text-xs border-slate-200 dark:border-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900"
                                         >
                                             Undo
                                         </Button>
                                     ) : (
                                         <Button 
                                            size="sm" 
                                            onClick={() => onCheckIn(attendee.id, true)}
                                            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                         >
                                             Check In
                                         </Button>
                                     )}
                                 </td>
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
