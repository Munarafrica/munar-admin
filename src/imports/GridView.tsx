import svgPaths from "./svg-9tldmc2vgf";

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

function Paragraph() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0a0a0a] text-[16px]">Lagos Tech Fair</p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="capitalize css-ew64yg font-['Raleway:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#2f6192] text-[12px]">Physical</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="relative rounded-[21px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[6px] py-[2px] relative w-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function ContactTypeContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[79.484px]" data-name="Contact Type Container">
      <Container />
    </div>
  );
}

function StatusIndicator() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center px-[11px] py-px relative rounded-[11px] shrink-0" data-name="Status Indicator">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(35, 156, 69, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #239C45)" id="Ellipse 398" r="3" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#239c45] text-[13px]">Published</p>
    </div>
  );
}

function EventDetails() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Event Details">
      <ContactTypeContainer />
      <StatusIndicator />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Container">
      <Paragraph />
      <EventDetails />
    </div>
  );
}

function EventDateTime() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Date Time">
      <p className="css-ew64yg relative shrink-0">17 June 2025</p>
      <p className="css-ew64yg relative shrink-0">9:00 AM WAT</p>
    </div>
  );
}

function EventTickets() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Tickets">
      <p className="css-ew64yg relative shrink-0">Tickets/Registrations:</p>
      <p className="css-ew64yg relative shrink-0">10</p>
    </div>
  );
}

function EventInfo() {
  return (
    <div className="relative shrink-0 w-full" data-name="Event Info">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <Container1 />
        <EventDateTime />
        <EventTickets />
      </div>
    </div>
  );
}

function EventCard() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center pb-[16px] relative rounded-[8px] shrink-0 w-[305px]" data-name="event card">
      <div aria-hidden="true" className="absolute border border-[#e8e8e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-[#e5e5e5] h-[144px] relative rounded-[8px] shrink-0 w-full" data-name="Image Placeholder">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[9px]" />
      </div>
      <EventInfo />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0a0a0a] text-[16px]">Abuja Innovation Summit</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="capitalize css-ew64yg font-['Raleway:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#2f6192] text-[12px]">Hybrid</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative rounded-[21px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[6px] py-[2px] relative w-full">
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function ContactTypeContainer1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[79.484px]" data-name="Contact Type Container">
      <Container2 />
    </div>
  );
}

function StatusIndicator1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center px-[11px] py-px relative rounded-[11px] shrink-0" data-name="Status Indicator">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(35, 156, 69, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #239C45)" id="Ellipse 398" r="3" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#239c45] text-[13px]">Upcoming</p>
    </div>
  );
}

function EventDetails1() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Event Details">
      <ContactTypeContainer1 />
      <StatusIndicator1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Container">
      <Paragraph1 />
      <EventDetails1 />
    </div>
  );
}

function EventDateTime1() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Date Time">
      <p className="css-ew64yg relative shrink-0">23 July 2025</p>
      <p className="css-ew64yg relative shrink-0">10:30 AM WAT</p>
    </div>
  );
}

function EventTickets1() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Tickets">
      <p className="css-ew64yg relative shrink-0">Tickets/Registrations:</p>
      <p className="css-ew64yg relative shrink-0">20</p>
    </div>
  );
}

function EventInfo1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Event Info">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <Container3 />
        <EventDateTime1 />
        <EventTickets1 />
      </div>
    </div>
  );
}

function EventCard1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center pb-[16px] relative rounded-[8px] shrink-0 w-[305px]" data-name="event card">
      <div aria-hidden="true" className="absolute border border-[#e8e8e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-[#e5e5e5] h-[144px] relative rounded-[8px] shrink-0 w-full" data-name="Image Placeholder">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[9px]" />
      </div>
      <EventInfo1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0a0a0a] text-[16px]">Port Harcourt Startup Showcase</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="capitalize css-ew64yg font-['Raleway:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#2f6192] text-[12px]">Virtual</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative rounded-[21px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[6px] py-[2px] relative w-full">
          <Text2 />
        </div>
      </div>
    </div>
  );
}

function ContactTypeContainer2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[79.484px]" data-name="Contact Type Container">
      <Container4 />
    </div>
  );
}

function StatusIndicator2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center px-[11px] py-px relative rounded-[11px] shrink-0" data-name="Status Indicator">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(35, 156, 69, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #239C45)" id="Ellipse 398" r="3" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#239c45] text-[13px]">Ongoing</p>
    </div>
  );
}

function EventDetails2() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Event Details">
      <ContactTypeContainer2 />
      <StatusIndicator2 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Container">
      <Paragraph2 />
      <EventDetails2 />
    </div>
  );
}

function EventDateTime2() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Date Time">
      <p className="css-ew64yg relative shrink-0">15 August 2025</p>
      <p className="css-ew64yg relative shrink-0">1:00 PM WAT</p>
    </div>
  );
}

function EventTickets2() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Tickets">
      <p className="css-ew64yg relative shrink-0">Tickets/Registrations:</p>
      <p className="css-ew64yg relative shrink-0">15</p>
    </div>
  );
}

function EventInfo2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Event Info">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <Container5 />
        <EventDateTime2 />
        <EventTickets2 />
      </div>
    </div>
  );
}

function EventCard2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center pb-[16px] relative rounded-[8px] shrink-0 w-[305px]" data-name="event card">
      <div aria-hidden="true" className="absolute border border-[#e8e8e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-[#e5e5e5] h-[144px] relative rounded-[8px] shrink-0 w-full" data-name="Image Placeholder">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[9px]" />
      </div>
      <EventInfo2 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0a0a0a] text-[16px]">Ibadan Digital Workshop</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="capitalize css-ew64yg font-['Raleway:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#2f6192] text-[12px]">Physical</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative rounded-[21px] shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[6px] py-[2px] relative w-full">
          <Text3 />
        </div>
      </div>
    </div>
  );
}

function ContactTypeContainer3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[79.484px]" data-name="Contact Type Container">
      <Container6 />
    </div>
  );
}

function StatusIndicator3() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center px-[11px] py-px relative rounded-[11px] shrink-0" data-name="Status Indicator">
      <div className="relative shrink-0 size-[6px]">
        <div className="absolute inset-0" style={{ "--fill-0": "rgba(35, 156, 69, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
            <circle cx="3" cy="3" fill="var(--fill-0, #239C45)" id="Ellipse 398" r="3" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#239c45] text-[13px]">Scheduled</p>
    </div>
  );
}

function EventDetails3() {
  return (
    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="Event Details">
      <ContactTypeContainer3 />
      <StatusIndicator3 />
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-name="Container">
      <Paragraph3 />
      <EventDetails3 />
    </div>
  );
}

function EventDateTime3() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Date Time">
      <p className="css-ew64yg relative shrink-0">5 September 2025</p>
      <p className="css-ew64yg relative shrink-0">11:00 AM WAT</p>
    </div>
  );
}

function EventTickets3() {
  return (
    <div className="content-stretch flex font-['Raleway:Medium',sans-serif] gap-[16px] items-start leading-[normal] not-italic relative shrink-0 text-[#3c3c3c] text-[14px] w-full" data-name="Event Tickets">
      <p className="css-ew64yg relative shrink-0">Tickets/Registrations:</p>
      <p className="css-ew64yg relative shrink-0">25</p>
    </div>
  );
}

function EventInfo3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Event Info">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] relative w-full">
        <Container7 />
        <EventDateTime3 />
        <EventTickets3 />
      </div>
    </div>
  );
}

function EventCard3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center pb-[16px] relative rounded-[8px] shrink-0 w-[305px]" data-name="event card">
      <div aria-hidden="true" className="absolute border border-[#e8e8e8] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-[#e5e5e5] h-[144px] relative rounded-[8px] shrink-0 w-full" data-name="Image Placeholder">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[9px]" />
      </div>
      <EventInfo3 />
    </div>
  );
}

function AppList() {
  return (
    <div className="absolute content-stretch flex gap-[21px] items-center left-[calc(50%+0.5px)] top-[208px] translate-x-[-50%]" data-name="App List">
      <EventCard />
      <EventCard1 />
      <EventCard2 />
      <EventCard3 />
    </div>
  );
}

export default function GridView() {
  return (
    <div className="bg-gradient-to-r from-white relative size-full to-white" data-name="Grid View">
      <Header />
      <Header1 />
      <AppList />
    </div>
  );
}