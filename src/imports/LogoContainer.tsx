import svgPaths from "./svg-l4qpfmqf03";

function Logo() {
  return (
    <div className="h-[34.457px] relative shrink-0 w-[48.698px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48.6984 34.4567">
        <g id="Logo">
          <path d={svgPaths.pfd63200} fill="var(--fill-0, #525252)" id="Rectangle 12" />
          <path d={svgPaths.p22d01d00} fill="var(--fill-0, #525252)" id="Rectangle 13" />
        </g>
      </svg>
    </div>
  );
}

export default function LogoContainer() {
  return (
    <div className="content-stretch flex items-center relative size-full" data-name="Logo Container">
      <Logo />
      <div className="css-g0mm18 flex flex-col font-['Amulya_Variable:Regular',sans-serif] font-normal justify-end leading-[0] relative shrink-0 text-[#525252] text-[34.006px]">
        <p className="css-ew64yg leading-[normal]">Munar</p>
      </div>
    </div>
  );
}