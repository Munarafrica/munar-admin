// Product Modal - Add/Edit Product
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Product,
  ProductType,
  ProductImage,
  ProductVariant,
  FulfilmentType,
  DigitalFile,
  CreateProductRequest,
} from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageUploader } from './ImageUploader';
import { VariantBuilder } from './VariantBuilder';
import { cn } from '../ui/utils';
import {
  X,
  Package,
  FileDigit,
  Upload,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Mail,
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: CreateProductRequest) => Promise<void>;
  product?: Product; // For editing
  eventCurrency?: string;
}

type Step = 'basic' | 'variants' | 'fulfilment' | 'rules';

const STEPS: { id: Step; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'variants', label: 'Variants & Inventory' },
  { id: 'fulfilment', label: 'Fulfilment' },
  { id: 'rules', label: 'Purchase Rules' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  eventCurrency = 'NGN',
}) => {
  const isEditing = !!product;
  
  // Form State
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  // Basic Info
  const [productType, setProductType] = useState<ProductType>('physical');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);

  // Digital Product
  const [digitalFile, setDigitalFile] = useState<DigitalFile | null>(null);
  const [digitalDeliveryMethod, setDigitalDeliveryMethod] = useState<'email' | 'download' | 'dashboard'>('email');

  // Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [unlimitedInventory, setUnlimitedInventory] = useState(false);
  const [totalStock, setTotalStock] = useState<number>(0);

  // Fulfilment
  const [fulfilmentTypes, setFulfilmentTypes] = useState<FulfilmentType[]>(['pickup']);

  // Rules
  const [minQuantity, setMinQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(10);
  const [maxPerUser, setMaxPerUser] = useState<number | undefined>();
  const [ticketHoldersOnly, setTicketHoldersOnly] = useState(false);
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  // Initialize form when editing
  useEffect(() => {
    if (product) {
      setProductType(product.type);
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setSku(product.sku || '');
      setCategory(product.category || '');
      setTags(product.tags);
      setImages(product.images);
      setHasVariants(product.hasVariants);
      setVariants(product.variants);
      setUnlimitedInventory(product.unlimitedInventory);
      setTotalStock(product.totalStock);
      setFulfilmentTypes(product.fulfilmentTypes);
      setMinQuantity(product.minQuantity);
      setMaxQuantity(product.maxQuantity);
      setMaxPerUser(product.maxPerUser);
      setTicketHoldersOnly(product.ticketHoldersOnly);
      setRequiresAccessCode(product.requiresAccessCode);
      setAccessCode(product.accessCode || '');
      if (product.type === 'digital') {
        setDigitalDeliveryMethod(product.digitalDeliveryMethod || 'email');
        setDigitalFile(product.digitalFile || null);
      }
    }
  }, [product]);

  // Track changes
  useEffect(() => {
    if (name || description || price > 0 || images.length > 0) {
      setHasChanges(true);
    }
  }, [name, description, price, images, variants, hasVariants]);

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseWarning(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowCloseWarning(false);
    setHasChanges(false);
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDigitalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDigitalFile({
        id: `file-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
      });
    }
  };

  const toggleFulfilmentType = (type: FulfilmentType) => {
    if (fulfilmentTypes.includes(type)) {
      if (fulfilmentTypes.length > 1) {
        setFulfilmentTypes(fulfilmentTypes.filter((t) => t !== type));
      }
    } else {
      setFulfilmentTypes([...fulfilmentTypes, type]);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'basic':
        return name.trim() && price > 0;
      case 'variants':
        return !hasVariants || variants.length > 0;
      case 'fulfilment':
        return fulfilmentTypes.length > 0;
      case 'rules':
        return true;
      default:
        return false;
    }
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const goPrev = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const productData: CreateProductRequest = {
        type: productType,
        name,
        description,
        images: images.map((img) => img.url),
        price,
        currency: eventCurrency,
        sku: sku || undefined,
        category: category || undefined,
        tags,
        hasVariants,
        variants: hasVariants
          ? variants.map((v) => ({
              name: v.name,
              attributes: v.attributes,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              imageUrl: v.imageUrl,
            }))
          : undefined,
        unlimitedInventory,
        totalStock: hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : totalStock,
        minQuantity,
        maxQuantity,
        maxPerUser,
        ticketHoldersOnly,
        requiresAccessCode,
        accessCode: requiresAccessCode ? accessCode : undefined,
        fulfilmentTypes: productType === 'digital' ? ['digital'] : fulfilmentTypes,
        digitalDeliveryMethod: productType === 'digital' ? digitalDeliveryMethod : undefined,
      };

      await onSave(productData);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-transparent dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {STEPS.find((s) => s.id === currentStep)?.label}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(step.id)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  currentStep === step.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                    currentStep === step.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Step */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              {/* Product Type Toggle */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                  Product Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setProductType('physical')}
                    className={cn(
                      'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      productType === 'physical'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        productType === 'physical'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      )}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Physical</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        T-shirts, merch, etc.
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType('digital')}
                    className={cn(
                      'flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      productType === 'digital'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        productType === 'digital'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      )}
                    >
                      <FileDigit className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-slate-100">Digital</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PDFs, videos, files
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name & Description */}
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Product Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Event T-Shirt"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Price & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Price ({eventCurrency}) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price || ''}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    SKU
                  </label>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g., SHIRT-001"
                  />
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Apparel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag..."
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {productType === 'physical' && (
                <ImageUploader images={images} onChange={setImages} maxImages={3} />
              )}

              {/* Digital File Upload */}
              {productType === 'digital' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Digital File
                    </label>
                    {digitalFile ? (
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <FileDigit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {digitalFile.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatFileSize(digitalFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDigitalFile(null)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Click to upload file
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          PDF, ZIP, MP4, etc.
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleDigitalFileUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Delivery Method
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDigitalDeliveryMethod('email')}
                        className={cn(
                          'flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all',
                          digitalDeliveryMethod === 'email'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        )}
                      >
                        Email Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDigitalDeliveryMethod('download')}
                        className={cn(
                          'flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all',
                          digitalDeliveryMethod === 'download'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        )}
                      >
                        Download Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Variants Step */}
          {currentStep === 'variants' && (
            <div className="space-y-6">
              {productType === 'physical' && (
                <>
                  {/* Has Variants Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        This product has variants
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Add options like size, color, etc.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasVariants(!hasVariants)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        hasVariants ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                          hasVariants ? 'left-7' : 'left-1'
                        )}
                      />
                    </button>
                  </div>

                  {hasVariants ? (
                    <VariantBuilder
                      variants={variants}
                      onChange={setVariants}
                      basePrice={price}
                      currency={eventCurrency}
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Unlimited Inventory Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            Unlimited inventory
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Don't track stock quantity
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUnlimitedInventory(!unlimitedInventory)}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            unlimitedInventory ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                              unlimitedInventory ? 'left-7' : 'left-1'
                            )}
                          />
                        </button>
                      </div>

                      {!unlimitedInventory && (
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Stock Quantity
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={totalStock}
                            onChange={(e) => setTotalStock(parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {productType === 'digital' && (
                <div className="text-center py-12">
                  <FileDigit className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Digital products have unlimited inventory by default.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fulfilment Step */}
          {currentStep === 'fulfilment' && (
            <div className="space-y-6">
              {productType === 'physical' ? (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select how customers can receive this product.
                  </p>

                  <div className="space-y-3">
                    {/* Pickup */}
                    <button
                      type="button"
                      onClick={() => toggleFulfilmentType('pickup')}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                        fulfilmentTypes.includes('pickup')
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-xl',
                          fulfilmentTypes.includes('pickup')
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        )}
                      >
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Event Pickup
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Customers pick up at the event venue. Identity verification required.
                        </p>
                      </div>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          fulfilmentTypes.includes('pickup')
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-slate-300 dark:border-slate-600'
                        )}
                      >
                        {fulfilmentTypes.includes('pickup') && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10.28 2.28L4 8.56 1.72 6.28a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l7-7a.75.75 0 00-1.06-1.06z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Identity Verification
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          For pickup orders, you'll need to verify the customer's identity before
                          fulfilling. This can be done via ticket QR code, email, or ID.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                    <div className="p-3 bg-indigo-500 text-white rounded-xl">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900 dark:text-indigo-100">
                        Automatic Digital Delivery
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        The file will be sent to the customer's email automatically after purchase.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rules Step */}
          {currentStep === 'rules' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set purchase limits and access restrictions.
              </p>

              {/* Quantity Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Min Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Max Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Max Per User (optional)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={maxPerUser || ''}
                  onChange={(e) =>
                    setMaxPerUser(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="No limit"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Limit how many of this product a single user can purchase
                </p>
              </div>

              {/* Access Restrictions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Ticket holders only
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Only users with a ticket can purchase
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTicketHoldersOnly(!ticketHoldersOnly)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      ticketHoldersOnly ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        ticketHoldersOnly ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Require access code
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Users need a code to see/purchase this product
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequiresAccessCode(!requiresAccessCode)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      requiresAccessCode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        requiresAccessCode ? 'left-7' : 'left-1'
                      )}
                    />
                  </button>
                </div>

                {requiresAccessCode && (
                  <div className="ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Access Code
                    </label>
                    <Input
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentStep === 'basic'}
            className="gap-2"
          >
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep === 'rules' ? (
              <Button
                onClick={handleSave}
                disabled={!canGoNext() || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[120px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Add Product'
                )}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={!canGoNext()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Close Warning Modal */}
      {showCloseWarning && (
        <>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCloseWarning(false)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Discard changes?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You have unsaved changes. Are you sure you want to close without saving?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCloseWarning(false)}>
                Keep Editing
              </Button>
              <Button
                onClick={confirmClose}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Discard
              </Button>
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  );
};
