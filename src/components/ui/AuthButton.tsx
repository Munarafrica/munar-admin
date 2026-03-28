import React, { ButtonHTMLAttributes } from "react";
import { GoogleIcon } from "../icons";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "google" | "link";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", isLoading, className = "", ...props }, ref) => {
    const baseStyles = "relative w-full rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center";
    
    const variants = {
      primary: "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 shadow-sm active:scale-[0.99]",
      google: "bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5",
      link: "text-[#8b5cf6] hover:text-[#7c3aed] p-0 w-auto hover:underline"
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={`${baseStyles} ${variants[variant]} ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
        {...props}
      >
        {variant === "google" && (
          <span className="mr-2">
            <GoogleIcon />
          </span>
        )}
        {isLoading ? "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
