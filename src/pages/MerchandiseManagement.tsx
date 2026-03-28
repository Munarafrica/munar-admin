// Merchandise Management Page
import React, { useState } from 'react';
import { Page } from '../App';
import { TopBar } from '../components/dashboard/TopBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ProductCard } from '../components/merchandise/ProductCard';
import { OrderRow } from '../components/merchandise/OrderRow';
import { ProductModal } from '../components/merchandise/ProductModal';
import { OrderDetailModal } from '../components/merchandise/OrderDetailModal';
import { AnalyticsTab } from '../components/merchandise/AnalyticsTab';
import { SettingsTab } from '../components/merchandise/SettingsTab';
import { useProducts, useOrders } from '../hooks';
import { MerchandiseProvider, useMerchandise } from '../contexts';
import { Product, Order, CreateProductRequest, MerchandiseSettings } from '../types/merchandise';
import { cn } from '../components/ui/utils';
import {
  Package,
  ShoppingCart,
  BarChart3,
  Plus,
  Search,
  Download,
  DollarSign,
  ShoppingBag,
  Settings,
  Filter,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  ChevronLeft,
} from 'lucide-react';
import { eventsService } from '../services';
import { getCurrentEventId } from '../lib/event-storage';

interface MerchandiseManagementProps {
  onNavigate: (page: Page) => void;
}

const MerchandiseManagementContent: React.FC<MerchandiseManagementProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'settings'>('products');
  const eventId = getCurrentEventId();
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filter states
  const [productStatusFilter, setProductStatusFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Hooks
  const { 
    products, 
    isLoading: productsLoading, 
    createProduct,
    updateProduct,
    duplicateProduct, 
    deleteProduct,
    publishProduct,
    archiveProduct,
  } = useProducts({
    eventId,
  });

  const {
    orders,
    isLoading: ordersLoading,
    searchOrders,
    markFulfilled,
    cancelOrder,
    refundOrder,
    exportOrders,
  } = useOrders({
    eventId,
  });

  const updateMerchCount = (count: number, message?: string) => {
    eventsService.updateModuleCount(eventId, 'Merchandise', count, message, 'shopping-bag');
  };

  const { analytics, settings, isLoading: contextLoading, updateSettings } = useMerchandise();

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesStatus;
  });

  // Handlers
  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductModal(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };
  
  const handleSaveProduct = async (productData: CreateProductRequest) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      const created = await createProduct(productData);
      if (created) {
        updateMerchCount(products.length + 1, `Created product "${created.name}"`);
      }
    }
  };

  const handleDuplicateProduct = async (productId: string) => {
    const duplicated = await duplicateProduct(productId);
    if (duplicated) {
      updateMerchCount(products.length + 1, `Duplicated product "${duplicated.name}"`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const deleted = await deleteProduct(productId);
    if (deleted) {
      updateMerchCount(Math.max(products.length - 1, 0), 'Product deleted');
    }
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };
  
  const handleFulfillOrder = async (orderId: string, _verificationData?: { method: string; notes?: string }) => {
    await markFulfilled(orderId);
  };
  
  const handleCancelOrder = async (orderId: string) => {
    await cancelOrder(orderId);
  };
  
  const handleRefundOrder = async (orderId: string) => {
    await refundOrder(orderId);
  };
  
  const handleSaveSettings = async (newSettings: Partial<MerchandiseSettings>) => {
    await updateSettings(newSettings);
  };

  const eventName = 'Lagos Tech Summit 2026';
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'event';

  const eventSubdomain = slugify(eventName);
  const shopUrl = `https://${eventSubdomain}.munar.com/shop`;

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
              <button
                onClick={() => onNavigate?.('event-dashboard')}
                className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Merchandise
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Sell physical and digital merchandise to attendees. Manage products, orders, inventory and fulfilment.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span className="truncate max-w-[200px]" title={shopUrl}>{shopUrl}</span>
              <button onClick={() => copyLink(shopUrl)} className="p-1 hover:text-indigo-600" title="Copy link">
                <Copy className="w-4 h-4" />
              </button>
              <a href={shopUrl} target="_blank" rel="noreferrer" className="p-1 hover:text-indigo-600" title="Open">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <Button 
              onClick={handleAddProduct}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Revenue
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Orders</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analytics.ordersCount}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Items Sold
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {analytics.itemsSold}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Avg Order
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>
          </div>
        )}

        {/* Tabs & Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col transition-colors">
          {/* Tabs Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-2 flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 flex-1">
            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={productStatusFilter}
                      onChange={(e) => setProductStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="sold-out">Sold Out</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleAddProduct}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 sm:hidden"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {products.length === 0 ? 'No products created yet' : 'No products match your filters'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                      {products.length === 0 
                        ? 'Create your first product to start selling merchandise for your event.'
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                    {products.length === 0 && (
                      <Button 
                        onClick={handleAddProduct}
                        className="mt-4 bg-indigo-600 text-white gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={() => handleEditProduct(product)}
                        onDuplicate={() => handleDuplicateProduct(product.id)}
                        onDelete={() => handleDeleteProduct(product.id)}
                        onPublish={() => publishProduct(product.id)}
                        onArchive={() => archiveProduct(product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="search"
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => {
                          setOrderSearch(e.target.value);
                          searchOrders(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 dark:bg-slate-800 dark:border-slate-700"
                    onClick={() => exportOrders('csv')}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>

                {/* Orders Table */}
                {ordersLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                      {orders.length === 0 
                        ? 'Orders will appear here when customers make purchases.'
                        : 'Try adjusting your search or filter criteria.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Order
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Fulfilment
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredOrders.map((order) => (
                          <OrderRow
                            key={order.id}
                            order={order}
                            onView={() => handleViewOrder(order)}
                            onMarkFulfilled={() => markFulfilled(order)}
                            onCancel={() => cancelOrder(order)}
                            onRefund={() => refundOrder(order)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                analytics={analytics}
                isLoading={contextLoading}
                currency="NGN"
              />
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSave={handleSaveSettings}
                isLoading={contextLoading}
              />
            )}
          </div>
        </div>
        
        {/* Product Modal */}
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(undefined);
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          eventCurrency="NGN"
        />
        
        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onFulfill={handleFulfillOrder}
          onCancel={handleCancelOrder}
          onRefund={handleRefundOrder}
        />
      </main>
    </div>
  );
};

// Wrap with MerchandiseProvider
export const MerchandiseManagement: React.FC<MerchandiseManagementProps> = (props) => {
  const eventId = getCurrentEventId();
  return (
    <MerchandiseProvider eventId={eventId}>
      <MerchandiseManagementContent {...props} />
    </MerchandiseProvider>
  );
};
