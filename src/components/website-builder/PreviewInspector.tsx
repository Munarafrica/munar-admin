import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, GripVertical, Monitor, Smartphone, Tablet, Type } from 'lucide-react';
import {
  EditableTextField,
  PreviewBreakpoint,
  SectionOverrides,
  TextStyle,
  TextStyleValues,
  WebsiteConfig,
  WebsitePreviewEditableSelectMessage,
} from '../../modules/website/types';

interface PreviewInspectorProps {
  config: WebsiteConfig;
  previewMode: PreviewBreakpoint;
  selection: WebsitePreviewEditableSelectMessage['selection'] | null;
  onUpdateConfig: (updates: Partial<WebsiteConfig>) => void;
  onClearSelection?: () => void;
}

const FONT_OPTIONS = ['Raleway', 'Montserrat', 'Playfair Display', 'Poppins', 'Lora'];
const WEIGHT_OPTIONS = ['400', '500', '600', '700', '800', '900'];
const ALIGN_OPTIONS: Array<NonNullable<TextStyleValues['textAlign']>> = ['left', 'center', 'right'];
const BREAKPOINT_OPTIONS: Array<{ id: PreviewBreakpoint; label: string; icon: React.ReactNode }> = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: 'tablet', label: 'Tablet', icon: <Tablet className="h-3.5 w-3.5" /> },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="h-3.5 w-3.5" /> },
];
const INSPECTOR_STORAGE_KEY = 'munar:website-builder:preview-inspector';
const DEFAULT_OPEN_GROUPS = {
  ordering: true,
  content: true,
  typography: true,
  position: true,
};

function getSection(config: WebsiteConfig, sectionId: string | undefined) {
  return config.sections.find((section) => section.id === sectionId);
}

function formatFieldLabel(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PreviewInspector({
  config,
  previewMode,
  selection,
  onUpdateConfig,
  onClearSelection,
}: PreviewInspectorProps) {
  const [editorBreakpoint, setEditorBreakpoint] = useState<PreviewBreakpoint>(previewMode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(352);
  const [isResizing, setIsResizing] = useState(false);
  const [openGroups, setOpenGroups] = useState(DEFAULT_OPEN_GROUPS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INSPECTOR_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        isCollapsed?: boolean;
        panelWidth?: number;
        openGroups?: Partial<typeof DEFAULT_OPEN_GROUPS>;
      };
      if (typeof parsed.isCollapsed === 'boolean') setIsCollapsed(parsed.isCollapsed);
      if (typeof parsed.panelWidth === 'number') {
        setPanelWidth(Math.max(280, Math.min(520, parsed.panelWidth)));
      }
      if (parsed.openGroups && typeof parsed.openGroups === 'object') {
        setOpenGroups((prev) => ({
          ...prev,
          ...parsed.openGroups,
        }));
      }
    } catch {
      // ignore persistence issues
    }
  }, []);

  useEffect(() => {
    setEditorBreakpoint(previewMode);
  }, [previewMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        INSPECTOR_STORAGE_KEY,
        JSON.stringify({ isCollapsed, panelWidth, openGroups })
      );
    } catch {
      // ignore persistence issues
    }
  }, [isCollapsed, panelWidth, openGroups]);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const nextWidth = Math.max(280, Math.min(520, window.innerWidth - event.clientX));
      setPanelWidth(nextWidth);
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
  }, [isResizing]);

  const selectedSection = useMemo(
    () => getSection(config, selection?.sectionId),
    [config, selection?.sectionId]
  );
  const overrides = selectedSection?.overrides || {};
  const styles = overrides.styles || {};
  const currentStyle = selection ? (styles[selection.field] || {}) : {};
  const editorStyle = useMemo<Partial<TextStyleValues>>(
    () => ({
      ...currentStyle,
      ...(editorBreakpoint === 'desktop' ? {} : currentStyle.responsive?.[editorBreakpoint]),
    }),
    [currentStyle, editorBreakpoint]
  );
  const currentValue = selection
    ? ((overrides[selection.field] as string | undefined) ?? selection.value)
    : '';
  const sectionLabel = selectedSection?.label || formatFieldLabel(selection?.sectionId || 'Section');
  const fieldLabel = formatFieldLabel(selection?.field || 'Field');
  const orderedElementIds = useMemo(() => {
    if (!selection?.defaultElementOrder?.length) return [];
    const saved = (overrides.elementOrder || []).filter((id) => selection.defaultElementOrder?.includes(id));
    const missing = selection.defaultElementOrder.filter((id) => !saved.includes(id));
    return [...saved, ...missing];
  }, [overrides.elementOrder, selection?.defaultElementOrder]);
  const hiddenElementIds = overrides.hiddenElementIds || [];
  const selectedElementHidden = !!selection?.elementId && hiddenElementIds.includes(selection.elementId);

  const updateSectionOverrides = (nextOverrides: SectionOverrides) => {
    if (!selection) return;
    onUpdateConfig({
      sections: config.sections.map((section) =>
        section.id === selection.sectionId ? { ...section, overrides: nextOverrides } : section
      ),
    });
  };

  const updateFieldValue = (value: string) => {
    if (!selection) return;
    updateSectionOverrides({
      ...overrides,
      [selection.field]: value,
    });
  };

  const updateStyle = (patch: Partial<TextStyle>) => {
    if (!selection) return;
    const fieldStyle = styles[selection.field] || {};

    const nextFieldStyle =
      editorBreakpoint === 'desktop'
        ? { ...fieldStyle, ...patch }
        : {
            ...fieldStyle,
            responsive: {
              ...(fieldStyle.responsive || {}),
              [editorBreakpoint]: {
                ...((fieldStyle.responsive || {})[editorBreakpoint] || {}),
                ...patch,
              },
            },
          };

    updateSectionOverrides({
      ...overrides,
      styles: {
        ...styles,
        [selection.field]: nextFieldStyle,
      },
    });
  };

  const nudge = (dx: number, dy: number) => {
    updateStyle({
      offsetX: (editorStyle.offsetX || 0) + dx,
      offsetY: (editorStyle.offsetY || 0) + dy,
    });
  };

  const reorderElements = (fromId: string, toId: string) => {
    if (!selection?.defaultElementOrder?.length || fromId === toId) return;
    const fromIndex = orderedElementIds.indexOf(fromId);
    const toIndex = orderedElementIds.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const nextOrder = [...orderedElementIds];
    const [moved] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, moved);
    updateSectionOverrides({
      ...overrides,
      elementOrder: nextOrder,
    });
  };
  const setElementHidden = (elementId: string, hidden: boolean) => {
    const nextHidden = hidden
      ? Array.from(new Set([...(overrides.hiddenElementIds || []), elementId]))
      : (overrides.hiddenElementIds || []).filter((id) => id !== elementId);

    updateSectionOverrides({
      ...overrides,
      hiddenElementIds: nextHidden,
    });

    if (hidden && selection?.elementId === elementId) {
      onClearSelection?.();
    }
  };

  const formatElementLabel = (id: string) => formatFieldLabel(id);
  const inputClassName = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
  const sectionCardClassName = 'rounded-2xl border border-slate-800 bg-slate-950/70 p-3';
  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const SectionGroup = ({
    title,
    groupKey,
    children,
  }: {
    title: string;
    groupKey: keyof typeof openGroups;
    children: React.ReactNode;
  }) => (
    <section className={sectionCardClassName}>
      <button
        type="button"
        onClick={() => toggleGroup(groupKey)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${openGroups[groupKey] ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      {openGroups[groupKey] ? <div className="mt-3 space-y-4">{children}</div> : null}
    </section>
  );

  if (isCollapsed) {
    return (
      <aside className="relative w-14 border-l border-slate-200 bg-white/95 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-4 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
          title="Expand inspector"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
            <Type className="h-4 w-4" />
          </div>
          {selection ? (
            <div className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600 [writing-mode:vertical-rl]">
              {fieldLabel}
            </div>
          ) : null}
        </div>
      </aside>
    );
  }

  if (!selection) {
    return (
      <aside className="relative border-l border-slate-800 bg-[#060816] text-white backdrop-blur-sm" style={{ width: panelWidth }}>
        <button
          type="button"
          onPointerDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          className="absolute inset-y-0 left-0 z-10 flex w-3 -translate-x-1/2 cursor-col-resize items-center justify-center"
          title="Resize inspector"
        >
          <span className="h-12 w-1 rounded-full bg-slate-300/80" />
        </button>
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Inspector
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  No Selection
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Pick any editable text or button in the preview to start editing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300 shadow-sm transition hover:border-indigo-300 hover:text-indigo-100"
                title="Collapse inspector"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-slate-900 p-4 text-slate-300">
              <Type className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">Select text in the preview</h3>
            <p className="mt-2 max-w-[16rem] text-sm text-slate-400">
              Click any editable heading, button, or paragraph to edit it from this inspector.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative border-l border-slate-800 bg-[#060816] text-white backdrop-blur-sm" style={{ width: panelWidth }}>
      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          setIsResizing(true);
        }}
        className="absolute inset-y-0 left-0 z-10 flex w-3 -translate-x-1/2 cursor-col-resize items-center justify-center"
        title="Resize inspector"
      >
        <span className="h-12 w-1 rounded-full bg-slate-300/80" />
      </button>
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300 shadow-sm transition hover:border-indigo-300 hover:text-indigo-100"
        title="Collapse inspector"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="border-b border-slate-800 bg-slate-950/80 px-4 py-4 pr-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              {sectionLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {selection.elementLabel || fieldLabel}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Edit content, typography, spacing, and ordering from one place.
            </p>
            {selectedElementHidden ? (
              <p className="mt-2 text-xs font-medium text-amber-300">
                This element is currently hidden from the canvas.
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-slate-900 p-1 ring-1 ring-slate-800">
          {BREAKPOINT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setEditorBreakpoint(option.id)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                editorBreakpoint === option.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[calc(100vh-3.5rem)] space-y-4 overflow-y-auto px-4 py-4">
        {orderedElementIds.length > 0 ? (
          <SectionGroup title="Ordering" groupKey="ordering">
            <p className="text-xs text-slate-400">
              Drag blocks to reorder this section. You can also hide any block from the website canvas here.
            </p>
            <div className="space-y-2">
              {orderedElementIds.map((id) => (
                <div
                  key={id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const fromId = event.dataTransfer.getData('text/plain');
                    if (fromId) reorderElements(fromId, id);
                  }}
                  className={`flex cursor-grab items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold ${
                    selection.elementId === id
                      ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                      : 'border-slate-700 bg-slate-900 text-slate-200'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{formatElementLabel(id)}</span>
                    {hiddenElementIds.includes(id) ? (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-300">
                        Hidden
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setElementHidden(id, !hiddenElementIds.includes(id));
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition ${
                        hiddenElementIds.includes(id)
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-slate-600 bg-slate-950 text-slate-300 hover:border-rose-400/40 hover:text-rose-200'
                      }`}
                    >
                      {hiddenElementIds.includes(id) ? 'Restore' : 'Hide'}
                    </button>
                    <GripVertical className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </SectionGroup>
        ) : null}

        <SectionGroup title="Content" groupKey="content">
          {selection.multiline ? (
            <textarea
              value={currentValue}
              rows={4}
              onChange={(event) => updateFieldValue(event.target.value)}
              className={inputClassName}
            />
          ) : (
            <input
              value={currentValue}
              onChange={(event) => updateFieldValue(event.target.value)}
              className={inputClassName}
            />
          )}
        </SectionGroup>

        <SectionGroup title="Typography" groupKey="typography">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Text Color</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2">
                <input
                  type="color"
                  value={editorStyle.color || '#111827'}
                  onChange={(event) => updateStyle({ color: event.target.value })}
                  className="h-8 w-10 rounded border border-slate-700 bg-transparent p-0"
                />
                <span className="text-xs font-medium text-slate-200">
                  {(editorStyle.color || '#111827').toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Font Size</label>
              <input
                value={editorStyle.fontSize || ''}
                onChange={(event) => updateStyle({ fontSize: event.target.value })}
                placeholder="32px"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Font Family</label>
              <select
                value={editorStyle.fontFamily || ''}
                onChange={(event) => updateStyle({ fontFamily: event.target.value || undefined })}
                className={inputClassName}
              >
                <option value="">Default</option>
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Font Weight</label>
              <select
                value={editorStyle.fontWeight || ''}
                onChange={(event) => updateStyle({ fontWeight: event.target.value || undefined })}
                className={inputClassName}
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
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Letter Spacing</label>
              <input
                value={editorStyle.letterSpacing || ''}
                onChange={(event) => updateStyle({ letterSpacing: event.target.value })}
                placeholder="0.02em"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-400">Line Height</label>
              <input
                value={editorStyle.lineHeight || ''}
                onChange={(event) => updateStyle({ lineHeight: event.target.value })}
                placeholder="1.2"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-2">
              {ALIGN_OPTIONS.map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateStyle({ textAlign: align })}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    editorStyle.textAlign === align
                      ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {formatFieldLabel(align)}
                </button>
              ))}
            </div>
          </div>
        </SectionGroup>

        <SectionGroup title="Position" groupKey="position">
          <div>
            <label className="mb-2 block text-[11px] font-semibold text-slate-400">Position Nudge</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => nudge(0, -8)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600">Move Up</button>
              <button type="button" onClick={() => nudge(0, 8)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600">Move Down</button>
              <button type="button" onClick={() => nudge(-8, 0)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600">Move Left</button>
              <button type="button" onClick={() => nudge(8, 0)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600">Move Right</button>
            </div>
          </div>
        </SectionGroup>
      </div>
    </aside>
  );
}
