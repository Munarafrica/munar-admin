import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Circle,
  Copy,
  ExternalLink,
  Eye,
  Hexagon,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Menu,
  Save,
  Square,
  Star,
  Upload,
  X,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';

import { TopBar } from '../components/dashboard/TopBar';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useEvent } from '../contexts';
import { useEventId } from '../lib/navigation';
import { eventsService } from '../services';
import { EventSettings } from '../types/api';
import { renderDpCoverVariant } from '../modules/dp-maker/canvas';
import { dpCoverMakerService } from '../modules/dp-maker/service';
import {
  createDefaultDpCoverMakerConfig,
  DpCoverMakerConfig,
  DpCoverMakerShape,
  DpCoverMakerTextAlign,
  DpCoverMakerVariant,
  DpCoverMakerVariantKey,
} from '../modules/dp-maker/types';

type SelectedElement = 'photo' | 'text';
type Step = 'upload' | 'configure' | 'preview';

interface DPMakerAdminProps {
  onNavigate?: (page: any) => void;
}

const VALID_FRAME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_FRAME_SIZE = 8 * 1024 * 1024;

const shapes: Array<{ value: DpCoverMakerShape; icon: React.ReactNode; label: string }> = [
  { value: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
  { value: 'square', icon: <Square className="w-4 h-4" />, label: 'Square' },
  {
    value: 'rounded',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>,
    label: 'Rounded',
  },
  { value: 'hexagon', icon: <Hexagon className="w-4 h-4" />, label: 'Hexagon' },
  { value: 'star', icon: <Star className="w-4 h-4" />, label: 'Star' },
  { value: 'heart', icon: <Heart className="w-4 h-4" />, label: 'Heart' },
];

const fontFamilies = ['Raleway', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'];

const cloneVariant = (variant: DpCoverMakerVariant): DpCoverMakerVariant => ({
  ...variant,
  canvas: { ...variant.canvas },
  frameAsset: variant.frameAsset ? { ...variant.frameAsset } : null,
  photoPlaceholder: { ...variant.photoPlaceholder },
  nameText: { ...variant.nameText },
});

const getAbsoluteShareUrl = (sharePath: string) => {
  if (typeof window === 'undefined') return sharePath;
  return `${window.location.origin}${sharePath}`;
};

export const DPMakerAdmin: React.FC<DPMakerAdminProps> = ({ onNavigate }) => {
  const eventId = useEventId();
  const navigate = useNavigate();
  const { currentEvent } = useEvent();
  const eventSlug = currentEvent?.slug || eventId || 'event';

  const [step, setStep] = useState<Step>('upload');
  const [variantKey, setVariantKey] = useState<DpCoverMakerVariantKey>('dp');
  const [config, setConfig] = useState<DpCoverMakerConfig>(() => createDefaultDpCoverMakerConfig(eventSlug));
  const [existingSettings, setExistingSettings] = useState<EventSettings | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<DpCoverMakerVariantKey, File>>>({});
  const [selectedElement, setSelectedElement] = useState<SelectedElement>('photo');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dragState, setDragState] = useState<null | { mode: 'drag-photo' | 'resize-photo' | 'drag-text'; offsetX: number; offsetY: number }>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeVariant = variantKey === 'cover' ? config.variants.cover ?? config.variants.dp : config.variants.dp;
  const hasFrame = Boolean(activeVariant.frameAsset?.url);
  const shareUrl = useMemo(() => getAbsoluteShareUrl(`/events/${eventSlug}/dp`), [eventSlug]);

  const updateVariant = (updater: (variant: DpCoverMakerVariant) => DpCoverMakerVariant) => {
    setConfig((current) => {
      const currentVariant = variantKey === 'cover' ? current.variants.cover ?? current.variants.dp : current.variants.dp;
      const nextVariant = updater(cloneVariant(currentVariant));
      return {
        ...current,
        variants: {
          ...current.variants,
          [variantKey]: nextVariant,
        },
      };
    });
  };

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      if (!eventId) return;
      setIsLoading(true);
      try {
        const result = await dpCoverMakerService.loadAdminConfig(eventId, eventSlug);
        if (cancelled) return;
        setExistingSettings(result.settings);
        setConfig(result.config);
        setStep(result.config.variants.dp.frameAsset ? 'configure' : 'upload');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load DP maker settings');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [eventId, eventSlug]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderDpCoverVariant(canvas, activeVariant, {
      frameUrlOverride: activeVariant.frameAsset?.url,
      attendeeName: 'Sample Name',
      drawEditorGuides: step !== 'preview',
      selectedElement,
    }).catch(() => {
      if (!cancelled) toast.error('Could not render frame preview');
    });
    return () => {
      cancelled = true;
    };
  }, [activeVariant, selectedElement, step]);

  const getCanvasPoint = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    const photo = activeVariant.photoPlaceholder;
    const text = activeVariant.nameText;
    const inPhoto = point.x >= photo.x && point.x <= photo.x + photo.width && point.y >= photo.y && point.y <= photo.y + photo.height;
    const inResizeHandle = point.x >= photo.x + photo.width - 28 && point.x <= photo.x + photo.width + 28 && point.y >= photo.y + photo.height - 28 && point.y <= photo.y + photo.height + 28;
    const inText = point.x >= text.x && point.x <= text.x + text.width && point.y >= text.y && point.y <= text.y + text.height;

    if (inResizeHandle) {
      setSelectedElement('photo');
      setDragState({ mode: 'resize-photo', offsetX: 0, offsetY: 0 });
      return;
    }
    if (inPhoto) {
      setSelectedElement('photo');
      setDragState({ mode: 'drag-photo', offsetX: point.x - photo.x, offsetY: point.y - photo.y });
      return;
    }
    if (inText) {
      setSelectedElement('text');
      setDragState({ mode: 'drag-text', offsetX: point.x - text.x, offsetY: point.y - text.y });
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState) return;
    const point = getCanvasPoint(event);
    if (!point) return;

    updateVariant((variant) => {
      if (dragState.mode === 'resize-photo') {
        variant.photoPlaceholder.width = Math.max(50, Math.round(point.x - variant.photoPlaceholder.x));
        variant.photoPlaceholder.height = Math.max(50, Math.round(point.y - variant.photoPlaceholder.y));
      } else if (dragState.mode === 'drag-photo') {
        variant.photoPlaceholder.x = Math.round(point.x - dragState.offsetX);
        variant.photoPlaceholder.y = Math.round(point.y - dragState.offsetY);
      } else {
        variant.nameText.x = Math.round(point.x - dragState.offsetX);
        variant.nameText.y = Math.round(point.y - dragState.offsetY);
      }
      return variant;
    });
  };

  const handleFrameUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!VALID_FRAME_TYPES.includes(file.type)) {
      toast.error('Upload PNG, JPG, WEBP, or SVG frames only');
      return;
    }
    if (file.size > MAX_FRAME_SIZE) {
      toast.error('Frame uploads must be 8MB or smaller');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingFiles((current) => ({ ...current, [variantKey]: file }));
    updateVariant((variant) => ({
      ...variant,
      frameAsset: {
        assetId: `local-${Date.now()}`,
        url: objectUrl,
        mimeType: file.type,
      },
    }));
    setStep('configure');
    toast.success(`${activeVariant.label} frame ready to preview`);
  };

  const handleSave = async () => {
    if (!eventId) {
      toast.error('No event selected');
      return;
    }

    if (!config.variants.dp.frameAsset && !pendingFiles.dp) {
      toast.error('Upload a DP frame before publishing');
      return;
    }

    setIsSaving(true);
    try {
      const nextConfig: DpCoverMakerConfig = {
        ...config,
        variants: {
          dp: cloneVariant(config.variants.dp),
          cover: config.variants.cover ? cloneVariant(config.variants.cover) : undefined,
        },
      };

      for (const key of ['dp', 'cover'] as DpCoverMakerVariantKey[]) {
        const file = pendingFiles[key];
        if (!file) continue;
        const uploaded = await dpCoverMakerService.uploadFrame(eventId, file);
        const targetVariant = key === 'cover' ? nextConfig.variants.cover : nextConfig.variants.dp;
        if (targetVariant) targetVariant.frameAsset = uploaded;
      }

      const saved = await dpCoverMakerService.saveConfig(eventId, eventSlug, nextConfig, existingSettings);
      setConfig(saved);
      setPendingFiles({});
      eventsService.updateModuleCount(eventId, 'DP & Cover Maker', 1, 'DP & Cover Maker published', 'image');
      toast.success('Event frame published');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish event frame');
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const openPreview = () => {
    const previewPath = `/events/${eventSlug}/dp?preview=1&eventId=${encodeURIComponent(eventId)}`;
    navigate(previewPath);
  };

  const widthLabel = activeVariant.label === 'DP' ? '1080x1080 recommended' : '1640x924 recommended';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <button onClick={() => onNavigate?.('event-dashboard')} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-1">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Configure Event Frame</h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create a custom frame for attendees to generate branded profile pictures
              </p>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 max-w-[360px]">
                <LinkIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate" title={shareUrl}>{shareUrl}</span>
                <button onClick={copyLink} className="p-1 hover:text-indigo-500" title="Copy link"><Copy className="w-4 h-4" /></button>
                <button onClick={openPreview} className="p-1 hover:text-indigo-500" title="Open preview"><ExternalLink className="w-4 h-4" /></button>
              </div>
              <Button variant="outline" size="sm" onClick={openPreview} className="dark:bg-slate-900 dark:border-slate-800 gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStep('preview')} variant="outline" size="sm" className="gap-2 dark:bg-slate-900 dark:border-slate-800">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isLoading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Publish
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            ['upload', '1. Upload', <Upload className="w-4 h-4" />],
            ['configure', '2. Position', <Circle className="w-4 h-4" />],
            ['preview', '3. Preview', <Eye className="w-4 h-4" />],
          ].map(([key, label, icon]) => (
            <button
              key={key as string}
              onClick={() => setStep(key as Step)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-sm',
                step === key
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300'
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400',
              )}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 md:gap-6">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm">
            {isLoading ? (
              <div className="min-h-[430px] flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading frame editor...
              </div>
            ) : !hasFrame && step === 'upload' ? (
              <div className="flex flex-col items-center justify-center min-h-[430px] md:min-h-[520px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                <Upload className="w-14 h-14 text-slate-400 mb-4" />
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Upload Event Frame</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md px-4">
                  Upload a {activeVariant.label === 'DP' ? 'square' : 'landscape'} image ({widthLabel}). Transparent PNGs work best for overlays.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  <Upload className="w-4 h-4" />
                  Choose Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">Canvas Preview</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activeVariant.canvas.width} x {activeVariant.canvas.height}px</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Change Frame
                  </Button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-2 md:p-4 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-slate-300 dark:border-slate-700 rounded-lg cursor-move bg-black"
                    style={{ maxHeight: '68vh' }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={() => setDragState(null)}
                    onMouseLeave={() => setDragState(null)}
                  />
                </div>
                <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-3 text-xs md:text-sm text-blue-900 dark:text-blue-100">
                  Click the photo placeholder or name text, then drag it on the canvas. Drag the photo handle to resize it.
                </div>
              </div>
            )}
          </section>

          <aside>
            <button onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)} className="lg:hidden w-full mb-4 bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-between font-medium">
              <span>Element Controls</span>
              {isMobilePanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className={cn('bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm space-y-6 lg:block', isMobilePanelOpen ? 'block' : 'hidden')}>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm md:text-base">Element Controls</h3>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {(['dp', 'cover'] as DpCoverMakerVariantKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setVariantKey(key)}
                      className={cn('px-3 py-2 rounded-lg border text-xs font-semibold transition-all', variantKey === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-200 bg-white text-slate-600 dark:bg-slate-800 dark:border-slate-700')}
                    >
                      {key === 'dp' ? 'DP' : 'Cover'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Photo Placeholder</label>
                  <Button size="sm" variant={selectedElement === 'photo' ? 'default' : 'outline'} onClick={() => setSelectedElement('photo')} className={cn('text-xs h-8', selectedElement === 'photo' && 'bg-indigo-600 text-white')}>
                    Select
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Shape</label>
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map((shape) => (
                      <button
                        key={shape.value}
                        onClick={() => updateVariant((variant) => ({ ...variant, photoPlaceholder: { ...variant.photoPlaceholder, shape: shape.value } }))}
                        className={cn('flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all', activeVariant.photoPlaceholder.shape === shape.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700')}
                      >
                        {shape.icon}
                        <span className="text-[11px] font-medium">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(['width', 'height'] as const).map((field) => (
                    <div className="space-y-1" key={field}>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">{field}</label>
                      <input
                        type="number"
                        min={1}
                        value={Math.round(activeVariant.photoPlaceholder[field])}
                        onChange={(event) => updateVariant((variant) => ({ ...variant, photoPlaceholder: { ...variant.photoPlaceholder, [field]: Math.max(1, Number(event.target.value) || 1) } }))}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name Text</label>
                  <Button size="sm" variant={selectedElement === 'text' ? 'default' : 'outline'} onClick={() => setSelectedElement('text')} className={cn('text-xs h-8', selectedElement === 'text' && 'bg-indigo-600 text-white')}>
                    Select
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Size</label>
                  <input
                    type="range"
                    min="16"
                    max="96"
                    value={activeVariant.nameText.fontSize}
                    onChange={(event) => updateVariant((variant) => ({ ...variant, nameText: { ...variant.nameText, fontSize: Number(event.target.value) } }))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="text-xs text-slate-500 text-right">{activeVariant.nameText.fontSize}px</div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Family</label>
                  <select
                    value={activeVariant.nameText.fontFamily}
                    onChange={(event) => updateVariant((variant) => ({ ...variant, nameText: { ...variant.nameText, fontFamily: event.target.value } }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                  >
                    {fontFamilies.map((font) => <option key={font} value={font}>{font}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(activeVariant.nameText.color) ? activeVariant.nameText.color : '#ffffff'}
                      onChange={(event) => updateVariant((variant) => ({ ...variant, nameText: { ...variant.nameText, color: event.target.value } }))}
                      className="w-12 h-10 rounded border border-slate-200 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      value={activeVariant.nameText.color}
                      onChange={(event) => updateVariant((variant) => ({ ...variant, nameText: { ...variant.nameText, color: event.target.value } }))}
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as DpCoverMakerTextAlign[]).map((align) => (
                      <button
                        key={align}
                        onClick={() => updateVariant((variant) => ({ ...variant, nameText: { ...variant.nameText, align } }))}
                        className={cn('px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all', activeVariant.nameText.align === align ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700')}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <input ref={fileInputRef} type="file" accept={VALID_FRAME_TYPES.join(',')} onChange={handleFrameUpload} className="hidden" />
    </div>
  );
};
