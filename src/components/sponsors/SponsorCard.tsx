import React from 'react';
import { Globe2, Link2, Pencil, Trash, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Sponsor } from '../../types/sponsors';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';

interface SponsorCardProps {
  sponsor: Sponsor;
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (sponsor: Sponsor) => void;
  onToggleVisibility: (visible: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  grayscale?: boolean;
}

export const SponsorCard: React.FC<SponsorCardProps> = ({
  sponsor,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  grayscale,
}) => {
  const { name, logoUrl, description, websiteUrl, visible, order } = sponsor;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 text-[11px]">
            #{order}
          </Badge>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={disableMoveUp}
            aria-label="Move sponsor up"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={disableMoveDown}
            aria-label="Move sponsor down"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3 flex items-center justify-center h-32 overflow-hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className={cn('max-h-full max-w-full object-contain transition duration-200', grayscale && 'grayscale')}
          />
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Globe2 className="w-4 h-4" />
            No logo
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={name}>{name}</p>
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              aria-label="Open sponsor website"
            >
              <Link2 className="w-4 h-4" />
            </a>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2" title={description}>
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Switch checked={visible} onCheckedChange={onToggleVisibility} aria-label="Toggle visibility" />
          <span className="flex items-center gap-1">
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {visible ? 'Visible' : 'Hidden'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(sponsor)}
            className="dark:bg-slate-900 dark:border-slate-800"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(sponsor)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete sponsor"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
