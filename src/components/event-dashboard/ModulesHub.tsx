import React from 'react';
import { Module } from './types';
import { Globe, Ticket, Calendar, Mic, Users, FileText, CheckSquare, Image as ImageIcon, ShoppingBag, LayoutTemplate, ArrowRight, Vote } from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Page } from '../../App';

interface ModulesHubProps {
  modules: Module[];
  onNavigate?: (page: Page) => void;
}

const ModuleIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'globe': <Globe className={className} />,
    'ticket': <Ticket className={className} />,
    'calendar': <Calendar className={className} />,
    'mic': <Mic className={className} />,
    'users': <Users className={className} />,
    'file-text': <FileText className={className} />,
    'check-square': <CheckSquare className={className} />,
    'image': <ImageIcon className={className} />,
    'shopping-bag': <ShoppingBag className={className} />,
    'layout': <LayoutTemplate className={className} />,
    'vote': <Vote className={className} />,
  };
  return <>{icons[name] || <Globe className={className} />}</>;
};

export const ModulesHub: React.FC<ModulesHubProps> = ({ modules, onNavigate }) => {
  const getCountLabel = (module: Module) => {
    const count = module.count ?? 0;
    if (count <= 0) return null;
    const plural = (label: string) => `${count} ${label}${count === 1 ? '' : 's'}`;
    switch (module.name) {
      case 'Tickets':
        return plural('ticket');
      case 'Forms and surveys':
        return plural('form');
      case 'Merchandise':
        return plural('product');
      case 'Voting':
        return plural('campaign');
      case 'Sponsors':
        return plural('sponsor');
      case 'Schedule & Agenda':
        return plural('session');
      case 'People & Speakers':
        return plural('speaker');
      case 'Event Media & Gallery':
        return plural('item');
      case 'DP & Cover Maker':
        return plural('frame');
      default:
        return plural('item');
    }
  };

  const handleModuleClick = (moduleName: string) => {
    if (moduleName === 'Tickets') {
        onNavigate?.('ticket-management');
    } else if (moduleName === 'Schedule & Agenda' || moduleName === 'People & Speakers') {
        onNavigate?.('program-management');
    } else if (moduleName === 'Forms and surveys') {
        onNavigate?.('form-management');
    } else if (moduleName === 'Sponsors') {
      onNavigate?.('sponsors-management');
    } else if (moduleName === 'Merchandise') {
        onNavigate?.('merchandise-management');
    } else if (moduleName === 'Voting') {
        onNavigate?.('voting-management');
    } else if (moduleName === 'DP & Cover Maker') {
        onNavigate?.('dp-maker-admin');
    } else if (moduleName === 'Event Media & Gallery') {
        onNavigate?.('gallery-admin');
    } else if (moduleName === 'Analytics') {
      onNavigate?.('event-analytics');
    } else if (moduleName === 'Event Website') {
      onNavigate?.('website-builder');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Event Modules</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Everything you need to manage your Event</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {modules.map((module) => {
            const countLabel = getCountLabel(module);
            
            // Map color names to tailwind classes
            const colorMap: Record<string, string> = {
                'purple': 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
                'orange': 'text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400',
                'pink': 'text-pink-600 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400',
                'green': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
                'blue': 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
                'indigo': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400',
                'gray': 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400',
            };
            
            const colorClass = colorMap[module.iconColor || 'purple'];

            return (
                <div 
                    key={module.id}
                    onClick={() => handleModuleClick(module.name)}
                    className="group bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between h-[180px] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="flex justify-between items-start">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                            <ModuleIcon name={module.icon} className="w-5 h-5" />
                        </div>
                        
                        {countLabel ? (
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-medium border-0 px-2 h-6">
                            {countLabel}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-medium border-0 px-2 h-6">
                            Not Started
                          </Badge>
                        )}
                    </div>

                    <div className="mt-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{module.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {module.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-auto pt-4 group-hover:translate-x-1 transition-transform">
                        <span>{module.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};