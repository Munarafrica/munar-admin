import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
  X,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, useEvent } from "../../contexts";
import { Button } from "../../components/ui/button";
import type {
  CreateOrderRequest,
  Order,
  Product,
  ProductVariant,
} from "../../types/merchandise";
import {
  createPublicOrder,
  getPublicOrder,
  getPublicProducts,
  initializeMerchPayment,
} from "../../services/merchandise.service";
import { styles } from "./styles";

type CartLine = {
  key: string;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
};

type CheckoutForm = {
  email: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  country: string;
  note: string;
};

const ORDER_STORAGE_PREFIX = "munar_merch_last_order";

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

const getCategory = (product: Product) => {
  const category = product.metadataJson?.category;
  return typeof category === "string" ? category : "";
};

const getSelectedVariant = (product: Product, variantId?: string) =>
  product.variants.find((variant) => variant.id === variantId) ?? null;

const getUnitPriceMinor = (product: Product, variant: ProductVariant | null) =>
  variant?.priceMinor ?? product.basePriceMinor;

const getAvailableInventory = (
  product: Product,
  variant: ProductVariant | null,
) => {
  if (!product.inventoryTracked) return null;
  if (variant) return variant.inventoryCount ?? 0;
  return product.inventoryCount ?? 0;
};

const isProductOutOfStock = (
  product: Product,
  variant: ProductVariant | null,
) => {
  const available = getAvailableInventory(product, variant);
  return available !== null && available <= 0;
};

const getStorageKey = (slug: string) => `${ORDER_STORAGE_PREFIX}:${slug}`;

function statusTone(order?: Order | null) {
  if (!order)
    return {
      border: "#334155",
      bg: "rgba(15,23,42,0.8)",
      accent: "#94a3b8",
      badge: "rgba(51,65,85,0.6)",
    };
  if (order.status === "PAID" || order.status === "FULFILLED")
    return {
      border: "rgba(16,185,129,0.3)",
      bg: "rgba(16,185,129,0.08)",
      accent: "#34d399",
      badge: "rgba(16,185,129,0.15)",
    };
  if (
    order.status === "FAILED" ||
    order.status === "CANCELLED" ||
    order.status === "EXPIRED"
  )
    return {
      border: "rgba(239,68,68,0.3)",
      bg: "rgba(239,68,68,0.08)",
      accent: "#f87171",
      badge: "rgba(239,68,68,0.15)",
    };
  return {
    border: "rgba(245,158,11,0.3)",
    bg: "rgba(245,158,11,0.08)",
    accent: "#fbbf24",
    badge: "rgba(245,158,11,0.15)",
  };
}

// const styles: Record<string, React.CSSProperties> = {
//   root: {
//     minHeight: "100vh",
//     background:
//       "linear-gradient(135deg, #050914 0%, #0a1628 40%, #080d1e 100%)",
//     fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
//     color: "#e2e8f0",
//   },
//   topbar: {
//     borderBottom: "1px solid rgba(255,255,255,0.06)",
//     background: "rgba(5,9,20,0.85)",
//     backdropFilter: "blur(20px)",
//     position: "sticky" as const,
//     top: 0,
//     zIndex: 50,
//   },
//   topbarInner: {
//     maxWidth: 1280,
//     margin: "0 auto",
//     padding: "14px 24px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   backLink: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     fontSize: 13,
//     color: "#94a3b8",
//     textDecoration: "none",
//     fontWeight: 500,
//     transition: "color 0.2s",
//   },
//   storeBadge: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     padding: "5px 12px",
//     borderRadius: 20,
//     background: "rgba(99,102,241,0.15)",
//     border: "1px solid rgba(99,102,241,0.3)",
//     fontSize: 11,
//     fontWeight: 700,
//     letterSpacing: "0.14em",
//     textTransform: "uppercase" as const,
//     color: "#a5b4fc",
//   },
//   container: {
//     maxWidth: 1280,
//     margin: "0 auto",
//     padding: "32px 24px",
//   },
//   hero: {
//     marginBottom: 40,
//     padding: "48px 56px",
//     borderRadius: 24,
//     border: "1px solid rgba(255,255,255,0.07)",
//     backdropFilter: "blur(8px)",
//     position: "relative" as const,
//     overflow: "hidden",
//   },
//   heroGlow: {
//     position: "absolute" as const,
//     top: -80,
//     right: -80,
//     width: 300,
//     height: 300,
//     borderRadius: "50%",
//     pointerEvents: "none" as const,
//   },
//   heroTitle: {
//     fontSize: 36,
//     fontWeight: 700,
//     color: "#f8fafc",
//     margin: 0,
//     letterSpacing: "-0.02em",
//     lineHeight: 1.2,
//   },
//   heroSub: {
//     marginTop: 12,
//     fontSize: 15,
//     color: "#94a3b8",
//     lineHeight: 1.65,
//     maxWidth: 600,
//   },
//   howItWorks: {
//     marginTop: 28,
//     padding: "18px 22px",
//     borderRadius: 16,
//     background: "rgba(16,185,129,0.07)",
//     border: "1px solid rgba(16,185,129,0.18)",
//     display: "flex",
//     gap: 14,
//     alignItems: "flex-start",
//     maxWidth: 580,
//   },
//   howItWorksText: {
//     fontSize: 13.5,
//     color: "#a7f3d0",
//     lineHeight: 1.6,
//   },
//   layout: {
//     display: "grid",
//     gridTemplateColumns: "1fr 380px",
//     gap: 28,
//     alignItems: "start",
//   },
//   /* Catalog */
//   catalogHeader: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     gap: 16,
//     flexWrap: "wrap" as const,
//   },
//   searchWrap: {
//     position: "relative" as const,
//     flex: 1,
//     maxWidth: 380,
//   },
//   searchInput: {
//     width: "100%",
//     height: 44,
//     padding: "0 16px 0 44px",
//     borderRadius: 12,
//     border: "1px solid rgba(255,255,255,0.1)",
//     background: "rgba(255,255,255,0.05)",
//     color: "#f1f5f9",
//     fontSize: 14,
//     outline: "none",
//     transition: "border-color 0.2s, background 0.2s",
//     boxSizing: "border-box" as const,
//   },
//   searchIcon: {
//     position: "absolute" as const,
//     left: 14,
//     top: "50%",
//     transform: "translateY(-50%)",
//     color: "#64748b",
//     pointerEvents: "none" as const,
//   },
//   filterLabel: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     fontSize: 13,
//     color: "#94a3b8",
//     cursor: "pointer",
//     whiteSpace: "nowrap" as const,
//   },
//   checkbox: {
//     width: 16,
//     height: 16,
//     accentColor: "#6366f1",
//   },
//   productsGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//     gap: 20,
//   },
//   productCard: {
//     borderRadius: 20,
//     overflow: "hidden",
//     background: "rgba(15,23,42,0.7)",
//     border: "1px solid rgba(255,255,255,0.07)",
//     backdropFilter: "blur(8px)",
//     transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
//     display: "flex",
//     flexDirection: "column" as const,
//   },
//   productImage: {
//     height: 220,
//     overflow: "hidden",
//     background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
//     position: "relative" as const,
//   },
//   productImageImg: {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover" as const,
//     display: "block",
//   },
//   productBody: {
//     padding: "20px",
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: 14,
//     flex: 1,
//   },
//   badgeRow: {
//     display: "flex",
//     gap: 6,
//     flexWrap: "wrap" as const,
//   },
//   badge: (color: string) => ({
//     padding: "3px 10px",
//     borderRadius: 20,
//     fontSize: 11,
//     fontWeight: 600,
//     letterSpacing: "0.04em",
//     background:
//       color === "slate"
//         ? "rgba(100,116,139,0.2)"
//         : color === "indigo"
//           ? "rgba(99,102,241,0.15)"
//           : color === "rose"
//             ? "rgba(239,68,68,0.15)"
//             : "rgba(100,116,139,0.2)",
//     color:
//       color === "slate"
//         ? "#94a3b8"
//         : color === "indigo"
//           ? "#a5b4fc"
//           : color === "rose"
//             ? "#fca5a5"
//             : "#94a3b8",
//     border: `1px solid ${
//       color === "slate"
//         ? "rgba(100,116,139,0.2)"
//         : color === "indigo"
//           ? "rgba(99,102,241,0.25)"
//           : color === "rose"
//             ? "rgba(239,68,68,0.25)"
//             : "rgba(100,116,139,0.2)"
//     }`,
//   }),
//   productName: {
//     fontSize: 17,
//     fontWeight: 700,
//     color: "#f8fafc",
//     margin: 0,
//     letterSpacing: "-0.01em",
//   },
//   productPrice: {
//     fontSize: 20,
//     fontWeight: 700,
//     color: "#6366f1",
//     margin: "2px 0 0",
//     letterSpacing: "-0.02em",
//   },
//   productDesc: {
//     fontSize: 13.5,
//     color: "#64748b",
//     lineHeight: 1.6,
//     margin: 0,
//   },
//   variantLabel: {
//     fontSize: 12,
//     fontWeight: 600,
//     color: "#94a3b8",
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.08em",
//     display: "block",
//     marginBottom: 6,
//   },
//   variantSelect: {
//     width: "100%",
//     height: 42,
//     padding: "0 12px",
//     borderRadius: 10,
//     border: "1px solid rgba(255,255,255,0.1)",
//     background: "rgba(15,23,42,0.8)",
//     color: "#f1f5f9",
//     fontSize: 13.5,
//     outline: "none",
//   },
//   inventoryRow: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "10px 14px",
//     borderRadius: 10,
//     background: "rgba(255,255,255,0.03)",
//     border: "1px solid rgba(255,255,255,0.06)",
//   },
//   inventoryLabel: {
//     fontSize: 11,
//     fontWeight: 600,
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.1em",
//     color: "#475569",
//   },
//   inventoryValue: {
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#94a3b8",
//     marginTop: 2,
//   },
//   qtyControls: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//   },
//   qtyBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: "50%",
//     border: "1px solid rgba(255,255,255,0.12)",
//     background: "rgba(255,255,255,0.05)",
//     color: "#94a3b8",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     transition: "background 0.15s, border-color 0.15s",
//   },
//   qtyValue: {
//     minWidth: 28,
//     textAlign: "center" as const,
//     fontSize: 14,
//     fontWeight: 700,
//     color: "#f8fafc",
//   },
//   addToCartBtn: {
//     width: "100%",
//     height: 44,
//     borderRadius: 12,
//     border: "none",
//     background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "opacity 0.2s, transform 0.1s",
//     letterSpacing: "0.01em",
//   },
//   addToCartBtnDisabled: {
//     opacity: 0.4,
//     cursor: "not-allowed",
//     transform: "none",
//   },
//   emptyState: {
//     display: "flex",
//     flexDirection: "column" as const,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "72px 24px",
//     borderRadius: 20,
//     border: "1px dashed rgba(255,255,255,0.1)",
//     background: "rgba(255,255,255,0.02)",
//     textAlign: "center" as const,
//   },
//   emptyTitle: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: 700,
//     color: "#f1f5f9",
//   },
//   emptyDesc: {
//     marginTop: 6,
//     fontSize: 13.5,
//     color: "#475569",
//     maxWidth: 340,
//   },
//   loadingState: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "72px 24px",
//     gap: 10,
//     fontSize: 14,
//     color: "#475569",
//     borderRadius: 20,
//     border: "1px solid rgba(255,255,255,0.05)",
//     background: "rgba(255,255,255,0.02)",
//   },
//   /* Sidebar */
//   sidebar: {
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: 20,
//     position: "sticky" as const,
//     top: 76,
//   },
//   panel: {
//     borderRadius: 20,
//     border: "1px solid rgba(255,255,255,0.07)",
//     background: "rgba(15,23,42,0.75)",
//     backdropFilter: "blur(12px)",
//     padding: 24,
//   },
//   panelTitle: {
//     fontSize: 16,
//     fontWeight: 700,
//     color: "#f8fafc",
//     margin: 0,
//     letterSpacing: "-0.01em",
//   },
//   panelSub: {
//     fontSize: 13,
//     color: "#475569",
//     marginTop: 4,
//   },
//   cartEmpty: {
//     marginTop: 16,
//     padding: "20px 16px",
//     borderRadius: 12,
//     border: "1px dashed rgba(255,255,255,0.08)",
//     fontSize: 13,
//     color: "#475569",
//     textAlign: "center" as const,
//     lineHeight: 1.6,
//   },
//   cartItem: {
//     padding: "14px",
//     borderRadius: 14,
//     background: "rgba(255,255,255,0.03)",
//     border: "1px solid rgba(255,255,255,0.06)",
//     marginTop: 10,
//   },
//   cartItemHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     gap: 8,
//   },
//   cartItemName: {
//     fontSize: 13.5,
//     fontWeight: 600,
//     color: "#f1f5f9",
//     margin: 0,
//   },
//   cartItemVariant: {
//     fontSize: 12,
//     color: "#475569",
//     marginTop: 2,
//   },
//   cartRemoveBtn: {
//     background: "none",
//     border: "none",
//     color: "#ef4444",
//     cursor: "pointer",
//     padding: "2px",
//     display: "flex",
//     alignItems: "center",
//     opacity: 0.7,
//     transition: "opacity 0.15s",
//     flexShrink: 0,
//   },
//   cartItemFooter: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   cartItemPrice: {
//     fontSize: 14,
//     fontWeight: 700,
//     color: "#a5b4fc",
//   },
//   divider: {
//     height: 1,
//     background: "rgba(255,255,255,0.06)",
//     margin: "16px 0",
//   },
//   summaryRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     fontSize: 13,
//     color: "#64748b",
//     marginBottom: 8,
//   },
//   summaryTotal: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 12,
//     borderTop: "1px solid rgba(255,255,255,0.08)",
//     marginTop: 4,
//   },
//   summaryTotalLabel: {
//     fontSize: 15,
//     fontWeight: 700,
//     color: "#f8fafc",
//   },
//   summaryTotalValue: {
//     fontSize: 18,
//     fontWeight: 700,
//     color: "#6366f1",
//   },
//   /* Form */
//   formGroup: {
//     marginTop: 16,
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: 12,
//   },
//   fieldLabel: {
//     fontSize: 12,
//     fontWeight: 600,
//     color: "#94a3b8",
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.08em",
//     display: "block",
//     marginBottom: 6,
//   },
//   fieldInput: {
//     width: "100%",
//     height: 42,
//     padding: "0 14px",
//     borderRadius: 10,
//     border: "1px solid rgba(255,255,255,0.1)",
//     background: "rgba(255,255,255,0.04)",
//     color: "#f1f5f9",
//     fontSize: 13.5,
//     outline: "none",
//     transition: "border-color 0.2s",
//     boxSizing: "border-box" as const,
//   },
//   fieldTextarea: {
//     width: "100%",
//     padding: "12px 14px",
//     borderRadius: 10,
//     border: "1px solid rgba(255,255,255,0.1)",
//     background: "rgba(255,255,255,0.04)",
//     color: "#f1f5f9",
//     fontSize: 13.5,
//     outline: "none",
//     resize: "vertical" as const,
//     minHeight: 80,
//     boxSizing: "border-box" as const,
//     transition: "border-color 0.2s",
//     fontFamily: "inherit",
//   },
//   twoCol: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 10,
//   },
//   checkoutBtn: {
//     width: "100%",
//     height: 48,
//     borderRadius: 12,
//     border: "none",
//     background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: 700,
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     transition: "opacity 0.2s",
//     letterSpacing: "0.01em",
//     marginTop: 4,
//   },
//   orderStatusPanel: (tone: ReturnType<typeof statusTone>) => ({
//     borderRadius: 20,
//     border: `1px solid ${tone.border}`,
//     background: tone.bg,
//     padding: "20px 24px",
//     marginBottom: 28,
//   }),
//   orderStatusLabel: {
//     fontSize: 11,
//     fontWeight: 700,
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.14em",
//     color: "#94a3b8",
//   },
//   orderStatusTitle: {
//     fontSize: 16,
//     fontWeight: 700,
//     color: "#f8fafc",
//     margin: "4px 0 6px",
//   },
//   orderStatusMsg: {
//     fontSize: 13.5,
//     color: "#94a3b8",
//     lineHeight: 1.55,
//   },
//   orderBadgesRow: {
//     display: "flex",
//     gap: 8,
//     flexWrap: "wrap" as const,
//     marginTop: 14,
//   },
// };

export function MerchPublic() {
  const { currentEvent } = useEvent();
  const { user } = useAuth();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const [searchParams] = useSearchParams();
  const slug = eventSlug || currentEvent?.slug || currentEvent?.id || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [catalogTitle, setCatalogTitle] = useState("Event merchandise");
  const [catalogSummary, setCatalogSummary] = useState("");
  const [currency, setCurrency] = useState(currentEvent?.currency || "NGN");
  const [search, setSearch] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [draftQuantities, setDraftQuantities] = useState<
    Record<string, number>
  >({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [lookupEmail, setLookupEmail] = useState(user?.email || "");
  const [checkout, setCheckout] = useState<CheckoutForm>({
    email: user?.email || "",
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    country: "NG",
    note: "",
  });

  const eventPageUrl = `/e/${slug}`;

  useEffect(() => {
    if (user?.email) {
      setCheckout((prev) => ({ ...prev, email: prev.email || user.email }));
      setLookupEmail((prev) => prev || user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setIsLoading(true);
    getPublicProducts(slug)
      .then((response) => {
        if (!active) return;
        setProducts(response.products ?? []);
        setCatalogTitle(
          response.event?.title
            ? `${response.event.title} merch`
            : "Event merchandise",
        );
        setCatalogSummary(
          response.event?.summary ?? currentEvent?.description ?? "",
        );
        setCurrency(
          response.event?.currency || currentEvent?.currency || "NGN",
        );
      })
      .catch((error: Error) => {
        if (!active) return;
        toast.error(error.message || "Failed to load merchandise.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, currentEvent?.currency, currentEvent?.description]);

  useEffect(() => {
    if (!slug) return;
    const orderIdFromQuery = searchParams.get("orderId");
    const emailFromQuery = searchParams.get("email");
    const saved = localStorage.getItem(getStorageKey(slug));
    if (orderIdFromQuery && emailFromQuery) {
      setLookupOrderId(orderIdFromQuery);
      setLookupEmail(emailFromQuery);
      void handleLookup(orderIdFromQuery, emailFromQuery, true);
      return;
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          orderId?: string;
          email?: string;
        };
        if (parsed.orderId && parsed.email) {
          setLookupOrderId(parsed.orderId);
          setLookupEmail(parsed.email);
        }
      } catch {
        localStorage.removeItem(getStorageKey(slug));
      }
    }
  }, [searchParams, slug]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        [product.name, product.description ?? "", getCategory(product)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      if (!matchesSearch) return false;
      if (!showInStockOnly) return true;
      if (!product.inventoryTracked) return true;
      if (product.variants.length > 0)
        return product.variants.some((v) => (v.inventoryCount ?? 0) > 0);
      return (product.inventoryCount ?? 0) > 0;
    });
  }, [products, search, showInStockOnly]);

  const totals = useMemo(() => {
    const subtotalMinor = cart.reduce(
      (sum, line) =>
        sum + getUnitPriceMinor(line.product, line.variant) * line.quantity,
      0,
    );
    return {
      itemCount: cart.reduce((sum, line) => sum + line.quantity, 0),
      subtotalMinor,
    };
  }, [cart]);

  function persistOrderReference(orderId: string, email: string) {
    if (!slug) return;
    localStorage.setItem(
      getStorageKey(slug),
      JSON.stringify({ orderId, email }),
    );
  }

  async function handleLookup(
    orderId = lookupOrderId,
    email = lookupEmail,
    silent = false,
  ) {
    if (!orderId.trim() || !email.trim()) {
      if (!silent)
        toast.error("Enter both your order ID and email to find your order.");
      return;
    }
    try {
      setIsLookingUp(true);
      const order = await getPublicOrder(orderId.trim(), email.trim());
      setCurrentOrder(order);
      setCheckout((prev) => ({ ...prev, email: email.trim() }));
      persistOrderReference(order.id, email.trim());
      if (!silent) toast.success("Order loaded.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not find that order.";
      toast.error(message);
    } finally {
      setIsLookingUp(false);
    }
  }

  function updateDraftQuantity(productId: string, next: number) {
    setDraftQuantities((prev) => ({ ...prev, [productId]: Math.max(1, next) }));
  }

  function addToCart(product: Product) {
    const variant = getSelectedVariant(product, selectedVariants[product.id]);
    const quantity = Math.max(1, draftQuantities[product.id] ?? 1);
    if (product.variants.length > 0 && !variant) {
      toast.error(`Choose a version for ${product.name} before adding it.`);
      return;
    }
    if (isProductOutOfStock(product, variant)) {
      toast.error(`${product.name} is currently out of stock.`);
      return;
    }
    const availableInventory = getAvailableInventory(product, variant);
    const key = `${product.id}:${variant?.id ?? "base"}`;
    setCart((prev) => {
      const existing = prev.find((line) => line.key === key);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      if (availableInventory !== null && nextQuantity > availableInventory) {
        toast.error(
          `Only ${availableInventory} unit(s) are available for this selection.`,
        );
        return prev;
      }
      if (existing)
        return prev.map((line) =>
          line.key === key ? { ...line, quantity: nextQuantity } : line,
        );
      return [...prev, { key, product, variant, quantity }];
    });
  }

  function updateCartQuantity(key: string, quantity: number) {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.key !== key) return line;
          const avail = getAvailableInventory(line.product, line.variant);
          const clamped =
            avail === null
              ? Math.max(1, quantity)
              : Math.min(Math.max(1, quantity), avail);
          return { ...line, quantity: clamped };
        })
        .filter((line) => line.quantity > 0),
    );
  }

  function removeFromCart(key: string) {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentEvent?.id) {
      toast.error("Event details are still loading.");
      return;
    }
    if (!checkout.email.trim()) {
      toast.error("Enter an email address before checkout.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Add at least one product before checkout.");
      return;
    }

    const payload: CreateOrderRequest = {
      email: checkout.email.trim(),
      items: cart.map((line) => ({
        productId: line.product.id,
        productVariantId: line.variant?.id,
        quantity: line.quantity,
      })),
    };
    if (
      checkout.fullName ||
      checkout.phone ||
      checkout.line1 ||
      checkout.city ||
      checkout.country
    ) {
      payload.shippingAddressJson = {
        fullName: checkout.fullName || undefined,
        phone: checkout.phone || undefined,
        line1: checkout.line1 || undefined,
        city: checkout.city || undefined,
        country: checkout.country || undefined,
      };
    }
    if (checkout.note.trim())
      payload.metadataJson = { note: checkout.note.trim() };

    try {
      setIsSubmitting(true);
      const order = await createPublicOrder(currentEvent.id, payload);
      setCurrentOrder(order);
      persistOrderReference(order.id, checkout.email.trim());
      if (order.totalMinor === 0) {
        toast.success("Your order is confirmed.");
        setCart([]);
        return;
      }
      const callbackUrl = `${window.location.origin}/e/${slug}/merch?orderId=${encodeURIComponent(order.id)}&email=${encodeURIComponent(checkout.email.trim())}`;
      const payment = await initializeMerchPayment(order.id, {
        email: checkout.email.trim(),
        callbackUrl,
      });
      toast.success("Redirecting you to secure payment.");
      window.location.assign(payment.checkoutUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const orderMessage = useMemo(() => {
    if (!currentOrder) return "";
    if (currentOrder.status === "PAID" || currentOrder.status === "FULFILLED")
      return "Payment confirmed — we will keep you updated on fulfillment.";
    if (currentOrder.status === "FAILED")
      return "Order was created but payment was not confirmed.";
    return "Order created. Payment confirmation may take a moment to reflect.";
  }, [currentOrder]);

  if (!currentEvent) return null;

  const orderTone = statusTone(currentOrder);

  const inputFocusStyle = `
    .merch-input:focus { border-color: rgba(99,102,241,0.6) !important; background: rgba(99,102,241,0.06) !important; }
    .merch-card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.2) !important; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
    .merch-qty-btn:hover { background: rgba(99,102,241,0.15) !important; border-color: rgba(99,102,241,0.3) !important; }
    .merch-add-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    .merch-checkout-btn:hover:not(:disabled) { opacity: 0.88; }
    .merch-remove-btn:hover { opacity: 1 !important; }
    .merch-back:hover { color: #f1f5f9 !important; }
    @media (max-width: 900px) {
      .merch-layout { grid-template-columns: 1fr !important; }
      .merch-sidebar { position: static !important; top: auto !important; }
      .merch-hero { padding: 32px 28px !important; }
      .merch-hero-title { font-size: 26px !important; }
    }
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  `;

  return (
    <div style={styles.root}>
      <style>{inputFocusStyle}</style>

      {/* Topbar */}
      <div style={styles.topbar}>
        <div style={styles.topbarInner}>
          <Link
            to={eventPageUrl}
            style={styles.backLink}
            className="merch-back"
          >
            <ArrowLeft size={15} />
            Back to event
          </Link>
          <div style={styles.storeBadge}>
            <ShoppingBag size={12} />
            Merch Store
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Hero */}
        <div style={styles.hero} className="merch-hero">
          <div style={styles.heroGlow} />
          <div
            style={{
              display: "flex",
              gap: 48,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#a5b4fc",
                  marginBottom: 14,
                }}
              >
                <Tag size={11} /> Official Store
              </div>
              <h1 style={styles.heroTitle} className="merch-hero-title">
                {catalogTitle}
              </h1>
              <p style={styles.heroSub}>
                {catalogSummary ||
                  "Browse event merchandise, choose your preferred option, and complete checkout here."}
              </p>
            </div>

            <div style={styles.howItWorks}>
              <CheckCircle2
                size={18}
                color="#34d399"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#a7f3d0",
                    marginBottom: 6,
                  }}
                >
                  How checkout works
                </p>
                <p style={styles.howItWorksText}>
                  Add items to your cart, fill in your details, and proceed to
                  secure payment. Stock is confirmed only after payment
                  succeeds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order status */}
        {currentOrder && (
          <div style={styles.orderStatusPanel(orderTone)}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <p style={styles.orderStatusLabel}>Latest order</p>
                <h2 style={styles.orderStatusTitle}>
                  Order {currentOrder.orderNumber || currentOrder.id}
                </h2>
                <p style={styles.orderStatusMsg}>{orderMessage}</p>
              </div>
              <div style={styles.orderBadgesRow}>
                {[
                  `Status: ${currentOrder.status}`,
                  `Fulfillment: ${currentOrder.fulfillmentStatus}`,
                  `Total: ${formatMoney(currentOrder.totalMinor, currentOrder.currency || currency)}`,
                ].map((label) => (
                  <span
                    key={label}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: orderTone.badge,
                      color: orderTone.accent,
                      border: `1px solid ${orderTone.border}`,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main layout */}
        <div style={styles.layout} className="merch-layout">
          {/* Catalog */}
          <section>
            <div style={styles.catalogHeader}>
              <div style={styles.searchWrap}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search merchandise…"
                  style={styles.searchInput}
                  className="merch-input"
                />
              </div>
              <label style={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  style={styles.checkbox}
                />
                In-stock only
              </label>
            </div>

            {isLoading ? (
              <div style={styles.loadingState}>
                <Loader2 size={18} className="animate-spin" />
                Loading merchandise…
              </div>
            ) : visibleProducts.length === 0 ? (
              <div style={styles.emptyState}>
                <Package size={44} color="#1e293b" />
                <p style={styles.emptyTitle}>No products found</p>
                <p style={styles.emptyDesc}>
                  Try a different search, or check back once live merchandise
                  has been added to this event.
                </p>
              </div>
            ) : (
              <div style={styles.productsGrid}>
                {visibleProducts.map((product) => {
                  const selectedVariant = getSelectedVariant(
                    product,
                    selectedVariants[product.id],
                  );
                  const draftQuantity = draftQuantities[product.id] ?? 1;
                  const availableInventory = getAvailableInventory(
                    product,
                    selectedVariant,
                  );
                  const displayPrice = getUnitPriceMinor(
                    product,
                    selectedVariant,
                  );
                  const category = getCategory(product);
                  const requiresVariant = product.variants.length > 0;
                  const soldOut = requiresVariant
                    ? !selectedVariant
                      ? product.variants.every(
                          (v) => (v.inventoryCount ?? 0) <= 0,
                        )
                      : isProductOutOfStock(product, selectedVariant)
                    : isProductOutOfStock(product, null);

                  return (
                    <article
                      key={product.id}
                      style={styles.productCard}
                      className="merch-card"
                    >
                      <div style={styles.productImage}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={styles.productImageImg}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                            }}
                          >
                            <Package size={36} color="#1e293b" />
                          </div>
                        )}
                        {soldOut && (
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(239,68,68,0.85)",
                              color: "#fff",
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            Sold out
                          </div>
                        )}
                      </div>

                      <div style={styles.productBody}>
                        <div style={styles.badgeRow}>
                          {category && (
                            <span style={styles.badge("slate")}>
                              {category}
                            </span>
                          )}
                          <span style={styles.badge("indigo")}>
                            {product.productType === "DIGITAL"
                              ? "Digital"
                              : "Physical"}
                          </span>
                        </div>

                        <div>
                          <h2 style={styles.productName}>{product.name}</h2>
                          <p style={styles.productPrice}>
                            {formatMoney(
                              displayPrice,
                              product.currency || currency,
                            )}
                          </p>
                        </div>

                        <p style={styles.productDesc}>
                          {product.description || "No description available."}
                        </p>

                        {requiresVariant && (
                          <div>
                            <span style={styles.variantLabel}>
                              Choose an option
                            </span>
                            <select
                              value={selectedVariants[product.id] ?? ""}
                              onChange={(e) =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [product.id]: e.target.value,
                                }))
                              }
                              style={styles.variantSelect}
                              className="merch-input"
                            >
                              <option value="">Select an option</option>
                              {product.variants.map((variant) => {
                                const variantOOS =
                                  variant.inventoryCount !== null &&
                                  variant.inventoryCount <= 0;
                                return (
                                  <option
                                    key={variant.id}
                                    value={variant.id}
                                    disabled={variantOOS}
                                  >
                                    {variant.name}
                                    {variantOOS ? " — Out of stock" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}

                        <div style={styles.inventoryRow}>
                          <div>
                            <p style={styles.inventoryLabel}>Available</p>
                            <p style={styles.inventoryValue}>
                              {availableInventory === null
                                ? "∞ In stock"
                                : `${availableInventory} left`}
                            </p>
                          </div>
                          <div style={styles.qtyControls}>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraftQuantity(
                                  product.id,
                                  draftQuantity - 1,
                                )
                              }
                              style={styles.qtyBtn}
                              className="merch-qty-btn"
                            >
                              <Minus size={13} />
                            </button>
                            <span style={styles.qtyValue}>{draftQuantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraftQuantity(
                                  product.id,
                                  draftQuantity + 1,
                                )
                              }
                              style={styles.qtyBtn}
                              className="merch-qty-btn"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={soldOut}
                          style={{
                            ...styles.addToCartBtn,
                            ...(soldOut ? styles.addToCartBtnDisabled : {}),
                          }}
                          className="merch-add-btn"
                        >
                          {soldOut ? "Out of stock" : "Add to cart"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside style={styles.sidebar} className="merch-sidebar">
            {/* Cart */}
            <div style={styles.panel}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShoppingCart size={18} color="#6366f1" />
                  <h2 style={styles.panelTitle}>Your cart</h2>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background:
                      totals.itemCount > 0
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.05)",
                    color: totals.itemCount > 0 ? "#a5b4fc" : "#475569",
                  }}
                >
                  {totals.itemCount} item{totals.itemCount !== 1 ? "s" : ""}
                </span>
              </div>

              {cart.length === 0 ? (
                <div style={styles.cartEmpty}>
                  <ShoppingBag
                    size={24}
                    color="#1e293b"
                    style={{ margin: "0 auto 8px" }}
                  />
                  <p style={{ margin: 0 }}>
                    Your cart is empty.
                    <br />
                    Add products from the catalog.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    {cart.map((line) => (
                      <div key={line.key} style={styles.cartItem}>
                        <div style={styles.cartItemHeader}>
                          <div style={{ minWidth: 0 }}>
                            <p style={styles.cartItemName}>
                              {line.product.name}
                            </p>
                            <p style={styles.cartItemVariant}>
                              {line.variant?.name || "Standard"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(line.key)}
                            style={styles.cartRemoveBtn}
                            className="merch-remove-btn"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={styles.cartItemFooter}>
                          <div style={styles.qtyControls}>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(line.key, line.quantity - 1)
                              }
                              style={styles.qtyBtn}
                              className="merch-qty-btn"
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ ...styles.qtyValue, fontSize: 13 }}>
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(line.key, line.quantity + 1)
                              }
                              style={styles.qtyBtn}
                              className="merch-qty-btn"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <p style={styles.cartItemPrice}>
                            {formatMoney(
                              getUnitPriceMinor(line.product, line.variant) *
                                line.quantity,
                              line.product.currency || currency,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    {[
                      ["Subtotal", formatMoney(totals.subtotalMinor, currency)],
                      ["Fees", formatMoney(0, currency)],
                      ["Shipping", formatMoney(0, currency)],
                    ].map(([label, val]) => (
                      <div key={label} style={styles.summaryRow}>
                        <span>{label}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                    <div style={styles.summaryTotal}>
                      <span style={styles.summaryTotalLabel}>Total</span>
                      <span style={styles.summaryTotalValue}>
                        {formatMoney(totals.subtotalMinor, currency)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout form */}
            <div style={styles.panel}>
              <h2 style={styles.panelTitle}>Checkout</h2>
              <p style={styles.panelSub}>
                We'll use your email to reopen your order after payment.
              </p>

              <form onSubmit={handleCheckoutSubmit} style={styles.formGroup}>
                <div>
                  <span style={styles.fieldLabel}>Email *</span>
                  <input
                    type="email"
                    value={checkout.email}
                    onChange={(e) =>
                      setCheckout((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    style={styles.fieldInput}
                    className="merch-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div style={styles.twoCol}>
                  <div>
                    <span style={styles.fieldLabel}>Full name</span>
                    <input
                      value={checkout.fullName}
                      onChange={(e) =>
                        setCheckout((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      style={styles.fieldInput}
                      className="merch-input"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <span style={styles.fieldLabel}>Phone</span>
                    <input
                      value={checkout.phone}
                      onChange={(e) =>
                        setCheckout((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      style={styles.fieldInput}
                      className="merch-input"
                      placeholder="+234…"
                    />
                  </div>
                </div>

                <div>
                  <span style={styles.fieldLabel}>Address / pickup note</span>
                  <input
                    value={checkout.line1}
                    onChange={(e) =>
                      setCheckout((prev) => ({
                        ...prev,
                        line1: e.target.value,
                      }))
                    }
                    style={styles.fieldInput}
                    className="merch-input"
                    placeholder="10 Example Street"
                  />
                </div>

                <div style={styles.twoCol}>
                  <div>
                    <span style={styles.fieldLabel}>City</span>
                    <input
                      value={checkout.city}
                      onChange={(e) =>
                        setCheckout((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      style={styles.fieldInput}
                      className="merch-input"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <span style={styles.fieldLabel}>Country</span>
                    <input
                      value={checkout.country}
                      onChange={(e) =>
                        setCheckout((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      style={styles.fieldInput}
                      className="merch-input"
                      placeholder="NG"
                    />
                  </div>
                </div>

                <div>
                  <span style={styles.fieldLabel}>Order note</span>
                  <textarea
                    value={checkout.note}
                    onChange={(e) =>
                      setCheckout((prev) => ({ ...prev, note: e.target.value }))
                    }
                    style={styles.fieldTextarea}
                    className="merch-input"
                    placeholder="Add any helpful delivery or pickup note."
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  style={{
                    ...styles.checkoutBtn,
                    opacity: isSubmitting || cart.length === 0 ? 0.45 : 1,
                    cursor:
                      isSubmitting || cart.length === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                  className="merch-checkout-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing…
                    </>
                  ) : totals.subtotalMinor > 0 ? (
                    `Continue to payment · ${formatMoney(totals.subtotalMinor, currency)}`
                  ) : (
                    "Place order"
                  )}
                </button>
              </form>
            </div>

            {/* Find order */}
            <div style={styles.panel}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <AlertCircle size={16} color="#f59e0b" />
                <h2 style={styles.panelTitle}>Find an order</h2>
              </div>
              <p style={styles.panelSub}>
                Use your order ID and the email you checked out with.
              </p>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <input
                  value={lookupOrderId}
                  onChange={(e) => setLookupOrderId(e.target.value)}
                  style={styles.fieldInput}
                  className="merch-input"
                  placeholder="Order ID"
                />
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  style={styles.fieldInput}
                  className="merch-input"
                  placeholder="Email used at checkout"
                />
                <button
                  type="button"
                  onClick={() => void handleLookup()}
                  disabled={isLookingUp}
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#94a3b8",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: isLookingUp ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: isLookingUp ? 0.5 : 1,
                    transition: "background 0.15s",
                  }}
                >
                  {isLookingUp ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Finding…
                    </>
                  ) : (
                    "Open order"
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
