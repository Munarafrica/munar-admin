// Sections Panel
// Manages section visibility and ordering with HTML5 drag-and-drop
// Custom blocks appear as individual items and are added via a modal

import React, { useState } from 'react';
import {
  Eye, EyeOff, GripVertical, Plus, Trash2, X, Pencil,
  Image, Columns2, FileText, LayoutGrid, Megaphone, MessageSquareQuote,
  Link as LinkIcon,
} from 'lucide-react';
import { SectionId, WebsiteConfig, CustomBlock, CustomBlockLayout } from '../../../modules/website/types';
import { CUSTOM_BLOCK_PRESETS, createDefaultBlock } from '../../../modules/website/templates/helpers';
import { cn } from '../../ui/utils';

interface SectionsPanelProps {
  config: WebsiteConfig;
  selectedSection: SectionId | null;
  onSelectSection: (id: SectionId) => void;
  onToggleSection: (id: SectionId) => void;
  onSwapSections: (fromId: SectionId, toId: SectionId) => void;
  onUpdateConfig?: (updates: Partial<WebsiteConfig>) => void;
}

// ── Lucide icon mapping for block types ─────────────────────────────────────

const BLOCK_TYPE_ICONS: Record<string, React.ReactNode> = {
  'image': <Image className="w-5 h-5" />,
  'columns-2': <Columns2 className="w-5 h-5" />,
  'file-text': <FileText className="w-5 h-5" />,
  'layout-grid': <LayoutGrid className="w-5 h-5" />,
  'megaphone': <Megaphone className="w-5 h-5" />,
  'message-square-quote': <MessageSquareQuote className="w-5 h-5" />,
};

const BLOCK_TYPE_ICONS_SM: Record<string, React.ReactNode> = {
  'image': <Image className="w-3.5 h-3.5" />,
  'columns-2': <Columns2 className="w-3.5 h-3.5" />,
  'file-text': <FileText className="w-3.5 h-3.5" />,
  'layout-grid': <LayoutGrid className="w-3.5 h-3.5" />,
  'megaphone': <Megaphone className="w-3.5 h-3.5" />,
  'message-square-quote': <MessageSquareQuote className="w-3.5 h-3.5" />,
};

function getBlockIcon(layout: CustomBlockLayout, size: 'sm' | 'md' = 'md') {
  const preset = CUSTOM_BLOCK_PRESETS.find(p => p.layout === layout);
  if (!preset) return size === 'sm' ? <FileText className="w-3.5 h-3.5" /> : <FileText className="w-5 h-5" />;
  return size === 'sm' ? (BLOCK_TYPE_ICONS_SM[preset.icon] || <FileText className="w-3.5 h-3.5" />) : (BLOCK_TYPE_ICONS[preset.icon] || <FileText className="w-5 h-5" />);
}

// ── Section metadata ────────────────────────────────────────────────────────

const SECTION_META: Record<SectionId, { label: string; description: string }> = {
  hero:     { label: 'Hero',        description: 'Event name, date & main CTA' },
  about:    { label: 'About',       description: 'Event description and details' },
  tickets:  { label: 'Tickets',     description: 'Registration and ticket CTA' },
  schedule: { label: 'Schedule',    description: 'Programme and sessions' },
  speakers: { label: 'Speakers',    description: 'Speaker cards and profiles' },
  sponsors: { label: 'Sponsors',    description: 'Partner logos and tiers' },
  voting:   { label: 'Voting',      description: 'Vote now CTA' },
  merch:    { label: 'Merchandise', description: 'Shop and product links' },
  forms:    { label: 'Forms',       description: 'Surveys and data collection' },
  gallery:  { label: 'Gallery',     description: 'Media and photo gallery' },
  faq:      { label: 'FAQ',         description: 'Frequently asked questions' },
  custom:   { label: 'Custom Content', description: 'Custom blocks you create' },
  footer:   { label: 'Footer',      description: 'Links and powered by Munar' },
};

// ── Block Editor Modal ──────────────────────────────────────────────────────

function BlockEditorModal({ block, onSave, onClose }: {
  block: CustomBlock;
  onSave: (updated: CustomBlock) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CustomBlock>({ ...block });
  const preset = CUSTOM_BLOCK_PRESETS.find(p => p.layout === block.layout);

  const showImage = ['text-image-left', 'text-image-right'].includes(draft.layout);
  const showImages = draft.layout === 'image-grid';
  const showButton = ['text-image-left', 'text-image-right', 'cta-banner'].includes(draft.layout);
  const showTestimonial = draft.layout === 'testimonial';

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
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Block</h3>
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

          {/* Image URL (text-image-left / text-image-right) */}
          {showImage && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Image URL</label>
              <input
                type="url"
                value={draft.imageUrl || ''}
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              {draft.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img src={draft.imageUrl} alt="Preview" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}

          {/* Image Grid URLs */}
          {showImages && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Image URLs (one per line)</label>
              <textarea
                value={(draft.images || []).join('\n')}
                onChange={(e) => setDraft({ ...draft, images: e.target.value.split('\n').filter(u => u.trim()) })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none font-mono"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
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
            onClick={() => { onSave(draft); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Section Modal ───────────────────────────────────────────────────────

function AddSectionModal({ onAdd, onClose }: {
  onAdd: (layout: CustomBlockLayout) => void;
  onClose: () => void;
}) {
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Choose a block type to add</p>
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
              onClick={() => { onAdd(preset.layout); onClose(); }}
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

// ── Main SectionsPanel ──────────────────────────────────────────────────────

export function SectionsPanel({
  config,
  selectedSection,
  onSelectSection,
  onToggleSection,
  onSwapSections,
  onUpdateConfig,
}: SectionsPanelProps) {
  // Sort sections excluding 'custom' (custom blocks shown individually below)
  const sorted = [...config.sections]
    .filter((s) => s.id !== 'custom')
    .sort((a, b) => a.order - b.order);

  const customBlocks = config.customBlocks || [];

  const [dragId, setDragId] = useState<SectionId | null>(null);
  const [dragOverId, setDragOverId] = useState<SectionId | null>(null);

  // Block drag state (separate from section drag)
  const [dragBlockIdx, setDragBlockIdx] = useState<number | null>(null);
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CustomBlock | null>(null);

  // Section drag handlers
  const handleDragStart = (e: React.DragEvent, id: SectionId) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };
  const handleDragOver = (e: React.DragEvent, id: SectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragId) setDragOverId(id);
  };
  const handleDrop = (e: React.DragEvent, targetId: SectionId) => {
    e.preventDefault();
    if (dragId && dragId !== targetId) onSwapSections(dragId, targetId);
    setDragId(null); setDragOverId(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverId(null); };

  // Block drag handlers
  const handleBlockDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();
    setDragBlockIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `block-${idx}`);
  };
  const handleBlockDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== dragBlockIdx) setDragOverBlockIdx(idx);
  };
  const handleBlockDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragBlockIdx !== null && dragBlockIdx !== targetIdx && onUpdateConfig) {
      const newBlocks = [...customBlocks];
      const [moved] = newBlocks.splice(dragBlockIdx, 1);
      newBlocks.splice(targetIdx, 0, moved);
      onUpdateConfig({ customBlocks: newBlocks });
    }
    setDragBlockIdx(null); setDragOverBlockIdx(null);
  };
  const handleBlockDragEnd = () => { setDragBlockIdx(null); setDragOverBlockIdx(null); };

  // Add block handler
  const handleAddBlock = (layout: CustomBlockLayout) => {
    if (!onUpdateConfig) return;
    const newBlock = createDefaultBlock(layout);
    const blocks = [...customBlocks, newBlock];
    onUpdateConfig({ customBlocks: blocks });
    // Auto-enable custom section if hidden
    const customSection = config.sections.find(s => s.id === 'custom');
    if (customSection && !customSection.visible) {
      onToggleSection('custom');
    }
  };

  // Save edited block
  const handleSaveBlock = (updated: CustomBlock) => {
    if (!onUpdateConfig) return;
    onUpdateConfig({
      customBlocks: customBlocks.map(b => b.id === updated.id ? updated : b),
    });
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    if (!onUpdateConfig) return;
    onUpdateConfig({
      customBlocks: customBlocks.filter(b => b.id !== blockId),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sections</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Drag to reorder · Click eye to show/hide
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {/* ── Built-in sections ───────────────────────────────────── */}
          {sorted.map((section) => {
            const meta = SECTION_META[section.id];
            const isDragging = dragId === section.id;
            const isDragTarget = dragOverId === section.id && dragId !== section.id;
            const isSelected = selectedSection === section.id;

            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDrop={(e) => handleDrop(e, section.id)}
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

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold truncate',
                    section.visible ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
                  )}>
                    {meta?.label || section.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {meta?.description}
                  </p>
                </div>

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
              </div>
            );
          })}

          {/* ── Custom blocks (individual items) ───────────────────── */}
          {customBlocks.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Custom Blocks</p>
              </div>
              {customBlocks.map((block, idx) => {
                const preset = CUSTOM_BLOCK_PRESETS.find(p => p.layout === block.layout);
                const isDragB = dragBlockIdx === idx;
                const isDragTarget = dragOverBlockIdx === idx && dragBlockIdx !== idx;

                return (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleBlockDragStart(e, idx)}
                    onDragOver={(e) => handleBlockDragOver(e, idx)}
                    onDrop={(e) => handleBlockDrop(e, idx)}
                    onDragEnd={handleBlockDragEnd}
                    className={cn(
                      'group flex items-center gap-2 p-2.5 rounded-xl cursor-default transition-all border select-none',
                      isDragB && 'opacity-40 scale-95',
                      isDragTarget && 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]',
                      !isDragB && !isDragTarget
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'
                        : ''
                    )}
                  >
                    <span className="cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </span>

                    <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40">
                      {getBlockIcon(block.layout, 'sm')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{block.title || preset?.label || block.layout}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{preset?.label}</p>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingBlock(block); }}
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
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Footer with stats and Add Section ───────────────────────── */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {sorted.filter(s => s.visible).length}/{sorted.length} visible
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Section
        </button>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddSectionModal
          onAdd={handleAddBlock}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingBlock && (
        <BlockEditorModal
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
}
