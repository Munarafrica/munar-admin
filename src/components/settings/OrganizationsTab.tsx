// Organizations settings tab — list, create, edit, branding
import React, { useState, useEffect, useCallback } from 'react';
import { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../../types/settings';
import * as settingsService from '../../services/settings.service';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ImageUploader } from '../ui/ImageUploader';
import { cn } from '../ui/utils';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Globe,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Palette,
  Mail,
  ChevronDown,
} from 'lucide-react';

// ─── Preset color swatches ───────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#6366F1', '#8B5CF6', '#A855F7', '#EC4899', '#EF4444',
  '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#059669',
  '#14B8A6', '#06B6D4', '#3B82F6', '#2563EB', '#1D4ED8',
  '#475569',
];

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => { setHexInput(value); }, [value]);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map(c => (
          <button
            key={c}
            onClick={() => { onChange(c); setHexInput(c); }}
            className={cn(
              'w-7 h-7 rounded-lg border-2 transition-all hover:scale-110',
              value === c
                ? 'border-slate-900 dark:border-white scale-110 shadow-md'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600',
            )}
            style={{ backgroundColor: c }}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={e => handleHexChange(e.target.value)}
          placeholder="#6366F1"
          maxLength={7}
          className="w-28 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
};

// ─── Organization Modal ──────────────────────────────────────────────────────
interface OrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
  onSave: (data: CreateOrganizationRequest | UpdateOrganizationRequest, id?: string) => Promise<void>;
  isSaving: boolean;
}

const OrgModal: React.FC<OrgModalProps> = ({ isOpen, onClose, organization, onSave, isSaving }) => {
  const isEdit = !!organization;
  const [name, setName] = useState('');
  const [type, setType] = useState<'individual' | 'organization'>('organization');
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [emailSenderName, setEmailSenderName] = useState('');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setType(organization.type);
      setLogoUrl(organization.logoUrl);
      setCountry(organization.country || '');
      setWebsite(organization.website || '');
      setBusinessAddress(organization.businessAddress || '');
      setPrimaryColor(organization.primaryColor);
      setSecondaryColor(organization.secondaryColor);
      setEmailSenderName(organization.defaultEmailSenderName || '');
    } else {
      setName('');
      setType('organization');
      setLogoUrl(undefined);
      setCountry('');
      setWebsite('');
      setBusinessAddress('');
      setPrimaryColor('#6366F1');
      setSecondaryColor('#8B5CF6');
      setEmailSenderName('');
    }
  }, [organization, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && organization) {
      await onSave({
        name: name.trim(),
        logoUrl,
        country: country.trim() || undefined,
        website: website.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        primaryColor,
        secondaryColor,
        defaultEmailSenderName: emailSenderName.trim() || undefined,
      } as UpdateOrganizationRequest, organization.id);
    } else {
      await onSave({
        name: name.trim(),
        type,
        logoUrl,
        country: country.trim() || undefined,
        website: website.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
      } as CreateOrganizationRequest);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? 'Edit Organization' : 'Create Organization'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <Input
              label="Organization Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tech Summit Africa"
              required
            />

            {!isEdit && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Organization Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['individual', 'organization'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'px-4 py-3 rounded-xl border text-sm font-medium transition-colors text-left',
                        type === t
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600',
                      )}
                    >
                      {t === 'individual' ? 'Individual' : 'Organization'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Organization Logo</label>
              <ImageUploader
                value={logoUrl}
                onChange={setLogoUrl}
                aspectRatio="square"
                maxSizeMB={5}
                maxWidth="max-w-[160px]"
                placeholder="Upload organization logo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Country"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. Nigeria"
              />
              <Input
                label="Website"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <Input
              label="Business Address"
              value={businessAddress}
              onChange={e => setBusinessAddress(e.target.value)}
              placeholder="15 Admiralty Way, Lekki Phase 1, Lagos"
            />
          </div>

          {/* Branding (only in edit mode to keep creation simple) */}
          {isEdit && (
            <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Brand Colors</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
                <ColorPicker label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Email Settings</h4>
              </div>
              <Input
                label="Default Email Sender Name"
                value={emailSenderName}
                onChange={e => setEmailSenderName(e.target.value)}
                placeholder="e.g. Tech Summit Africa"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Create Organization'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
export const OrganizationsTab: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getOrganizations();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrganizations(); }, [loadOrganizations]);

  const handleSave = async (data: CreateOrganizationRequest | UpdateOrganizationRequest, id?: string) => {
    setIsSaving(true);
    try {
      if (id) {
        await settingsService.updateOrganization(id, data as UpdateOrganizationRequest);
        setSuccessMessage('Organization updated successfully');
      } else {
        await settingsService.createOrganization(data as CreateOrganizationRequest);
        setSuccessMessage('Organization created successfully');
      }
      setIsModalOpen(false);
      setEditingOrg(null);
      await loadOrganizations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrg) return;
    setIsDeleting(true);
    try {
      await settingsService.deleteOrganization(deletingOrg.id);
      setDeletingOrg(null);
      setSuccessMessage('Organization deleted');
      await loadOrganizations();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreate = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Organizations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organizations under your account
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Status messages */}
      {successMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto" aria-label="Dismiss error">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization list */}
      {!isLoading && organizations.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">No organizations yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Create your first organization to get started</p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
      )}

      {!isLoading && organizations.length > 0 && (
        <div className="space-y-3">
          {organizations.map(org => (
            <div
              key={org.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
                  style={{ backgroundColor: org.primaryColor }}
                >
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt={org.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    org.name.charAt(0)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {org.name}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide shrink-0',
                      org.type === 'organization'
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
                    )}>
                      {org.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {org.country && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {org.country}
                      </span>
                    )}
                    {org.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {org.website.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(org.createdAt)}
                    </span>
                    <span>{org.eventsCount} event{org.eventsCount !== 1 ? 's' : ''}</span>
                  </div>
                  {/* Brand colors preview */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: org.primaryColor }} />
                    <div className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: org.secondaryColor }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(org)}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label={`Edit ${org.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingOrg(org)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    aria-label={`Delete ${org.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <OrgModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingOrg(null); }}
        organization={editingOrg}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      {deletingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingOrg(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Organization</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong>{deletingOrg.name}</strong>?
              This will remove all associated events and data. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingOrg(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete Organization'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
