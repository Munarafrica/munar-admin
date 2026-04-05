export type ProductType = 'PHYSICAL' | 'DIGITAL';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type OrderStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'FULFILLED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProductImage {
  id: string;
  url: string;
  isFeatured: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  priceMinor: number;
  inventoryCount: number | null;
  attributesJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  attributes?: Record<string, string | undefined>;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  eventId: string;
  name: string;
  productType: ProductType;
  description: string | null;
  status: ProductStatus;
  basePriceMinor: number;
  currency: string;
  inventoryTracked: boolean;
  inventoryCount: number | null;
  imageUrl: string | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  event?: {
    id: string;
    title: string;
    slug: string;
  };
  type?: 'physical' | 'digital';
  images?: ProductImage[];
  price?: number;
  hasVariants?: boolean;
  unlimitedInventory?: boolean;
  totalStock?: number;
  sku?: string;
  category?: string;
  tags?: string[];
  createdBy?: string;
}

export interface MerchOrderItem {
  id: string;
  merchOrderId: string;
  productId: string;
  productVariantId: string | null;
  quantity: number;
  unitPriceMinor: number;
  totalPriceMinor: number;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  product: Product;
  productVariant: ProductVariant | null;
}

export interface MerchOrder {
  id: string;
  tenantId: string;
  eventId: string;
  buyerUserId: string | null;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotalMinor: number;
  feeMinor: number;
  shippingMinor: number;
  totalMinor: number;
  shippingAddressJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  event?: Record<string, unknown>;
  items: MerchOrderItem[];
  orderNumber?: string;
  displayEmail?: string | null;
}

export type Order = MerchOrder;
export type OrderItem = MerchOrderItem;

export interface MerchandiseAnalytics {
  totalRevenueMinor: number;
  ordersCount: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  itemsSold: number;
  averageOrderValueMinor: number;
  topProducts: {
    productId: string;
    productName: string;
    unitsSold: number;
    revenueMinor: number;
  }[];
  revenueByDay: {
    date: string;
    revenueMinor: number;
    orders: number;
  }[];
  fulfillmentBreakdown: {
    status: FulfillmentStatus;
    count: number;
  }[];
  lowStockProducts: {
    productId: string;
    productName: string;
    currentStock: number;
  }[];
}

export interface MerchandiseSettings {
  enabled: boolean;
  merchandisingJson: Record<string, unknown>;
  updatedAt?: string;
}

export interface MerchandiseCapabilityFlags {
  publicStorefrontAvailable: boolean;
  paymentInitializationAvailable: boolean;
  guestCheckoutAvailable: boolean;
  orderEmailReadableAfterCreate: boolean;
  orderMetadataPersisted: boolean;
}

export interface CreateProductRequest {
  name: string;
  productType: ProductType;
  description?: string;
  basePriceMinor: number;
  inventoryTracked?: boolean;
  inventoryCount?: number;
  imageUrl?: string;
  metadataJson?: Record<string, unknown>;
}

export interface UpdateProductRequest {
  name?: string;
  productType?: ProductType;
  description?: string;
  basePriceMinor?: number;
  inventoryTracked?: boolean;
  inventoryCount?: number;
  imageUrl?: string;
  status?: ProductStatus;
  metadataJson?: Record<string, unknown>;
}

export interface CreateProductVariantRequest {
  sku?: string;
  name: string;
  priceMinor: number;
  inventoryCount?: number;
  attributesJson?: Record<string, unknown>;
}

export interface UpdateProductVariantRequest {
  sku?: string;
  name?: string;
  priceMinor?: number;
  inventoryCount?: number;
  attributesJson?: Record<string, unknown>;
}

export interface CreateOrderRequest {
  email: string;
  items: Array<{
    productId: string;
    productVariantId?: string;
    quantity: number;
  }>;
  shippingAddressJson?: Record<string, unknown>;
  metadataJson?: Record<string, unknown>;
}

export interface UpdateOrderRequest {
  fulfillmentStatus: FulfillmentStatus;
}

export interface VariantOption {
  name: string;
  values: string[];
}

export interface FulfilmentConfig {
  id: string;
  eventId: string;
  pickupEnabled: boolean;
  pickupLocations: Array<{
    id: string;
    name: string;
    address: string;
    instructions?: string;
  }>;
  pickupTimeWindows: Array<{
    start: string;
    end: string;
  }>;
  shippingEnabled: boolean;
  shippingRegions: Array<{
    id: string;
    name: string;
    countries: string[];
    cost: number;
    estimatedDays: number;
  }>;
  digitalEnabled: boolean;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  variantId?: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  eventId: string;
  code: string;
  type: 'percentage' | 'fixed' | 'buy-x-get-y';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicableProducts: string[];
  active: boolean;
}

export interface Bundle {
  id: string;
  eventId: string;
  name: string;
  description: string;
  imageUrl?: string;
  products: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  active: boolean;
}
