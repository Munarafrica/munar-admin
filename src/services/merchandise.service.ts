import { config } from '../config';
import { apiClient } from '../lib/api-client';
import type { PaginatedResponse, SearchParams } from '../types/api';
import type {
  Bundle,
  CreateOrderRequest,
  CreateProductRequest,
  Discount,
  FulfilmentConfig,
  FulfillmentStatus,
  InventoryAdjustment,
  MerchandiseAnalytics,
  MerchandiseCapabilityFlags,
  MerchandiseSettings,
  Order,
  PublicProductsResponse,
  Product,
  ProductStatus,
  ProductType,
  UpdateOrderRequest,
  UpdateProductRequest,
  CreateProductVariantRequest,
  InitializeMerchPaymentRequest,
  InitializeMerchPaymentResponse,
} from '../types/merchandise';
import {
  delay,
  generateId,
  mockBundles,
  mockDiscounts,
  mockFulfilmentConfig,
  mockOrders as legacyMockOrders,
  mockProducts as legacyMockProducts,
} from './mock/data';

type EventSettingsResponse = {
  id: string;
  eventId: string;
  modulesEnabledJson: Record<string, unknown> | null;
  merchandisingJson: Record<string, unknown> | null;
  updatedAt: string;
};

type MerchImagePresignResponse = {
  assetId: string;
  uploadUrl: string;
  fileUrl: string;
  headers: Record<string, string>;
  mimeType: string;
  size: number;
  maxFileSizeBytes: number;
};

type MerchImageCompleteResponse = {
  url: string;
  mimeType: string;
  size: number;
};

type LegacyProduct = (typeof legacyMockProducts)[number];
type LegacyOrder = (typeof legacyMockOrders)[number];

const mockProductsStore = new Map<string, Product[]>();
const mockOrdersStore = new Map<string, Order[]>();
const mockSettingsStore = new Map<string, MerchandiseSettings>();
const mockUploadStore = new Map<string, { fileUrl: string; contentType: string; size: number }>();

const DEFAULT_CAPABILITIES: MerchandiseCapabilityFlags = {
  publicStorefrontAvailable: false,
  paymentInitializationAvailable: false,
  guestCheckoutAvailable: false,
  orderEmailReadableAfterCreate: false,
  orderMetadataPersisted: false,
};

const toMinor = (value: number) => Math.round(value);

const isoNow = () => new Date().toISOString();

const createMeta = <T>(items: T[]): PaginatedResponse<T>['meta'] => ({
  currentPage: 1,
  itemsPerPage: items.length || 20,
  totalItems: items.length,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

function normalizeVariant(variant: LegacyProduct['variants'][number], parent: LegacyProduct): Product['variants'][number] {
  const inventoryCount =
    parent.unlimitedInventory || !parent.hasVariants ? null : variant.stock ?? null;

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku ?? null,
    name: variant.name,
    priceMinor: toMinor(variant.price ?? parent.price ?? 0),
    inventoryCount,
    attributesJson: variant.attributes ?? null,
    createdAt: parent.createdAt,
    updatedAt: parent.updatedAt,
    attributes: variant.attributes,
    price: variant.price,
    stock: variant.stock,
    imageUrl: variant.imageUrl,
  };
}

function normalizeProduct(product: LegacyProduct): Product {
  const variants = product.variants.map((variant) => normalizeVariant(variant, product));
  const imageUrl = product.images?.find((image) => image.isFeatured)?.url ?? product.images?.[0]?.url ?? null;
  const inventoryCount = product.unlimitedInventory ? null : product.totalStock ?? 0;

  return {
    id: product.id,
    eventId: product.eventId,
    name: product.name,
    productType: product.type === 'digital' ? 'DIGITAL' : 'PHYSICAL',
    description: product.description ?? null,
    status:
      product.status === 'active'
        ? 'ACTIVE'
        : product.status === 'archived'
          ? 'ARCHIVED'
          : 'DRAFT',
    basePriceMinor: toMinor(product.price ?? 0),
    currency: product.currency,
    inventoryTracked: !product.unlimitedInventory,
    inventoryCount,
    imageUrl,
    metadataJson: product.category ? { category: product.category } : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variants,
    type: product.type,
    images: product.images,
    price: product.price,
    hasVariants: product.hasVariants,
    unlimitedInventory: product.unlimitedInventory,
    totalStock: product.totalStock,
    sku: product.sku,
    category: product.category,
    tags: product.tags,
    createdBy: product.createdBy,
  };
}

function normalizeBackendProduct(product: Product): Product {
  return {
    ...product,
    description: product.description ?? null,
    imageUrl: product.imageUrl ?? null,
    metadataJson: product.metadataJson ?? null,
    variants: product.variants ?? [],
  };
}

function normalizeBackendOrder(order: Order): Order {
  return {
    ...order,
    buyerEmail: order.buyerEmail ?? order.displayEmail ?? null,
    paymentStatus: order.paymentStatus ?? null,
    paymentReference: order.paymentReference ?? null,
    metadataJson: order.metadataJson ?? null,
    shippingAddressJson: order.shippingAddressJson ?? null,
    items: (order.items ?? []).map((item) => ({
      ...item,
      metadataJson: item.metadataJson ?? null,
      product: normalizeBackendProduct(item.product),
      productVariant: item.productVariant ?? null,
    })),
  };
}

function normalizeOrder(order: LegacyOrder): Order {
  const items = order.items.map((item) => {
    const sourceProduct = legacyMockProducts.find((product) => product.id === item.productId);
    const normalizedProduct = sourceProduct ? normalizeProduct(sourceProduct) : {
      id: item.productId,
      eventId: order.eventId,
      name: item.productName,
      productType: 'PHYSICAL' as ProductType,
      description: null,
      status: 'ACTIVE' as ProductStatus,
      basePriceMinor: item.unitPrice,
      currency: order.currency,
      inventoryTracked: false,
      inventoryCount: null,
      imageUrl: item.productImage ?? null,
      metadataJson: null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      variants: [],
    };

    const productVariant = normalizedProduct.variants.find((variant) => variant.id === item.variantId) ?? null;

    return {
      id: item.id,
      merchOrderId: order.id,
      productId: item.productId,
      productVariantId: item.variantId ?? null,
      quantity: item.quantity,
      unitPriceMinor: item.unitPrice,
      totalPriceMinor: item.totalPrice,
      metadataJson: null,
      createdAt: order.createdAt,
      product: normalizedProduct,
      productVariant,
    };
  });

  const shippingAddressJson = order.shippingAddress
    ? {
        fullName: order.shippingAddress.name,
        phone: order.shippingAddress.phone,
        line1: order.shippingAddress.addressLine1,
        line2: order.shippingAddress.addressLine2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      }
    : null;

  return {
    id: order.id,
    tenantId: 'tenant-mock',
    eventId: order.eventId,
    buyerUserId: order.customerId ?? null,
    status:
      order.status === 'paid'
        ? 'PAID'
        : order.status === 'fulfilled'
          ? 'FULFILLED'
          : order.status === 'cancelled'
            ? 'CANCELLED'
            : order.status === 'refunded'
              ? 'REFUNDED'
              : 'PENDING',
    fulfillmentStatus:
      order.fulfilmentStatus === 'completed'
        ? 'COMPLETED'
        : order.fulfilmentStatus === 'ready'
          ? 'READY'
          : 'UNFULFILLED',
    currency: order.currency,
    subtotalMinor: order.subtotal,
    feeMinor: 0,
    shippingMinor: order.shippingCost,
    totalMinor: order.total,
    shippingAddressJson,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
    orderNumber: order.orderNumber,
    displayEmail: order.customerEmail,
  };
}

function ensureMockProducts(eventId: string): Product[] {
  if (!mockProductsStore.has(eventId)) {
    const seeded = legacyMockProducts
      .filter((product) => product.eventId === eventId)
      .map((product) => normalizeProduct(product));
    mockProductsStore.set(eventId, seeded);
  }
  return mockProductsStore.get(eventId) ?? [];
}

function ensureMockOrders(eventId: string): Order[] {
  if (!mockOrdersStore.has(eventId)) {
    const seeded = legacyMockOrders
      .filter((order) => order.eventId === eventId)
      .map((order) => normalizeOrder(order));
    mockOrdersStore.set(eventId, seeded);
  }
  return mockOrdersStore.get(eventId) ?? [];
}

function ensureMockSettings(eventId: string): MerchandiseSettings {
  if (!mockSettingsStore.has(eventId)) {
    mockSettingsStore.set(eventId, {
      enabled: true,
      merchandisingJson: {
        storeHeadline: 'Official event merchandise',
        shippingPolicyText: 'Delivery costs are not calculated by the current backend.',
        pickupInstructions: 'Collect physical merch at the registration desk during event hours.',
      },
      updatedAt: isoNow(),
    });
  }

  return mockSettingsStore.get(eventId)!;
}

function applyProductFilters(products: Product[], params?: SearchParams): Product[] {
  let filtered = [...products];
  const search = params?.search?.trim().toLowerCase();

  if (search) {
    filtered = filtered.filter((product) => {
      const haystacks = [product.name, product.description ?? ''];
      return haystacks.some((value) => value.toLowerCase().includes(search));
    });
  }

  const type = params?.productType as ProductType | undefined;
  if (type) {
    filtered = filtered.filter((product) => product.productType === type);
  }

  const status = params?.status as ProductStatus | undefined;
  if (status) {
    filtered = filtered.filter((product) => product.status === status);
  }

  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function applyOrderFilters(orders: Order[], params?: SearchParams): Order[] {
  const search = params?.search?.trim().toLowerCase();
  let filtered = [...orders];

  if (search) {
    filtered = filtered.filter((order) => {
      const productText = order.items.map((item) => item.product.name).join(' ');
      return [order.id, order.orderNumber ?? '', order.displayEmail ?? '', productText]
        .some((value) => value.toLowerCase().includes(search));
    });
  }

  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildAnalytics(products: Product[], orders: Order[]): MerchandiseAnalytics {
  const paidStatuses: Order['status'][] = ['PAID', 'FULFILLED', 'REFUNDED'];
  const revenueOrders = orders.filter((order) => paidStatuses.includes(order.status));
  const totalRevenueMinor = revenueOrders.reduce((sum, order) => sum + order.totalMinor, 0);
  const itemsSold = revenueOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const topProductsMap = new Map<string, { productName: string; unitsSold: number; revenueMinor: number }>();
  const revenueByDayMap = new Map<string, { revenueMinor: number; orders: number }>();
  const fulfillmentBreakdownMap = new Map<FulfillmentStatus, number>();

  revenueOrders.forEach((order) => {
    const day = order.createdAt.slice(0, 10);
    const currentDay = revenueByDayMap.get(day) ?? { revenueMinor: 0, orders: 0 };
    currentDay.revenueMinor += order.totalMinor;
    currentDay.orders += 1;
    revenueByDayMap.set(day, currentDay);

    order.items.forEach((item) => {
      const current = topProductsMap.get(item.productId) ?? {
        productName: item.product.name,
        unitsSold: 0,
        revenueMinor: 0,
      };
      current.unitsSold += item.quantity;
      current.revenueMinor += item.totalPriceMinor;
      topProductsMap.set(item.productId, current);
    });
  });

  orders.forEach((order) => {
    fulfillmentBreakdownMap.set(
      order.fulfillmentStatus,
      (fulfillmentBreakdownMap.get(order.fulfillmentStatus) ?? 0) + 1,
    );
  });

  return {
    totalRevenueMinor,
    ordersCount: orders.length,
    paidOrdersCount: orders.filter((order) => order.status === 'PAID' || order.status === 'FULFILLED').length,
    pendingOrdersCount: orders.filter((order) => order.status === 'PENDING').length,
    itemsSold,
    averageOrderValueMinor: revenueOrders.length ? Math.round(totalRevenueMinor / revenueOrders.length) : 0,
    topProducts: [...topProductsMap.entries()]
      .map(([productId, value]) => ({ productId, ...value }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5),
    revenueByDay: [...revenueByDayMap.entries()]
      .map(([date, value]) => ({ date, ...value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    fulfillmentBreakdown: [...fulfillmentBreakdownMap.entries()].map(([status, count]) => ({ status, count })),
    lowStockProducts: products
      .filter((product) => product.inventoryTracked && (product.inventoryCount ?? 0) <= 10)
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.inventoryCount ?? 0,
      })),
  };
}

async function getEventSettings(eventId: string): Promise<EventSettingsResponse> {
  return apiClient.get<EventSettingsResponse>(`/events/${eventId}/settings`);
}

async function patchEventSettings(
  eventId: string,
  payload: Pick<EventSettingsResponse, 'modulesEnabledJson' | 'merchandisingJson'>,
): Promise<EventSettingsResponse> {
  return apiClient.patch<EventSettingsResponse>(`/events/${eventId}/settings`, payload);
}

export async function getCapabilityFlags(): Promise<MerchandiseCapabilityFlags> {
  return DEFAULT_CAPABILITIES;
}

export async function presignMerchImageUpload(
  eventId: string,
  file: { fileName: string; contentType: string; size: number },
): Promise<MerchImagePresignResponse> {
  if (config.features.useMockData) {
    await delay();
    const assetId = generateId('asset');
    const fileUrl = `mock-merch-image://${assetId}/${file.fileName}`;
    mockUploadStore.set(assetId, {
      fileUrl,
      contentType: file.contentType,
      size: file.size,
    });
    return {
      assetId,
      uploadUrl: fileUrl,
      fileUrl,
      headers: { 'Content-Type': file.contentType },
      mimeType: file.contentType,
      size: file.size,
      maxFileSizeBytes: 10 * 1024 * 1024,
    };
  }

  return apiClient.post<MerchImagePresignResponse>('/uploads/merch-images/presign', {
    eventId,
    fileName: file.fileName,
    contentType: file.contentType,
    size: file.size,
  });
}

export async function uploadMerchImageBinary(
  uploadUrl: string,
  file: File,
  headers: Record<string, string>,
): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    return;
  }

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error('Image upload failed while sending the file.');
  }
}

export async function finalizeMerchImageUpload(
  assetId: string,
  file: { contentType: string; size: number },
): Promise<MerchImageCompleteResponse> {
  if (config.features.useMockData) {
    await delay();
    const stored = mockUploadStore.get(assetId);
    if (!stored) {
      throw new Error('Image upload could not be completed.');
    }
    return {
      url: stored.fileUrl,
      mimeType: stored.contentType,
      size: stored.size,
    };
  }

  return apiClient.post<MerchImageCompleteResponse>(`/uploads/merch-images/${assetId}/complete`, {
    contentType: file.contentType,
    size: file.size,
  });
}

export async function getProducts(eventId: string, params?: SearchParams): Promise<Product[]> {
  if (config.features.useMockData) {
    await delay();
    return applyProductFilters(ensureMockProducts(eventId), params);
  }

  const response = await apiClient.get<Product[]>(`/events/${eventId}/products`, {
    params: {
      productType: params?.productType,
      status: params?.status,
      search: params?.search,
    } as Record<string, string | undefined>,
  });

  return response
    .map(normalizeBackendProduct)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProduct(eventId: string, productId: string): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const product = ensureMockProducts(eventId).find((entry) => entry.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  return normalizeBackendProduct(await apiClient.get<Product>(`/products/${productId}`));
}

export async function createProduct(eventId: string, data: CreateProductRequest): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const createdAt = isoNow();
    const product: Product = {
      id: generateId('prod'),
      eventId,
      name: data.name,
      productType: data.productType,
      description: data.description ?? null,
      status: 'DRAFT',
      basePriceMinor: data.basePriceMinor,
      currency: 'NGN',
      inventoryTracked: data.inventoryTracked ?? true,
      inventoryCount: data.inventoryTracked === false ? null : data.inventoryCount ?? 0,
      imageUrl: data.imageUrl ?? null,
      metadataJson: data.metadataJson ?? null,
      createdAt,
      updatedAt: createdAt,
      variants: [],
    };
    mockProductsStore.set(eventId, [product, ...ensureMockProducts(eventId)]);
    return product;
  }

  return normalizeBackendProduct(await apiClient.post<Product>(`/events/${eventId}/products`, data));
}

export async function updateProduct(eventId: string, productId: string, data: UpdateProductRequest): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const products = ensureMockProducts(eventId);
    const index = products.findIndex((product) => product.id === productId);

    if (index === -1) {
      throw new Error('Product not found');
    }

    const previous = products[index];
    const updated: Product = {
      ...previous,
      ...data,
      inventoryCount:
        data.inventoryTracked === false
          ? null
          : data.inventoryCount ?? previous.inventoryCount,
      updatedAt: isoNow(),
    };
    products[index] = updated;
    mockProductsStore.set(eventId, [...products]);
    return updated;
  }

  return normalizeBackendProduct(await apiClient.patch<Product>(`/products/${productId}`, data));
}

export async function deleteProduct(eventId: string, productId: string): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    mockProductsStore.set(
      eventId,
      ensureMockProducts(eventId).filter((product) => product.id !== productId),
    );
    return;
  }

  await apiClient.delete(`/products/${productId}`);
}

export async function duplicateProduct(eventId: string, productId: string): Promise<Product> {
  const source = await getProduct(eventId, productId);
  return createProduct(eventId, {
    name: `${source.name} (Copy)`,
    productType: source.productType,
    description: source.description ?? undefined,
    basePriceMinor: source.basePriceMinor,
    inventoryTracked: source.inventoryTracked,
    inventoryCount: source.inventoryCount ?? undefined,
    imageUrl: source.imageUrl ?? undefined,
    metadataJson: source.metadataJson ?? undefined,
  });
}

export async function publishProduct(eventId: string, productId: string): Promise<Product> {
  return updateProduct(eventId, productId, { status: 'ACTIVE' });
}

export async function archiveProduct(eventId: string, productId: string): Promise<Product> {
  return updateProduct(eventId, productId, { status: 'ARCHIVED' });
}

export async function createProductVariant(productId: string, data: CreateProductVariantRequest): Promise<Product['variants'][number]> {
  if (config.features.useMockData) {
    await delay();
    for (const [eventId, products] of mockProductsStore.entries()) {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        continue;
      }

      const createdAt = isoNow();
      const variant: Product['variants'][number] = {
        id: generateId('var'),
        productId,
        sku: data.sku ?? null,
        name: data.name,
        priceMinor: data.priceMinor,
        inventoryCount: product.inventoryTracked ? data.inventoryCount ?? 0 : null,
        attributesJson: data.attributesJson ?? null,
        createdAt,
        updatedAt: createdAt,
      };

      product.variants = [...product.variants, variant];
      product.updatedAt = createdAt;
      mockProductsStore.set(eventId, [...products]);
      return variant;
    }

    throw new Error('Product not found');
  }

  return apiClient.post<Product['variants'][number]>(`/products/${productId}/variants`, data);
}

export async function getOrders(eventId: string, params?: SearchParams): Promise<PaginatedResponse<Order>> {
  if (config.features.useMockData) {
    await delay();
    const data = applyOrderFilters(ensureMockOrders(eventId), params);
    return { data, meta: createMeta(data) };
  }

  const orders = await apiClient.get<Order[]>(`/events/${eventId}/merch-orders`);
  const normalized = orders.map(normalizeBackendOrder);
  const data = applyOrderFilters(normalized, params);
  return { data, meta: createMeta(data) };
}

export async function getOrder(eventId: string, orderId: string): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const order = ensureMockOrders(eventId).find((entry) => entry.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  return normalizeBackendOrder(await apiClient.get<Order>(`/merch-orders/${orderId}`));
}

export async function createOrder(eventId: string, data: CreateOrderRequest): Promise<Order> {
  if (config.features.useMockData) {
    await delay();

    const products = ensureMockProducts(eventId);
    const createdAt = isoNow();
    const items = data.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const variant = item.productVariantId
        ? product.variants.find((entry) => entry.id === item.productVariantId)
        : null;

      if (product.variants.length > 0 && !variant) {
        throw new Error(`Product "${product.name}" requires a variant selection`);
      }

      const unitPriceMinor = variant?.priceMinor ?? product.basePriceMinor;
      return {
        id: generateId('item'),
        merchOrderId: '',
        productId: product.id,
        productVariantId: variant?.id ?? null,
        quantity: item.quantity,
        unitPriceMinor,
        totalPriceMinor: unitPriceMinor * item.quantity,
        metadataJson: null,
        createdAt,
        product,
        productVariant: variant ?? null,
      };
    });

    const subtotalMinor = items.reduce((sum, item) => sum + item.totalPriceMinor, 0);
    const order: Order = {
      id: generateId('morder'),
      tenantId: 'tenant-mock',
      eventId,
      buyerUserId: 'user-mock',
      status: subtotalMinor > 0 ? 'PENDING' : 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      currency: products[0]?.currency ?? 'NGN',
      subtotalMinor,
      feeMinor: 0,
      shippingMinor: 0,
      totalMinor: subtotalMinor,
      shippingAddressJson: data.shippingAddressJson ?? null,
      createdAt,
      updatedAt: createdAt,
      items: items.map((item) => ({ ...item, merchOrderId: 'pending' })),
      displayEmail: data.email,
      orderNumber: `MER-${String(ensureMockOrders(eventId).length + 1).padStart(4, '0')}`,
    };

    order.items = order.items.map((item) => ({ ...item, merchOrderId: order.id }));
    mockOrdersStore.set(eventId, [order, ...ensureMockOrders(eventId)]);
    return order;
  }

  return normalizeBackendOrder(await apiClient.post<Order>(`/events/${eventId}/merch-orders`, data));
}

export async function updateOrder(_eventId: string, orderId: string, data: UpdateOrderRequest): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    for (const [eventId, orders] of mockOrdersStore.entries()) {
      const index = orders.findIndex((entry) => entry.id === orderId);
      if (index === -1) {
        continue;
      }

      const updated: Order = {
        ...orders[index],
        fulfillmentStatus: data.fulfillmentStatus,
        updatedAt: isoNow(),
      };
      orders[index] = updated;
      mockOrdersStore.set(eventId, [...orders]);
      return updated;
    }

    throw new Error('Order not found');
  }

  return normalizeBackendOrder(await apiClient.patch<Order>(`/merch-orders/${orderId}/fulfillment`, data));
}

export async function getPublicProducts(
  eventSlug: string,
  params?: {
    search?: string;
    productType?: ProductType;
    category?: string;
    inStock?: boolean;
  },
): Promise<PublicProductsResponse> {
  const response = await apiClient.get<PublicProductsResponse>(`/public/events/${eventSlug}/products`, {
    params: {
      search: params?.search,
      productType: params?.productType,
      category: params?.category,
      inStock: params?.inStock,
    },
  });

  return {
    event: response.event,
    products: (response.products ?? []).map(normalizeBackendProduct),
  };
}

export async function getPublicProduct(productId: string): Promise<Product> {
  return normalizeBackendProduct(await apiClient.get<Product>(`/public/products/${productId}`));
}

export async function createPublicOrder(eventId: string, data: CreateOrderRequest): Promise<Order> {
  return normalizeBackendOrder(await apiClient.post<Order>(`/public/events/${eventId}/merch-orders`, data));
}

export async function getPublicOrder(orderId: string, email: string): Promise<Order> {
  return normalizeBackendOrder(await apiClient.get<Order>(`/public/merch-orders/${orderId}`, {
    params: { email },
  }));
}

export async function initializeMerchPayment(
  merchOrderId: string,
  data: InitializeMerchPaymentRequest,
): Promise<InitializeMerchPaymentResponse> {
  return apiClient.post<InitializeMerchPaymentResponse>(
    `/payments/merch-orders/${merchOrderId}/initialize-payment`,
    data,
  );
}

export async function cancelOrder(eventId: string, orderId: string): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const orders = ensureMockOrders(eventId);
    const index = orders.findIndex((order) => order.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }

    orders[index] = {
      ...orders[index],
      status: 'CANCELLED',
      fulfillmentStatus: 'CANCELLED',
      updatedAt: isoNow(),
    };
    mockOrdersStore.set(eventId, [...orders]);
    return orders[index];
  }

  return updateOrder(eventId, orderId, { fulfillmentStatus: 'CANCELLED' });
}

export async function refundOrder(eventId: string, orderId: string): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const orders = ensureMockOrders(eventId);
    const index = orders.findIndex((order) => order.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }

    orders[index] = {
      ...orders[index],
      status: 'REFUNDED',
      updatedAt: isoNow(),
    };
    mockOrdersStore.set(eventId, [...orders]);
    return orders[index];
  }

  throw new Error('Refund endpoint is not documented for merch orders yet.');
}

export async function exportOrders(eventId: string): Promise<Blob> {
  const { data } = await getOrders(eventId);
  const csv = [
    'Order ID,Email,Status,Fulfillment Status,Items,Total Minor,Created At',
    ...data.map((order) =>
      [
        order.orderNumber ?? order.id,
        order.displayEmail ?? '',
        order.status,
        order.fulfillmentStatus,
        order.items.length,
        order.totalMinor,
        order.createdAt,
      ].join(','),
    ),
  ].join('\n');

  return new Blob([csv], { type: 'text/csv' });
}

export async function adjustInventory(
  eventId: string,
  productId: string,
  variantId: string | undefined,
  adjustment: {
    type: 'restock' | 'adjustment';
    quantity: number;
    reason?: string;
  },
): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const products = ensureMockProducts(eventId);
    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (variantId) {
      product.variants = product.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              inventoryCount: Math.max((variant.inventoryCount ?? 0) + adjustment.quantity, 0),
              updatedAt: isoNow(),
            }
          : variant,
      );
    } else if (product.inventoryTracked) {
      product.inventoryCount = Math.max((product.inventoryCount ?? 0) + adjustment.quantity, 0);
    }

    product.updatedAt = isoNow();
    mockProductsStore.set(eventId, [...products]);
    return product;
  }

  throw new Error('Inventory adjustment endpoint is not documented for the current backend.');
}

export async function getInventoryHistory(_eventId: string, _productId: string): Promise<InventoryAdjustment[]> {
  return [];
}

export async function getDiscounts(eventId: string): Promise<Discount[]> {
  if (config.features.useMockData) {
    await delay();
    return mockDiscounts.filter((discount) => discount.eventId === eventId);
  }

  return [];
}

export async function validateDiscount(eventId: string, code: string): Promise<Discount> {
  const discounts = await getDiscounts(eventId);
  const discount = discounts.find((entry) => entry.code === code);
  if (!discount) {
    throw new Error('Invalid discount code');
  }
  return discount;
}

export async function getBundles(eventId: string): Promise<Bundle[]> {
  if (config.features.useMockData) {
    await delay();
    return mockBundles.filter((bundle) => bundle.eventId === eventId);
  }

  return [];
}

export async function getFulfilmentConfig(eventId: string): Promise<FulfilmentConfig> {
  if (config.features.useMockData) {
    await delay();
    return { ...mockFulfilmentConfig, eventId };
  }

  return {
    ...mockFulfilmentConfig,
    eventId,
  };
}

export async function updateFulfilmentConfig(eventId: string, data: Partial<FulfilmentConfig>): Promise<FulfilmentConfig> {
  if (config.features.useMockData) {
    await delay();
    return { ...mockFulfilmentConfig, eventId, ...data };
  }

  return {
    ...mockFulfilmentConfig,
    eventId,
    ...data,
  };
}

export async function getMerchandiseAnalytics(eventId: string): Promise<MerchandiseAnalytics> {
  if (config.features.useMockData) {
    await delay();
    return buildAnalytics(ensureMockProducts(eventId), ensureMockOrders(eventId));
  }

  const [products, { data: orders }] = await Promise.all([getProducts(eventId), getOrders(eventId)]);
  return buildAnalytics(products, orders);
}

export async function getMerchandiseSettings(eventId: string): Promise<MerchandiseSettings> {
  if (config.features.useMockData) {
    await delay();
    return ensureMockSettings(eventId);
  }

  const settings = await getEventSettings(eventId);
  const modulesEnabled = settings.modulesEnabledJson ?? {};

  return {
    enabled: modulesEnabled.merchandising === true,
    merchandisingJson: settings.merchandisingJson ?? {},
    updatedAt: settings.updatedAt,
  };
}

export async function updateMerchandiseSettings(
  eventId: string,
  data: Partial<MerchandiseSettings>,
): Promise<MerchandiseSettings> {
  if (config.features.useMockData) {
    await delay();
    const current = ensureMockSettings(eventId);
    const next: MerchandiseSettings = {
      enabled: data.enabled ?? current.enabled,
      merchandisingJson: {
        ...current.merchandisingJson,
        ...(data.merchandisingJson ?? {}),
      },
      updatedAt: isoNow(),
    };
    mockSettingsStore.set(eventId, next);
    return next;
  }

  const existing = await getEventSettings(eventId);
  const currentModulesEnabled = existing.modulesEnabledJson ?? {};
  const currentMerchandisingJson = existing.merchandisingJson ?? {};

  const updated = await patchEventSettings(eventId, {
    modulesEnabledJson: {
      ...currentModulesEnabled,
      merchandising: data.enabled ?? currentModulesEnabled.merchandising ?? false,
    },
    merchandisingJson: {
      ...currentMerchandisingJson,
      ...(data.merchandisingJson ?? {}),
    },
  });

  return {
    enabled: updated.modulesEnabledJson?.merchandising === true,
    merchandisingJson: updated.merchandisingJson ?? {},
    updatedAt: updated.updatedAt,
  };
}
