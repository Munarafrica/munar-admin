// Publish Modal
// Confirmation flow for publishing / unpublishing the event website

import React, { useState } from 'react';
import { Globe, Lock, AlertCircle, Check, ExternalLink, Copy, CheckCheck } from 'lucide-react';
import { WebsiteConfig } from '../../../modules/website/types';
import { cn } from '../../ui/utils';

interface PublishModalProps {
  config: WebsiteConfig;
  eventSlug: string;
  onPublish: () => void;
  onUnpublish: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function PublishModal({
  config,
  eventSlug,
  onPublish,
  onUnpublish,
  onClose,
  isLoading,
}: PublishModalProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/e/${eventSlug}`;
  const isPublished = config.status === 'published';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isPublished ? 'bg-amber-100 dark:bg-amber-950/50' : 'bg-emerald-100 dark:bg-emerald-950/50'
            )}>
              {isPublished ? (
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                {isPublished ? 'Unpublish Website' : 'Publish Website'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPublished ? 'Make the website private' : 'Make the website publicly accessible'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {isPublished ? (
            <>
              {/* Currently published state */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 mb-4 flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Your website is live</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Attendees can view your event website at the link below.
                  </p>
                </div>
              </div>

              {/* URL */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Public URL
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 font-medium overflow-hidden">
                  <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate flex-1">{publicUrl}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Copy link"
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Unpublishing will make your website inaccessible to attendees immediately.</p>
              </div>
            </>
          ) : (
            <>
              {/* Draft state - about to publish */}
              <div className="space-y-3 mb-5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Before publishing:</h3>

                {/* Checklist */}
                <div className="space-y-2">
                  {[
                    { label: 'Event name is set', checked: true },
                    { label: 'Hero section is visible', checked: config.sections.find(s => s.id === 'hero')?.visible ?? true },
                    { label: 'Website theme is configured', checked: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 text-sm">
                      <div className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                        item.checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      )}>
                        {item.checked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={item.checked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* URL preview */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Your website URL
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 overflow-hidden">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{publicUrl}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {isPublished ? (
            <button
              onClick={onUnpublish}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-sm hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Unpublishing...' : 'Unpublish'}
            </button>
          ) : (
            <button
              onClick={onPublish}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Publishing...'
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publish Website
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
