// Merchandise Types
export type ProductType = 'physical' | 'digital';
export type ProductStatus = 'draft' | 'active' | 'sold-out' | 'archived';
export type FulfilmentType = 'pickup' | 'shipping' | 'digital';
export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'partially-refunded' | 'refunded' | 'failed';

// Product Variant
export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Small / Red"
  attributes: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  sku?: string;
  price?: number; // Override product price if set
  stock: number;
  imageUrl?: string;
}

// Product Image
export interface ProductImage {
  id: string;
  url: string;
  isFeatured: boolean;
  order: number;
}

// Digital File
export interface DigitalFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// Product
export interface Product {
  id: string;
  eventId: string;
  type: ProductType;
  name: string;
  description: string;
  images: ProductImage[];
  price: number;
  currency: string;
  sku?: string;
  category?: string;
  tags: string[];
  status: ProductStatus;
  
  // Inventory
  hasVariants: boolean;
  variants: ProductVariant[];
  unlimitedInventory: boolean;
  totalStock: number;
  
  // Purchase Rules
  minQuantity: number;
  maxQuantity: number;
  maxPerUser?: number;
  ticketHoldersOnly: boolean;
  requiresAccessCode: boolean;
  accessCode?: string;
  
  // Fulfilment
  fulfilmentTypes: FulfilmentType[];
  
  // Digital Product Settings
  digitalDeliveryMethod?: 'download' | 'email' | 'dashboard';
  digitalFile?: DigitalFile;
  downloadLimit?: number;
  expiryDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Fulfilment Configuration
export interface FulfilmentConfig {
  id: string;
  eventId: string;
  
  // Pickup Config
  pickupEnabled: boolean;
  pickupLocations: {
    id: string;
    name: string;
    address: string;
    instructions?: string;
  }[];
  pickupTimeWindows: {
    start: string;
    end: string;
  }[];
  
  // Shipping Config
  shippingEnabled: boolean;
  shippingRegions: {
    id: string;
    name: string;
    countries: string[];
    cost: number;
    estimatedDays: number;
  }[];
  
  // Digital Config
  digitalEnabled: boolean;
}

// Shipping Address
export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  eventId: string;
  
  // Customer
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  
  // Fulfilment
  fulfilmentType: FulfilmentType;
  fulfilmentStatus: 'pending' | 'ready' | 'completed';
  shippingAddress?: ShippingAddress;
  pickupLocation?: string;
  pickupCode?: string;
  trackingNumber?: string;
  
  // Identity Verification (for pickup)
  verifiedBy?: string;
  verifiedAt?: string;
  verificationMethod?: 'ticket' | 'id' | 'email' | 'qr';
  verificationNotes?: string;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  
  // Status
  status: OrderStatus;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
}

// Inventory Adjustment
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

// Discount
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
  applicableProducts: string[]; // Empty = all products
  active: boolean;
}

// Bundle
export interface Bundle {
  id: string;
  eventId: string;
  name: string;
  description: string;
  imageUrl?: string;
  products: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  active: boolean;
}

// Analytics
export interface MerchandiseAnalytics {
  totalRevenue: number;
  ordersCount: number;
  itemsSold: number;
  averageOrderValue: number;
  conversionRate: number;
  
  // Top products
  topProducts: {
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }[];
  
  // Revenue over time
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  
  // Fulfilment breakdown
  fulfilmentBreakdown: {
    type: FulfilmentType;
    count: number;
    percentage: number;
  }[];
  
  // Inventory alerts
  lowStockProducts: {
    productId: string;
    productName: string;
    currentStock: number;
    alertThreshold: number;
  }[];
}

// API Request Types
export interface CreateProductRequest {
  type: ProductType;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency?: string;
  sku?: string;
  category?: string;
  tags?: string[];
  hasVariants?: boolean;
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
  unlimitedInventory?: boolean;
  totalStock?: number;
  minQuantity?: number;
  maxQuantity?: number;
  maxPerUser?: number;
  ticketHoldersOnly?: boolean;
  requiresAccessCode?: boolean;
  accessCode?: string;
  fulfilmentTypes: FulfilmentType[];
  digitalDeliveryMethod?: 'download' | 'email' | 'dashboard';
  downloadUrl?: string;
  downloadLimit?: number;
  expiryDate?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}

export interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  fulfilmentType: FulfilmentType;
  shippingAddress?: ShippingAddress;
  pickupLocation?: string;
  customerNotes?: string;
  discountCode?: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  fulfilmentStatus?: 'pending' | 'ready' | 'completed';
  trackingNumber?: string;
  internalNotes?: string;
}

// Merchandise Settings
export interface MerchandiseSettings {
  id: string;
  eventId: string;
  
  // Low Stock Alerts
  lowStockAlertEnabled: boolean;
  lowStockThreshold: number;
  lowStockEmailNotify: boolean;
  
  // Pickup Settings
  pickupEnabled: boolean;
  pickupInstructions?: string;
  requireIdentityVerification: boolean;
  
  // Digital Settings
  digitalEnabled: boolean;
  autoDeliverDigital: boolean;
  
  // Order Settings
  orderConfirmationEmail: boolean;
  fulfilmentNotificationEmail: boolean;
  
  updatedAt: string;
}

// Variant Option (for building variants)
export interface VariantOption {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["S", "M", "L", "XL"]
}
