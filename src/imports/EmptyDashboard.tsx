import svgPaths from "./svg-mwwl118gzv";

function Group() {
  return (
    <div className="h-[27.292px] relative shrink-0 w-[38.573px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.573 27.2924">
        <g id="Group 4">
          <path d={svgPaths.p33d7e180} fill="var(--fill-0, #252525)" id="Rectangle 12" />
          <path d={svgPaths.p2456cef0} fill="var(--fill-0, #252525)" id="Rectangle 13" />
        </g>
      </svg>
    </div>
  );
}

function LogoContainer() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Logo Container">
      <Group />
      <div className="css-g0mm18 flex flex-col font-['Amulya_Variable:Regular',sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[26.935px] text-black">
        <p className="css-ew64yg leading-[normal]">Munar</p>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="menu">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="menu">
          <path d={svgPaths.pe213f80} fill="var(--fill-0, #8B5CF6)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MenuItem() {
  return (
    <div className="bg-[#ede9fe] content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative rounded-[16px] shrink-0" data-name="menu item">
      <Menu />
      <p className="css-ew64yg font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8b5cf6] text-[14px]">Events</p>
    </div>
  );
}

function Menu1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="menu">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="menu">
          <path d={svgPaths.pe213f80} fill="var(--fill-0, #777777)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MenuItem1() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative rounded-[16px] shrink-0" data-name="menu item">
      <Menu1 />
      <p className="css-ew64yg font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#777] text-[14px]">Finance</p>
    </div>
  );
}

function NavigationContainer() {
  return (
    <div className="content-stretch flex gap-[23px] items-center relative shrink-0" data-name="Navigation Container">
      <MenuItem />
      <MenuItem1 />
    </div>
  );
}

function Notifications() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="notifications">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="notifications">
          <path d={svgPaths.p24b0af80} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function HelpCircle() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="help-circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="help-circle">
          <path d={svgPaths.pace200} id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.pbc79d00} id="Vector_2" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 17H12.01" id="Vector_3" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_5_1708)" id="settings">
          <path d={svgPaths.p3cccb600} id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3737f500} id="Vector_2" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_5_1708">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function GenericAvatar() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Generic avatar">
      <div className="absolute inset-0" style={{ "--fill-0": "rgba(212, 212, 212, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
          <circle cx="20" cy="20" fill="var(--fill-0, #EADDFF)" id="Background" r="20" />
        </svg>
      </div>
      <div className="absolute flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 size-[40px] text-[16px] text-black text-center top-1/2 tracking-[0.1px] translate-x-[-50%] translate-y-[-50%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="css-4hzbpn leading-[24px]">VE</p>
      </div>
    </div>
  );
}

function UserActionsContainer() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="User Actions Container">
      <Notifications />
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-0 relative w-[15px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 1">
                <line id="Line 3" stroke="var(--stroke-0, #D4D4D4)" x2="15" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <HelpCircle />
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-0 relative w-[15px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 1">
                <line id="Line 3" stroke="var(--stroke-0, #D4D4D4)" x2="15" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Settings />
      <div className="flex h-[15px] items-center justify-center relative shrink-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-0 relative w-[15px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 1">
                <line id="Line 3" stroke="var(--stroke-0, #D4D4D4)" x2="15" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <GenericAvatar />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-1/2 px-[80px] py-[16px] top-0 translate-x-[-50%] w-[1440px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-b border-black border-solid inset-0 pointer-events-none" />
      <LogoContainer />
      <NavigationContainer />
      <UserActionsContainer />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="search">
          <path d={svgPaths.p1684b100} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MenuItem2() {
  return (
    <div className="bg-[#f6f7f8] content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[23px] shrink-0 w-[203px]" data-name="menu item">
      <div aria-hidden="true" className="absolute border border-[#d2d2d2] border-solid inset-0 pointer-events-none rounded-[23px]" />
      <Search />
      <p className="css-4hzbpn flex-[1_0_0] font-['Poppins:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#a4a4a4] text-[14px]">{`Search `}</p>
    </div>
  );
}

function Sort() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="sort">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="sort">
          <path d={svgPaths.p2bd9b280} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function KeyboardArrowDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="keyboard-arrow-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="keyboard-arrow-down">
          <path d={svgPaths.p38aebf00} fill="var(--fill-0, black)" fillOpacity="0.54" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MenuItem3() {
  return (
    <div className="bg-[#f6f7f8] content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[23px] shrink-0 w-[103px]" data-name="menu item">
      <Sort />
      <p className="css-4hzbpn flex-[1_0_0] font-['Poppins:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#a4a4a4] text-[14px]">All</p>
      <KeyboardArrowDown />
    </div>
  );
}

function Apps() {
  return (
    <div className="absolute left-[4px] size-[20px] top-[4px]" data-name="apps">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="apps">
          <path d={svgPaths.p2e465b00} fill="var(--fill-0, #8B5CF6)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-[6px] size-[28px] top-[4px]">
      <Apps />
    </div>
  );
}

function List() {
  return (
    <div className="absolute left-[4px] size-[20px] top-[4px]" data-name="list">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="list">
          <path d={svgPaths.p2292ee40} fill="var(--fill-0, #C8CDC8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute left-[39px] size-[28px] top-[4px]">
      <List />
    </div>
  );
}

function GridSwitch() {
  return (
    <div className="bg-[#f6f7f8] h-[36px] relative rounded-[22px] shrink-0 w-[73px]" data-name="grid switch">
      <div className="absolute bg-[#ddd6fe] left-[6px] rounded-[29px] size-[28px] top-[4px]" />
      <Frame1 />
      <Frame />
    </div>
  );
}

function MenuItems() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Menu Items">
      <MenuItem2 />
      <MenuItem3 />
      <GridSwitch />
    </div>
  );
}

function Add() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <path d={svgPaths.p298d3d00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Buttons() {
  return (
    <div className="bg-[#8b5cf6] content-stretch flex gap-[12px] items-center justify-center px-[20px] py-[8px] relative rounded-[12px] shrink-0 w-[123px]" data-name="Buttons">
      <Add />
      <p className="css-ew64yg font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">New Event</p>
    </div>
  );
}

function NewEventButton() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="New Event Button">
      <Buttons />
    </div>
  );
}

function Menu2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[624px]" data-name="Menu">
      <MenuItems />
      <NewEventButton />
    </div>
  );
}

function Header1() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[80px] py-[12px] top-[104px] w-[1280px]" data-name="Header">
      <div className="css-g0mm18 flex flex-col font-['Manrope:Regular',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[26.935px] text-black">
        <p className="css-ew64yg">
          <span className="font-['Amulya_Variable:Regular',sans-serif] font-normal leading-[normal]">My Ev</span>
          <span className="leading-[normal]">ents</span>
        </p>
      </div>
      <Menu2 />
    </div>
  );
}

function Frame7() {
  return <div className="absolute h-[443px] left-[calc(50%+0.5px)] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[603px]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 603 443\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(0.05 24.25 -33.008 0.068058 301.5 221.5)\\\'><stop stop-color=\\\'rgba(255,255,255,0)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(255,255,255,1)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }} />;
}

function CarbonEvent() {
  return (
    <div className="relative shrink-0 size-[23.503px]" data-name="carbon:event">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.5034 23.5034">
        <g id="carbon:event">
          <path d={svgPaths.p2ec5f270} fill="var(--fill-0, #525252)" id="Vector" />
          <path d={svgPaths.p14ed9ef0} fill="var(--fill-0, #525252)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconBackground() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center p-[8.475px] relative rounded-[6.78px] shadow-[0px_3.39px_3.39px_0px_rgba(89,89,89,0.15)] shrink-0" data-name="Icon Background">
      <CarbonEvent />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1.695px_3.39px_3.39px_0px_rgba(255,255,255,0.25)]" />
    </div>
  );
}

function IconContainer() {
  return (
    <div className="bg-white content-stretch flex items-center p-[3.39px] relative rounded-[10.17px] shrink-0" data-name="Icon Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f5] border-[0.847px] border-solid inset-0 pointer-events-none rounded-[10.17px]" />
      <IconBackground />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8.814px] items-start justify-center min-h-px min-w-px relative">
      <div className="bg-[#e5e5e5] h-[8.814px] relative rounded-[5.876px] shrink-0 w-full">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2.938px_2.938px_0px_rgba(0,0,0,0.07)]" />
      </div>
      <div className="bg-[#e5e5e5] h-[8.814px] relative rounded-[5.876px] shrink-0 w-[101.359px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2.938px_2.938px_0px_rgba(0,0,0,0.07)]" />
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex from-[#efefef] gap-[7.345px] items-center left-[calc(50%+0.5px)] p-[7.345px] rounded-[18.362px] to-[#fafafa] to-[52.404%] top-[400px] translate-x-[-50%] w-[213px]">
      <div aria-hidden="true" className="absolute border-[2.938px] border-solid border-white inset-0 pointer-events-none rounded-[18.362px] shadow-[0px_0.734px_5.435px_0px_rgba(142,142,142,0.25)]" />
      <IconContainer />
      <Frame3 />
    </div>
  );
}

function CarbonEvent1() {
  return (
    <div className="relative shrink-0 size-[20.855px]" data-name="carbon:event">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.8552 20.8552">
        <g id="carbon:event">
          <path d={svgPaths.p1e3b14f0} fill="var(--fill-0, #525252)" id="Vector" />
          <path d={svgPaths.p1d96a500} fill="var(--fill-0, #525252)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconBackground1() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center p-[7.52px] relative rounded-[6.016px] shadow-[0px_3.008px_3.008px_0px_rgba(89,89,89,0.15)] shrink-0" data-name="Icon Background">
      <CarbonEvent1 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1.504px_3.008px_3.008px_0px_rgba(255,255,255,0.25)]" />
    </div>
  );
}

function IconContainer1() {
  return (
    <div className="bg-white content-stretch flex items-center p-[3.008px] relative rounded-[9.024px] shrink-0" data-name="Icon Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f5] border-[0.752px] border-solid inset-0 pointer-events-none rounded-[9.024px]" />
      <IconBackground1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[7.821px] items-start justify-center min-h-px min-w-px relative">
      <div className="bg-[#e5e5e5] h-[7.821px] relative rounded-[5.214px] shrink-0 w-full">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2.607px_2.607px_0px_rgba(0,0,0,0.07)]" />
      </div>
      <div className="bg-[#e5e5e5] h-[7.821px] relative rounded-[5.214px] shrink-0 w-[89.938px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2.607px_2.607px_0px_rgba(0,0,0,0.07)]" />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex from-[#efefef] gap-[6.517px] items-center left-[calc(50%+0.5px)] p-[6.517px] rounded-[16.293px] to-[#fafafa] to-[52.404%] top-[515.49px] translate-x-[-50%] w-[189px]">
      <div aria-hidden="true" className="absolute border-[2.607px] border-solid border-white inset-0 pointer-events-none rounded-[16.293px] shadow-[0px_0.652px_4.823px_0px_rgba(142,142,142,0.25)]" />
      <IconContainer1 />
      <Frame9 />
    </div>
  );
}

function CarbonEvent2() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="carbon:event">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="carbon:event">
          <path d={svgPaths.p351f0f00} fill="var(--fill-0, #8B5CF6)" id="Vector" />
          <path d={svgPaths.p39299880} fill="var(--fill-0, #8B5CF6)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function IconBackground2() {
  return (
    <div className="bg-[#fafafa] content-stretch flex items-center p-[11.538px] relative rounded-[9.231px] shadow-[0px_4.615px_4.615px_0px_rgba(89,89,89,0.15)] shrink-0" data-name="Icon Background">
      <CarbonEvent2 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_2.308px_4.615px_4.615px_0px_rgba(255,255,255,0.25)]" />
    </div>
  );
}

function IconContainer2() {
  return (
    <div className="bg-white content-stretch flex items-center p-[4.615px] relative rounded-[13.846px] shrink-0" data-name="Icon Container">
      <div aria-hidden="true" className="absolute border-[#f5f5f5] border-[1.154px] border-solid inset-0 pointer-events-none rounded-[13.846px]" />
      <IconBackground2 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start justify-center min-h-px min-w-px relative">
      <div className="bg-[#e5e5e5] h-[12px] relative rounded-[8px] shrink-0 w-full">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.07)]" />
      </div>
      <div className="bg-[#e5e5e5] h-[12px] relative rounded-[8px] shrink-0 w-[138px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.07)]" />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex from-[#efefef] gap-[10px] items-center left-1/2 p-[10px] rounded-[25px] to-[#fafafa] to-[52.404%] top-[445px] translate-x-[-50%] w-[324px]">
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 pointer-events-none rounded-[25px] shadow-[0px_1px_7.4px_0px_rgba(142,142,142,0.25)]" />
      <IconContainer2 />
      <Frame10 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-center w-full">
      <p className="css-4hzbpn font-['Raleway:SemiBold',sans-serif] relative shrink-0 text-[#262626] text-[18px] w-full">No event yet</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] relative shrink-0 text-[#737373] text-[14px] w-full">Add your first event by clicking below</p>
    </div>
  );
}

function Add1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="add">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="add">
          <path d={svgPaths.p298d3d00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="bg-[#8b5cf6] content-stretch flex gap-[12px] items-center justify-center px-[20px] py-[8px] relative rounded-[12px] shrink-0 w-[123px]" data-name="Buttons">
      <Add1 />
      <p className="css-ew64yg font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">New Event</p>
    </div>
  );
}

function NewEventButton1() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="New Event Button">
      <Buttons1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-center justify-center left-[calc(50%+0.33px)] top-[602px] translate-x-[-50%] w-[250.667px]">
      <Frame6 />
      <NewEventButton1 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(50%+0.5px)] top-[291px] translate-x-[-50%]">
      <Frame7 />
      <Frame8 />
      <Frame4 />
      <Frame2 />
      <Frame5 />
    </div>
  );
}

export default function EmptyDashboard() {
  return (
    <div className="bg-gradient-to-r from-white relative size-full to-white" data-name="Empty Dashboard">
      <Header />
      <Header1 />
      <Group1 />
    </div>
  );
}