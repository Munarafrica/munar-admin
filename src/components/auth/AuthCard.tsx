import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLink?: {
    text: string;
    linkText: string;
    onClick: () => void;
  };
}

export const AuthCard = ({ title, subtitle, children, footerLink }: AuthCardProps) => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[16px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      
      {children}

      {footerLink && (
        <div className="mt-8 text-center">
           <p className="text-[13px] text-slate-900 dark:text-slate-100">
             {footerLink.text}{" "}
             <button 
               onClick={footerLink.onClick}
               className="font-bold text-[#8b5cf6] hover:underline"
             >
               {footerLink.linkText}
             </button>
           </p>
        </div>
      )}
    </div>
  );
};
