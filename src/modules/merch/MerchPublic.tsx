// Public Merchandise Page - Attendee-facing store
// Route: /e/:eventSlug/merch

import React from 'react';
import { useEvent } from '../../contexts';
import { useBrandSafe } from '../../contexts/BrandContext';
import { Button } from '../../components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MerchPublic() {
  const { currentEvent } = useEvent();
  const { branding } = useBrandSafe();

  if (!currentEvent) return null;

  // Mock product data for stub
  const products = [
    { id: 'p1', name: 'Event T-Shirt', price: 8000, currency: 'NGN', imageUrl: '', inStock: true },
    { id: 'p2', name: 'Branded Hoodie', price: 15000, currency: 'NGN', imageUrl: '', inStock: true },
    { id: 'p3', name: 'Digital Badge', price: 0, currency: 'NGN', imageUrl: '', inStock: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Raleway']">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            to={`/e/${currentEvent.slug || currentEvent.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to event
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Merchandise
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {currentEvent.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {product.price === 0
                    ? 'Free'
                    : `${product.currency} ${product.price.toLocaleString()}`}
                </p>
                <Button size="sm" className="w-full rounded-xl">
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Powered by Munar
      </div>
    </div>
  );
}
