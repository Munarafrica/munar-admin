// Product Card Component
import React from 'react';
import { Product } from '../../types/merchandise';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Package, MoreVertical, Edit, Copy, Archive, Trash2, Eye, AlertTriangle, FileDigit } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onArchive?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

const getStatusColor = (status: Product['status']) => {
  const colors = {
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    'sold-out': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    archived: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  };
  return colors[status];
};

const getTypeIcon = (type: Product['type']) => {
  return type === 'digital' ? <FileDigit className="w-3 h-3" /> : <Package className="w-3 h-3" />;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onView,
}) => {
  const lowStock = !product.unlimitedInventory && product.totalStock < 20;
  const outOfStock = !product.unlimitedInventory && product.totalStock === 0;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {product.images.length > 0 ? (
          <img
            src={product.images.find(img => img.isFeatured)?.url || product.images[0]?.url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-medium border-0">
            {getTypeIcon(product.type)} {product.type === 'digital' ? 'Digital' : 'Physical'}
          </Badge>
        </div>

        {/* Stock Alert */}
        {lowStock && !outOfStock && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-500/90 dark:bg-amber-600/90 text-white backdrop-blur-sm text-xs font-medium border-0 gap-1">
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </Badge>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Badge className="bg-red-500 text-white text-sm font-semibold px-4 py-1.5 border-0">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onView && (
                <DropdownMenuItem onClick={() => onView(product)} className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Product
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(product)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onArchive && product.status !== 'archived' && (
                <DropdownMenuItem onClick={() => onArchive(product)} className="gap-2">
                  <Archive className="w-4 h-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Status & Category */}
        <div className="flex items-center justify-between gap-2">
          <Badge className={`${getStatusColor(product.status)} border-0 text-xs font-medium`}>
            {product.status}
          </Badge>
          {product.category && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{product.category}</span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: product.currency,
                minimumFractionDigits: 0,
              }).format(product.price)}
            </div>
            {product.sku && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                SKU: {product.sku}
              </div>
            )}
          </div>

          <div className="text-right">
            {product.unlimitedInventory ? (
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Unlimited
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {product.totalStock}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  in stock
                </div>
              </>
            )}
          </div>
        </div>

        {/* Variants Indicator */}
        {product.hasVariants && product.variants.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''} available
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
