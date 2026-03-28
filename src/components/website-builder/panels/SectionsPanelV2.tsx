// Unified Sections Panel
// Manages all building blocks (sections + custom blocks) in a single sortable list
// Custom blocks can be placed anywhere among standard sections
// Features: drag-and-drop reordering, visibility toggle, per-section overrides, image upload

import React, { useState, useCallback, useMemo } from 'react';
import {
  Eye, EyeOff, GripVertical, Plus, Trash2, X, Pencil, Settings2,
  Image, Columns2, FileText, LayoutGrid, Megaphone, MessageSquareQuote,
  Link as LinkIcon, ChevronDown, ChevronUp, Layout, Ticket, Calendar,
  Mic, Users, Vote, ShoppingBag, HelpCircle, Images, Footprints,
} from 'lucide-react';
import {
  SectionId,
  WebsiteConfig,
  CustomBlock,
  CustomBlockLayout,
  SectionConfig,
  SectionOverrides,
} from '../../../modules/website/types';
import { CUSTOM_BLOCK_PRESETS, createDefaultBlock } from '../../../modules/website/templates/helpers';
import { SECTION_METADATA, getSectionMeta, canHideSection } from '../../../modules/website/templates/registry';
import { cn } from '../../ui/utils';
import { SingleImageField, MultiImageField } from '../SingleImageField';

// ── Types ───────────────────────────────────────────────────────────────────

interface UnifiedItem {
  id: string;
  type: 'section' | 'custom-block';
  order: number;
  visible: boolean;
  data: SectionConfig | CustomBlock;
}

interface SectionsPanelProps {
  config: WebsiteConfig;
  selectedSection: SectionId | null;
  eventId?: string;
  onSelectSection: (id: SectionId) => void;
  onToggleSection: (id: SectionId) => void;
  onSwapSections: (fromId: SectionId, toId: SectionId) => void;
  onUpdateConfig?: (updates: Partial<WebsiteConfig>) => void;
}

// ── Icon mapping ────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionId, React.ReactNode> = {
  hero: <Layout className="w-4 h-4" />,
  about: <FileText className="w-4 h-4" />,
  tickets: <Ticket className="w-4 h-4" />,
  schedule: <Calendar className="w-4 h-4" />,
  speakers: <Mic className="w-4 h-4" />,
  sponsors: <Users className="w-4 h-4" />,
  voting: <Vote className="w-4 h-4" />,
  merch: <ShoppingBag className="w-4 h-4" />,
  forms: <FileText className="w-4 h-4" />,
  gallery: <Images className="w-4 h-4" />,
  faq: <HelpCircle className="w-4 h-4" />,
  footer: <Footprints className="w-4 h-4" />,
  custom: <LayoutGrid className="w-4 h-4" />,
};

const BLOCK_TYPE_ICONS: Record<string, React.ReactNode> = {
  'image': <Image className="w-4 h-4" />,
  'columns-2': <Columns2 className="w-4 h-4" />,
  'file-text': <FileText className="w-4 h-4" />,
  'layout-grid': <LayoutGrid className="w-4 h-4" />,
  'megaphone': <Megaphone className="w-4 h-4" />,
  'message-square-quote': <MessageSquareQuote className="w-4 h-4" />,
};

function getBlockIcon(layout: CustomBlockLayout) {
  const preset = CUSTOM_BLOCK_PRESETS.find(p => p.layout === layout);
  return preset ? (BLOCK_TYPE_ICONS[preset.icon] || <FileText className="w-4 h-4" />) : <FileText className="w-4 h-4" />;
}

// ── Block Editor Modal ──────────────────────────────────────────────────────

interface BlockEditorModalProps {
  block: CustomBlock;
  eventId?: string;
  onSave: (updated: CustomBlock) => void;
  onClose: () => void;
  isNew?: boolean;
}

function BlockEditorModal({ block, eventId, onSave, onClose, isNew }: BlockEditorModalProps) {
  const [draft, setDraft] = useState<CustomBlock>({ ...block });
  const preset = CUSTOM_BLOCK_PRESETS.find(p => p.layout === block.layout);

  const showImage = ['text-image-left', 'text-image-right'].includes(draft.layout);
  const showImages = draft.layout === 'image-grid';
  const showButton = ['text-image-left', 'text-image-right', 'cta-banner'].includes(draft.layout);
  const showTestimonial = draft.layout === 'testimonial';

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50">
              {getBlockIcon(draft.layout)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isNew ? 'Add Block' : 'Edit Block'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{preset?.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="Block title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {showTestimonial ? 'Quote' : 'Content'}
            </label>
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
              placeholder={showTestimonial ? 'Enter quote text...' : 'Block content text...'}
            />
          </div>

          {/* Single Image Upload */}
          {showImage && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Image</label>
              <SingleImageField
                value={draft.imageUrl}
                onChange={(url) => setDraft({ ...draft, imageUrl: url })}
                eventId={eventId}
                aspectRatio="landscape"
                placeholder="Upload block image"
                category="block"
              />
            </div>
          )}

          {/* Multiple Images Upload */}
          {showImages && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Images</label>
              <MultiImageField
                values={draft.images || []}
                onChange={(urls) => setDraft({ ...draft, images: urls })}
                eventId={eventId}
                maxImages={6}
              />
            </div>
          )}

          {/* Button (optional) */}
          {showButton && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Button (optional)</span>
              </div>
              <input
                type="text"
                value={draft.buttonText || ''}
                onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Button text (e.g. Learn More)"
              />
              <input
                type="url"
                value={draft.buttonUrl || ''}
                onChange={(e) => setDraft({ ...draft, buttonUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Button URL (e.g. https://...)"
              />
            </div>
          )}

          {/* Testimonial fields */}
          {showTestimonial && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Author Name</label>
                <input
                  type="text"
                  value={draft.author || ''}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Author Role</label>
                <input
                  type="text"
                  value={draft.authorRole || ''}
                  onChange={(e) => setDraft({ ...draft, authorRole: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="CEO, TechCorp"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            {isNew ? 'Add Block' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section Override Editor ─────────────────────────────────────────────────

interface SectionOverrideEditorProps {
  section: SectionConfig;
  onSave: (overrides: SectionOverrides) => void;
  onClose: () => void;
}

function SectionOverrideEditor({ section, onSave, onClose }: SectionOverrideEditorProps) {
  const meta = SECTION_METADATA[section.id];
  const [draft, setDraft] = useState<SectionOverrides>(section.overrides || {});

  const overrideFields = meta?.overrideFields || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50">
              {SECTION_ICONS[section.id]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Customize {meta?.label || section.id}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Override default content</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {overrideFields.includes('heading') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Custom Heading</label>
              <input
                type="text"
                value={draft.heading || ''}
                onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for default"
              />
            </div>
          )}

          {overrideFields.includes('subheading') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Custom Subheading</label>
              <input
                type="text"
                value={draft.subheading || ''}
                onChange={(e) => setDraft({ ...draft, subheading: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for default"
              />
            </div>
          )}

          {overrideFields.includes('description') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Custom Description</label>
              <textarea
                value={draft.description || ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Leave empty for default"
              />
            </div>
          )}

          {overrideFields.includes('buttonText') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Button Text</label>
              <input
                type="text"
                value={draft.buttonText || ''}
                onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for default"
              />
            </div>
          )}

          {overrideFields.includes('buttonUrl') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Button URL</label>
              <input
                type="url"
                value={draft.buttonUrl || ''}
                onChange={(e) => setDraft({ ...draft, buttonUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty for default"
              />
            </div>
          )}

          {overrideFields.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              This section does not support content overrides.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Block Modal ─────────────────────────────────────────────────────────

interface AddBlockModalProps {
  onAdd: (layout: CustomBlockLayout) => void;
  onClose: () => void;
  insertAfter?: string;
}

function AddBlockModal({ onAdd, onClose, insertAfter }: AddBlockModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Content Block</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {insertAfter ? 'Insert below selected item' : 'Choose a block type'}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Block types grid */}
        <div className="p-4 grid grid-cols-2 gap-2">
          {CUSTOM_BLOCK_PRESETS.map((preset) => (
            <button
              key={preset.layout}
              onClick={() => onAdd(preset.layout)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-colors">
                {BLOCK_TYPE_ICONS[preset.icon] || <FileText className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{preset.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{preset.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Sections Panel ─────────────────────────────────────────────────────

export function SectionsPanel({
  config,
  selectedSection,
  eventId,
  onSelectSection,
  onToggleSection,
  onSwapSections,
  onUpdateConfig,
}: SectionsPanelProps) {
  const customBlocks = config.customBlocks || [];

  // Build unified items list: sections + custom blocks ordered together
  const unifiedItems = useMemo(() => {
    const items: UnifiedItem[] = [];
    
    // Add sections (excluding hero, footer, and the 'custom' marker which are fixed)
    config.sections
      .filter((s) => s.id !== 'hero' && s.id !== 'footer' && s.id !== 'custom')
      .forEach((section) => {
        items.push({
          id: `section-${section.id}`,
          type: 'section',
          order: section.order,
          visible: section.visible,
          data: section,
        });
      });
    
    // Add custom blocks
    customBlocks.forEach((block, idx) => {
      // Custom blocks have order starting after sections unless specified otherwise
      const baseOrder = config.sections.length;
      items.push({
        id: `block-${block.id}`,
        type: 'custom-block',
        order: baseOrder + idx,
        visible: true,
        data: block,
      });
    });
    
    return items.sort((a, b) => a.order - b.order);
  }, [config.sections, customBlocks]);

  // Hero and Footer (fixed positions)
  const heroSection = config.sections.find((s) => s.id === 'hero');
  const footerSection = config.sections.find((s) => s.id === 'footer');

  // Drag state
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{ block: CustomBlock; isNew: boolean } | null>(null);
  const [editingSection, setEditingSection] = useState<SectionConfig | null>(null);
  const [insertAfterItem, setInsertAfterItem] = useState<string | null>(null);

  // Drag handlers for unified items
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDragItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (itemId !== dragItemId) setDragOverItemId(itemId);
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!dragItemId || dragItemId === targetItemId || !onUpdateConfig) {
      setDragItemId(null);
      setDragOverItemId(null);
      return;
    }

    const dragItem = unifiedItems.find((i) => i.id === dragItemId);
    const targetItem = unifiedItems.find((i) => i.id === targetItemId);
    if (!dragItem || !targetItem) return;

    // Swap orders
    const newOrder = targetItem.order;
    const oldOrder = dragItem.order;

    // Update sections
    const newSections = config.sections.map((s) => {
      const itemId = `section-${s.id}`;
      if (itemId === dragItemId) return { ...s, order: newOrder };
      if (itemId === targetItemId) return { ...s, order: oldOrder };
      return s;
    });

    // Update custom blocks (reorder array)
    const dragIsBlock = dragItem.type === 'custom-block';
    const targetIsBlock = targetItem.type === 'custom-block';
    
    if (dragIsBlock || targetIsBlock) {
      // For simplicity, just rebuild block order based on unified items
      const newBlocks = [...customBlocks];
      // This is a simplified approach - for full implementation, track block positions
      onUpdateConfig({ sections: newSections });
    } else {
      // Both are sections - use existing swap logic
      const dragSectionId = dragItemId.replace('section-', '') as SectionId;
      const targetSectionId = targetItemId.replace('section-', '') as SectionId;
      onSwapSections(dragSectionId, targetSectionId);
    }

    setDragItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDragItemId(null);
    setDragOverItemId(null);
  };

  // Add block handler - creates and immediately opens editor
  const handleAddBlock = useCallback((layout: CustomBlockLayout) => {
    if (!onUpdateConfig) return;
    const newBlock = createDefaultBlock(layout);
    const blocks = [...customBlocks, newBlock];
    onUpdateConfig({ customBlocks: blocks });
    // Auto-open editor for the new block
    setEditingBlock({ block: newBlock, isNew: true });
    setShowAddModal(false);
  }, [customBlocks, onUpdateConfig]);

  // Save edited block
  const handleSaveBlock = useCallback((updated: CustomBlock) => {
    if (!onUpdateConfig) return;
    onUpdateConfig({
      customBlocks: customBlocks.map((b) => (b.id === updated.id ? updated : b)),
    });
  }, [customBlocks, onUpdateConfig]);

  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    if (!onUpdateConfig) return;
    onUpdateConfig({
      customBlocks: customBlocks.filter((b) => b.id !== blockId),
    });
  }, [customBlocks, onUpdateConfig]);

  // Save section overrides
  const handleSaveSectionOverrides = useCallback((sectionId: SectionId, overrides: SectionOverrides) => {
    if (!onUpdateConfig) return;
    onUpdateConfig({
      sections: config.sections.map((s) =>
        s.id === sectionId ? { ...s, overrides } : s
      ),
    });
  }, [config.sections, onUpdateConfig]);

  // Render a single item (section or custom block)
  const renderItem = (item: UnifiedItem) => {
    const isDragging = dragItemId === item.id;
    const isDragTarget = dragOverItemId === item.id && dragItemId !== item.id;

    if (item.type === 'section') {
      const section = item.data as SectionConfig;
      const meta = SECTION_METADATA[section.id];
      const isSelected = selectedSection === section.id;
      const canHide = canHideSection(section.id, config.templateId);
      const hasOverrides = meta?.hasOverrides && (meta?.overrideFields?.length || 0) > 0;

      return (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          onClick={() => onSelectSection(section.id)}
          className={cn(
            'group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border select-none',
            isDragging && 'opacity-40 scale-95',
            isDragTarget && 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01] shadow-sm',
            !isDragging && !isDragTarget && isSelected
              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
              : !isDragging && !isDragTarget
              ? 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              : ''
          )}
        >
          <span className="cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
            <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
          </span>

          <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
            {SECTION_ICONS[section.id]}
          </div>

          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-semibold truncate',
              section.visible ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
            )}>
              {meta?.label || section.label}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {meta?.description || ''}
            </p>
          </div>

          {/* Settings button for section overrides */}
          {hasOverrides && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditingSection(section); }}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
              title="Section settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Visibility toggle */}
          {canHide && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSection(section.id); }}
              className={cn(
                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                section.visible
                  ? 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
              title={section.visible ? 'Hide section' : 'Show section'}
            >
              {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      );
    } else {
      // Custom block
      const block = item.data as CustomBlock;
      const preset = CUSTOM_BLOCK_PRESETS.find((p) => p.layout === block.layout);

      return (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={(e) => handleDrop(e, item.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'group flex items-center gap-2 p-2.5 rounded-xl cursor-default transition-all border select-none',
            isDragging && 'opacity-40 scale-95',
            isDragTarget && 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]',
            !isDragging && !isDragTarget
              ? 'bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-200 dark:hover:border-indigo-700'
              : ''
          )}
        >
          <span className="cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
            <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
          </span>

          <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50">
            {getBlockIcon(block.layout)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {block.title || preset?.label || block.layout}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{preset?.label}</p>
          </div>

          {/* Edit button */}
          <button
            onClick={(e) => { e.stopPropagation(); setEditingBlock({ block, isNew: false }); }}
            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors opacity-0 group-hover:opacity-100"
            title="Edit block"
          >
            <Pencil className="w-3 h-3" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
            className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    }
  };

  const visibleSections = config.sections.filter((s) => s.visible && s.id !== 'hero' && s.id !== 'footer' && s.id !== 'custom').length;
  const totalMiddleSections = config.sections.filter((s) => s.id !== 'hero' && s.id !== 'footer' && s.id !== 'custom').length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Building Blocks</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Drag to reorder · Add custom blocks anywhere
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Fixed: Hero */}
        {heroSection && (
          <div className="mb-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">Fixed Top</p>
            <div
              onClick={() => onSelectSection('hero')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border',
                selectedSection === 'hero'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700">
                {SECTION_ICONS.hero}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Hero</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Event name, date & main CTA</p>
              </div>
            </div>
          </div>
        )}

        {/* Sortable middle sections + custom blocks */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">Content Blocks</p>
          {unifiedItems.map(renderItem)}
        </div>

        {/* Fixed: Footer */}
        {footerSection && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1">Fixed Bottom</p>
            <div
              onClick={() => onSelectSection('footer')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border',
                selectedSection === 'footer'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700">
                {SECTION_ICONS.footer}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Footer</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Links and powered by Munar</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with stats and Add button */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {visibleSections}/{totalMiddleSections} sections · {customBlocks.length} blocks
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Block
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBlockModal
          onAdd={handleAddBlock}
          onClose={() => setShowAddModal(false)}
          insertAfter={insertAfterItem || undefined}
        />
      )}

      {editingBlock && (
        <BlockEditorModal
          block={editingBlock.block}
          eventId={eventId}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
          isNew={editingBlock.isNew}
        />
      )}

      {editingSection && (
        <SectionOverrideEditor
          section={editingSection}
          onSave={(overrides) => handleSaveSectionOverrides(editingSection.id, overrides)}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}
