// Variant Builder Component for Products
import React, { useState, useEffect } from 'react';
import { ProductVariant, VariantOption } from '../../types/merchandise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { Plus, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface VariantBuilderProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  currency: string;
  className?: string;
}

// Common preset options
const PRESET_OPTIONS: Record<string, string[]> = {
  Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Color: ['Black', 'White', 'Navy', 'Red', 'Blue', 'Green'],
};

export const VariantBuilder: React.FC<VariantBuilderProps> = ({
  variants,
  onChange,
  basePrice,
  currency,
  className,
}) => {
  const [options, setOptions] = useState<VariantOption[]>([]);
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

  // Generate variant combinations when options change
  useEffect(() => {
    if (options.length === 0) {
      onChange([]);
      return;
    }

    // Generate all combinations
    const generateCombinations = (optionsList: VariantOption[]): Record<string, string>[] => {
      if (optionsList.length === 0) return [{}];
      
      const [first, ...rest] = optionsList;
      const restCombinations = generateCombinations(rest);
      
      const combinations: Record<string, string>[] = [];
      for (const value of first.values) {
        for (const restCombo of restCombinations) {
          combinations.push({
            [first.name]: value,
            ...restCombo,
          });
        }
      }
      return combinations;
    };

    const combinations = generateCombinations(options);
    
    // Create or update variants
    const newVariants: ProductVariant[] = combinations.map((attrs, index) => {
      const name = Object.values(attrs).join(' / ');
      const existingVariant = variants.find((v) => v.name === name);
      
      return {
        id: existingVariant?.id || `var-${Date.now()}-${index}`,
        productId: existingVariant?.productId || '',
        name,
        attributes: attrs,
        sku: existingVariant?.sku || '',
        price: existingVariant?.price,
        stock: existingVariant?.stock ?? 0,
        imageUrl: existingVariant?.imageUrl,
      };
    });

    onChange(newVariants);
  }, [options]);

  const addOption = () => {
    const usedNames = options.map((o) => o.name);
    const availablePresets = Object.keys(PRESET_OPTIONS).filter((p) => !usedNames.includes(p));
    const newName = availablePresets[0] || `Option ${options.length + 1}`;
    
    setOptions([
      ...options,
      {
        name: newName,
        values: PRESET_OPTIONS[newName] ? [PRESET_OPTIONS[newName][0]] : ['Value 1'],
      },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], name };
    setOptions(newOptions);
  };

  const addOptionValue = (optionIndex: number) => {
    const newOptions = [...options];
    const option = newOptions[optionIndex];
    const preset = PRESET_OPTIONS[option.name];
    const nextValue = preset
      ? preset.find((p) => !option.values.includes(p)) || `Value ${option.values.length + 1}`
      : `Value ${option.values.length + 1}`;
    
    newOptions[optionIndex] = {
      ...option,
      values: [...option.values, nextValue],
    };
    setOptions(newOptions);
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      values: newOptions[optionIndex].values.filter((_, i) => i !== valueIndex),
    };
    
    // Remove the option if no values left
    if (newOptions[optionIndex].values.length === 0) {
      setOptions(newOptions.filter((_, i) => i !== optionIndex));
    } else {
      setOptions(newOptions);
    }
  };

  const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      values: newOptions[optionIndex].values.map((v, i) => (i === valueIndex ? value : v)),
    };
    setOptions(newOptions);
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    onChange(variants.map((v) => (v.id === variantId ? { ...v, ...updates } : v)));
  };

  const toggleVariantExpanded = (variantId: string) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Options Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Variant Options
          </label>
          {options.length < 3 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
              className="gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          )}
        </div>

        {options.length === 0 ? (
          <div className="py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Add options like Size or Color to create variants
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Input
                    value={option.name}
                    onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                    placeholder="Option name (e.g., Size)"
                    className="flex-1 max-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(optionIndex)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {option.values.map((value, valueIndex) => (
                    <div
                      key={valueIndex}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                        className="w-20 text-sm bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optionIndex, valueIndex)}
                        className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(optionIndex)}
                    className="px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg transition-colors"
                  >
                    + Add Value
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Variant Details ({variants.length} variants)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Base price: {formatPrice(basePrice)}
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              <div className="col-span-4">Variant</div>
              <div className="col-span-3">Price Override</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-3">SKU</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {variants.map((variant) => (
                <div key={variant.id}>
                  <div
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => toggleVariantExpanded(variant.id)}
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      {expandedVariants.has(variant.id) ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {variant.name}
                      </span>
                    </div>
                    <div className="col-span-3 text-sm text-slate-600 dark:text-slate-300">
                      {variant.price ? formatPrice(variant.price) : 'Base price'}
                    </div>
                    <div className="col-span-2 text-sm text-slate-600 dark:text-slate-300">
                      {variant.stock}
                    </div>
                    <div className="col-span-3 text-sm text-slate-500 dark:text-slate-400 font-mono">
                      {variant.sku || '—'}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedVariants.has(variant.id) && (
                    <div
                      className="grid grid-cols-3 gap-4 px-4 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                          Price Override
                        </label>
                        <Input
                          type="number"
                          placeholder={`${basePrice}`}
                          value={variant.price || ''}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              price: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                          }
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Leave empty to use base price
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                          Stock Quantity
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                          SKU
                        </label>
                        <Input
                          placeholder="e.g., SHIRT-BLK-L"
                          value={variant.sku || ''}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              sku: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
