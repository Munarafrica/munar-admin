import svgPaths from "./svg-42ec9vhsmh";
import imgFrame22 from "figma:asset/474253cb7d9b021dda3b9a215c06c4f8649ba5be.png";

function Group() {
  return (
    <div className="h-[34.457px] relative shrink-0 w-[48.698px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48.6984 34.4567">
        <g id="Group 4">
          <path d={svgPaths.pfd63200} fill="var(--fill-0, white)" id="Rectangle 12" />
          <path d={svgPaths.p22d01d00} fill="var(--fill-0, white)" id="Rectangle 13" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <Group />
      <div className="css-g0mm18 flex flex-col font-['Amulya_Variable:Regular',sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[34.006px] text-white">
        <p className="css-ew64yg leading-[normal]">Munar</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <p className="css-4hzbpn font-['Raleway:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[64px] text-white w-full">Everything you need to plan, run, and grow your event.</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[73px] items-start justify-end relative shrink-0 w-full">
      <Frame2 />
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[13px] text-center text-white">2026 Munar</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[989px] items-start justify-between left-[18px] px-[29px] py-[26px] rounded-[16px] top-[calc(50%+0.5px)] translate-y-[-50%] w-[684px]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[16px]">
        <img alt="" className="absolute max-w-none object-cover rounded-[16px] size-full" src={imgFrame22} />
        <div className="absolute bg-gradient-to-b from-[rgba(21,6,81,0)] inset-0 rounded-[16px] to-[69.231%] to-[rgba(21,6,81,0.8)]" />
      </div>
      <Frame4 />
      <Frame6 />
    </div>
  );
}

function HeaderContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center leading-[normal] not-italic relative shrink-0 text-center w-full" data-name="Header Container">
      <p className="css-4hzbpn font-['Raleway:Bold',sans-serif] relative shrink-0 text-[21px] text-black w-full">Create an Account</p>
      <p className="css-4hzbpn font-['Raleway:Regular',sans-serif] relative shrink-0 text-[13px] text-[rgba(15,23,42,0.68)] w-full">Enter your details to create your account for free</p>
    </div>
  );
}

function Google() {
  return (
    <div className="absolute inset-[8.33%_10.23%_8.33%_8.33%]" data-name="Google">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.5455 20">
        <g id="Google">
          <path d={svgPaths.p21307180} fill="var(--fill-0, #FBBC05)" id="Intersect" />
          <path d={svgPaths.p16d89a00} fill="var(--fill-0, #EA4335)" id="Intersect_2" />
          <path d={svgPaths.p32d99700} fill="var(--fill-0, #34A853)" id="Subtract" />
          <path d={svgPaths.p17598b70} fill="var(--fill-0, #4285F4)" id="Intersect_3" />
        </g>
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <div className="absolute left-[-6px] overflow-clip size-[24px] top-[-1px]" data-name="google-icon">
      <Google />
    </div>
  );
}

function MaskedIcon() {
  return (
    <div className="h-[22px] relative shrink-0 w-[18px]" data-name="Masked Icon">
      <GoogleIcon />
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-center min-h-px min-w-px relative" data-name="Content">
      <MaskedIcon />
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-black">Sign up with Google</p>
    </div>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center px-[22px] py-[8px] relative w-full">
          <Content />
        </div>
      </div>
    </div>
  );
}

function ButtonGoogle() {
  return (
    <div className="flex-[1_0_0] h-[42px] min-h-px min-w-px relative rounded-[12px]" data-name="Button/Google">
      <div className="content-stretch flex flex-col items-start justify-center overflow-clip relative rounded-[inherit] size-full">
        <Button />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(30,36,50,0.23)] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex gap-[24px] items-center relative rounded-[12px] shrink-0 w-full">
      <ButtonGoogle />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <div className="flex-[1_0_0] h-0 min-h-px min-w-px relative">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 177 1">
            <line id="Line 2" stroke="var(--stroke-0, #525252)" x2="177" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#525252] text-[13px]">{`Or Continue with `}</p>
      <div className="flex-[1_0_0] h-0 min-h-px min-w-px relative">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 177 1">
            <line id="Line 2" stroke="var(--stroke-0, #525252)" x2="177" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Field() {
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="field">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-[-1px] pointer-events-none rounded-[7px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[12px] pr-[56px] py-[8px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#94a3b8] text-[14px]">Email</p>
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
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Email*</p>
      <InputWithButton />
    </div>
  );
}

function Eye() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2_444)" id="Eye">
          <g id="Icon">
            <path d={svgPaths.p348ba580} stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.666667" />
            <path d={svgPaths.p138fbff0} stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.666667" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_2_444">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CurrencySelect() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="Currency Select">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Raleway:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#94a3b8] text-[14px]">Create a strong password</p>
          <Eye />
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Password*</p>
      <CurrencySelect />
      <p className="css-ew64yg font-['Raleway:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#525252] text-[13px]">Must contain at least 8 characters</p>
    </div>
  );
}

function Eye1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Eye">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2_444)" id="Eye">
          <g id="Icon">
            <path d={svgPaths.p348ba580} stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.666667" />
            <path d={svgPaths.p138fbff0} stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.666667" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_2_444">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Select() {
  return (
    <div className="bg-white h-[36px] relative rounded-[6px] shrink-0 w-full" data-name="select">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[8px] relative size-full">
          <p className="css-4hzbpn flex-[1_0_0] font-['Raleway:Regular',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#94a3b8] text-[14px]">Create a strong password</p>
          <Eye1 />
        </div>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="input">
      <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#0f172a] text-[14px]">Confirm Password*</p>
      <Select />
    </div>
  );
}

function FormFieldsContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Form Fields Container">
      <Input />
      <Input1 />
      <Input2 />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="checkbox">
      <div className="bg-white relative rounded-[2px] shrink-0 size-[14px]">
        <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[2px]" />
      </div>
      <p className="css-ew64yg font-['Inter:Medium',sans-serif] font-['Raleway:Medium',sans-serif] font-medium leading-[0] not-italic relative shrink-0 text-[#4e4e4e] text-[0px] text-[12px]">
        <span className="leading-[14px]">{`I accept the `}</span>
        <span className="[text-decoration-skip-ink:none] decoration-solid leading-[14px] text-[#4285f4] underline">Terms of Service</span>
        <span className="leading-[14px]">{` and `}</span>
        <span className="[text-decoration-skip-ink:none] decoration-solid leading-[14px] text-[#4285f4] underline">Privacy Policy</span>
        <span className="leading-[14px] text-[#4285f4]">.</span>
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full">
      <Checkbox />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#8b5cf6] relative rounded-[12px] shrink-0 w-full" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[16px] relative w-full">
          <p className="css-ew64yg font-['Raleway:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white">Sign up for free</p>
        </div>
      </div>
    </div>
  );
}

function FormContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Form Container">
      <FormFieldsContainer />
      <Frame />
      <Button1 />
    </div>
  );
}

function ProfileSetupContainer() {
  return (
    <div className="backdrop-blur-[3.65px] bg-white content-stretch flex flex-col gap-[24px] items-start p-[32px] relative rounded-[16px] shrink-0 w-[538px]" data-name="Profile Setup Container">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <HeaderContainer />
      <Frame1 />
      <Frame3 />
      <FormContainer />
      <p className="css-4hzbpn font-['Poppins:Medium',sans-serif] leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[0px] text-[13px] text-center w-full">
        <span className="font-['Raleway:Regular',sans-serif] leading-[normal]">Got an account?</span>
        <span className="font-['Raleway:Regular',sans-serif] leading-[normal] text-[#8b5cf6]">&nbsp;</span>
        <span className="font-['Raleway:Bold',sans-serif] leading-[normal] text-[#8b5cf6]">{`Login `}</span>
      </p>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[calc(75%-23.5px)] p-[10px] top-[calc(50%+9.5px)] translate-x-[-50%] translate-y-[-50%] w-[639px]" data-name="Container">
      <ProfileSetupContainer />
    </div>
  );
}

export default function SignUp() {
  return (
    <div className="bg-[#f8fafc] relative size-full" data-name="Sign UP">
      <Frame5 />
      <Container />
    </div>
  );
}