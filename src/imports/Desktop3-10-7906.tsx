import svgPaths from "./svg-n8884irubb";

function TitleContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center leading-[normal] min-h-px min-w-px not-italic relative" data-name="Title Container">
      <p className="css-ew64yg font-['Raleway:Bold',sans-serif] relative shrink-0 text-[21px] text-black">Create a new event</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] min-w-full relative shrink-0 text-[13px] text-[rgba(15,23,42,0.68)] w-[min-content]">let us set up your event</p>
    </div>
  );
}

function X() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="x">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="x">
          <path d="M18 6L6 18" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M6 6L18 18" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex gap-[24px] items-start justify-center pb-[10px] relative shrink-0 w-[880px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <TitleContainer />
      <X />
    </div>
  );
}

function Field() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[12px] pr-[56px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">First Name</p>
        </div>
      </div>
    </div>
  );
}

function Default() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="default">
      <Field />
    </div>
  );
}

function InputWithButton() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-name="input/with button">
      <Default />
    </div>
  );
}

function Input() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event Name*</p>
      <InputWithButton />
    </div>
  );
}

function InputContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start justify-center relative shrink-0 w-full" data-name="Input Container">
      <Input />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[8.33%_16.67%]" data-name="Group">
      <div className="absolute inset-[-5%_-6.25%_-6.07%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 22.2135">
          <g id="Group">
            <g id="Vector"></g>
            <path d={svgPaths.p100d8f80} id="Vector_2" stroke="var(--stroke-0, #8B5CF6)" strokeWidth="2" />
            <path d={svgPaths.p23f84000} id="Vector_3" stroke="var(--stroke-0, #8B5CF6)" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function TdesignLocation() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="tdesign:location">
      <Group />
    </div>
  );
}

function EventTypeIconContainer() {
  return (
    <div className="bg-[#d7c6fe] content-stretch flex items-center p-[10px] relative rounded-[8px] shrink-0" data-name="Event Type Icon Container">
      <TdesignLocation />
    </div>
  );
}

function EventTypeDescriptionContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-full" data-name="Event Type Description Container">
      <p className="css-4hzbpn font-['Raleway:SemiBold',sans-serif] relative shrink-0 text-[#262626] text-[16px] w-full">Physical</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] relative shrink-0 text-[#737373] text-[14px] w-full">Live, in-person gathering at a venue.</p>
    </div>
  );
}

function EventTypeOption() {
  return (
    <div className="bg-[#e7ddff] flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Event Type Option">
      <div aria-hidden="true" className="absolute border border-[#8b5cf6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start justify-center p-[16px] relative w-full">
          <EventTypeIconContainer />
          <EventTypeDescriptionContainer />
        </div>
      </div>
    </div>
  );
}

function GgCamera() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="gg:camera">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_8_6138)" id="gg:camera">
          <path clipRule="evenodd" d={svgPaths.p29477500} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_8_6138">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function EventTypeIconContainer1() {
  return (
    <div className="bg-white content-stretch flex items-center p-[10px] relative shrink-0" data-name="Event Type Icon Container">
      <GgCamera />
    </div>
  );
}

function EventTypeDescriptionContainer1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-full" data-name="Event Type Description Container">
      <p className="css-4hzbpn font-['Raleway:SemiBold',sans-serif] relative shrink-0 text-[#262626] text-[16px] w-full">Virtual</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] relative shrink-0 text-[#737373] text-[14px] w-full">Online only event via streaming.</p>
    </div>
  );
}

function EventTypeOption1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Event Type Option">
      <div aria-hidden="true" className="absolute border border-[#8b5cf6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start justify-center p-[16px] relative w-full">
          <EventTypeIconContainer1 />
          <EventTypeDescriptionContainer1 />
        </div>
      </div>
    </div>
  );
}

function JamComputer() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="jam:computer">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="jam:computer">
          <path d={svgPaths.p1b8f180} fill="var(--fill-0, #1E1E1E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function EventTypeIconContainer2() {
  return (
    <div className="bg-white content-stretch flex items-center p-[10px] relative shrink-0" data-name="Event Type Icon Container">
      <JamComputer />
    </div>
  );
}

function EventTypeDescriptionContainer2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-full" data-name="Event Type Description Container">
      <p className="css-4hzbpn font-['Raleway:SemiBold',sans-serif] relative shrink-0 text-[#262626] text-[16px] w-full">Hybrid</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] relative shrink-0 text-[#737373] text-[14px] w-full">Both in-person and online access.</p>
    </div>
  );
}

function EventTypeOption2() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="Event Type Option">
      <div aria-hidden="true" className="absolute border border-[#8b5cf6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start justify-center p-[16px] relative w-full">
          <EventTypeIconContainer2 />
          <EventTypeDescriptionContainer2 />
        </div>
      </div>
    </div>
  );
}

function EventTypeOptionsContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full" data-name="Event Type Options Container">
      <EventTypeOption />
      <EventTypeOption1 />
      <EventTypeOption2 />
    </div>
  );
}

function EventTypeContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Event Type Container">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event Type*</p>
      <EventTypeOptionsContainer />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Icon">
          <path d={svgPaths.p1efeac80} id="Vector" stroke="var(--stroke-0, #8E8E8E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.p3a485e00} id="Vector_2" stroke="var(--stroke-0, #8E8E8E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
          <path d={svgPaths.p2e2c5880} id="Vector_3" stroke="var(--stroke-0, #8E8E8E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
        </g>
      </svg>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Placeholder">
      <p className="css-ew64yg font-['Raleway:SemiBold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#2563eb] text-[14px] text-center tracking-[0.07px]">browse</p>
    </div>
  );
}

function LinkDefault() {
  return (
    <div className="content-stretch flex gap-[10px] items-center overflow-clip relative shrink-0" data-name="_link-default">
      <Placeholder />
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Links">
      <LinkDefault />
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[5px] items-start justify-center relative shrink-0" data-name="Title">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#1f2937] text-[14px] tracking-[0.07px]">Drop your file here or</p>
      <Links />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Content">
      <Icon />
      <Title />
    </div>
  );
}

function DragNDropFileUpload() {
  return (
    <div className="bg-white relative rounded-[12px] shrink-0 w-full" data-name="_drag-n-drop-file-upload">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-dashed inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-center p-[48px] relative w-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function TypeBaseStateDefault() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Type=Base, State=Default">
      <DragNDropFileUpload />
    </div>
  );
}

function AddACoverImage() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Add a cover Image">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Add a cover Image</p>
      <TypeBaseStateDefault />
    </div>
  );
}

function Undo() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[24px]" data-name="Undo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Undo">
          <path d={svgPaths.p2ecf4700} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Redo() {
  return (
    <div className="col-1 ml-[32px] mt-0 relative row-1 size-[24px]" data-name="Redo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Redo">
          <path d={svgPaths.p23479400} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function GroupHistory() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="group-history">
      <Undo />
      <Redo />
    </div>
  );
}

function Bold() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[24px]" data-name="bold">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="bold">
          <path d={svgPaths.p358dcd00} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="B" />
        </g>
      </svg>
    </div>
  );
}

function Italic() {
  return (
    <div className="col-1 ml-[32px] mt-0 relative row-1 size-[24px]" data-name="italic">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="italic">
          <path d={svgPaths.p1c914400} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="/" />
        </g>
      </svg>
    </div>
  );
}

function Underline() {
  return (
    <div className="col-1 ml-[64px] mt-0 relative row-1 size-[24px]" data-name="underline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="underline">
          <g id="U">
            <path d={svgPaths.p19f1500} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" />
            <path d={svgPaths.p22ce200} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Strike() {
  return (
    <div className="col-1 ml-[96px] mt-0 relative row-1 size-[24px]" data-name="strike">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="strike">
          <g id="T">
            <path d={svgPaths.p3cc9b200} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" />
            <path d={svgPaths.p1c2a2c00} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function GroupEmphasis() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="group-emphasis">
      <Bold />
      <Italic />
      <Underline />
      <Strike />
    </div>
  );
}

function UnorderedList() {
  return (
    <div className="col-1 ml-[32px] mt-0 relative row-1 size-[24px]" data-name="Unordered list">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Unordered list">
          <path d={svgPaths.paea7100} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function OrderedList() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[24px]" data-name="Ordered list">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Ordered list">
          <path d={svgPaths.p2b737b80} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function GroupList() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="group-list">
      <UnorderedList />
      <OrderedList />
    </div>
  );
}

function AlignLeft() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[24px]" data-name="Align left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Align left">
          <path clipRule="evenodd" d={svgPaths.p13a066f0} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function AlignCenter() {
  return (
    <div className="col-1 ml-[32px] mt-0 relative row-1 size-[24px]" data-name="Align center">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Align center">
          <path clipRule="evenodd" d={svgPaths.p305b4800} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function AlignRight() {
  return (
    <div className="col-1 ml-[64px] mt-0 relative row-1 size-[24px]" data-name="Align right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Align right">
          <path clipRule="evenodd" d={svgPaths.p86480} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function GroupAlignment() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="group-alignment">
      <AlignLeft />
      <AlignCenter />
      <AlignRight />
    </div>
  );
}

function Image() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[24px]" data-name="image">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="image">
          <path d={svgPaths.p1ad7b6b2} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Link() {
  return (
    <div className="col-1 ml-[32px] mt-0 relative row-1 size-[24px]" data-name="link">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="link">
          <path d={svgPaths.p30562c00} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function GroupAttachment() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="group-attachment">
      <Image />
      <Link />
    </div>
  );
}

function Clean() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="clean">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="clean">
          <path d={svgPaths.p25d7d780} fill="var(--fill-0, #1C2E45)" fillOpacity="0.6" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Toolbar() {
  return (
    <div className="bg-[rgba(25,59,103,0.05)] relative shrink-0 w-full" data-name="toolbar">
      <div aria-hidden="true" className="absolute border-[rgba(28,55,90,0.16)] border-b border-solid inset-[0_0_-1px_0] pointer-events-none" />
      <div className="content-start flex flex-wrap gap-[22px] items-start px-[10px] py-[9px] relative w-full">
        <GroupHistory />
        <GroupEmphasis />
        <GroupList />
        <GroupAlignment />
        <GroupAttachment />
        <Clean />
      </div>
    </div>
  );
}

function Editor() {
  return <div className="flex-[1_0_0] min-h-px min-w-px overflow-clip w-full" data-name="editor" />;
}

function EventDescriptionEditor() {
  return (
    <div className="bg-white h-[236px] relative rounded-[8px] shrink-0 w-full" data-name="Event Description Editor">
      <div aria-hidden="true" className="absolute border border-[rgba(28,55,90,0.16)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center p-px relative size-full">
          <Toolbar />
          <Editor />
        </div>
      </div>
    </div>
  );
}

function EventDescriptionContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Event Description Container">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event Description*</p>
      <EventDescriptionEditor />
    </div>
  );
}

function Calendar() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="calendar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="calendar">
          <path d={svgPaths.p1da67b80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.3333 1.66667V5" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 1.66667V5" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 8.33333H17.5" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Field1() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">mm/dd/yyyy</p>
          <Calendar />
        </div>
      </div>
    </div>
  );
}

function Default1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="default">
      <Field1 />
    </div>
  );
}

function InputWithButton1() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-[270px]" data-name="input/with button">
      <Default1 />
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="clock">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="clock">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 5V10L13.3333 11.6667" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Field2() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">--:--</p>
          <Clock />
        </div>
      </div>
    </div>
  );
}

function Default2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="default">
      <Field2 />
    </div>
  );
}

function InputWithButton2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-start min-h-px min-w-px relative" data-name="input/with button">
      <Default2 />
    </div>
  );
}

function EventStartsInputContainer() {
  return (
    <div className="content-stretch flex gap-[6px] items-start relative shrink-0 w-full" data-name="Event Starts Input Container">
      <InputWithButton1 />
      <InputWithButton2 />
    </div>
  );
}

function Input1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-h-px min-w-px relative" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event Starts</p>
      <EventStartsInputContainer />
    </div>
  );
}

function Calendar1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="calendar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="calendar">
          <path d={svgPaths.p1da67b80} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.3333 1.66667V5" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 1.66667V5" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 8.33333H17.5" id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Field3() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">mm/dd/yyyy</p>
          <Calendar1 />
        </div>
      </div>
    </div>
  );
}

function Default3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="default">
      <Field3 />
    </div>
  );
}

function InputWithButton3() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-[270px]" data-name="input/with button">
      <Default3 />
    </div>
  );
}

function Clock1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="clock">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="clock">
          <path d={svgPaths.p14d24500} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 5V10L13.3333 11.6667" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Field4() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">--:--</p>
          <Clock1 />
        </div>
      </div>
    </div>
  );
}

function Default4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="default">
      <Field4 />
    </div>
  );
}

function InputWithButton4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-start min-h-px min-w-px relative" data-name="input/with button">
      <Default4 />
    </div>
  );
}

function EventEndsInputContainer() {
  return (
    <div className="content-stretch flex gap-[6px] items-start relative shrink-0 w-full" data-name="Event Ends Input Container">
      <InputWithButton3 />
      <InputWithButton4 />
    </div>
  );
}

function Input2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-h-px min-w-px relative" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event Ends</p>
      <EventEndsInputContainer />
    </div>
  );
}

function EventTimingContainer() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="Event Timing Container">
      <Input1 />
      <Input2 />
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Check">
          <path d={svgPaths.p39be50} id="Icon" stroke="var(--stroke-0, #F5F5F5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox() {
  return (
    <div className="bg-[#8b5cf6] content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[16px]" data-name="Checkbox">
      <Check />
    </div>
  );
}

function CheckboxAndLabel() {
  return (
    <div className="content-stretch flex gap-[12px] items-center min-w-[120px] relative shrink-0" data-name="Checkbox and Label">
      <Checkbox />
      <p className="css-4hzbpn flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-h-px min-w-px not-italic relative text-[#1e1e1e] text-[16px]">Recurring Event</p>
    </div>
  );
}

function CheckboxField() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Checkbox Field">
      <CheckboxAndLabel />
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Chevron down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Chevron down">
          <path d="M4 6L8 10L12 6" id="Icon" stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.666667" />
        </g>
      </svg>
    </div>
  );
}

function CountrySelect() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Country Select">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Raleway:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#94a3b8] text-[14px]">Select Country</p>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Country*</p>
      <CountrySelect />
    </div>
  );
}

function VenueLocationSelect() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Venue Location Select">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Raleway:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#94a3b8] text-[14px]">Search address or venue</p>
        </div>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Venue Location of Event*</p>
      <VenueLocationSelect />
    </div>
  );
}

function MapPin() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="map-pin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="map-pin">
          <path d={svgPaths.pf087300} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p2d59bff0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center p-[16px] relative rounded-[12px] shrink-0 w-[248px]" data-name="button">
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
      <MapPin />
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Edit location on map</p>
    </div>
  );
}

function EditLocationContainer() {
  return (
    <div className="bg-[rgba(0,0,0,0.2)] h-[140px] relative rounded-[8px] shrink-0 w-full" data-name="Edit Location Container">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center p-[10px] relative size-full">
          <Button />
        </div>
      </div>
    </div>
  );
}

function EventCategorySelect() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Event Category Select">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Raleway:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#94a3b8] text-[14px]">Enter category</p>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d="M7.5 2.5L2.5 7.5" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.5 2.5L7.5 7.5" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#e5e5e5] h-[22px] relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit]">
        <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#030213] text-[11px]">party</p>
        <Icon1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d="M7.5 2.5L2.5 7.5" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.5 2.5L7.5 7.5" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge1() {
  return (
    <div className="bg-[#e5e5e5] h-[22px] relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit]">
        <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#030213] text-[11px]">Carnival</p>
        <Icon2 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
        <g id="Icon">
          <path d="M7.5 2.5L2.5 7.5" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2.5 2.5L7.5 7.5" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Badge2() {
  return (
    <div className="bg-[#e5e5e5] h-[22px] relative rounded-[8px] shrink-0" data-name="Badge">
      <div className="content-stretch flex gap-[4px] h-full items-center justify-center overflow-clip px-[9px] py-[3px] relative rounded-[inherit]">
        <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#030213] text-[11px]">Kids</p>
        <Icon3 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[16px]" data-name="Frame">
      <div className="absolute inset-[20.83%]" data-name="Vector">
        <div className="absolute inset-[-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
            <path d={svgPaths.p386a9f40} id="Vector" stroke="var(--stroke-0, #8B5CF6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative shrink-0 size-[16px]" data-name="SVG">
      <Frame />
    </div>
  );
}

function SvgMargin() {
  return (
    <div className="content-stretch flex flex-col h-[16px] items-start pr-[4px] relative shrink-0 w-[20px]" data-name="SVG:margin">
      <Svg />
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Button">
      <SvgMargin />
      <div className="css-g0mm18 flex flex-col font-['Raleway:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#8b5cf6] text-[12px] text-center">
        <p className="css-ew64yg leading-[20px]">New Tag</p>
      </div>
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="content-stretch flex flex-col items-start px-[9px] py-[8px] relative shrink-0" data-name="Button:margin">
      <Button1 />
    </div>
  );
}

function PeopleHubPage() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full" data-name="PeopleHubPage">
      <Badge />
      <Badge1 />
      <Badge2 />
      <ButtonMargin />
    </div>
  );
}

function Input5() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center py-[12px] relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Event category</p>
      <EventCategorySelect />
      <PeopleHubPage />
    </div>
  );
}

function FormContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Form Container">
      <InputContainer />
      <EventTypeContainer />
      <AddACoverImage />
      <EventDescriptionContainer />
      <EventTimingContainer />
      <CheckboxField />
      <Input3 />
      <Input4 />
      <EditLocationContainer />
      <Input5 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#f5f5f5] flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#8b5cf6] text-[14px]">Cancel</p>
        </div>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#6342e9] flex-[1_0_0] min-h-px min-w-px relative rounded-[12px]" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Continue</p>
        </div>
      </div>
    </div>
  );
}

function ActionButtonsContainer() {
  return (
    <div className="content-stretch flex gap-[32px] items-start relative shrink-0 w-full" data-name="Action Buttons Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function FormContainer1() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[880px]" data-name="Form Container">
      <FormContainer />
      <ActionButtonsContainer />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[24px] items-center left-1/2 p-[32px] rounded-[16px] top-[124px] translate-x-[-50%] w-[1280px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Header />
      <FormContainer1 />
    </div>
  );
}

function LogoIcon() {
  return (
    <div className="h-[27.292px] relative shrink-0 w-[38.573px]" data-name="Logo Icon">
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
      <LogoIcon />
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
        <g clipPath="url(#clip0_10_7912)" id="settings">
          <path d={svgPaths.p3cccb600} id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p3737f500} id="Vector_2" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_10_7912">
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

function Header1() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-1/2 px-[80px] py-[16px] top-0 translate-x-[-50%] w-[1440px]" data-name="Header">
      <div aria-hidden="true" className="absolute border-b border-black border-solid inset-0 pointer-events-none" />
      <LogoContainer />
      <NavigationContainer />
      <UserActionsContainer />
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="relative size-full" data-name="Desktop - 3" style={{ backgroundImage: "linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(248, 250, 252) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container />
      <Header1 />
    </div>
  );
}