import React, { useEffect, useMemo, useState } from "react";
import { TopBar } from "../components/dashboard/TopBar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { EventGrid } from "../components/events/EventGrid";
import { EventList } from "../components/events/EventList";
import { EmptyEvents } from "../components/events/EmptyEvents";
import { Event } from "../components/events/EventCard";
import { eventsService } from "../services";
import { setCurrentEventId } from "../lib/event-storage";
import { Page } from "../App";
import { EventData } from "../components/event-dashboard/types";

export const MyEvents = ({ onNavigate }: { onNavigate?: (page: Page) => void }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await eventsService.getEvents();
      setEvents(response.data as Event[]);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const buildDraft = (event: EventData) => {
    const website = event.websiteUrl?.replace(/^https?:\/\//, '') || '';
    const isSubdomain = website.endsWith('.munar.site');
    const subdomain = isSubdomain ? website.replace('.munar.site', '') : '';
    const customDomain = !isSubdomain ? website : '';

    return {
      id: event.id,
      eventName: event.name,
      description: event.description || '',
      eventType: event.type,
      domainType: isSubdomain ? 'subdomain' : 'custom',
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
  };

  // Filter and search events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.status.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === "All" || event.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, filterStatus]);

  const handleNewEvent = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("munar_event_form");
    }
    onNavigate?.('create-event');
  };

  const handleEditEvent = async (eventId: string) => {
    try {
      const event = await eventsService.getEvent(eventId);
      const draft = buildDraft(event);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("munar_event_form", JSON.stringify(draft));
      }
      setCurrentEventId(eventId);
      onNavigate?.('create-event');
    } catch (error) {
      console.error("Failed to load event", error);
    }
  };

  const handleViewEvent = (eventId: string) => {
    setCurrentEventId(eventId);
    onNavigate?.('event-dashboard');
  };

  const handleCloneEvent = async (eventId: string) => {
    try {
      await eventsService.cloneEvent(eventId);
      await loadEvents();
    } catch (error) {
      console.error("Failed to clone event", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventsService.deleteEvent(eventId);
        await loadEvents();
      } catch (error) {
        console.error("Failed to delete event", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background flex flex-col font-['Raleway']">
      <TopBar onNavigate={onNavigate as any} />
      
      <DashboardHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        onNewEvent={handleNewEvent}
        showControls={events.length > 0}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <div className="flex-1 w-full overflow-visible">
        {isLoading ? (
          <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 && events.length === 0 ? (
          <EmptyEvents onNewEvent={handleNewEvent} />
        ) : filteredEvents.length === 0 ? (
          <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">No events found matching your search criteria.</p>
          </div>
        ) : (
          viewMode === "grid" ? (
            <EventGrid 
              events={filteredEvents}
              onEdit={handleEditEvent}
              onView={handleViewEvent}
              onClone={handleCloneEvent}
              onDelete={handleDeleteEvent}
            />
          ) : (
            <EventList 
              events={filteredEvents}
              onEdit={handleEditEvent}
              onView={handleViewEvent}
              onClone={handleCloneEvent}
              onDelete={handleDeleteEvent}
            />
          )
        )}
      </div>
    </div>
  );
};
