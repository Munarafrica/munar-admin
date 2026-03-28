// Contestant Modal - Create/Edit contestants
import React, { useState, useEffect } from 'react';
import { Contestant, CreateContestantRequest } from '../../types/voting';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ImageUploader } from '../ui/ImageUploader';
import { X, User, Check } from 'lucide-react';

interface ContestantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateContestantRequest) => Promise<void>;
  contestant?: Contestant;
  categoryId: string;
}

export const ContestantModal: React.FC<ContestantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contestant,
  categoryId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateContestantRequest>({
    name: '',
    bio: '',
    imageUrl: '',
    socialLinks: {},
  });

  useEffect(() => {
    if (contestant) {
      setFormData({
        name: contestant.name,
        bio: contestant.bio || '',
        imageUrl: contestant.imageUrl || '',
        socialLinks: contestant.socialLinks || {},
      });
    } else {
      setFormData({
        name: '',
        bio: '',
        imageUrl: '',
        socialLinks: {},
      });
    }
  }, [contestant, isOpen]);

  const handleChange = (field: keyof CreateContestantRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageData: string | undefined) => {
    handleChange('imageUrl', imageData || '');
  };

  const handleSocialChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save contestant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-transparent dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {contestant ? 'Edit Contestant' : 'Add Contestant'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Photo
            </label>
            <div className="w-32 mx-auto">
              <ImageUploader
                value={formData.imageUrl}
                onChange={handleImageChange}
                aspectRatio="square"
                maxSizeMB={5}
                placeholder="Upload photo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief description or background..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Social Links (Optional)
            </label>
            <div className="space-y-2">
              <Input
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="Instagram URL"
                className="w-full"
              />
              <Input
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="Twitter/X URL"
                className="w-full"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172B]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="dark:bg-slate-900 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {contestant ? 'Save Changes' : 'Add Contestant'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
