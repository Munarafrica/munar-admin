import React, { useMemo, useState } from 'react';
import { TopBar } from '../components/dashboard/TopBar';
import { ProductCard } from '../components/merchandise/ProductCard';
import { OrderRow } from '../components/merchandise/OrderRow';
import { ProductModal, type ProductModalValues } from '../components/merchandise/ProductModal';
import { OrderDetailModal } from '../components/merchandise/OrderDetailModal';
import { AnalyticsTab } from '../components/merchandise/AnalyticsTab';
import { SettingsTab } from '../components/merchandise/SettingsTab';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MerchandiseProvider, useMerchandise } from '../contexts';
import { useOrders, useProducts } from '../hooks';
import { useEventId } from '../lib/navigation';
import { Page } from '../App';
import type { FulfillmentStatus, Order, Product } from '../types/merchandise';
import { merchandiseService } from '../services';
import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
} from 'lucide-react';

interface MerchandiseManagementProps {
  onNavigate: (page: Page) => void;
}

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

const MerchandiseManagementContent: React.FC<MerchandiseManagementProps> = ({ onNavigate }) => {
  const eventId = useEventId();
  const [activeTab, setActiveTab] = useState('products');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    products,
    isLoading: productsLoading,
    createProduct,
    updateProduct,
    publishProduct,
    archiveProduct,
    fetchProducts,
  } = useProducts({ eventId });

  const {
    orders,
    isLoading: ordersLoading,
    fetchOrders,
    updateOrder,
    meta,
  } = useOrders({ eventId });

  const {
    analytics,
    settings,
    isLoading: merchandiseLoading,
    updateSettings,
    refreshAnalytics,
    refreshProducts,
    refreshOrders,
  } = useMerchandise();

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();
    if (!search) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.description ?? ''].some((value) => value.toLowerCase().includes(search)),
    );
  }, [productSearch, products]);

  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();
    if (!search) {
      return orders;
    }

    return orders.filter((order) => {
      const haystacks = [
        order.orderNumber ?? order.id,
        order.displayEmail ?? '',
        order.items.map((item) => item.product.name).join(' '),
      ];

      return haystacks.some((value) => value.toLowerCase().includes(search));
    });
  }, [orderSearch, orders]);

  const handleSaveProduct = async ({ product, variants }: ProductModalValues) => {
    if (!eventId) {
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, product);
      await refreshProducts();
      await refreshAnalytics();
      return;
    }

    const created = await createProduct(product);
    if (!created) {
      return;
    }

    for (const variant of variants) {
      await merchandiseService.createProductVariant(created.id, variant);
    }

    await fetchProducts();
    await refreshProducts();
    await refreshAnalytics();
  };

  const handleUpdateFulfillment = async (orderId: string, status: FulfillmentStatus) => {
    await updateOrder(orderId, { fulfillmentStatus: status });
    await fetchOrders();
    await refreshOrders();
    await refreshAnalytics();
    setSelectedOrder((current) => (current && current.id === orderId ? { ...current, fulfillmentStatus: status } : current));
  };

  const revenueCurrency = products[0]?.currency ?? orders[0]?.currency ?? 'NGN';
  const summaryRevenue = analytics?.totalRevenueMinor ?? 0;
  const merchEnabled = settings?.enabled ?? false;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Raleway'] dark:bg-background">
      <TopBar onNavigate={onNavigate} />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <button
              onClick={() => onNavigate('event-dashboard')}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to event dashboard
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Merchandise</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Organizer-facing merch management built around the current backend: products, variants,
                orders, and fulfillment updates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setActiveTab('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Merchandise Settings
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(undefined);
                setShowProductModal(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add product
            </Button>
          </div>
        </div>

        {!merchEnabled ? (
          <section className="rounded-3xl border border-amber-300 bg-amber-50/95 p-5 text-amber-950 shadow-sm shadow-amber-100/50 dark:border-amber-700/60 dark:bg-amber-500/12 dark:text-amber-50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-950 dark:text-amber-50">
                  Merchandise is currently turned off
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-900 dark:text-amber-100/90">
                  Turn on merchandise in your event settings to start adding products and managing orders.
                </p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('settings')}
                    className="border-amber-400 bg-white/70 text-amber-950 hover:bg-white dark:border-amber-500/50 dark:bg-amber-400/10 dark:text-amber-50 dark:hover:bg-amber-400/20"
                  >
                    Open merch settings
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: 'Revenue',
              value: formatMoney(summaryRevenue, revenueCurrency),
              icon: ShoppingBag,
            },
            {
              label: 'Products',
              value: String(products.length),
              icon: Package,
            },
            {
              label: 'Orders',
              value: String(meta?.totalItems ?? orders.length),
              icon: ShoppingBag,
            },
            {
              label: 'Pending',
              value: String(analytics?.pendingOrdersCount ?? 0),
              icon: BarChart3,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                  <item.icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Merchandise Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search products"
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Products are event-scoped and ordered by newest first.
                </p>
              </div>

              {productsLoading || merchandiseLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading merch products...</p>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No products yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Create your first merch product in draft, then activate it when ready.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-start gap-5">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex-none" style={{ width: 240, maxWidth: 240 }}>
                      <ProductCard
                        product={product}
                        onEdit={(current) => {
                          setEditingProduct(current);
                          setShowProductModal(true);
                        }}
                        onPublish={(current) => publishProduct(current.id)}
                        onArchive={(current) => archiveProduct(current.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={orderSearch}
                    onChange={(event) => setOrderSearch(event.target.value)}
                    placeholder="Search orders"
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Backend order listing has no server filters yet, so filtering is client-side.
                </p>
              </div>

              {ordersLoading || merchandiseLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading merch orders...</p>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No orders yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Orders appear here once authenticated buyers create merch orders.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.3em] text-slate-400 dark:border-slate-800">
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Buyer</th>
                        <th className="px-4 py-3">Units</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Fulfillment</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <OrderRow key={order.id} order={order} onView={setSelectedOrder} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab analytics={analytics} isLoading={merchandiseLoading} currency={revenueCurrency} />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab settings={settings} onSave={updateSettings} isLoading={merchandiseLoading} />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(undefined);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        eventId={eventId}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateFulfillment={handleUpdateFulfillment}
      />
    </div>
  );
};

export const MerchandiseManagement: React.FC<MerchandiseManagementProps> = (props) => {
  const eventId = useEventId();

  return (
    <MerchandiseProvider eventId={eventId}>
      <MerchandiseManagementContent {...props} />
    </MerchandiseProvider>
  );
};
