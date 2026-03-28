import React, { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "../icons";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-normal">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full appearance-none bg-white dark:bg-slate-950 rounded-lg px-3 py-2 pr-10 text-sm text-slate-700 dark:text-slate-100
              border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-primary-500
              ${error ? "border-red-500 dark:border-red-500" : ""}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900 dark:text-slate-400">
            <ChevronDownIcon className="size-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
