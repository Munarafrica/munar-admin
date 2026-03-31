// Account Profile settings tab
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import {
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  User as UserIcon,
} from 'lucide-react';

export const AccountProfileTab: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone('');
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    if (!user) return;
    const changed =
      firstName !== (user.firstName || '') ||
      lastName !== (user.lastName || '') ||
      email !== (user.email || '') ||
      avatarPreview !== user.avatarUrl;
    setHasChanges(changed);
  }, [user, firstName, lastName, email, avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG or JPG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUrl: avatarPreview,
      });
      setSavedMessage('Profile updated successfully');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone('');
      setAvatarPreview(user.avatarUrl);
      setError(null);
      setSavedMessage(null);
    }
  };

  const initials = user
    ? `${(user.firstName || user.email[0] || '').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase()
    : '?';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Account Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal account information
        </p>
      </div>

      {/* Status messages */}
      {savedMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {savedMessage}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0 w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-200 dark:ring-slate-700 overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Change profile photo"
            >
              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload profile photo"
            />
          </div>
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PNG or JPG. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Personal info section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          <div className="relative">
            <Input
              label="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="relative">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Changing email requires verification confirmation
          </p>
        </div>

        <div className="relative">
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            Optional. Used for account recovery.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
