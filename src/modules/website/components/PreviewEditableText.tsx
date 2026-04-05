import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { EditableTextField, PreviewBreakpoint, SectionId, SectionOverrides, TextStyle, TextStyleValues, WebsitePreviewEditableSelectMessage } from '../types';

interface PreviewEditableTextProps {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  sectionId: SectionId;
  elementId?: string;
  elementLabel?: string;
  defaultElementOrder?: string[];
  field: EditableTextField;
  value: string;
  multiline?: boolean;
  isPreviewMode?: boolean;
  activeBreakpoint?: PreviewBreakpoint;
  overrides?: SectionOverrides;
  onUpdate: (sectionId: SectionId, nextOverrides: SectionOverrides) => void;
}

const FONT_OPTIONS = ['Raleway', 'Montserrat', 'Playfair Display', 'Poppins', 'Lora'];
const WEIGHT_OPTIONS = ['400', '500', '600', '700', '800', '900'];
const ALIGN_OPTIONS: Array<TextStyle['textAlign']> = ['left', 'center', 'right'];
const BREAKPOINT_OPTIONS: Array<{ id: PreviewBreakpoint; label: string; icon: React.ReactNode }> = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet className="h-3.5 w-3.5" /> },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="h-3.5 w-3.5" /> },
];

function toStyleMap(overrides?: SectionOverrides): Partial<Record<EditableTextField, TextStyle>> {
  return overrides?.styles || {};
}

function getPortalDocument(): Document | null {
  if (typeof window === 'undefined') return null;
  try {
    if (window.parent && window.parent !== window) {
      return window.parent.document;
    }
  } catch {
    // Ignore cross-window access issues and fall back to local document.
  }
  return document;
}

export function PreviewEditableText({
  as = 'div',
  className,
  style,
  sectionId,
  elementId,
  elementLabel,
  defaultElementOrder,
  field,
  value,
  multiline,
  isPreviewMode,
  activeBreakpoint = 'desktop',
  overrides,
  onUpdate,
}: PreviewEditableTextProps) {
  const Tag = as as any;
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const resizeHandleRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [handlePos, setHandlePos] = useState({ top: 0, left: 0 });
  const [resizePos, setResizePos] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [editorBreakpoint, setEditorBreakpoint] = useState<PreviewBreakpoint>(activeBreakpoint);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);

  const stylesMap = toStyleMap(overrides);
  const textStyle = stylesMap[field] || {};
  const responsiveStyle = textStyle.responsive?.[activeBreakpoint] || {};
  const isBlockLike = as !== 'span';
  const isInlineButtonLabel = field === 'buttonText' && as === 'span';
  const normalizedElementOrder = useMemo(() => {
    if (!defaultElementOrder?.length) return [];
    const saved = (overrides?.elementOrder || []).filter((id) => defaultElementOrder.includes(id));
    const missing = defaultElementOrder.filter((id) => !saved.includes(id));
    return [...saved, ...missing];
  }, [defaultElementOrder, overrides?.elementOrder]);
  const elementIndex = elementId ? normalizedElementOrder.indexOf(elementId) : -1;
  const portalDocument = useMemo(() => getPortalDocument(), []);

  const renderedStyle = useMemo<React.CSSProperties>(() => ({
    ...style,
    color: responsiveStyle.color || textStyle.color || style?.color,
    fontSize: responsiveStyle.fontSize || textStyle.fontSize || style?.fontSize,
    fontFamily: responsiveStyle.fontFamily || textStyle.fontFamily || style?.fontFamily,
    fontWeight: responsiveStyle.fontWeight || textStyle.fontWeight || style?.fontWeight,
    textAlign: responsiveStyle.textAlign || textStyle.textAlign || style?.textAlign,
    letterSpacing: responsiveStyle.letterSpacing || textStyle.letterSpacing || style?.letterSpacing,
    lineHeight: responsiveStyle.lineHeight || textStyle.lineHeight || style?.lineHeight,
    backgroundColor: isInlineButtonLabel ? style?.backgroundColor : (responsiveStyle.backgroundColor || textStyle.backgroundColor || style?.backgroundColor),
    padding: isInlineButtonLabel ? style?.padding : (responsiveStyle.padding || textStyle.padding || style?.padding),
    borderRadius: isInlineButtonLabel ? style?.borderRadius : (responsiveStyle.borderRadius || textStyle.borderRadius || style?.borderRadius),
    maxWidth: isInlineButtonLabel ? style?.maxWidth : (responsiveStyle.maxWidth || textStyle.maxWidth || style?.maxWidth),
    marginTop: isInlineButtonLabel ? style?.marginTop : (responsiveStyle.marginTop || textStyle.marginTop || style?.marginTop),
    marginBottom: isInlineButtonLabel ? style?.marginBottom : (responsiveStyle.marginBottom || textStyle.marginBottom || style?.marginBottom),
    transform:
      !isInlineButtonLabel && (typeof (responsiveStyle.offsetX ?? textStyle.offsetX) === 'number' || typeof (responsiveStyle.offsetY ?? textStyle.offsetY) === 'number')
        ? `translate(${responsiveStyle.offsetX ?? textStyle.offsetX ?? 0}px, ${responsiveStyle.offsetY ?? textStyle.offsetY ?? 0}px)`
        : style?.transform,
    display: isBlockLike ? 'block' : 'inline-block',
    width: isBlockLike ? '100%' : undefined,
    cursor: isPreviewMode ? 'pointer' : style?.cursor,
  }), [style, textStyle, responsiveStyle, isBlockLike, isPreviewMode, isInlineButtonLabel]);

  const editorStyle = useMemo<Partial<TextStyleValues>>(
    () => ({
      ...textStyle,
      ...(editorBreakpoint === 'desktop' ? {} : textStyle.responsive?.[editorBreakpoint]),
    }),
    [editorBreakpoint, textStyle]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const doc = portalDocument || document;
    doc.addEventListener('mousedown', handlePointerDown);
    return () => doc.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, portalDocument]);

  const updatePanelPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    const panelEl = panelRef.current;
    if (!rect) return;

    const parentFrameRect = (() => {
      if (window.parent && window.parent !== window) {
        const frame = window.frameElement as HTMLElement | null;
        return frame?.getBoundingClientRect() || null;
      }
      return null;
    })();

    const offsetTop = parentFrameRect?.top || 0;
    const offsetLeft = parentFrameRect?.left || 0;
    const viewportWidth = parentFrameRect?.width || window.innerWidth;
    const viewportHeight = parentFrameRect?.height || window.innerHeight;

    const panelWidth = panelEl?.offsetWidth || 360;
    const panelHeight = panelEl?.offsetHeight || 520;
    const gutter = 16;

    const preferredLeft = offsetLeft + rect.left;
    const clampedLeft = Math.min(
      Math.max(gutter, preferredLeft),
      offsetLeft + viewportWidth - panelWidth - gutter
    );

    const spaceBelow = viewportHeight - rect.bottom;
    const placeAbove = spaceBelow < panelHeight + 24 && rect.top > panelHeight + 24;
    const preferredTop = placeAbove
      ? offsetTop + rect.top - panelHeight - 12
      : offsetTop + rect.bottom + 8;
    const clampedTop = Math.min(
      Math.max(offsetTop + gutter, preferredTop),
      offsetTop + viewportHeight - panelHeight - gutter
    );

    setPanelPos({
      top: clampedTop,
      left: clampedLeft,
    });
    setHandlePos({
      top: Math.max(offsetTop + gutter, offsetTop + rect.top - 14),
      left: Math.min(offsetLeft + rect.right - 14, offsetLeft + viewportWidth - 56),
    });
    setResizePos({
      top: Math.min(offsetTop + rect.bottom - 10, offsetTop + viewportHeight - 56),
      left: Math.min(offsetLeft + rect.right - 10, offsetLeft + viewportWidth - 56),
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();

    const handleWindowChange = () => updatePanelPosition();
    window.addEventListener('scroll', handleWindowChange, true);
    window.addEventListener('resize', handleWindowChange);
    return () => {
      window.removeEventListener('scroll', handleWindowChange, true);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [isOpen, textStyle.offsetX, textStyle.offsetY]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (!isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();
    if (window.parent && window.parent !== window) {
      const msg: WebsitePreviewEditableSelectMessage = {
        type: 'WEBSITE_PREVIEW_EDITABLE_SELECT',
        selection: {
          sectionId,
          field,
          value,
          multiline,
          elementId,
          elementLabel,
          defaultElementOrder,
        },
      };
      window.parent.postMessage(msg, '*');
      return;
    }
    updatePanelPosition();
    setIsOpen(true);
  };

  const handleOverrideUpdate = (patch: Partial<SectionOverrides>) => {
    onUpdate(sectionId, {
      ...(overrides || {}),
      ...patch,
      styles: {
        ...stylesMap,
        ...(patch.styles || {}),
      },
    });
  };

  const handleTextChange = (nextValue: string) => {
    handleOverrideUpdate({ [field]: nextValue } as Partial<SectionOverrides>);
  };

  const reorderElement = (direction: 'up' | 'down') => {
    if (!elementId || !defaultElementOrder?.length || elementIndex === -1) return;

    const targetIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
    if (targetIndex < 0 || targetIndex >= normalizedElementOrder.length) return;

    const nextOrder = [...normalizedElementOrder];
    const [item] = nextOrder.splice(elementIndex, 1);
    nextOrder.splice(targetIndex, 0, item);
    handleOverrideUpdate({ elementOrder: nextOrder });
  };

  const reorderElementToIndex = (fromId: string, toId: string) => {
    if (!defaultElementOrder?.length) return;
    if (fromId === toId) return;

    const fromIndex = normalizedElementOrder.indexOf(fromId);
    const toIndex = normalizedElementOrder.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const nextOrder = [...normalizedElementOrder];
    const [item] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, item);
    handleOverrideUpdate({ elementOrder: nextOrder });
  };

  const formatElementLabel = (id: string) => {
    if (id === elementId && elementLabel) return elementLabel;
    return id
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleStyleChange = (patch: Partial<TextStyle>) => {
    if (editorBreakpoint === 'desktop') {
    handleOverrideUpdate({
      styles: {
        ...stylesMap,
        [field]: {
          ...textStyle,
          ...patch,
        },
      },
    });
      return;
    }

    const currentResponsive = textStyle.responsive || {};
    const currentBreakpointStyle = currentResponsive[editorBreakpoint] || {};

    handleOverrideUpdate({
      styles: {
        ...stylesMap,
        [field]: {
          ...textStyle,
          responsive: {
            ...currentResponsive,
            [editorBreakpoint]: {
              ...currentBreakpointStyle,
              ...patch,
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const startX = editorStyle.offsetX || 0;
    const startY = editorStyle.offsetY || 0;
    let pointerOriginX = 0;
    let pointerOriginY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerOriginX === 0 && pointerOriginY === 0) {
        pointerOriginX = event.clientX;
        pointerOriginY = event.clientY;
        return;
      }

      const deltaX = event.clientX - pointerOriginX;
      const deltaY = event.clientY - pointerOriginY;
      handleStyleChange({
        offsetX: startX + deltaX,
        offsetY: startY + deltaY,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, editorStyle.offsetX, editorStyle.offsetY]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isResizing) return;

    const startWidth = triggerRef.current?.getBoundingClientRect().width || 0;
    const startFontSize = parseFloat(editorStyle.fontSize || '');
    let pointerOriginX = 0;
    let pointerOriginY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerOriginX === 0 && pointerOriginY === 0) {
        pointerOriginX = event.clientX;
        pointerOriginY = event.clientY;
        return;
      }

      const deltaX = event.clientX - pointerOriginX;
      const deltaY = event.clientY - pointerOriginY;

      if (isBlockLike) {
        const nextWidth = Math.max(80, Math.round(startWidth + deltaX));
        handleStyleChange({ maxWidth: `${nextWidth}px` });
      } else {
        const baseFontSize = Number.isFinite(startFontSize) ? startFontSize : 16;
        const nextFontSize = Math.max(10, Math.round(baseFontSize + deltaY / 3));
        handleStyleChange({ fontSize: `${nextFontSize}px` });
      }
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
  }, [isResizing, isBlockLike, editorStyle.fontSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const nudge = (dx: number, dy: number) => {
    handleStyleChange({
      offsetX: (editorStyle.offsetX || 0) + dx,
      offsetY: (editorStyle.offsetY || 0) + dy,
    });
  };

  useEffect(() => {
    setEditorBreakpoint(activeBreakpoint);
  }, [activeBreakpoint]);

  return (
    <>
      <Tag
        ref={triggerRef}
        className={className}
        style={renderedStyle}
        onClick={handleOpen}
        data-editable-text={field}
      >
        {value}
      </Tag>

      {isPreviewMode && isOpen && portalDocument
        ? createPortal(
        <>
          <button
            ref={dragHandleRef}
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDragging(true);
            }}
            className="fixed z-[2147483645] inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-lg"
            style={{ top: handlePos.top, left: handlePos.left }}
          >
            Drag
          </button>

          <button
            ref={resizeHandleRef}
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsResizing(true);
            }}
            className="fixed z-[2147483645] inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 shadow-lg"
            style={{ top: resizePos.top, left: resizePos.left }}
          >
            Resize
          </button>

          <div
            ref={panelRef}
            className="fixed z-[2147483646] w-[23rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            style={{ top: panelPos.top, left: panelPos.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Edit {field}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    x:{Math.round(editorStyle.offsetX || 0)} y:{Math.round(editorStyle.offsetY || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                  {editorBreakpoint}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 ring-1 ring-slate-200">
                {BREAKPOINT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setEditorBreakpoint(option.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                      editorBreakpoint === option.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[min(70vh,38rem)] space-y-3 overflow-y-auto px-4 py-4">
              {elementId && defaultElementOrder?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Element Order
                    </span>
                    <span className="text-xs text-slate-500">
                      {elementLabel || elementId}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">
                      Drag the handles to reorder elements inside this section.
                    </p>
                    {normalizedElementOrder.map((orderId) => {
                      const isCurrent = orderId === elementId;
                      const isDragged = orderId === draggedElementId;

                      return (
                        <div
                          key={orderId}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/plain', orderId);
                            setDraggedElementId(orderId);
                          }}
                          onDragEnd={() => setDraggedElementId(null)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const fromId = event.dataTransfer.getData('text/plain') || draggedElementId;
                            if (fromId) reorderElementToIndex(fromId, orderId);
                            setDraggedElementId(null);
                          }}
                          className={`flex cursor-grab items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition active:cursor-grabbing ${
                            isCurrent
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
                          } ${isDragged ? 'opacity-50' : ''}`}
                        >
                          <span>{formatElementLabel(orderId)}</span>
                          <span className="text-slate-400">::</span>
                        </div>
                      );
                    })}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => reorderElement('up')}
                        disabled={elementIndex <= 0}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Nudge Up
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderElement('down')}
                        disabled={elementIndex === -1 || elementIndex >= normalizedElementOrder.length - 1}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Nudge Down
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">Text</label>
                {multiline ? (
                  <textarea
                    value={value}
                    rows={3}
                    onChange={(event) => handleTextChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(event) => handleTextChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Color</label>
                  <input
                    type="color"
                    value={editorStyle.color || '#111827'}
                    onChange={(event) => handleStyleChange({ color: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white p-1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Size</label>
                  <input
                    value={editorStyle.fontSize || ''}
                    onChange={(event) => handleStyleChange({ fontSize: event.target.value })}
                    placeholder="32px"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Font</label>
                  <select
                    value={editorStyle.fontFamily || ''}
                    onChange={(event) => handleStyleChange({ fontFamily: event.target.value || undefined })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="">Default</option>
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Weight</label>
                  <select
                    value={editorStyle.fontWeight || ''}
                    onChange={(event) => handleStyleChange({ fontWeight: event.target.value || undefined })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  >
                    <option value="">Default</option>
                    {WEIGHT_OPTIONS.map((weight) => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Letter spacing</label>
                  <input
                    value={editorStyle.letterSpacing || ''}
                    onChange={(event) => handleStyleChange({ letterSpacing: event.target.value })}
                    placeholder="0.02em"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Line height</label>
                  <input
                    value={editorStyle.lineHeight || ''}
                    onChange={(event) => handleStyleChange({ lineHeight: event.target.value })}
                    placeholder="1.2"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Max width</label>
                  <input
                    value={editorStyle.maxWidth || ''}
                    onChange={(event) => handleStyleChange({ maxWidth: event.target.value })}
                    placeholder={isBlockLike ? '640px' : 'auto'}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Padding</label>
                  <input
                    value={editorStyle.padding || ''}
                    onChange={(event) => handleStyleChange({ padding: event.target.value })}
                    placeholder="8px 12px"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Background</label>
                  <input
                    type="color"
                    value={editorStyle.backgroundColor || '#ffffff'}
                    onChange={(event) => handleStyleChange({ backgroundColor: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white p-1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Radius</label>
                  <input
                    value={editorStyle.borderRadius || ''}
                    onChange={(event) => handleStyleChange({ borderRadius: event.target.value })}
                    placeholder="12px"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Margin top</label>
                  <input
                    value={editorStyle.marginTop || ''}
                    onChange={(event) => handleStyleChange({ marginTop: event.target.value })}
                    placeholder="0px"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Margin bottom</label>
                  <input
                    value={editorStyle.marginBottom || ''}
                    onChange={(event) => handleStyleChange({ marginBottom: event.target.value })}
                    placeholder="16px"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALIGN_OPTIONS.map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleStyleChange({ textAlign: align })}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        editorStyle.textAlign === align
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">Nudge</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => nudge(0, -8)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Up</button>
                  <button type="button" onClick={() => nudge(-8, 0)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Left</button>
                  <button type="button" onClick={() => nudge(8, 0)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Right</button>
                  <button type="button" onClick={() => nudge(0, 8)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Down</button>
                  <button
                    type="button"
                    onClick={() => handleStyleChange({
                      offsetX: 0,
                      offsetY: 0,
                    })}
                    className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500"
                  >
                    Reset positioning
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleStyleChange({
                  color: undefined,
                  fontSize: undefined,
                  fontFamily: undefined,
                  fontWeight: undefined,
                  textAlign: undefined,
                  letterSpacing: undefined,
                  lineHeight: undefined,
                  backgroundColor: undefined,
                  padding: undefined,
                  borderRadius: undefined,
                  maxWidth: undefined,
                  marginTop: undefined,
                  marginBottom: undefined,
                  offsetX: 0,
                  offsetY: 0,
                })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              >
                Reset {editorBreakpoint === 'desktop' ? 'base' : editorBreakpoint} text styles
              </button>
            </div>
          </div>
        </>,
        portalDocument.body
      )
        : null}
    </>
  );
}
