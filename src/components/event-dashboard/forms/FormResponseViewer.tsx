import React, { useState, useEffect, useCallback } from "react";
import { Form, FormResponse } from "../types";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  X,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { cn } from "../../ui/utils";
import { formsService } from "../../../services";
import { getCurrentEventId } from "../../../lib/event-storage";
import { useAuth } from "../../../contexts";
import { toast } from "sonner";

interface FormResponseViewerProps {
  form: Form;
  onCancel: () => void;
}

export const FormResponseViewer: React.FC<FormResponseViewerProps> = ({
  form,
  onCancel,
}) => {
  const eventId = getCurrentEventId();
  const { currentTenant, memberships } = useAuth();
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "partial"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Live data
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingResponse, setIsDeletingResponse] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [analytics, setAnalytics] = useState<Awaited<
    ReturnType<typeof formsService.getFormAnalytics>
  > | null>(null);

  // Selected response for detail modal
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<FormResponse | null>(null);

  const activeMembership = memberships?.find(
    (membership) => membership.tenant.id === currentTenant?.id,
  );
  const canDeleteResponses =
    activeMembership?.role === "OWNER" || activeMembership?.role === "ADMIN";

  // Fetch responses
  const fetchResponses = useCallback(async () => {
    setIsLoading(true);
    try {
      const [result, analyticsResult] = await Promise.all([
        formsService.getResponses(eventId, form.id),
        formsService.getFormAnalytics(eventId, form.id).catch(() => null),
      ]);
      setResponses(result.data);
      setTotalItems(result.meta.totalItems);
      setAnalytics(analyticsResult);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load responses",
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId, form.id]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleExportResponses = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await formsService.exportResponses(eventId, form.id, "csv");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form.title.toLowerCase().replace(/\s+/g, "-") || "form"}-responses.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV export started");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export responses",
      );
    } finally {
      setIsExporting(false);
    }
  }, [eventId, form.id, form.title]);

  const handleDeleteResponse = useCallback(async () => {
    if (!pendingDelete) return;

    setIsDeletingResponse(true);
    try {
      await formsService.deleteResponse(eventId, form.id, pendingDelete.id);
      setResponses((prev) =>
        prev.filter((response) => response.id !== pendingDelete.id),
      );
      setTotalItems((prev) => Math.max(prev - 1, 0));
      setSelectedResponse((current) =>
        current?.id === pendingDelete.id ? null : current,
      );
      setPendingDelete(null);
      toast.success("Submission deleted");
      fetchResponses();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete submission",
      );
    } finally {
      setIsDeletingResponse(false);
    }
  }, [eventId, fetchResponses, form.id, pendingDelete]);

  // Derived Stats
  const completedResponses =
    analytics?.completedSubmissions ??
    responses.filter((r) => r.status === "completed").length;
  const partialResponses =
    analytics?.partialSubmissions ??
    responses.filter((r) => r.status === "partial").length;
  const completionRate =
    typeof analytics?.completionRate === "number"
      ? Math.round(analytics.completionRate * 100)
      : responses.length > 0
        ? Math.round((completedResponses / responses.length) * 100)
        : 0;
  const totalRevenueMinor = analytics?.paymentSummary?.revenueMinor;
  const totalRevenue =
    typeof totalRevenueMinor === "number"
      ? totalRevenueMinor / 100
      : responses
          .filter((r) => r.paymentStatus === "paid")
          .reduce((acc, _) => acc + (form.settings.price || 0), 0);
  const pendingPayments =
    analytics?.paymentSummary?.pending ??
    responses.filter((r) => r.paymentStatus === "pending").length;

  const filteredResponses = responses.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      (r.respondentName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      (r.respondentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                {form.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalItems} total response{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResponses}
              disabled={isExporting}
              className="gap-1.5 text-xs"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchResponses()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 max-w-[1440px] mx-auto w-full space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Total Responses
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {totalItems}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {completedResponses}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Partial
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {partialResponses}
            </p>
          </div>
          {form.settings.isPaid && (
            <>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {form.settings.currency} {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-amber-500 mt-1">
                  {pendingPayments}
                </p>
              </div>
            </>
          )}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Completion Rate
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {completionRate}%
            </p>
          </div>
        </div>

        {!!analytics?.submissionsByDay?.length && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Submission Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily submission volume from the analytics endpoint
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Recent Trend
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Last {Math.min(analytics.submissionsByDay.length, 8)} day
                    {analytics.submissionsByDay.length === 1 ? "" : "s"} of
                    submission activity
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Total In Range
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {analytics.submissionsByDay
                      .slice(-8)
                      .reduce((sum, item) => sum + item.count, 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {(() => {
                  const recentActivity = analytics.submissionsByDay.slice(-8);
                  const maxCount = Math.max(
                    ...recentActivity.map((item) => item.count),
                    1,
                  );

                  return recentActivity.map((item) => {
                    const barWidth = Math.max(
                      (item.count / maxCount) * 100,
                      item.count > 0 ? 14 : 6,
                    );

                    return (
                      <div
                        key={item.date}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {new Date(item.date).toLocaleDateString([], {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {item.count}
                            </p>
                          </div>
                          <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                            submission{item.count === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

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
              {(["all", "completed", "partial"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors capitalize",
                    filterStatus === status
                      ? status === "completed"
                        ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                        : status === "partial"
                          ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                          : "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400",
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
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Respondent
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Date
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    {form.settings.isPaid && (
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        Payment
                      </th>
                    )}
                    {/* Dynamic Field Columns (First 3 fields) */}
                    {form.fields.slice(0, 3).map((field) => (
                      <th
                        key={field.id}
                        className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap max-w-[180px]"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredResponses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        {responses.length === 0
                          ? "No responses yet. Share the form link to start collecting."
                          : "No responses found matching your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredResponses.map((response) => (
                      <tr
                        key={response.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {response.respondentName || "Anonymous"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {response.respondentEmail || "–"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(response.submittedAt).toLocaleDateString()}{" "}
                          <span className="text-xs opacity-70">
                            {new Date(response.submittedAt).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-medium border-0 px-2 h-5",
                              response.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            )}
                          >
                            {response.status === "completed"
                              ? "Completed"
                              : "Partial"}
                          </Badge>
                        </td>
                        {form.settings.isPaid && (
                          <td className="py-3 px-4">
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                response.paymentStatus === "paid"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : response.paymentStatus === "pending"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-red-600 dark:text-red-400",
                              )}
                            >
                              {response.paymentStatus === "paid" && (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              {response.paymentStatus === "pending" && (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {response.paymentStatus === "failed" && (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span className="capitalize">
                                {response.paymentStatus}
                              </span>
                            </div>
                          </td>
                        )}
                        {/* Dynamic data */}
                        {form.fields.slice(0, 3).map((field) => (
                          <td
                            key={field.id}
                            className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-[180px] truncate"
                          >
                            {formatAnswerValue(response.answers[field.id])}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              onClick={() => setSelectedResponse(response)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canDeleteResponses && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                                onClick={() => setPendingDelete(response)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Response Detail Modal ── */}
      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-100 dark:bg-slate-900">
              <div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {selectedResponse.respondentName || "Anonymous Response"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selectedResponse.respondentEmail || "No email provided"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Submitted{" "}
                  {new Date(selectedResponse.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body — Answers */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {form.fields.map((field) => {
                const answer = selectedResponse.answers[field.id];
                return (
                  <div key={field.id} className="space-y-2.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      {field.label}
                    </label>
                    <div className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-100 dark:border-slate-800 min-h-[44px]">
                      {field.type === "rating" ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              className={cn(
                                "w-5 h-5",
                                (answer || 0) >= s
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300 dark:text-slate-600",
                              )}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-slate-500 dark:text-slate-400">
                            {answer || 0}/5
                          </span>
                        </div>
                      ) : Array.isArray(answer) ? (
                        answer.length > 0 ? (
                          answer.join(", ")
                        ) : (
                          <span className="text-slate-400 italic">
                            No selection
                          </span>
                        )
                      ) : answer !== undefined &&
                        answer !== null &&
                        answer !== "" ? (
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResponse(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !isDeletingResponse && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Delete submission?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This will permanently remove the submission from this form. Paid
              or settled submissions may be rejected by the backend.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={isDeletingResponse}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteResponse}
                disabled={isDeletingResponse}
                className="shadow-sm"
              >
                {isDeletingResponse ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
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
  if (value === undefined || value === null) return "–";
  if (Array.isArray(value)) return value.join(", ") || "–";
  return String(value);
}
