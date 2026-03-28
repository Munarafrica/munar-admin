import React from "react";

const icons = {
  eventLarge: "M28 6C28 5.46957 27.7893 4.96086 27.4142 4.58579C27.0391 4.21071 26.5304 4 26 4H22V2H20V4H12V2H10V4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H10V26H6V6H10V8H12V6H20V8H22V6H26V12H28V6Z M21 15L23.549 19.938L29 20.729L25 24.573L26 30L21 27.438L16 30L17 24.573L13 20.729L18.6 19.938L21 15Z",
  eventMedium: "M20.5656 4.40688C20.5656 4.01729 20.4108 3.64365 20.1353 3.36817C19.8598 3.09268 19.4862 2.93792 19.0966 2.93792H16.1587V1.46895H14.6897V2.93792H8.81384V1.46895H7.34488V2.93792H4.40695C4.01735 2.93792 3.64371 3.09268 3.36823 3.36817C3.09275 3.64365 2.93798 4.01729 2.93798 4.40688V19.0965C2.93798 19.4861 3.09275 19.8598 3.36823 20.1353C3.64371 20.4107 4.01735 20.5655 4.40695 20.5655H7.34488V19.0965H4.40695V4.40688H7.34488V5.87585H8.81384V4.40688H14.6897V5.87585H16.1587V4.40688H19.0966V8.81378H20.5656V4.40688Z M15.4242 11.0172L17.2964 14.6441L21.3 15.2251L18.3621 18.0484L19.0966 22.0345L15.4242 20.1527L11.7518 22.0345L12.4863 18.0484L9.54832 15.2251L13.6614 14.6441L15.4242 11.0172Z",
  eventSmall: "M18.2484 3.91027C18.2484 3.56457 18.1111 3.23304 17.8667 2.98859C17.6222 2.74415 17.2907 2.60682 16.945 2.60682H14.3381V1.30337H13.0346V2.60682H7.82084V1.30337H6.5174V2.60682H3.9105C3.5648 2.60682 3.23327 2.74415 2.98882 2.98859C2.74438 3.23304 2.60705 3.56457 2.60705 3.91027V16.9448C2.60705 17.2904 2.74438 17.622 2.98882 17.8664C3.23327 18.1109 3.5648 18.2482 3.9105 18.2482H6.5174V16.9448H3.9105V3.91027H6.5174V5.21372H7.82084V3.91027H13.0346V5.21372H14.3381V3.91027H16.945V7.82062H18.2484V3.91027Z M13.6864 9.77584L15.3476 12.9941L18.9002 13.5096L16.2933 16.0148L16.945 19.5517L13.6864 17.882L10.4277 19.5517L11.0795 16.0148L8.47257 13.5096L12.1222 12.9941L13.6864 9.77584Z"
};

export const EmptyStateGraphic = () => {
  return (
    <div className="relative w-[340px] h-[200px] flex items-center justify-center">
        {/* Background Gradient/Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white to-transparent dark:from-slate-800 dark:to-transparent opacity-50" />

        {/* Top Floating Card (Small) */}
        <div className="absolute top-0 right-10 bg-gradient-to-b from-[#efefef] to-[#fafafa] dark:from-slate-800 dark:to-slate-700 p-2 rounded-[18px] border-[3px] border-white dark:border-slate-600 shadow-[0px_0.7px_5.4px_0px_rgba(142,142,142,0.25)] dark:shadow-none flex items-center gap-2 w-[213px] z-0 opacity-60 scale-90">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-[10px] border-[0.8px] border-[#f5f5f5] dark:border-slate-800">
                <div className="bg-[#fafafa] dark:bg-slate-800 p-2 rounded-[7px] shadow-inner text-[#525252] dark:text-slate-400">
                    <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d={icons.eventMedium} /></svg>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-2 rounded-full w-full shadow-inner" />
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-2 rounded-full w-1/2 shadow-inner" />
            </div>
        </div>

        {/* Bottom Floating Card (Medium) */}
        <div className="absolute bottom-0 left-10 bg-gradient-to-b from-[#efefef] to-[#fafafa] dark:from-slate-800 dark:to-slate-700 p-2 rounded-[16px] border-[3px] border-white dark:border-slate-600 shadow-[0px_0.7px_5.4px_0px_rgba(142,142,142,0.25)] dark:shadow-none flex items-center gap-2 w-[189px] z-10 opacity-60 scale-90">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-[9px] border-[0.8px] border-[#f5f5f5] dark:border-slate-800">
                <div className="bg-[#fafafa] dark:bg-slate-800 p-2 rounded-[6px] shadow-inner text-[#525252] dark:text-slate-400">
                    <svg viewBox="0 0 21 21" className="size-4 fill-current"><path d={icons.eventSmall} /></svg>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-2 rounded-full w-full shadow-inner" />
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-2 rounded-full w-1/2 shadow-inner" />
            </div>
        </div>

        {/* Center Main Card (Large) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-[#efefef] to-[#fafafa] dark:from-slate-800 dark:to-slate-700 p-2.5 rounded-[25px] border-4 border-white dark:border-slate-600 shadow-[0px_1px_7.4px_0px_rgba(142,142,142,0.25)] dark:shadow-none flex items-center gap-3 w-[324px] z-20">
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-[14px] border-[1.2px] border-[#f5f5f5] dark:border-slate-800">
                <div className="bg-[#fafafa] dark:bg-slate-800 p-3 rounded-[9px] shadow-inner text-[#8B5CF6] dark:text-[#a78bfa]">
                    <svg viewBox="0 0 32 32" className="size-8 fill-current"><path d={icons.eventLarge} /></svg>
                </div>
            </div>
             <div className="flex flex-col gap-3 w-full">
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-3 rounded-full w-full shadow-inner" />
                <div className="bg-[#e5e5e5] dark:bg-slate-600 h-3 rounded-full w-2/3 shadow-inner" />
            </div>
        </div>
    </div>
  );
};
