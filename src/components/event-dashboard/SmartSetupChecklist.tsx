import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChecklistItem } from './types';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface SmartSetupChecklistProps {
  items: ChecklistItem[];
  className?: string;
  onNavigate?: (page: import('../../App').Page) => void;
}

const checklistRoutes: Record<string, import('../../App').Page> = {
  tickets: 'ticket-management',
  website: 'event-dashboard',
  schedule: 'program-management',
  sponsors: 'sponsors-management',
  forms: 'form-management',
  gallery: 'gallery-admin',
  dp: 'dp-maker-admin',
  merch: 'merchandise-management',
  voting: 'voting-management',
};

// Simple modal using createPortal for guaranteed visibility
const ChecklistModal: React.FC<{
  open: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  onNavigate?: (page: import('../../App').Page) => void;
}> = ({ open, onClose, items, onNavigate }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Full checklist</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">All tasks for setting up your event</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="p-4 space-y-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => { 
                const target = checklistRoutes[item.id]; 
                if (target) { 
                  onNavigate?.(target); 
                  onClose(); 
                } 
              }}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  item.status === 'completed' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                )}>{item.label}</span>
                {item.count ? <span className="text-xs text-slate-400">• {item.count}</span> : null}
              </div>
              <Button
                size="sm"
                variant={item.status === 'completed' ? 'secondary' : 'ghost'}
                className={cn(
                  "text-xs",
                  item.status === 'completed'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  const target = checklistRoutes[item.id];
                  if (target) {
                    onNavigate?.(target);
                    onClose();
                  }
                }}
              >
                {item.status === 'completed' ? 'View' : item.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const SmartSetupChecklist: React.FC<SmartSetupChecklistProps> = ({ items, className, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const completedCount = items.filter((item) => item.status === 'completed').length;
  const totalCount = items.length || 1;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Order already has completed moved to bottom from service; show first 3
  const visibleItems = useMemo(() => items.slice(0, 3), [items]);

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors", className)}>
      {/* Header */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
             {/* Circular Progress */}
            <div className="relative w-[34px] h-[34px] flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="17" cy="17" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                 <circle cx="17" cy="17" r="14" stroke="currentColor" strokeWidth="2.5" fill="transparent" 
                   strokeDasharray={88} 
                   strokeDashoffset={88 - (88 * percentage) / 100} 
                   strokeLinecap="round"
                   className="text-indigo-600 dark:text-indigo-500" 
                 />
               </svg>
               <span className="absolute text-[9px] font-bold text-slate-900 dark:text-slate-100">{percentage}%</span>
            </div>
            
            <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">Checklist for setting up your event</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{completedCount} of {totalCount} tasks completed</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-indigo-600 dark:text-indigo-400"
            onClick={() => setOpen(true)}
          >
            All tasks
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
            onClick={() => setOpen(true)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <ChecklistModal 
          open={open} 
          onClose={() => setOpen(false)} 
          items={items} 
          onNavigate={onNavigate} 
        />
      </div>

      {/* List */}
      <div className="flex-1 p-2">
          {visibleItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                const target = checklistRoutes[item.id];
                if (target) {
                  onNavigate?.(target);
                }
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer",
                idx !== visibleItems.length - 1 && "border-b border-slate-50 dark:border-slate-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  item.status === 'completed' ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'
                )}>{item.label}</span>
                {item.count ? <span className="text-xs text-slate-400">• {item.count}</span> : null}
              </div>
              <Button
                size="sm"
                variant={item.status === 'completed' ? 'secondary' : 'ghost'}
                className={cn(
                  "text-xs",
                  item.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  const target = checklistRoutes[item.id];
                  if (target) {
                    onNavigate?.(target);
                  }
                }}
              >
                {item.status === 'completed' ? 'View' : item.actionLabel}
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
};
