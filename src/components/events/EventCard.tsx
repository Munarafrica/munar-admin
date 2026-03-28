import React, { useState, useRef, useEffect } from "react";
import { OrganizationIcon, MoreVerticalIcon } from "../icons";

export interface Event {
  id: string;
  name: string;
  type: "Physical" | "Virtual" | "Hybrid";
  status: "Published" | "Draft" | "Scheduled" | "Ongoing" | "Ended" | "Unpublished" | "Sold-out";
  date: string;
  time: string;
  ticketsSold: number | string;
  price?: string;
  coverImageUrl?: string;
}

interface EventCardProps {
  event: Event;
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
    <div className="flex items-center gap-1.5">
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
  return <span className={`text-[12px] ${colors[type as keyof typeof colors] || "text-slate-500"}`}>{type}</span>;
};

export const EventCard = ({ event, onEdit, onView, onClone, onDelete }: EventCardProps) => {
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
      className="bg-white dark:bg-slate-900 rounded-[8px] border border-slate-100 dark:border-slate-800 overflow-visible hover:shadow-md dark:hover:shadow-slate-800/50 transition-shadow cursor-pointer flex flex-col h-full group relative"
    >
      {/* Cover Image */}
      <div className="h-[140px] bg-[#e5e5e5] dark:bg-slate-800 w-full relative overflow-hidden">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={`${event.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600 opacity-20">
            <OrganizationIcon className="size-10" />
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-bold text-[#262626] dark:text-slate-100 font-['Raleway'] group-hover:text-[#8b5cf6] dark:group-hover:text-[#a78bfa] transition-colors line-clamp-1" title={event.name}>{event.name}</h3>
            <div className="flex items-center gap-4">
              <EventType type={event.type} />
              <StatusDot status={event.status} />
            </div>
          </div>
          
          <div className="relative z-10" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 -mr-2 -mt-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVerticalIcon className="size-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 min-w-[140px] z-[100]">
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

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2 text-[13px] text-[#262626] dark:text-slate-300">
            <span>{event.date}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#525252] dark:text-slate-400">Tickets/Registrations:</span>
            <span className="font-medium text-[#262626] dark:text-slate-200">{event.ticketsSold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
