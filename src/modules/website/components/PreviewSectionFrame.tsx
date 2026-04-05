import React, { useEffect, useMemo, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, MoveHorizontal, PanelBottom, PanelTop, Rows3 } from 'lucide-react';
import { SectionId, SectionOverrides } from '../types';

interface PreviewSectionFrameProps {
  sectionId: SectionId;
  isPreviewMode?: boolean;
  isSelected?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  overrides?: SectionOverrides;
  onSelect?: (sectionId: SectionId) => void;
  onUpdate?: (sectionId: SectionId, overrides: SectionOverrides) => void;
  onReorder?: (sectionId: SectionId, direction: 'up' | 'down') => void;
  children: React.ReactNode;
}

function pxStep(value: string | undefined, delta: number, fallback: number) {
  const current = Number.parseInt(value || '', 10);
  const next = Number.isFinite(current) ? current + delta : fallback + delta;
  return `${Math.max(0, next)}px`;
}

export function PreviewSectionFrame({
  sectionId,
  isPreviewMode,
  isSelected,
  canMoveUp,
  canMoveDown,
  overrides,
  onSelect,
  onUpdate,
  onReorder,
  children,
}: PreviewSectionFrameProps) {
  const layout = overrides?.layout || {};
  const [isResizing, setIsResizing] = useState(false);

  const updateLayout = (patch: NonNullable<SectionOverrides['layout']>) => {
    onUpdate?.(sectionId, {
      ...(overrides || {}),
      layout: {
        ...layout,
        ...patch,
      },
    });
  };

  const contentWidthLabel = useMemo(() => {
    const raw = layout.contentMaxWidth;
    if (!raw) return 'Auto';
    return raw;
  }, [layout.contentMaxWidth]);

  useEffect(() => {
    if (!isResizing) return;

    const root = document.querySelector(`[data-preview-section="${sectionId}"]`);
    const rect = root?.getBoundingClientRect();
    const startWidth = Number.parseInt(layout.contentMaxWidth || '', 10);
    const fallbackWidth = rect ? Math.round(rect.width - 64) : 960;
    const initialWidth = Number.isFinite(startWidth) ? startWidth : fallbackWidth;
    let pointerOriginX = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerOriginX === 0) {
        pointerOriginX = event.clientX;
        return;
      }

      const deltaX = event.clientX - pointerOriginX;
      const nextWidth = Math.max(320, Math.round(initialWidth + deltaX));
      updateLayout({ contentMaxWidth: `${nextWidth}px` });
    };

    const handlePointerUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing, layout.contentMaxWidth, sectionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative"
      data-preview-section={sectionId}
      style={{
        ...(layout.backgroundColor ? { backgroundColor: layout.backgroundColor } : {}),
        ...(overrides?.backgroundImage?.url
          ? {
              backgroundImage: `url("${overrides.backgroundImage.url}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}),
      }}
      onClick={() => {
        if (isPreviewMode) onSelect?.(sectionId);
      }}
    >
      {children}

      {isPreviewMode && isSelected && (
        <div className="pointer-events-none absolute inset-3 z-20 rounded-3xl border-2 border-dashed border-indigo-400/80 bg-indigo-500/5 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]" />
      )}

      {isPreviewMode && isSelected && (
        <div className="absolute right-5 top-5 z-30 flex max-w-[calc(100%-2.5rem)] flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <Rows3 className="h-3 w-3" />
            Section Layout
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {sectionId}
          </span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReorder?.(sectionId, 'up');
            }}
            disabled={!canMoveUp}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Move Up
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReorder?.(sectionId, 'down');
            }}
            disabled={!canMoveDown}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Move Down
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateLayout({
                paddingTop: pxStep(layout.paddingTop, -12, 64),
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <PanelTop className="h-3.5 w-3.5" />
            Less Top Space
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateLayout({
                paddingTop: pxStep(layout.paddingTop, 12, 64),
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <PanelTop className="h-3.5 w-3.5" />
            More Top Space
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateLayout({
                paddingBottom: pxStep(layout.paddingBottom, -12, 64),
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <PanelBottom className="h-3.5 w-3.5" />
            Less Bottom Space
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateLayout({
                paddingBottom: pxStep(layout.paddingBottom, 12, 64),
              });
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <PanelBottom className="h-3.5 w-3.5" />
            More Bottom Space
          </button>

          <div className="ml-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {[
              { value: 'left', icon: <AlignLeft className="h-3.5 w-3.5" /> },
              { value: 'center', icon: <AlignCenter className="h-3.5 w-3.5" /> },
              { value: 'right', icon: <AlignRight className="h-3.5 w-3.5" /> },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  updateLayout({
                    contentAlign: option.value as NonNullable<SectionOverrides['layout']>['contentAlign'],
                  });
                }}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                  (layout.contentAlign || 'center') === option.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                {option.icon}
              </button>
            ))}
          </div>

          <button
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setIsResizing(true);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
          >
            <MoveHorizontal className="h-3.5 w-3.5" />
            Content Width {contentWidthLabel}
          </button>

          <label
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
            onClick={(event) => event.stopPropagation()}
          >
            Section Color
            <input
              type="color"
              value={layout.backgroundColor || '#ffffff'}
              onChange={(event) => {
                event.stopPropagation();
                updateLayout({
                  backgroundColor: event.target.value,
                });
              }}
              className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-0"
            />
          </label>

          {layout.backgroundColor ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                updateLayout({
                  backgroundColor: undefined,
                });
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
            >
              Clear Section Color
            </button>
          ) : null}
        </div>
      )}

      {isPreviewMode && isSelected && (
        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setIsResizing(true);
          }}
          className="absolute bottom-5 right-5 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xl transition hover:border-indigo-300 hover:text-indigo-700"
          title="Drag to resize section content width"
        >
          <MoveHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
