import React, { useState, useEffect, useMemo } from "react";
import { useEvent } from "../../contexts";
import { useAuth } from "../../contexts";
import { useBrandSafe } from "../../contexts/BrandContext";
import { cn } from "../../components/ui/utils";
import { Button } from "../../components/ui/button";
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ShoppingCart,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Minus,
  Plus,
  User,
  Mail,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ticketsService } from "../../services";
import {
  PublicTicketsResponse,
  CreateTicketOrderRequest,
  TicketOrderResponse,
  TicketQuestion,
} from "../../types/api";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

type Step = "select" | "checkout" | "confirmation";

type RecipientForm = {
  fullName: string;
  email: string;
  phone: string;
  questionAnswers: Record<string, string>;
};

type RecipientSlot = {
  key: string;
  ticketId: string;
  ticketName: string;
  quantityIndex: number;
  seatIndex: number;
  attendeeNumber: number;
  requiresAttendeeInfo: boolean;
};

export function TicketsPublic() {
  const { currentEvent } = useEvent();
  const { user, isAuthenticated } = useAuth();
  const { branding } = useBrandSafe();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams] = useSearchParams();
  const slug = eventSlug || currentEvent?.slug || currentEvent?.id || "";
  const isPreviewMode = searchParams.get("preview") === "1";
  const eventPageUrl = isPreviewMode
    ? `/e/${slug}?preview=1&eventId=${encodeURIComponent(currentEvent?.id || "")}`
    : `/e/${slug}`;

  const [step, setStep] = useState<Step>("select");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PublicTicketsResponse | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});

  // Checkout form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recipientDetails, setRecipientDetails] = useState<
    Record<string, RecipientForm>
  >({});

  // Confirmation state
  const [orderResult, setOrderResult] = useState<TicketOrderResponse | null>(
    null,
  );

  // Fetch public tickets
  useEffect(() => {
    if (!slug || !currentEvent?.id) return;
    setIsLoading(true);
    const loadTickets = isPreviewMode
      ? Promise.all([
          ticketsService
            .getTickets(currentEvent.id, { status: "ACTIVE" })
            .catch(() => []),
          ticketsService.getQuestions(currentEvent.id).catch(() => []),
        ]).then(([tickets, questions]) => ({
          event: {
            id: currentEvent.id,
            name: currentEvent.name,
            slug,
            date: currentEvent.date,
            time: currentEvent.time,
            endDate: currentEvent.endDate,
            endTime: currentEvent.endTime,
            type: currentEvent.type,
            coverImageUrl: currentEvent.coverImageUrl,
            venueLocation: currentEvent.venueLocation,
            currency: currentEvent.currency || "NGN",
          },
          tickets: tickets
            .filter((ticket) => ticket.status === "On Sale")
            .map((ticket) => ({
              id: ticket.id,
              name: ticket.name,
              description: ticket.description,
              type: ticket.type,
              groupSize: ticket.groupSize,
              attendeesPerUnit: ticket.attendeesPerUnit,
              isFree: ticket.isFree,
              price: ticket.price || 0,
              available: Math.max(
                0,
                ticket.quantityTotal - ticket.quantitySold,
              ),
              quantityTotal: ticket.quantityTotal,
              minPerOrder: ticket.minPerOrder,
              maxPerOrder: ticket.maxPerOrder,
              perks: ticket.perks,
              requireAttendeeInfo: ticket.requireAttendeeInfo,
            })),
          questions,
        }))
      : ticketsService.getPublicTickets(slug);

    loadTickets
      .then(setData)
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setIsLoading(false));
  }, [
    slug,
    currentEvent?.id,
    currentEvent?.name,
    currentEvent?.date,
    currentEvent?.time,
    currentEvent?.endDate,
    currentEvent?.endTime,
    currentEvent?.type,
    currentEvent?.coverImageUrl,
    currentEvent?.venueLocation,
    currentEvent?.currency,
    isPreviewMode,
  ]);

  useEffect(() => {
    if (user?.email) {
      setBuyerEmail(user.email);
    }
    if (user?.firstName || user?.lastName) {
      setBuyerName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    }
  }, [user?.email, user?.firstName, user?.lastName]);

  const ticketTypes = data?.tickets || [];
  const eventInfo = data?.event;
  const currency = eventInfo?.currency || currentEvent?.currency || "NGN";
  const questions = data?.questions || [];

  // Filter questions that apply to selected ticket types
  const selectedTicketIds = Object.entries(selectedTickets)
    .filter(([, qty]) => qty > 0)
    .map(([id]) => id);
  const relevantQuestions = questions
    .filter(
      (q) =>
        q.ticketIds.length === 0 ||
        q.ticketIds.includes("all") ||
        q.ticketIds.some((tid) => selectedTicketIds.includes(tid)),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const recipientSlots = useMemo<RecipientSlot[]>(() => {
    return Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .flatMap(([ticketId, qty]) => {
        const ticket = ticketTypes.find((item) => item.id === ticketId);
        if (!ticket) return [];

        const attendeesPerUnit =
          ticket.type === "Group"
            ? Math.max(1, ticket.attendeesPerUnit ?? ticket.groupSize ?? 1)
            : 1;

        return Array.from({ length: qty }).flatMap((_, quantityIndex) =>
          Array.from({ length: attendeesPerUnit }).map((__, seatIndex) => ({
            key: `${ticketId}:${quantityIndex}:${seatIndex}`,
            ticketId,
            ticketName: ticket.name,
            quantityIndex,
            seatIndex,
            attendeeNumber: quantityIndex * attendeesPerUnit + seatIndex + 1,
            requiresAttendeeInfo: ticket.requireAttendeeInfo,
          })),
        );
      });
  }, [selectedTickets, ticketTypes]);

  useEffect(() => {
    setRecipientDetails((prev) => {
      const next: Record<string, RecipientForm> = {};

      recipientSlots.forEach((slot, index) => {
        next[slot.key] = prev[slot.key] || {
          fullName: index === 0 ? buyerName : "",
          email: index === 0 ? buyerEmail : "",
          phone: index === 0 ? buyerPhone : "",
          questionAnswers: {},
        };
      });

      return next;
    });
  }, [recipientSlots, buyerEmail, buyerName, buyerPhone]);

  const totalItems = Object.values(selectedTickets).reduce((s, q) => s + q, 0);
  const totalAttendees = useMemo(() => {
    return Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === id);
      if (!ticket) return sum;
      const attendeesPerUnit =
        ticket.type === "Group"
          ? Math.max(1, ticket.attendeesPerUnit ?? ticket.groupSize ?? 1)
          : 1;
      return sum + qty * attendeesPerUnit;
    }, 0);
  }, [selectedTickets, ticketTypes]);
  const totalAmount = useMemo(() => {
    return Object.entries(selectedTickets).reduce((total, [id, qty]) => {
      const ticket = ticketTypes.find((t) => t.id === id);
      return total + (ticket?.price || 0) * qty;
    }, 0);
  }, [selectedTickets, ticketTypes]);
  const estimatedVatAmount = useMemo(
    () => Math.round(totalAmount * 0.075),
    [totalAmount],
  );
  const estimatedTotalAmount = useMemo(
    () => totalAmount + estimatedVatAmount,
    [totalAmount, estimatedVatAmount],
  );

  const formatCurrency = (amount: number) => {
    if (currency === "NGN") return `₦${amount.toLocaleString()}`;
    if (currency === "GHS") return `GH₵${amount.toLocaleString()}`;
    if (currency === "ZAR") return `R${amount.toLocaleString()}`;
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatEventDate = (value?: string) => {
    if (!value) return "";

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const plainDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (plainDateMatch) {
      const [, year, month, day] = plainDateMatch;
      const fallback = new Date(Number(year), Number(month) - 1, Number(day));
      return fallback.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return value;
  };

  const formatEventTime = (value?: string) => {
    if (!value) return "";

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    const timeMatch = value.match(/^(\d{2}):(\d{2})/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      const fallback = new Date();
      fallback.setHours(Number(hours), Number(minutes), 0, 0);
      return fallback.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return value;
  };

  const updateRecipient = (
    slotKey: string,
    field: keyof Omit<RecipientForm, "questionAnswers">,
    value: string,
  ) => {
    setRecipientDetails((prev) => ({
      ...prev,
      [slotKey]: {
        ...(prev[slotKey] || {
          fullName: "",
          email: "",
          phone: "",
          questionAnswers: {},
        }),
        [field]: value,
      },
    }));
  };

  const updateRecipientAnswer = (
    slotKey: string,
    questionId: string,
    value: string,
  ) => {
    setRecipientDetails((prev) => ({
      ...prev,
      [slotKey]: {
        ...(prev[slotKey] || {
          fullName: "",
          email: "",
          phone: "",
          questionAnswers: {},
        }),
        questionAnswers: {
          ...(prev[slotKey]?.questionAnswers || {}),
          [questionId]: value,
        },
      },
    }));
  };

  const getQuestionsForTicket = (ticketId: string): TicketQuestion[] =>
    relevantQuestions.filter(
      (question) =>
        question.ticketIds.length === 0 ||
        question.ticketIds.includes("all") ||
        question.ticketIds.includes(ticketId),
    );

  const handleCheckout = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }

    for (const slot of recipientSlots) {
      const details = recipientDetails[slot.key];
      if (!details?.fullName.trim()) {
        toast.error(`Enter the attendee name for ${slot.ticketName}`);
        return;
      }

      if (!details.email.trim()) {
        toast.error(`Enter the delivery email for ${slot.ticketName}`);
        return;
      }

      const unanswered = getQuestionsForTicket(slot.ticketId).filter(
        (question) =>
          question.required &&
          !(details.questionAnswers?.[question.id] || "").trim(),
      );

      if (unanswered.length > 0) {
        toast.error(
          `${slot.ticketName}: answer ${unanswered
            .map((question) => question.label)
            .join(", ")}`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const items = Object.entries(selectedTickets)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, quantity]) => {
          const ticket = ticketTypes.find((t) => t.id === ticketTypeId);
          const attendeesPerUnit =
            ticket?.type === "Group"
              ? Math.max(1, ticket.attendeesPerUnit ?? ticket.groupSize ?? 1)
              : 1;
          const attendeePayloads = Array.from({
            length: quantity * attendeesPerUnit,
          }).map((_, index) => {
            const quantityIndex = Math.floor(index / attendeesPerUnit);
            const seatIndex = index % attendeesPerUnit;
            const slotKey = `${ticketTypeId}:${quantityIndex}:${seatIndex}`;
            const recipient = recipientDetails[slotKey];
            const answers = getQuestionsForTicket(ticketTypeId)
              .filter(
                (question) =>
                  (recipient?.questionAnswers?.[question.id] || "").trim()
                    .length > 0,
              )
              .map((question) => ({
                questionId: question.id,
                questionLabel: question.label,
                answer:
                  recipient?.questionAnswers?.[question.id]?.trim() || "",
              }));

            return {
              fullName: recipient?.fullName.trim() || buyerName.trim(),
              email: recipient?.email.trim() || buyerEmail.trim(),
              phone: recipient?.phone.trim() || buyerPhone.trim() || undefined,
              questionAnswers: answers,
              deliveryEmail: recipient?.email.trim() || buyerEmail.trim(),
            };
          });

          return {
            ticketTypeId,
            quantity,
            attendeePayloads,
          };
        });

      const checkoutData: CreateTicketOrderRequest = {
        email: buyerEmail.trim(),
        items,
        metadataJson: {
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim() || undefined,
          deliveryAssignments: recipientSlots.map((slot) => {
            const recipient = recipientDetails[slot.key];
            return {
              ticketTypeId: slot.ticketId,
              ticketName: slot.ticketName,
              quantityIndex: slot.quantityIndex,
              seatIndex: slot.seatIndex,
              fullName: recipient?.fullName.trim() || "",
              email: recipient?.email.trim() || "",
            };
          }),
        },
      };

      const order = await ticketsService.createOrder(
        currentEvent!.id,
        checkoutData,
      );
      localStorage.setItem("munar_last_ticket_event_slug", slug);

      if (order.totalMinor === 0 || order.status === "PAID") {
        setOrderResult(order);
        setStep("confirmation");
        return;
      }

      const checkout = await ticketsService.initializeCheckout(order.id, {
        callbackUrl: `${window.location.origin}/checkout/tickets/callback`,
        metadataJson: { eventSlug: slug },
      });

      window.location.assign(checkout.authorizationUrl);
    } catch (err: any) {
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Tickets Unavailable
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          This event doesn't have tickets available for purchase right now.
        </p>
      </div>
    );
  }

  const displayName = eventInfo?.name || currentEvent?.name || "Event";
  const displayDate = eventInfo?.date || currentEvent?.date || "";
  const displayTime = eventInfo?.time || currentEvent?.time || "";
  const displayVenue =
    eventInfo?.venueLocation || currentEvent?.venueLocation || "";
  const formattedDisplayDate = formatEventDate(displayDate);
  const formattedDisplayTime = formatEventTime(displayTime);

  // ═══════════════════════════════════════════════════════════
  //  CONFIRMATION STEP
  // ═══════════════════════════════════════════════════════════
  if (step === "confirmation" && orderResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              You're All Set!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Confirmation sent to{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {orderResult.email}
              </strong>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Order Reference
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {orderResult.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {orderResult.totalMinor === 0
                    ? "Free"
                    : formatCurrency(orderResult.totalMinor / 100)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {displayDate} {displayTime && `at ${displayTime}`}
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Subtotal
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {formatCurrency(orderResult.subtotalMinor / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  VAT (7.5%)
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {formatCurrency((orderResult.vatMinor ?? 0) / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fees</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {formatCurrency(orderResult.feeMinor / 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Individual Tickets with QR Codes */}
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Your Tickets (
            {orderResult.items.reduce(
              (sum, item) => sum + item.attendees.length,
              0,
            )}
            )
          </h2>
          <div className="space-y-4">
            {orderResult.items
              .flatMap((item) =>
                item.attendees.map((attendee) => ({ attendee, item })),
              )
              .map(({ attendee, item }) => (
                <div
                  key={attendee.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5"
                >
                  {/* QR Code */}
                  <div className="shrink-0 bg-white p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    {attendee.qrCode ? (
                      <QRCodeSVG value={attendee.qrCode} size={112} level="M" />
                    ) : (
                      <QRCodeSVG value={attendee.id} size={112} level="M" />
                    )}
                  </div>

                  {/* Ticket Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {attendee.fullName || buyerName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {attendee.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
                      <Ticket className="w-3 h-3" />
                      {item.ticketType.name}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                      Ref: {orderResult.id}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <Link
              to={eventPageUrl}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Back to event page
            </Link>
          </div>
        </div>

        <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
          Powered by Munar
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  CHECKOUT STEP
  // ═══════════════════════════════════════════════════════════
  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => setStep("select")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to tickets
          </button>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Checkout
          </h1>
          {!isAuthenticated && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              You can complete this purchase as a guest. Your ticket details will be sent to the email address you provide below.
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              {Object.entries(selectedTickets)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const ticket = ticketTypes.find((t) => t.id === id);
                  if (!ticket) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">
                          {ticket.name} x {qty}
                        </span>
                        {ticket.type === "Group" && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {qty *
                              Math.max(
                                1,
                                ticket.attendeesPerUnit ??
                                  ticket.groupSize ??
                                  1,
                              )}{" "}
                            attendee slots
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {ticket.isFree
                          ? "Free"
                          : formatCurrency(ticket.price * qty)}
                      </span>
                    </div>
                  );
                })}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    VAT (7.5%)
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(estimatedVatAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Total
                </span>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {totalAmount === 0
                    ? "Free"
                    : formatCurrency(estimatedTotalAmount)}
                </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Your Information
            </h3>
            <div className="space-y-4">
              {/* Full Name */}
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="pointer-events-none absolute left-3 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
                  className="w-full py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Email Address */}
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
                  className="w-full py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-2.5 text-sm leading-normal border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Ticket Delivery */}
          {recipientSlots.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ticket Delivery & Attendee Details
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Assign each ticket to the attendee who should receive it. Their
                ticket details will be generated against that email.
              </p>
              <div className="space-y-4">
                {recipientSlots.map((slot, index) => {
                  const recipient = recipientDetails[slot.key] || {
                    fullName: "",
                    email: "",
                    phone: "",
                    questionAnswers: {},
                  };
                  const slotQuestions = getQuestionsForTicket(slot.ticketId);
                  return (
                    <div
                      key={slot.key}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {slot.ticketName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Attendee {index + 1}
                            {slot.requiresAttendeeInfo
                              ? " • details required"
                              : " • recipient assignment"}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          Ticket {slot.quantityIndex + 1}
                          {ticketTypes.find((ticket) => ticket.id === slot.ticketId)
                            ?.type === "Group"
                            ? ` • Seat ${slot.seatIndex + 1}`
                            : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Attendee Name *
                          </label>
                          <input
                            type="text"
                            value={recipient.fullName}
                            onChange={(e) =>
                              updateRecipient(
                                slot.key,
                                "fullName",
                                e.target.value,
                              )
                            }
                            placeholder="Attendee full name"
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Delivery Email *
                          </label>
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) =>
                              updateRecipient(slot.key, "email", e.target.value)
                            }
                            placeholder="attendee@example.com"
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={recipient.phone}
                          onChange={(e) =>
                            updateRecipient(slot.key, "phone", e.target.value)
                          }
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {slotQuestions.length > 0 && (
                        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                          {slotQuestions.map((question) => (
                            <div key={question.id} className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {question.label}
                                {question.required && " *"}
                              </label>
                              {question.type === "text" && (
                                <input
                                  type="text"
                                  value={
                                    recipient.questionAnswers[question.id] || ""
                                  }
                                  onChange={(e) =>
                                    updateRecipientAnswer(
                                      slot.key,
                                      question.id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter your answer"
                                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                              )}
                              {question.type === "dropdown" && (
                                <div className="relative">
                                  <select
                                    value={
                                      recipient.questionAnswers[question.id] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateRecipientAnswer(
                                        slot.key,
                                        question.id,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none pr-10"
                                  >
                                    <option value="">Select an option</option>
                                    {(question.options || []).map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                              )}
                              {question.type === "checkbox" && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      recipient.questionAnswers[question.id] ===
                                      "Yes"
                                    }
                                    onChange={(e) =>
                                      updateRecipientAnswer(
                                        slot.key,
                                        question.id,
                                        e.target.checked ? "Yes" : "No",
                                      )
                                    }
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Yes
                                  </span>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checkout Actions */}
          <Button
            onClick={handleCheckout}
            disabled={isSubmitting || !buyerName.trim() || !buyerEmail.trim()}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : totalAmount === 0 ? (
              "Complete Registration"
            ) : (
              `Pay ${formatCurrency(estimatedTotalAmount)}`
            )}
          </Button>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
            By completing this purchase, you agree to the event's terms and
            conditions.
          </p>
        </div>

        <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
          Powered by Munar
        </div>
      </div>
    );
  }

  //  TICKET SELECTION
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      <div
        className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:items-start lg:gap-8"
        style={{ gap: "48px" }}
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
            <Link
              to={eventPageUrl}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to event
            </Link>

            {(eventInfo?.coverImageUrl || currentEvent?.coverImageUrl) && (
              <div className="w-full h-56 rounded-xl overflow-hidden mb-5">
                <img
                  src={eventInfo?.coverImageUrl || currentEvent?.coverImageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-4 mb-3">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              {formattedDisplayDate && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  {formattedDisplayDate}
                </span>
              )}
              {formattedDisplayTime && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  {formattedDisplayTime}
                </span>
              )}
              {displayVenue && (
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <MapPin className="w-4 h-4" />
                  {displayVenue}
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Select Tickets
              </h2>
            </div>

            {ticketTypes.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  No Tickets Available
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Check back later for ticket availability.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ticketTypes.map((ticket) => {
                  const qty = selectedTickets[ticket.id] || 0;
                  const maxQty = Math.min(
                    ticket.maxPerOrder || 10,
                    ticket.available,
                  );
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {ticket.name}
                          </h3>
                          {ticket.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                              {ticket.description}
                            </p>
                          )}
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                            {ticket.isFree
                              ? "Free"
                              : formatCurrency(ticket.price)}
                          </p>
                          {ticket.type === "Group" && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {Math.max(
                                1,
                                ticket.attendeesPerUnit ??
                                  ticket.groupSize ??
                                  1,
                              )}{" "}
                              people per ticket
                            </p>
                          )}
                          {ticket.available <= 10 && ticket.available > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              Only {ticket.available} left
                            </p>
                          )}
                          {ticket.perks && ticket.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {ticket.perks.map((p) => (
                                <span
                                  key={p.id}
                                  className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {ticket.available === 0 ? (
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                            Sold Out
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() =>
                                setSelectedTickets((prev) => ({
                                  ...prev,
                                  [ticket.id]: Math.max(0, qty - 1),
                                }))
                              }
                              disabled={qty === 0}
                              className={cn(
                                "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
                                qty === 0
                                  ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                              )}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() =>
                                setSelectedTickets((prev) => ({
                                  ...prev,
                                  [ticket.id]: Math.min(maxQty, qty + 1),
                                }))
                              }
                              disabled={qty >= maxQty}
                              className={cn(
                                "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
                                qty >= maxQty
                                  ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                              )}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside
          style={{
            width: "360px",
            minWidth: "360px",
            maxWidth: "360px",
            position: "sticky",
            top: "24px",
            alignSelf: "flex-start",
          }}
          className="hidden lg:block lg:mt-0 shrink-0"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <p className="inline-flex items-center gap-2 text-lg font-semibold text-slate-100">
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                  Checkout Summary
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {totalItems} ticket{totalItems > 1 ? "s" : ""} selected
                </p>
                <p className="text-[12px] text-slate-500 mt-1 mb-4">
                  {totalAttendees} attendee slot{totalAttendees > 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-lg font-bold text-slate-100">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="py-5 space-y-4">
              <div className="space-y-3 mt-4">
                {totalItems > 0 ? (
                  Object.entries(selectedTickets)
                    .filter(([, qty]) => qty > 0)
                    .map(([id, qty]) => {
                      const ticket = ticketTypes.find((item) => item.id === id);
                      if (!ticket) return null;

                      return (
                        <div
                          key={id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-100 truncate">
                              {ticket.name} x {qty}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {ticket.type === "Group"
                                ? `${qty * Math.max(1, ticket.attendeesPerUnit ?? ticket.groupSize ?? 1)} attendee slots`
                                : `${qty} attendee${qty > 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <span className="font-medium text-slate-100 whitespace-nowrap">
                            {ticket.isFree
                              ? "Free"
                              : formatCurrency((ticket.price || 0) * qty)}
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-slate-400">
                    Select one or more tickets to continue to checkout.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#10192e] px-4 py-4 space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-100">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">VAT (7.5%)</span>
                  <span className="font-medium text-slate-100">
                    {formatCurrency(estimatedVatAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-sm font-semibold text-slate-100">
                    Total
                  </span>
                  <span className="text-lg font-bold text-slate-100">
                    {formatCurrency(estimatedTotalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("checkout")}
              disabled={totalItems === 0}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
              size="lg"
            >
              Proceed to Checkout
            </Button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}
