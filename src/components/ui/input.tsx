import React, { InputHTMLAttributes, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../icons";
import { cn } from "./utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-[20px]">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "transition-colors",
              isPassword && "pr-10",
              error && "border-red-500 dark:border-red-500"
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
