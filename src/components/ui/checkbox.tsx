import React, { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <label className={`flex gap-2 items-start cursor-pointer group ${className}`}>
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            className="peer appearance-none size-3.5 border border-slate-300 dark:border-slate-600 rounded-[2px] bg-white dark:bg-slate-900 checked:bg-primary-500 checked:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            {...props}
          />
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {label && <span className="text-xs text-slate-600 dark:text-slate-400 leading-[14px] select-none">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
