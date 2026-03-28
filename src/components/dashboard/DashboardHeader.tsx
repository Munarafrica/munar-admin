import React, { useState, useRef, useEffect } from "react";
import { ArrowDownIcon, GridIcon, ListIcon, PlusIcon, SearchIcon, SortIcon } from "../icons";

interface DashboardHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onNewEvent: () => void;
  showControls?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const STATUS_OPTIONS = [
  "All",
  "Published",
  "Draft",
  "Scheduled",
  "Ongoing",
  "Ended",
  "Unpublished",
  "Sold-out"
];

export const DashboardHeader = ({ 
  viewMode, 
  setViewMode, 
  onNewEvent, 
  showControls = true,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus
}: DashboardHeaderProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <h1 className="text-[28px] md:text-[34px] font-normal leading-tight text-slate-900 dark:text-slate-100">
        My Events
      </h1>

      {showControls && (
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Controls Group */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-0 border border-[#d2d2d2] dark:border-slate-700 rounded-full pointer-events-none group-focus-within:border-[#8b5cf6] dark:group-focus-within:border-[#8b5cf6] transition-colors" />
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f6f7f8] dark:bg-slate-800 rounded-full w-[203px]">
                <SearchIcon className="size-4 text-black/54 dark:text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm placeholder:text-[#a4a4a4] dark:placeholder:text-slate-500 w-full text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="relative z-20" ref={filterRef}>
              <div 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#f6f7f8] dark:bg-slate-800 rounded-full min-w-[103px] justify-between cursor-pointer hover:bg-[#edeef0] dark:hover:bg-slate-700 transition-colors"
              >
                <SortIcon className="size-4 text-black/54 dark:text-slate-400" />
                <span className="text-sm text-[#a4a4a4] dark:text-slate-400">{filterStatus}</span>
                <ArrowDownIcon className={`size-4 text-black/54 dark:text-slate-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-2 min-w-[160px] z-[100] max-h-[300px] overflow-y-auto">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        filterStatus === status ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8b5cf6] dark:text-[#a78bfa] font-medium' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="bg-[#f6f7f8] dark:bg-slate-800 p-1 rounded-full flex items-center relative h-[36px]">
              <div 
                className={`absolute top-1 bottom-1 w-[32px] bg-[#ddd6fe] dark:bg-indigo-900/50 rounded-full transition-all duration-200 ${viewMode === 'list' ? 'left-[36px]' : 'left-1'}`}
              />
              <button 
                onClick={() => setViewMode("grid")}
                className="relative z-10 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <GridIcon className={`size-5 ${viewMode === 'grid' ? 'text-[#8b5cf6] dark:text-[#a78bfa]' : 'text-[#C8CDC8] dark:text-slate-500'}`} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className="relative z-10 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ListIcon className={`size-5 ${viewMode === 'list' ? 'text-[#8b5cf6] dark:text-[#a78bfa]' : 'text-[#C8CDC8] dark:text-slate-500'}`} />
              </button>
            </div>
          </div>

          {/* New Event Button */}
          <button 
            onClick={onNewEvent}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2 rounded-xl flex items-center gap-3 shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusIcon className="size-5" />
            <span className="font-medium text-sm">New Event</span>
          </button>
        </div>
      )}
    </div>
  );
};
