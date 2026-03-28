import React from "react";
import { Event, EventCard } from "./EventCard";

interface EventGridProps {
  events: Event[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const EventGrid = ({ events, onEdit, onView, onClone, onDelete }: EventGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-10 pb-10 max-w-[1440px] mx-auto overflow-visible">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event}
          onEdit={onEdit}
          onView={onView}
          onClone={onClone}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
