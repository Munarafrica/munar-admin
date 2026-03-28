// Image Uploader Component for Products
import React, { useState, useRef } from 'react';
import { ProductImage } from '../../types/merchandise';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Upload, X, Star, GripVertical, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 3,
  className,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ProductImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: e.target?.result as string,
          isFeatured: images.length === 0, // First image is featured by default
          order: images.length,
        };
        onChange([...images, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    // If we removed the featured image, make the first one featured
    if (newImages.length > 0 && !newImages.some((img) => img.isFeatured)) {
      newImages[0].isFeatured = true;
    }
    // Reorder
    newImages.forEach((img, idx) => {
      img.order = idx;
    });
    onChange(newImages);
  };

  const setFeatured = (id: string) => {
    const newImages = images.map((img) => ({
      ...img,
      isFeatured: img.id === id,
    }));
    onChange(newImages);
  };

  const handleImageDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, draggedImage);
    newImages.forEach((img, idx) => {
      img.order = idx;
    });
    setDragIndex(index);
    onChange(newImages);
  };

  const handleImageDragEnd = () => {
    setDragIndex(null);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Product Images
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleImageDragStart(index)}
            onDragOver={(e) => handleImageDragOver(e, index)}
            onDragEnd={handleImageDragEnd}
            className={cn(
              'relative aspect-square rounded-lg border-2 overflow-hidden group cursor-move',
              image.isFeatured
                ? 'border-amber-400 dark:border-amber-500'
                : 'border-slate-200 dark:border-slate-700',
              dragIndex === index && 'opacity-50'
            )}
          >
            <img
              src={image.url}
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setFeatured(image.id)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  image.isFeatured
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/90 text-slate-700 hover:bg-amber-500 hover:text-white'
                )}
                title={image.isFeatured ? 'Featured image' : 'Set as featured'}
              >
                <Star className="w-4 h-4" fill={image.isFeatured ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Featured Badge */}
            {image.isFeatured && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-md flex items-center gap-1">
                <Star className="w-3 h-3" fill="currentColor" />
                Featured
              </div>
            )}

            {/* Drag Handle */}
            <div className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-slate-800/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        ))}

        {/* Upload Area */}
        {canAddMore && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
              dragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            )}
          >
            <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-2" />
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center px-2">
              Click or drag to upload
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {images.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'py-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
            <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Upload product images
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag & drop or click to browse. Max {maxImages} images.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        The featured image (marked with ★) will be shown in product listings. Drag images to reorder.
      </p>
    </div>
  );
};
