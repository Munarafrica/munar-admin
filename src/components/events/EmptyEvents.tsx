import React from "react";
import { PlusIcon } from "../icons";
import { EmptyStateGraphic } from "./EmptyStateGraphic";

interface EmptyEventsProps {
  onNewEvent: () => void;
}

export const EmptyEvents = ({ onNewEvent }: EmptyEventsProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <EmptyStateGraphic />
      
      <div className="text-center">
        <h3 className="text-[18px] font-semibold text-[#262626] dark:text-slate-100 mb-2 font-['Raleway']">No event yet</h3>
        <p className="text-sm text-[#737373] dark:text-slate-400 font-['Raleway']">Add your first event by clicking below</p>
      </div>

      <button 
        onClick={onNewEvent}
        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm transition-all active:scale-95"
      >
        <PlusIcon className="size-5" />
        <span className="font-medium text-sm">New Event</span>
      </button>
    </div>
  );
};
