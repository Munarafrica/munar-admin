import React, { useState, useRef, useEffect } from "react";
import { Event } from "./EventCard";
import { OrganizationIcon, MoreVerticalIcon } from "../icons";

interface EventListProps {
  events: Event[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const StatusDot = ({ status }: { status: string }) => {
  // Color coding based on status
  const getColor = () => {
    switch (status) {
      case "Published":
      case "Ongoing":
        return "bg-[#10b981]";
      case "Draft":
        return "bg-[#f59e0b]";
      case "Scheduled":
        return "bg-[#3b82f6]";
      case "Ended":
        return "bg-[#ef4444]";
      case "Unpublished":
        return "bg-[#6b7280]";
      case "Sold-out":
        return "bg-[#8b5cf6]";
      default:
        return "bg-[#10b981]";
    }
  };

  const color = getColor();
  
  return (
    <div className="flex items-center gap-1.5 justify-end md:justify-start">
      <div className={`size-1.5 rounded-full ${color}`} />
      <span className={`text-[12px] ${color.replace("bg-", "text-")}`}>{status}</span>
    </div>
  );
};

const EventType = ({ type }: { type: string }) => {
  const colors = {
    Physical: "text-[#3b82f6]",
    Virtual: "text-[#8b5cf6]",
    Hybrid: "text-[#0ea5e9]"
  };
  return <span className={`text-[12px] ${colors[type as keyof typeof colors] || "text-slate-500"} block mt-1`}>{type}</span>;
};

interface EventRowProps {
  event: Event;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const EventRow = ({ event, onEdit, onView, onClone, onDelete }: EventRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      onClick={() => onView?.(event.id)}
      className="grid grid-cols-12 gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[12px] px-6 py-4 items-center hover:shadow-sm dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer group relative z-0"
    >
      {/* Event Name + Image */}
      <div className="col-span-8 md:col-span-4 flex items-center gap-4">
        <div className="size-12 rounded-[8px] bg-[#e5e5e5] dark:bg-slate-800 shrink-0 flex items-center justify-center text-slate-300 dark:text-slate-600 overflow-hidden">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={`${event.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <OrganizationIcon className="size-6" />
          )}
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-[#262626] dark:text-slate-100 font-['Raleway'] group-hover:text-[#8b5cf6] dark:group-hover:text-[#a78bfa] transition-colors">{event.name}</h3>
          <EventType type={event.type} />
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2 hidden md:block text-[13px] text-[#262626] dark:text-slate-300">
        {event.date}
      </div>

      {/* Time */}
      <div className="col-span-2 hidden md:block text-[13px] text-[#262626] dark:text-slate-300">
        {event.time}
      </div>

      {/* Tickets */}
      <div className="col-span-2 hidden md:block text-[13px] font-medium text-[#262626] dark:text-slate-200">
        {event.ticketsSold}
      </div>

      {/* Status */}
      <div className="col-span-4 md:col-span-2 text-right md:text-left flex items-center justify-between md:pr-8">
        <StatusDot status={event.status} />
      </div>

      {/* Options Button (Absolute) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10" ref={menuRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <MoreVerticalIcon className="size-5" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 min-w-[140px] z-[200]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(event.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(event.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone?.(event.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Clone
            </button>
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(event.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const EventList = ({ events, onEdit, onView, onClone, onDelete }: EventListProps) => {
  return (
    <div className="px-4 md:px-10 pb-10 max-w-[1280px] mx-auto w-full">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 bg-[#f6f7f8] dark:bg-slate-800 rounded-[8px] px-6 py-3 text-sm text-[#525252] dark:text-slate-400 font-medium mb-4">
        <div className="col-span-4">Event Name</div>
        <div className="col-span-2 hidden md:block">Date</div>
        <div className="col-span-2 hidden md:block">Time</div>
        <div className="col-span-2 hidden md:block">Tickets/Registrations</div>
        <div className="col-span-2 text-right md:text-left">Status</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <EventRow 
            key={event.id}
            event={event}
            onEdit={onEdit}
            onView={onView}
            onClone={onClone}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
