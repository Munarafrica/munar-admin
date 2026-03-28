import React from "react";
import { Logo } from "../ui/Logo";
import imgFrame22 from "figma:asset/474253cb7d9b021dda3b9a215c06c4f8649ba5be.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 overflow-hidden relative p-4 md:p-0">
      {/* Left Panel - Image (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex fixed left-4 top-4 bottom-4 w-[684px] rounded-[16px] overflow-hidden flex-col justify-between p-8 z-10">
        <div className="absolute inset-0 z-0">
          <img 
            src={imgFrame22} 
            alt="Event Atmosphere" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#150651]/0 to-[#150651]/80" />
        </div>
        
        {/* Logo Area */}
        <div className="relative z-10">
          <Logo variant="light" />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 text-white mb-8">
          <h1 className="text-[64px] font-bold leading-tight mb-16">
            Everything you need to plan, run, and grow your event.
          </h1>
          <p className="text-[13px] opacity-80 text-center">2026 Munar</p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col items-center justify-center lg:ml-[684px] w-full relative z-20 min-h-screen py-10">
        <div className="w-full max-w-[540px] px-4">
            {children}
        </div>
      </div>
    </div>
  );
};
