import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import type { Product } from '../../types/merchandise';
import {
  Archive,
  Eye,
  MoreVertical,
  Package,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onPublish?: (product: Product) => void;
  onArchive?: (product: Product) => void;
}

const statusTone: Record<Product['status'], string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PAUSED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  ARCHIVED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const formatMoney = (amountMinor: number, currency: string) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amountMinor / 100);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onPublish,
  onArchive,
}) => {
  const variantCount = product.variants?.length ?? 0;
  const stockLabel = !product.inventoryTracked
    ? 'Inventory off'
    : `${product.inventoryCount ?? 0} in stock`;

  return (
    <Card
      className="overflow-hidden border-slate-200 dark:border-slate-800"
      style={{ width: 240, maxWidth: 240 }}
    >
      <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Badge className={`border-0 ${statusTone[product.status]}`}>{product.status}</Badge>
            <div>
              <h3 className="line-clamp-2 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {product.productType === 'DIGITAL' ? 'Digital product' : 'Physical product'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit ? (
                <DropdownMenuItem onClick={() => onEdit(product)} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Edit details
                </DropdownMenuItem>
              ) : null}
              {product.status !== 'ACTIVE' && onPublish ? (
                <DropdownMenuItem onClick={() => onPublish(product)} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Activate product
                </DropdownMenuItem>
              ) : null}
              {product.status === 'ACTIVE' && onArchive ? (
                <DropdownMenuItem onClick={() => onArchive(product)} className="gap-2">
                  <PauseCircle className="h-4 w-4" />
                  Archive product
                </DropdownMenuItem>
              ) : null}
              {product.status === 'PAUSED' && onArchive ? (
                <DropdownMenuItem onClick={() => onArchive(product)} className="gap-2">
                  <Archive className="h-4 w-4" />
                  Archive product
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {product.description ? (
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">No description added yet.</p>
        )}

        <div className="flex items-end justify-between gap-4 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Base price</p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {formatMoney(product.basePriceMinor, product.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventory</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{stockLabel}</p>
            <p className="text-xs text-slate-400">
              {variantCount > 0 ? `${variantCount} variant(s)` : 'No variants'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
