import React from 'react';
import { EventData } from './types';
import { Calendar, Clock, MapPin, Globe, Settings, Eye, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import imgImagePlaceholder from "figma:asset/65e556ca7e7ea4317a3b52abe7f8c041aeaaf1eb.png";
import { Page } from '../../App';
import { setCurrentEventId } from '../../lib/event-storage';

interface EventHeaderProps {
  event: EventData;
  onPublish: () => void;
  onUnpublish?: () => void;
  onNavigate?: (page: Page) => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event, onPublish, onUnpublish, onNavigate }) => {
    const handleEventSettings = () => {
        const website = event.websiteUrl?.replace(/^https?:\/\//, '') || '';
        const isSubdomain = website.endsWith('.munar.site');
        const subdomain = isSubdomain ? website.replace('.munar.site', '') : '';
        const customDomain = !isSubdomain ? website : '';

        const draft = {
            id: event.id,
            eventName: event.name,
            eventType: event.type,
            domainType: isSubdomain ? 'subdomain' : 'custom',
            description: event.description || '',
            subdomain,
            customDomain,
            startDate: event.date,
            startTime: event.time,
            endDate: event.endDate || '',
            endTime: event.endTime || '',
            isRecurring: false,
            recurringStartDate: '',
            frequency: '',
            customDates: [],
            recurringStartTime: '',
            recurringEndTime: '',
            recurringEndType: 'date',
            recurringEndDate: '',
            recurringOccurrences: 1,
            country: event.country || '',
            venueLocation: event.venueLocation || '',
            categories: event.categories || [],
            currency: event.currency || 'NGN',
            coverImageUrl: event.coverImageUrl || '',
        };

        window.localStorage.setItem('munar_event_form', JSON.stringify(draft));
        setCurrentEventId(event.id);
        onNavigate?.('create-event');
    };
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-8 shadow-sm transition-colors">
        {/* Cover Image */}
        <div className="w-full md:w-[305px] h-[186px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 relative">
                <img 
                    src={event.coverImageUrl || imgImagePlaceholder} 
                alt="Event Cover" 
                className="w-full h-full object-cover"
            />
        </div>

        {/* Details & Actions */}
        <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-4">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span 
                      onClick={() => onNavigate?.('my-events')}
                      className="hover:text-slate-900 dark:hover:text-slate-200 hover:underline cursor-pointer transition-colors"
                    >
                      My Events
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    <span className="text-slate-900 dark:text-slate-100">{event.name}</span>
                </div>

                                {/* Title & Badge */}
                                <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{event.name}</h1>
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md px-2.5 py-0.5 border-0">
                                                {event.status}
                                        </Badge>
                                </div>

                                {event.description && (
                                    <p
                                        className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl [&_a]:text-indigo-500 [&_a]:underline"
                                        dangerouslySetInnerHTML={{ __html: event.description }}
                                    />
                                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span>{event.type} Event</span>
                    </div>
                    {event.slug ? (
                      <a href={`${window.location.origin}/e/${event.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
                        <Globe className="w-4 h-4" />
                        <span>{window.location.host}/e/{event.slug}</span>
                      </a>
                    ) : event.websiteUrl ? (
                      <a href={event.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
                        <Globe className="w-4 h-4" />
                        <span>{event.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <Globe className="w-4 h-4" />
                        <span>No website yet</span>
                      </span>
                    )}
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-4 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    onClick={handleEventSettings}
                                    className="gap-2 h-9 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent"
                                >
                    <Settings className="w-4 h-4" />
                    Event Settings
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden md:block" />
                <Button 
                    variant="outline" 
                    className="gap-2 h-9 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 bg-transparent"
                    onClick={() => window.open(`/e/${event.slug}`, '_blank')}
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </Button>
                {event.status === 'published' ? (
                  <Button
                    variant="outline"
                    className="gap-2 h-9 px-6 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-transparent"
                    onClick={onUnpublish}
                  >
                    Unpublish
                  </Button>
                ) : (
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-6 shadow-sm shadow-indigo-200 dark:shadow-none" onClick={onPublish}>
                    Publish Event
                  </Button>
                )}
            </div>
        </div>
    </div>
  );
};
