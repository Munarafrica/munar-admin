import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  CreateProductRequest,
  Product,
  ProductType,
} from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { merchandiseService } from '../../services';
import { toast } from 'sonner';

export interface ProductModalValues {
  product: CreateProductRequest;
  variants: Array<{
    name: string;
    sku?: string;
    priceMinor: number;
    inventoryCount?: number;
    attributesJson?: Record<string, unknown>;
  }>;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ProductModalValues) => Promise<void>;
  product?: Product;
  eventId?: string | null;
}

type VariantDraft = {
  id: string;
  name: string;
  sku: string;
  priceMinor: string;
  inventoryCount: string;
  size: string;
  color: string;
};

const emptyVariant = (): VariantDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  sku: '',
  priceMinor: '',
  inventoryCount: '',
  size: '',
  color: '',
});

const toMajorCurrency = (amountMinor: number) => (amountMinor / 100).toString();
const toMinorCurrency = (value: string) => Math.round(Number(value || 0) * 100);

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  eventId,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductType>('PHYSICAL');
  const [basePrice, setBasePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [inventoryTracked, setInventoryTracked] = useState(true);
  const [inventoryCount, setInventoryCount] = useState('');
  const [category, setCategory] = useState('');
  const [variants, setVariants] = useState<VariantDraft[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!product) {
      setName('');
      setDescription('');
      setProductType('PHYSICAL');
      setBasePrice('');
      setImageUrl('');
      setImageFileName('');
      setInventoryTracked(true);
      setInventoryCount('');
      setCategory('');
      setVariants([]);
      return;
    }

    setName(product.name);
    setDescription(product.description ?? '');
    setProductType(product.productType);
    setBasePrice(toMajorCurrency(product.basePriceMinor));
    setImageUrl(product.imageUrl ?? '');
    setImageFileName('');
    setInventoryTracked(product.inventoryTracked);
    setInventoryCount(product.inventoryCount?.toString() ?? '');
    setCategory(String(product.metadataJson?.category ?? ''));
    setVariants(
      product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku ?? '',
        priceMinor: toMajorCurrency(variant.priceMinor),
        inventoryCount: variant.inventoryCount?.toString() ?? '',
        size: String(variant.attributesJson?.size ?? ''),
        color: String(variant.attributesJson?.color ?? ''),
      })),
    );
  }, [isOpen, product]);

  if (!isOpen) {
    return null;
  }

  const canSubmit = name.trim().length >= 2 && toMinorCurrency(basePrice) >= 0;

  const updateVariant = (id: string, field: keyof VariantDraft, value: string) => {
    setVariants((current) =>
      current.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant)),
    );
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!eventId) {
      toast.error('No event selected for image upload.');
      return;
    }

    setIsUploadingImage(true);
    setImageFileName(file.name);

    void (async () => {
      try {
        const presign = await merchandiseService.presignMerchImageUpload(eventId, {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        });

        await merchandiseService.uploadMerchImageBinary(presign.uploadUrl, file, presign.headers);

        const finalized = await merchandiseService.finalizeMerchImageUpload(presign.assetId, {
          contentType: file.type,
          size: file.size,
        });

        setImageUrl(finalized.url);
        toast.success('Product image uploaded');
      } catch (error) {
        setImageFileName('');
        setImageUrl('');
        toast.error(error instanceof Error ? error.message : 'Image upload failed');
      } finally {
        setIsUploadingImage(false);
        event.target.value = '';
      }
    })();
  };

  const handleSave = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        product: {
          name: name.trim(),
          description: description.trim() || undefined,
          productType,
          basePriceMinor: toMinorCurrency(basePrice),
          inventoryTracked,
          inventoryCount: inventoryTracked ? Number(inventoryCount || 0) : undefined,
          imageUrl: imageUrl.trim() || undefined,
          metadataJson: category.trim() ? { category: category.trim() } : undefined,
        },
        variants: variants
          .filter((variant) => variant.name.trim().length >= 2)
          .map((variant) => ({
            name: variant.name.trim(),
            sku: variant.sku.trim() || undefined,
            priceMinor: toMinorCurrency(variant.priceMinor || basePrice),
            inventoryCount: inventoryTracked ? Number(variant.inventoryCount || 0) : undefined,
            attributesJson:
              variant.size || variant.color
                ? {
                    ...(variant.size ? { size: variant.size } : {}),
                    ...(variant.color ? { color: variant.color } : {}),
                  }
                : undefined,
          })),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/40 px-4 py-20 backdrop-blur-sm md:py-24">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative mx-auto my-0 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:max-h-[calc(100vh-10rem)] md:overflow-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 mt-4 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {product ? 'Edit product' : 'Create product'}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {product ? product.name : 'New merchandise product'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-8 p-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Munar T-Shirt" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product type</label>
              <select
                value={productType}
                onChange={(event) => setProductType(event.target.value as ProductType)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="PHYSICAL">Physical</option>
                <option value="DIGITAL">Digital</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Base price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(event) => setBasePrice(event.target.value)}
                placeholder="1500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Premium branded merchandise for your event."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product image</label>
              <label className="flex h-10 cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-input-background px-3 text-sm text-slate-500 transition-colors hover:border-indigo-400 dark:border-slate-700 dark:bg-input/30 dark:text-slate-400">
                <Upload className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="min-w-0 flex-1 truncate">
                  {isUploadingImage ? 'Uploading image...' : imageFileName || 'Choose a PNG, JPG, JPEG, or WEBP image'}
                </span>
                <span className="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Browse
                </span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                />
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use a clear square image for the best product preview.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Apparel" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Inventory</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Turn this on if you want to keep track of how many units are available.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInventoryTracked((value) => !value)}
                className={`relative h-6 w-12 rounded-full transition-colors ${inventoryTracked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${inventoryTracked ? 'left-7' : 'left-1'}`}
                />
              </button>
            </div>

            {inventoryTracked ? (
              <div className="mt-4 max-w-xs space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Inventory count</label>
                <Input
                  type="number"
                  min="0"
                  value={inventoryCount}
                  onChange={(event) => setInventoryCount(event.target.value)}
                  placeholder="200"
                />
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Variants</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add options like size or color if this product comes in multiple versions.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => [...current, emptyVariant()])}>
                <Plus className="mr-2 h-4 w-4" />
                Add variant
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {variants.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No variants added yet. Leave this empty if this product has just one version.
                </p>
              ) : null}

              {variants.map((variant) => (
                <div key={variant.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-5">
                  <Input
                    value={variant.name}
                    onChange={(event) => updateVariant(variant.id, 'name', event.target.value)}
                    placeholder="Large / Black"
                  />
                  <Input
                    value={variant.sku}
                    onChange={(event) => updateVariant(variant.id, 'sku', event.target.value)}
                    placeholder="SKU"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variant.priceMinor}
                    onChange={(event) => updateVariant(variant.id, 'priceMinor', event.target.value)}
                    placeholder="Price"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={variant.inventoryCount}
                    onChange={(event) => updateVariant(variant.id, 'inventoryCount', event.target.value)}
                    placeholder="Stock"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVariants((current) => current.filter((entry) => entry.id !== variant.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Input
                    value={variant.size}
                    onChange={(event) => updateVariant(variant.id, 'size', event.target.value)}
                    placeholder="Size"
                    className="md:col-span-2"
                  />
                  <Input
                    value={variant.color}
                    onChange={(event) => updateVariant(variant.id, 'color', event.target.value)}
                    placeholder="Color"
                    className="md:col-span-2"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-8 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isUploadingImage} className="h-11 px-5">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit || isSaving || isUploadingImage} className="h-11 px-5">
            {isSaving ? 'Saving...' : product ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
