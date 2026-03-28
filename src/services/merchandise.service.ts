// Merchandise Service - handles products, orders, inventory management
import { config } from '../config';
import { apiClient } from '../lib/api-client';
import { PaginatedResponse, SearchParams } from '../types/api';
import {
  Product,
  Order,
  Discount,
  Bundle,
  FulfilmentConfig,
  MerchandiseAnalytics,
  MerchandiseSettings,
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  InventoryAdjustment,
} from '../types/merchandise';
import {
  mockProducts,
  mockOrders,
  mockDiscounts,
  mockBundles,
  mockFulfilmentConfig,
  delay,
  generateId,
} from './mock/data';

// ============ Products ============

export async function getProducts(eventId: string): Promise<Product[]> {
  if (config.features.useMockData) {
    await delay();
    return mockProducts.filter(p => p.eventId === eventId);
  }
  
  return await apiClient.get<Product[]>(`/events/${eventId}/merchandise/products`);
}

export async function getProduct(eventId: string, productId: string): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const product = mockProducts.find(p => p.id === productId && p.eventId === eventId);
    if (!product) throw new Error('Product not found');
    return product;
  }
  
  return await apiClient.get<Product>(`/events/${eventId}/merchandise/products/${productId}`);
}

export async function createProduct(eventId: string, data: CreateProductRequest): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    // Convert string[] images to ProductImage[]
    const productImages = data.images.map((url, idx) => ({
      id: generateId('img'),
      url,
      isFeatured: idx === 0,
      order: idx,
    }));
    
    const newProduct: Product = {
      id: generateId('prod'),
      eventId,
      type: data.type,
      name: data.name,
      description: data.description,
      images: productImages,
      price: data.price,
      currency: data.currency || 'NGN',
      sku: data.sku,
      category: data.category,
      tags: data.tags || [],
      status: 'draft',
      hasVariants: data.hasVariants || false,
      variants: data.variants?.map(v => ({
        ...v,
        id: generateId('var'),
        productId: '',
      })) || [],
      unlimitedInventory: data.unlimitedInventory || false,
      totalStock: data.totalStock || 0,
      minQuantity: data.minQuantity || 1,
      maxQuantity: data.maxQuantity || 10,
      maxPerUser: data.maxPerUser,
      ticketHoldersOnly: data.ticketHoldersOnly || false,
      requiresAccessCode: data.requiresAccessCode || false,
      accessCode: data.accessCode,
      fulfilmentTypes: data.fulfilmentTypes,
      digitalDeliveryMethod: data.digitalDeliveryMethod,
      digitalFile: data.downloadUrl ? {
        id: generateId('file'),
        name: 'Digital Product',
        url: data.downloadUrl,
        size: 0,
        type: 'application/octet-stream',
      } : undefined,
      downloadLimit: data.downloadLimit,
      expiryDate: data.expiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user-1',
    };
    
    newProduct.variants = newProduct.variants.map(v => ({ ...v, productId: newProduct.id }));
    mockProducts.push(newProduct);
    return newProduct;
  }
  
  return await apiClient.post<Product>(`/events/${eventId}/merchandise/products`, data);
}

export async function updateProduct(eventId: string, productId: string, data: UpdateProductRequest): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const index = mockProducts.findIndex(p => p.id === productId && p.eventId === eventId);
    if (index === -1) throw new Error('Product not found');
    
    // Convert images from string[] to ProductImage[] if provided
    let updatedImages = mockProducts[index].images;
    if (data.images) {
      updatedImages = data.images.map((url, idx) => ({
        id: generateId('img'),
        url,
        isFeatured: idx === 0,
        order: idx,
      }));
    }
    
    // Convert variants if provided
    let updatedVariants = mockProducts[index].variants;
    if (data.variants) {
      updatedVariants = data.variants.map(v => ({
        ...v,
        id: generateId('var'),
        productId: productId,
      }));
    }
    
    // Create updated product, explicitly excluding images and variants from spread
    const { images: _images, variants: _variants, ...restData } = data;
    mockProducts[index] = {
      ...mockProducts[index],
      ...restData,
      images: updatedImages,
      variants: updatedVariants,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  }
  
  return await apiClient.put<Product>(`/events/${eventId}/merchandise/products/${productId}`, data);
}

export async function deleteProduct(eventId: string, productId: string): Promise<void> {
  if (config.features.useMockData) {
    await delay();
    const index = mockProducts.findIndex(p => p.id === productId && p.eventId === eventId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
    return;
  }
  
  await apiClient.delete(`/events/${eventId}/merchandise/products/${productId}`);
}

export async function duplicateProduct(eventId: string, productId: string): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const original = mockProducts.find(p => p.id === productId && p.eventId === eventId);
    if (!original) throw new Error('Product not found');
    
    const duplicate: Product = {
      ...original,
      id: generateId('prod'),
      name: `${original.name} (Copy)`,
      status: 'draft',
      variants: original.variants.map(v => ({
        ...v,
        id: generateId('var'),
        productId: '',
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    duplicate.variants = duplicate.variants.map(v => ({ ...v, productId: duplicate.id }));
    mockProducts.push(duplicate);
    return duplicate;
  }
  
  return await apiClient.post<Product>(`/events/${eventId}/merchandise/products/${productId}/duplicate`);
}

export async function publishProduct(eventId: string, productId: string): Promise<Product> {
  return updateProduct(eventId, productId, { status: 'active' });
}

export async function archiveProduct(eventId: string, productId: string): Promise<Product> {
  return updateProduct(eventId, productId, { status: 'archived' });
}

// ============ Orders ============

export async function getOrders(eventId: string, params?: SearchParams): Promise<PaginatedResponse<Order>> {
  if (config.features.useMockData) {
    await delay();
    let filtered = mockOrders.filter(o => o.eventId === eventId);
    
    // Apply search
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerEmail.toLowerCase().includes(search)
      );
    }
    
    return {
      data: filtered,
      meta: {
        currentPage: params?.page || 1,
        itemsPerPage: params?.limit || 20,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / (params?.limit || 20)),
        hasNextPage: false,
        hasPreviousPage: (params?.page || 1) > 1,
      },
    };
  }
  
  return await apiClient.get<PaginatedResponse<Order>>(`/events/${eventId}/merchandise/orders`, { params: params as unknown as Record<string, string | number | boolean | undefined> });
}

export async function getOrder(eventId: string, orderId: string): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId && o.eventId === eventId);
    if (!order) throw new Error('Order not found');
    return order;
  }
  
  return await apiClient.get<Order>(`/events/${eventId}/merchandise/orders/${orderId}`);
}

export async function createOrder(eventId: string, data: CreateOrderRequest): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    
    // Calculate order totals
    const items = data.items.map(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      let unitPrice = product.price;
      let productName = product.name;
      let variantName: string | undefined;
      
      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          unitPrice = variant.price || product.price;
          variantName = variant.name;
        }
      }
      
      return {
        id: generateId('item'),
        productId: item.productId,
        productName,
        productImage: product.images[0]?.url,
        variantId: item.variantId,
        variantName,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCost = data.fulfilmentType === 'shipping' ? 2000 : 0;
    
    const newOrder: Order = {
      id: generateId('order'),
      orderNumber: `ORD-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`,
      eventId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items,
      subtotal,
      shippingCost,
      taxAmount: 0,
      discountAmount: 0,
      total: subtotal + shippingCost,
      currency: 'NGN',
      fulfilmentType: data.fulfilmentType,
      fulfilmentStatus: 'pending',
      shippingAddress: data.shippingAddress,
      pickupLocation: data.pickupLocation,
      pickupCode: data.fulfilmentType === 'pickup' ? generateId('pickup').substr(0, 6).toUpperCase() : undefined,
      paymentStatus: 'pending',
      status: 'pending',
      customerNotes: data.customerNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.push(newOrder);
    return newOrder;
  }
  
  return await apiClient.post<Order>(`/events/${eventId}/merchandise/orders`, data);
}

export async function updateOrder(eventId: string, orderId: string, data: UpdateOrderRequest): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const index = mockOrders.findIndex(o => o.id === orderId && o.eventId === eventId);
    if (index === -1) throw new Error('Order not found');
    
    mockOrders[index] = {
      ...mockOrders[index],
      ...data,
      fulfilledAt: data.fulfilmentStatus === 'completed' ? new Date().toISOString() : mockOrders[index].fulfilledAt,
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  }
  
  return await apiClient.put<Order>(`/events/${eventId}/merchandise/orders/${orderId}`, data);
}

export async function cancelOrder(eventId: string, orderId: string): Promise<Order> {
  return updateOrder(eventId, orderId, { status: 'cancelled' });
}

export async function refundOrder(eventId: string, orderId: string): Promise<Order> {
  if (config.features.useMockData) {
    await delay();
    const index = mockOrders.findIndex(o => o.id === orderId && o.eventId === eventId);
    if (index === -1) throw new Error('Order not found');
    
    mockOrders[index] = {
      ...mockOrders[index],
      status: 'refunded',
      paymentStatus: 'refunded',
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[index];
  }
  
  return await apiClient.post<Order>(`/events/${eventId}/merchandise/orders/${orderId}/refund`);
}

export async function exportOrders(eventId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
  if (config.features.useMockData) {
    await delay();
    const orders = mockOrders.filter(o => o.eventId === eventId);
    const csv = [
      'Order Number,Customer Name,Email,Items,Total,Status,Date',
      ...orders.map(o => 
        `${o.orderNumber},"${o.customerName}",${o.customerEmail},${o.items.length},${o.total},${o.status},${o.createdAt}`
      ),
    ].join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }
  
  // For real API, use fetch directly to handle blob response
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${config.api.baseUrl}/events/${eventId}/merchandise/orders/export?format=${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.blob();
}

// ============ Inventory ============

export async function adjustInventory(
  eventId: string,
  productId: string,
  variantId: string | undefined,
  adjustment: {
    type: 'restock' | 'adjustment';
    quantity: number;
    reason?: string;
  }
): Promise<Product> {
  if (config.features.useMockData) {
    await delay();
    const product = mockProducts.find(p => p.id === productId && p.eventId === eventId);
    if (!product) throw new Error('Product not found');
    
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        variant.stock += adjustment.quantity;
      }
    } else {
      product.totalStock += adjustment.quantity;
    }
    
    return product;
  }
  
  return await apiClient.post<Product>(
    `/events/${eventId}/merchandise/products/${productId}/inventory`,
    { variantId, ...adjustment }
  );
}

export async function getInventoryHistory(
  eventId: string,
  productId: string
): Promise<InventoryAdjustment[]> {
  if (config.features.useMockData) {
    await delay();
    return [];
  }
  
  return await apiClient.get<InventoryAdjustment[]>(
    `/events/${eventId}/merchandise/products/${productId}/inventory/history`
  );
}

// ============ Discounts ============

export async function getDiscounts(eventId: string): Promise<Discount[]> {
  if (config.features.useMockData) {
    await delay();
    return mockDiscounts.filter(d => d.eventId === eventId);
  }
  
  return await apiClient.get<Discount[]>(`/events/${eventId}/merchandise/discounts`);
}

export async function validateDiscount(eventId: string, code: string): Promise<Discount> {
  if (config.features.useMockData) {
    await delay();
    const discount = mockDiscounts.find(d => d.code === code && d.eventId === eventId && d.active);
    if (!discount) throw new Error('Invalid discount code');
    return discount;
  }
  
  return await apiClient.post<Discount>(`/events/${eventId}/merchandise/discounts/validate`, { code });
}

// ============ Bundles ============

export async function getBundles(eventId: string): Promise<Bundle[]> {
  if (config.features.useMockData) {
    await delay();
    return mockBundles.filter(b => b.eventId === eventId);
  }
  
  return await apiClient.get<Bundle[]>(`/events/${eventId}/merchandise/bundles`);
}

// ============ Fulfilment Config ============

export async function getFulfilmentConfig(eventId: string): Promise<FulfilmentConfig> {
  if (config.features.useMockData) {
    await delay();
    return { ...mockFulfilmentConfig, eventId };
  }
  
  return await apiClient.get<FulfilmentConfig>(`/events/${eventId}/merchandise/fulfilment-config`);
}

export async function updateFulfilmentConfig(eventId: string, data: Partial<FulfilmentConfig>): Promise<FulfilmentConfig> {
  if (config.features.useMockData) {
    await delay();
    Object.assign(mockFulfilmentConfig, data);
    return { ...mockFulfilmentConfig, eventId };
  }
  
  return await apiClient.put<FulfilmentConfig>(`/events/${eventId}/merchandise/fulfilment-config`, data);
}

// ============ Analytics ============

export async function getMerchandiseAnalytics(eventId: string): Promise<MerchandiseAnalytics> {
  if (config.features.useMockData) {
    await delay();
    const orders = mockOrders.filter(o => o.eventId === eventId && o.status !== 'cancelled');
    const products = mockProducts.filter(p => p.eventId === eventId);
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const itemsSold = orders.reduce((sum, o) => 
      sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    return {
      totalRevenue,
      ordersCount: orders.length,
      itemsSold,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      conversionRate: 12.5,
      topProducts: products.slice(0, 5).map(p => ({
        productId: p.id,
        productName: p.name,
        unitsSold: Math.floor(Math.random() * 50) + 10,
        revenue: p.price * (Math.floor(Math.random() * 50) + 10),
      })),
      revenueByDay: [
        { date: '2026-01-20', revenue: 45000, orders: 3 },
        { date: '2026-01-21', revenue: 62000, orders: 4 },
        { date: '2026-01-22', revenue: 38000, orders: 2 },
        { date: '2026-01-23', revenue: 71000, orders: 5 },
        { date: '2026-01-24', revenue: 54000, orders: 3 },
        { date: '2026-01-25', revenue: 89000, orders: 6 },
        { date: '2026-01-26', revenue: 91000, orders: 7 },
      ],
      fulfilmentBreakdown: [
        { type: 'pickup', count: 12, percentage: 40 },
        { type: 'shipping', count: 15, percentage: 50 },
        { type: 'digital', count: 3, percentage: 10 },
      ],
      lowStockProducts: products
        .filter(p => !p.unlimitedInventory && p.totalStock < 50)
        .map(p => ({
          productId: p.id,
          productName: p.name,
          currentStock: p.totalStock,
          alertThreshold: 50,
        })),
    };
  }
  
  return await apiClient.get<MerchandiseAnalytics>(`/events/${eventId}/merchandise/analytics`);
}

// ============ Settings ============

// Mock settings storage
let mockSettings: Record<string, MerchandiseSettings> = {};

export async function getMerchandiseSettings(eventId: string): Promise<MerchandiseSettings> {
  if (config.features.useMockData) {
    await delay();
    if (!mockSettings[eventId]) {
      mockSettings[eventId] = {
        id: generateId('settings'),
        eventId,
        lowStockAlertEnabled: true,
        lowStockThreshold: 10,
        lowStockEmailNotify: true,
        pickupEnabled: true,
        pickupInstructions: 'Visit the merchandise booth near the main entrance during event hours.',
        requireIdentityVerification: true,
        digitalEnabled: true,
        autoDeliverDigital: true,
        orderConfirmationEmail: true,
        fulfilmentNotificationEmail: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return mockSettings[eventId];
  }
  
  return await apiClient.get<MerchandiseSettings>(`/events/${eventId}/merchandise/settings`);
}

export async function updateMerchandiseSettings(
  eventId: string,
  data: Partial<MerchandiseSettings>
): Promise<MerchandiseSettings> {
  if (config.features.useMockData) {
    await delay();
    const existing = mockSettings[eventId] || {
      id: generateId('settings'),
      eventId,
      lowStockAlertEnabled: true,
      lowStockThreshold: 10,
      lowStockEmailNotify: true,
      pickupEnabled: true,
      requireIdentityVerification: true,
      digitalEnabled: true,
      autoDeliverDigital: true,
      orderConfirmationEmail: true,
      fulfilmentNotificationEmail: true,
      updatedAt: new Date().toISOString(),
    };
    
    mockSettings[eventId] = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockSettings[eventId];
  }
  
  return await apiClient.patch<MerchandiseSettings>(
    `/events/${eventId}/merchandise/settings`,
    data
  );
}
