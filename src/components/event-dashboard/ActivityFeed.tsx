import React from 'react';
import { Activity } from './types';
import { Ticket, FileText, Globe, Zap, MessageSquare, Users, ShoppingBag, Image as ImageIcon, Calendar, Mic, LayoutTemplate, Vote } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface ActivityFeedProps {
  activities: Activity[];
}

const moduleIconMap: Record<string, string> = {
  'Event Website': 'globe',
  'Tickets': 'ticket',
  'Schedule & Agenda': 'calendar',
  'People & Speakers': 'mic',
  'Sponsors': 'users',
  'Forms and surveys': 'file-text',
  'Voting': 'vote',
  'Event Media & Gallery': 'image',
  'DP & Cover Maker': 'image',
  'Merchandise': 'shopping-bag',
  'Analytics': 'layout',
};

const iconComponents: Record<string, React.ReactNode> = {
  'globe': <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
  'ticket': <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  'calendar': <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
  'mic': <Mic className="w-4 h-4 text-green-600 dark:text-green-400" />,
  'users': <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  'file-text': <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  'vote': <Vote className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  'image': <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  'shopping-bag': <ShoppingBag className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
  'layout': <LayoutTemplate className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
  'system': <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  'message': <MessageSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
};

const ActivityIcon = ({ activity }: { activity: Activity }) => {
  const iconName = activity.icon || (activity.module ? moduleIconMap[activity.module] : undefined) || activity.type;
  return <>{iconComponents[iconName] || iconComponents.globe}</>;
};

const getIconBg = (iconName?: string, type?: string) => {
  const key = iconName || type;
  switch (key) {
    case 'ticket': return 'bg-emerald-50 dark:bg-emerald-900/30';
    case 'file-text': return 'bg-indigo-50 dark:bg-indigo-900/30';
    case 'calendar': return 'bg-pink-50 dark:bg-pink-900/30';
    case 'mic': return 'bg-green-50 dark:bg-green-900/30';
    case 'users': return 'bg-blue-50 dark:bg-blue-900/30';
    case 'vote': return 'bg-purple-50 dark:bg-purple-900/30';
    case 'image': return 'bg-amber-50 dark:bg-amber-900/30';
    case 'shopping-bag': return 'bg-slate-50 dark:bg-slate-800';
    case 'layout': return 'bg-indigo-50 dark:bg-indigo-900/30';
    case 'system': return 'bg-amber-50 dark:bg-amber-900/30';
    case 'message': return 'bg-pink-50 dark:bg-pink-900/30';
    default: return 'bg-slate-50 dark:bg-slate-800';
  }
};

const formatTime = (isoString: string) => {
    // Mocking "Just now", "1h ago" logic for simplicity based on the design
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="p-5 pb-2 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
        <Button variant="link" className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 p-0 h-auto">
           View All
        </Button>
      </div>
      
      <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No recent activity</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  getIconBg(activity.icon, activity.type)
                )}>
                   <ActivityIcon activity={activity} />
                </div>
                
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                     {activity.message}
                   </p>
                   {activity.module && (
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                       {activity.module}
                     </p>
                   )}
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                     {formatTime(activity.timestamp)}
                   </p>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
};
