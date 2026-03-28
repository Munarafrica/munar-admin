import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormResponse, FormField } from '../types';
import { ArrowLeft, Download, Filter, Search, CheckCircle, XCircle, Clock, CreditCard, DollarSign, Eye, Trash2, Loader2, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../ui/utils';
import { formsService } from '../../../services';
import { getCurrentEventId } from '../../../lib/event-storage';
import { toast } from 'sonner';

interface FormResponseViewerProps {
  form: Form;
  onCancel: () => void;
}

export const FormResponseViewer: React.FC<FormResponseViewerProps> = ({ form, onCancel }) => {
  const eventId = getCurrentEventId();
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'partial'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live data
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected response for detail modal
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<{
    totalResponses: number;
    completionRate: number;
    averageTimeToComplete: number;
    responsesByDay: Array<{ date: string; count: number }>;
  } | null>(null);

  // Fetch responses
  const fetchResponses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await formsService.getResponses(eventId, form.id, { page, limit: 50 });
      setResponses(result.data);
      setTotalItems(result.meta.totalItems);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      toast.error('Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, form.id, page]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await formsService.getFormAnalytics(eventId, form.id);
      setAnalytics(data);
    } catch { /* ignore */ }
  }, [eventId, form.id]);

  useEffect(() => {
    fetchResponses();
    fetchAnalytics();
  }, [fetchResponses, fetchAnalytics]);

  // Delete response
  const handleDeleteResponse = async (responseId: string) => {
    if (!window.confirm('Delete this response? This cannot be undone.')) return;
    try {
      await formsService.deleteResponse(eventId, form.id, responseId);
      setResponses(prev => prev.filter(r => r.id !== responseId));
      setTotalItems(prev => prev - 1);
      if (selectedResponse?.id === responseId) setSelectedResponse(null);
      toast.success('Response deleted');
    } catch {
      toast.error('Failed to delete response');
    }
  };

  // Export
  const handleExport = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await formsService.exportResponses(eventId, form.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  // Derived Stats
  const completedResponses = responses.filter(r => r.status === 'completed').length;
  const completionRate = responses.length > 0 ? Math.round((completedResponses / responses.length) * 100) : (analytics?.completionRate ?? 0);
  const totalRevenue = responses
    .filter(r => r.paymentStatus === 'paid')
    .reduce((acc, _) => acc + (form.settings.price || 0), 0);

  const filteredResponses = responses.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      (r.respondentName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (r.respondentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  const formatTime = (seconds: number) => {
    if (!seconds) return '–';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onCancel} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 truncate">{form.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalItems} total response{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => fetchResponses()} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')} className="gap-2 text-xs">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-[1440px] mx-auto w-full space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Responses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{analytics?.totalResponses ?? totalItems}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Avg. Completion Time</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatTime(analytics?.averageTimeToComplete || 0)}</p>
          </div>
          {form.settings.isPaid && (
            <>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                   {form.settings.currency} {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">
                   {responses.filter(r => r.paymentStatus === 'pending').length}
                </p>
              </div>
            </>
          )}
          {!form.settings.isPaid && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{analytics?.completionRate ?? completionRate}%</p>
            </div>
          )}
        </div>

        {/* Filters & Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
           {/* Toolbar */}
           <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                 />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'completed', 'partial'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors capitalize",
                        filterStatus === status
                          ? status === 'completed'
                            ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                            : status === 'partial'
                            ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                            : "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                      )}
                    >
                      {status}
                    </button>
                  ))}
              </div>
           </div>

           {/* Table */}
           {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Respondent</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                         {form.settings.isPaid && (
                            <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Payment</th>
                         )}
                         {/* Dynamic Field Columns (First 3 fields) */}
                         {form.fields.slice(0, 3).map(field => (
                            <th key={field.id} className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap max-w-[180px]">
                               {field.label}
                            </th>
                         ))}
                         <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredResponses.length === 0 ? (
                         <tr>
                            <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                               {responses.length === 0
                                 ? 'No responses yet. Share the form link to start collecting.'
                                 : 'No responses found matching your filters.'}
                            </td>
                         </tr>
                      ) : (
                         filteredResponses.map(response => (
                            <tr key={response.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedResponse(response)}>
                               <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                     <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {response.respondentName || 'Anonymous'}
                                     </span>
                                     <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {response.respondentEmail || '–'}
                                     </span>
                                  </div>
                               </td>
                               <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  {new Date(response.submittedAt).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(response.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                               </td>
                               <td className="py-3 px-4">
                                  <Badge variant="secondary" className={cn(
                                     "text-[10px] font-medium border-0 px-2 h-5",
                                     response.status === 'completed'
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  )}>
                                     {response.status === 'completed' ? 'Completed' : 'Partial'}
                                  </Badge>
                               </td>
                               {form.settings.isPaid && (
                                  <td className="py-3 px-4">
                                     <div className={cn(
                                        "flex items-center gap-1.5 text-xs font-medium",
                                        response.paymentStatus === 'paid' ? "text-emerald-600 dark:text-emerald-400" :
                                        response.paymentStatus === 'pending' ? "text-amber-600 dark:text-amber-400" :
                                        "text-red-600 dark:text-red-400"
                                     )}>
                                        {response.paymentStatus === 'paid' && <CheckCircle className="w-3.5 h-3.5" />}
                                        {response.paymentStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                        {response.paymentStatus === 'failed' && <XCircle className="w-3.5 h-3.5" />}
                                        <span className="capitalize">{response.paymentStatus}</span>
                                     </div>
                                  </td>
                               )}
                               {/* Dynamic data */}
                               {form.fields.slice(0, 3).map(field => (
                                  <td key={field.id} className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                                     {formatAnswerValue(response.answers[field.id])}
                                  </td>
                               ))}
                               <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setSelectedResponse(response)}>
                                       <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDeleteResponse(response.id)}>
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
           )}

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
               <p className="text-xs text-slate-500 dark:text-slate-400">
                 Page {page} of {totalPages} ({totalItems} total)
               </p>
               <div className="flex gap-2">
                 <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                   Previous
                 </Button>
                 <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                   Next
                 </Button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* ── Response Detail Modal ─────────────────────── */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedResponse(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/80">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedResponse.respondentName || 'Anonymous Response'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedResponse.respondentEmail || 'No email provided'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Submitted {new Date(selectedResponse.submittedAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body — Answers */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {form.fields.map(field => {
                const answer = selectedResponse.answers[field.id];
                return (
                  <div key={field.id} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5 border border-slate-100 dark:border-slate-800 min-h-[40px]">
                      {field.type === 'rating' ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} className={cn('w-5 h-5', (answer || 0) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600')} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          ))}
                          <span className="ml-2 text-slate-500 dark:text-slate-400">{answer || 0}/5</span>
                        </div>
                      ) : Array.isArray(answer) ? (
                        answer.length > 0 ? answer.join(', ') : <span className="text-slate-400 italic">No selection</span>
                      ) : answer !== undefined && answer !== null && answer !== '' ? (
                        String(answer)
                      ) : (
                        <span className="text-slate-400 italic">–</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => { handleDeleteResponse(selectedResponse.id); }}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedResponse(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ──────────────────────────────────────────── */

function formatAnswerValue(value: any): string {
  if (value === undefined || value === null) return '–';
  if (Array.isArray(value)) return value.join(', ') || '–';
  return String(value);
}