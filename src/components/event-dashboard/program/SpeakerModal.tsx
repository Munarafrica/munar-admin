import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Speaker } from '../types';
import { X, Upload, User, Briefcase, Link as LinkIcon, Linkedin, Twitter, Globe, Star, Loader2 } from 'lucide-react';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner@2.0.3';

interface SpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (speaker: Partial<Speaker>) => void | Promise<void>;
  speaker?: Speaker;
}

export const SpeakerModal: React.FC<SpeakerModalProps> = ({ isOpen, onClose, onSave, speaker }) => {
  const [formData, setFormData] = useState<Partial<Speaker>>({
    name: '',
    role: '',
    organization: '',
    bio: '',
    categories: [],
    isFeatured: false,
    linkedInUrl: '',
    twitterUrl: '',
    websiteUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (speaker) {
      setFormData(speaker);
      setImagePreview(speaker.imageUrl || null);
    } else {
      setFormData({
        name: '',
        role: '',
        organization: '',
        bio: '',
        categories: [],
        isFeatured: false,
        linkedInUrl: '',
        twitterUrl: '',
        websiteUrl: '',
      });
      setImagePreview(null);
    }
  }, [speaker, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      toast.error("Name and Role are required");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ ...formData, imageUrl: imagePreview || undefined });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {speaker ? 'Edit Speaker' : 'Add Speaker'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="speaker-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload & Basic Info Group */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Image Upload */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Profile Photo
                </label>
                <div 
                  className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors relative overflow-hidden group"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <User className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Basic Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Job Title / Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g. Chief Product Officer"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={e => setFormData({...formData, organization: e.target.value})}
                    placeholder="e.g. TechCorp Inc."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Short biography..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">Social Profiles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedInUrl}
                    onChange={e => setFormData({...formData, linkedInUrl: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Twitter className="w-3 h-3" /> Twitter / X
                  </label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={e => setFormData({...formData, twitterUrl: e.target.value})}
                    placeholder="https://twitter.com/..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Website
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Admin Settings */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Featured Speaker
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Highlight this speaker on the event homepage</p>
              </div>
              <Switch 
                checked={formData.isFeatured} 
                onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})} 
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
          <Button variant="ghost" onClick={onClose} type="button" disabled={isSaving}>Cancel</Button>
          <Button type="submit" form="speaker-form" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />{speaker ? 'Saving...' : 'Creating...'}</>
            ) : (
              speaker ? 'Save Changes' : 'Create Speaker'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
