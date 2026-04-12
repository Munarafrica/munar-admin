import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Download, Loader2, RefreshCw, Share2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useEvent } from '../contexts';
import { renderDpCoverVariant } from '../modules/dp-maker/canvas';
import { dpCoverMakerService } from '../modules/dp-maker/service';
import { DpCoverMakerConfig, DpCoverMakerVariantKey } from '../modules/dp-maker/types';

interface DPMakerPublicProps {
  onNavigate?: (page: any) => void;
}

const VALID_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const DPMakerPublic: React.FC<DPMakerPublicProps> = () => {
  const { eventSlug } = useParams<{ eventSlug?: string }>();
  const [searchParams] = useSearchParams();
  const { currentEvent } = useEvent();
  const previewEventId = searchParams.get('eventId');
  const slug = eventSlug || currentEvent?.slug || '';

  const [config, setConfig] = useState<DpCoverMakerConfig | null>(null);
  const [eventName, setEventName] = useState(currentEvent?.name || 'Event frame');
  const [variantKey, setVariantKey] = useState<DpCoverMakerVariantKey>('dp');
  const [attendeePhoto, setAttendeePhoto] = useState<string | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableVariants = useMemo(() => {
    if (!config) return [];
    return (['dp', 'cover'] as DpCoverMakerVariantKey[]).filter((key) => {
      const variant = key === 'cover' ? config.variants.cover : config.variants.dp;
      return Boolean(variant?.frameAsset?.url);
    });
  }, [config]);

  const activeVariant = config ? dpCoverMakerService.getVariant(config, variantKey) : null;

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      if (!slug && !previewEventId) return;
      setIsLoading(true);
      setError(null);

      try {
        if (previewEventId) {
          const result = await dpCoverMakerService.loadAdminConfig(previewEventId, currentEvent?.slug || slug || previewEventId);
          if (cancelled) return;
          setConfig(result.config);
          setEventName(currentEvent?.name || (slug ? slug.replace(/-/g, ' ') : 'Event frame'));
        } else {
          const result = await dpCoverMakerService.loadPublicConfig(slug);
          if (cancelled) return;
          setConfig(result.config);
          setEventName(result.event.title);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'This event frame is not available yet.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [currentEvent?.id, currentEvent?.name, currentEvent?.slug, previewEventId, slug]);

  useEffect(() => {
    if (availableVariants.length && !availableVariants.includes(variantKey)) {
      setVariantKey(availableVariants[0]);
    }
  }, [availableVariants, variantKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeVariant) return;
    renderDpCoverVariant(canvas, activeVariant, {
      attendeePhotoUrl: attendeePhoto,
      attendeeName,
      photoZoom,
      photoOffset,
    }).catch(() => toast.error('Could not render your preview'));
  }, [activeVariant, attendeeName, attendeePhoto, photoOffset, photoZoom]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!VALID_PHOTO_TYPES.includes(file.type)) {
      toast.error('Upload a PNG, JPG, or WEBP photo');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Photos must be 8MB or smaller');
      return;
    }

    setAttendeePhoto(URL.createObjectURL(file));
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  const getCanvasPoint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeVariant || !attendeePhoto) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    const photo = activeVariant.photoPlaceholder;
    const inPhoto = point.x >= photo.x && point.x <= photo.x + photo.width && point.y >= photo.y && point.y <= photo.y + photo.height;
    if (!inPhoto) return;
    setIsDraggingPhoto(true);
    setDragStart({ x: point.x - photoOffset.x, y: point.y - photoOffset.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingPhoto) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    setPhotoOffset({ x: point.x - dragStart.x, y: point.y - dragStart.y });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeVariant) return;
    const link = document.createElement('a');
    const safeName = (attendeeName || 'my').trim().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'my';
    link.download = `${safeName}-${activeVariant.label.toLowerCase()}-${eventName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!navigator.share) {
      handleDownload();
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'event-frame.png', { type: 'image/png' });
      try {
        await navigator.share({
          title: eventName,
          text: `My ${activeVariant?.label || 'event'} frame for ${eventName}`,
          files: [file],
        });
      } catch {
        handleDownload();
      }
    }, 'image/png');
  };

  const reset = () => {
    setAttendeeName('');
    setAttendeePhoto(null);
    setPhotoZoom(1);
    setPhotoOffset({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-['Raleway']">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading event frame...
        </div>
      </div>
    );
  }

  if (error || !config || !activeVariant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Raleway']">
        <div className="max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Event frame unavailable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {error || 'This event frame has not been published yet.'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Backend TODO: expose GET /api/public/events/:eventSlug/dp-cover-maker for unauthenticated attendee access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center p-4 md:p-8 font-['Raleway']">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create Your Event DP</h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 px-4">
            Upload your photo and personalize your display picture for {eventName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 md:gap-8">
          <section className="order-2 lg:order-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">Preview</h2>
              {availableVariants.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {availableVariants.map((key) => (
                    <button
                      key={key}
                      onClick={() => setVariantKey(key)}
                      className={cn('px-3 py-1.5 rounded-lg border text-xs font-semibold', variantKey === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300')}
                    >
                      {key === 'dp' ? 'DP' : 'Cover'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-2 md:p-4 flex justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg cursor-move touch-none bg-black"
                style={{ maxHeight: '560px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDraggingPhoto(false)}
                onMouseLeave={() => setIsDraggingPhoto(false)}
              />
            </div>

            {attendeePhoto && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">Photo Zoom</label>
                  <div className="flex gap-2">
                    <button onClick={() => setPhotoZoom(Math.max(0.5, photoZoom - 0.1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPhotoZoom(Math.min(3, photoZoom + 0.1))} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <input type="range" min="0.5" max="3" step="0.1" value={photoZoom} onChange={(event) => setPhotoZoom(Number(event.target.value))} className="w-full accent-indigo-600" />
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Drag your photo to reposition it inside the frame.</p>
              </div>
            )}
          </section>

          <aside className="order-1 lg:order-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">1. Upload Your Photo</h2>
              <input ref={fileInputRef} type="file" accept={VALID_PHOTO_TYPES.join(',')} onChange={handlePhotoUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant={attendeePhoto ? 'outline' : 'default'} className={cn('w-full gap-2', !attendeePhoto && 'bg-indigo-600 hover:bg-indigo-700 text-white')}>
                <Upload className="w-4 h-4" />
                {attendeePhoto ? 'Change Photo' : 'Choose Photo'}
              </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">2. Enter Your Name</h2>
              <input
                type="text"
                value={attendeeName}
                onChange={(event) => setAttendeeName(event.target.value.slice(0, 30))}
                placeholder={activeVariant.nameText.placeholder}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm md:text-base bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={30}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{attendeeName.length}/30 characters</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">3. Download & Share</h2>
              <div className="space-y-3">
                <Button onClick={handleDownload} disabled={!attendeePhoto || !attendeeName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  <Download className="w-4 h-4" />
                  Download {activeVariant.label}
                </Button>
                <Button onClick={handleShare} disabled={!attendeePhoto || !attendeeName.trim()} variant="outline" className="w-full gap-2 dark:bg-slate-800 dark:border-slate-700">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button onClick={reset} variant="ghost" className="w-full gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Start Over
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
