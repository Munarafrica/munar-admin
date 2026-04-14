import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Sponsor, CreateSponsorRequest } from '../../types/sponsors';
import { SingleImageField } from '../website-builder/SingleImageField';
import { WebsiteAssetRef } from '../../modules/website/types';

interface SponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateSponsorRequest) => Promise<void> | void;
  initialData?: Sponsor | null;
  eventId?: string;
}

export const SponsorModal: React.FC<SponsorModalProps> = ({ open, onOpenChange, onSave, initialData, eventId }) => {
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>('');
  const [logo, setLogo] = useState<WebsiteAssetRef | undefined>();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLogoUrl(initialData.logoUrl || '');
      setLogo(initialData.logo);
      setWebsiteUrl(initialData.websiteUrl || '');
      setDescription(initialData.description || '');
      setVisible(initialData.visible);
      setError(null);
    } else {
      setName('');
      setLogoUrl('');
      setLogo(undefined);
      setWebsiteUrl('');
      setDescription('');
      setVisible(true);
      setError(null);
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!logoUrl) {
      setError('Logo is required');
      return;
    }

    setError(null);
    await onSave({
      name: name.trim(),
      logoUrl,
      logo,
      websiteUrl: websiteUrl.trim() || undefined,
      description: description.trim() || undefined,
      visible,
    });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 transition-colors p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{initialData ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload the sponsor logo and details. Use a 430x215 image for best quality.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sponsor name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short tagline or copy (optional)"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Visibility</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hide or show this sponsor on the public page</p>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo *</label>
              <SingleImageField
                value={logoUrl}
                onChange={setLogoUrl}
                asset={logo}
                onAssetChange={setLogo}
                eventId={eventId}
                aspectRatio="landscape"
                category="logo"
                maxSizeMB={4}
                placeholder="Click to upload logo"
                altText={name.trim() ? `${name.trim()} logo` : undefined}
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                acceptedMimeTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                typeHint="JPG, JPEG, PNG, WebP"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Recommended: 430x215 JPG, JPEG, PNG, or WebP with transparent background where supported.</p>
            </div>

            {logoUrl && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Preview</p>
                <div className="h-28 rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-3">
                  <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:border-slate-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {initialData ? 'Save changes' : 'Add sponsor'}
          </Button>
        </div>
      </div>
    </div>
  );
};
