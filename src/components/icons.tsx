import React from "react";

// Paths from Figma imports
const paths = {
  logoDiamonds: [
    "M24.8468 0L33.7436 17.2283H15.95L24.8468 0Z",
    "M8.89679 8.24353L17.7936 25.4719H0L8.89679 8.24353Z"
  ],
  google: {
    p1: "M19.3182 8.18196H18.6364H10V11.3638H15.4091C15.1591 12.6365 14.1136 13.6365 12.7273 13.6365C10.9773 13.6365 9.54545 12.0456 9.54545 10.0001C9.54545 7.95469 10.9773 6.36378 12.7273 6.36378C13.5682 6.36378 14.3182 6.68196 14.9091 7.18196L17.0227 5.06833C15.8636 3.97742 14.3864 3.31833 12.7273 3.31833C9.02273 3.31833 6.02273 6.31833 6.02273 10.0001C6.02273 13.682 9.02273 16.682 12.7273 16.682C16.4318 16.682 19.5455 14.0001 19.5455 10.0001C19.5455 9.38651 19.4545 8.77287 19.3182 8.18196Z",
    p2: "M3.65909 6.27287L6.02273 8.13651C6.65909 6.5456 8.22727 5.43196 10.0455 5.43196C11.7273 5.43196 13.2045 6.09105 14.3409 7.18196L12.2273 9.2956C11.6364 8.7956 10.8864 8.47742 10.0455 8.47742C8.29545 8.47742 6.86364 10.0683 6.86364 12.1138C6.86364 12.8183 7.04545 13.4774 7.36364 14.0456L4.93182 15.8865C3.93182 14.8183 3.31818 13.5229 3.31818 12.1138C3.31818 9.93196 4.18182 7.95469 5.56818 6.5456L3.65909 6.27287Z",
    p3: "M9.54542 10.0001C9.54542 12.0456 10.9772 13.6365 12.7272 13.6365C14.1136 13.6365 15.1591 12.6365 15.4091 11.3638H9.99997L9.54542 10.0001Z",
    p4: "M19.3182 8.18182H18.6364V10H19.5455C19.5455 9.38637 19.4545 8.77273 19.3182 8.18182Z"
  },
  eye: {
    path1: "M8.00001 11.0909C9.70712 11.0909 11.0909 9.70709 11.0909 7.99998C11.0909 6.29287 9.70712 4.90906 8.00001 4.90906C6.2929 4.90906 4.9091 6.29287 4.9091 7.99998C4.9091 9.70709 6.2929 11.0909 8.00001 11.0909Z",
    path2: "M8.00001 13.6363C11.1132 13.6363 13.6364 11.1132 13.6364 7.99996C13.6364 4.88675 11.1132 2.3636 8.00001 2.3636C4.88681 2.3636 2.36365 4.88675 2.36365 7.99996C2.36365 11.1132 4.88681 13.6363 8.00001 13.6363Z"
  },
  email: "M13.8462 0C6.19962 0 0 6.19962 0 13.8462C0 21.4927 6.19962 27.6923 13.8462 27.6923C21.4927 27.6923 27.6923 21.4927 27.6923 13.8462C27.6923 6.19962 21.4927 0 13.8462 0ZM13.8462 24.9231C7.73654 24.9231 2.76923 19.9558 2.76923 13.8462C2.76923 7.73654 7.73654 2.76923 13.8462 2.76923C19.9558 2.76923 24.9231 7.73654 24.9231 13.8462C24.9231 19.9558 19.9558 24.9231 13.8462 24.9231ZM20.7692 9.69231L13.8462 16.6154L6.92308 9.69231H5.53846V18H8.30769V12.4615L13.8462 18L19.3846 12.4615V18H22.1538V9.69231H20.7692Z",
  menu: "M2.66667 12H13.3333C13.7 12 14 11.7 14 11.3333C14 10.9667 13.7 10.6667 13.3333 10.6667H2.66667C2.3 10.6667 2 10.9667 2 11.3333C2 11.7 2.3 12 2.66667 12ZM2.66667 8.66667H13.3333C13.7 8.66667 14 8.36667 14 8C14 7.63333 13.7 7.33333 13.3333 7.33333H2.66667C2.3 7.33333 2 7.63333 2 8C2 8.36667 2.3 8.66667 2.66667 8.66667ZM2 4.66667C2 5.03333 2.3 5.33333 2.66667 5.33333H13.3333C13.7 5.33333 14 5.03333 14 4.66667C14 4.3 13.7 4 13.3333 4H2.66667C2.3 4 2 4.3 2 4.66667Z",
  notification: "M16 29.3333C17.4667 29.3333 18.6667 28.1333 18.6667 26.6667H13.3333C13.3333 28.1333 14.5333 29.3333 16 29.3333ZM24 21.3333V14.6667C24 10.5733 21.8267 7.14667 18 6.24V5.33333C18 4.22667 17.1067 3.33333 16 3.33333C14.8933 3.33333 14 4.22667 14 5.33333V6.24C10.1867 7.14667 8 10.56 8 14.6667V21.3333L5.33333 24V25.3333H26.6667V24L24 21.3333ZM21.3333 22.6667H10.6667V14.6667C10.6667 11.36 12.68 8.66667 16 8.66667C19.32 8.66667 21.3333 11.36 21.3333 14.6667V22.6667Z",
  help: {
    p1: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z",
    p2: "M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
  },
  settings: {
    p1: "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z",
    p2: "M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
  },
  search: "M10.3333 9.33333H9.80667L9.62 9.15333C10.42 8.22 10.8333 6.94667 10.6067 5.59333C10.2933 3.74 8.74667 2.26 6.88 2.03333C4.06 1.68667 1.68667 4.06 2.03333 6.88C2.26 8.74667 3.74 10.2933 5.59333 10.6067C6.94667 10.8333 8.22 10.42 9.15333 9.62L9.33333 9.80667V10.3333L12.1667 13.1667C12.44 13.44 12.8867 13.44 13.16 13.1667C13.4333 12.8933 13.4333 12.4467 13.16 12.1733L10.3333 9.33333ZM6.33333 9.33333C4.67333 9.33333 3.33333 7.99333 3.33333 6.33333C3.33333 4.67333 4.67333 3.33333 6.33333 3.33333C7.99333 3.33333 9.33333 4.67333 9.33333 6.33333C9.33333 7.99333 7.99333 9.33333 6.33333 9.33333Z",
  sort: "M2.66667 12H5.33333C5.7 12 6 11.7 6 11.3333C6 10.9667 5.7 10.6667 5.33333 10.6667H2.66667C2.3 10.6667 2 10.9667 2 11.3333C2 11.7 2.3 12 2.66667 12ZM2 4.66667C2 5.03333 2.3 5.33333 2.66667 5.33333H13.3333C13.7 5.33333 14 5.03333 14 4.66667C14 4.3 13.7 4 13.3333 4H2.66667C2.3 4 2 4.3 2 4.66667ZM2.66667 8.66667H9.33333C9.7 8.66667 10 8.36667 10 8C10 7.63333 9.7 7.33333 9.33333 7.33333H2.66667C2.3 7.33333 2 7.63333 2 8C2 8.36667 2.3 8.66667 2.66667 8.66667Z",
    grid: "M3 7.6C3 8.15229 3.44772 8.6 4 8.6H7.6C8.15229 8.6 8.6 8.15229 8.6 7.6V4C8.6 3.44771 8.15229 3 7.6 3H4C3.44771 3 3 3.44772 3 4V7.6ZM3 16C3 16.5523 3.44772 17 4 17H7.6C8.15229 17 8.6 16.5523 8.6 16V12.4C8.6 11.8477 8.15229 11.4 7.6 11.4H4C3.44771 11.4 3 11.8477 3 12.4V16ZM11.4 16C11.4 16.5523 11.8477 17 12.4 17H16C16.5523 17 17 16.5523 17 16V12.4C17 11.8477 16.5523 11.4 16 11.4H12.4C11.8477 11.4 11.4 11.8477 11.4 12.4V16ZM11.4 7.6C11.4 8.15229 11.8477 8.6 12.4 8.6H16C16.5523 8.6 17 8.15229 17 7.6V4C17 3.44771 16.5523 3 16 3H12.4C11.8477 3 11.4 3.44772 11.4 4V7.6Z",
    list: "M4.83464 10.8333H14.8346C15.293 10.8333 15.668 10.4583 15.668 10C15.668 9.54167 15.293 9.16667 14.8346 9.16667H4.83464C4.3763 9.16667 4.0013 9.54167 4.0013 10C4.0013 10.4583 4.3763 10.8333 4.83464 10.8333ZM4.83464 14.1667H14.8346C15.293 14.1667 15.668 13.7917 15.668 13.3333C15.668 12.875 15.293 12.5 14.8346 12.5H4.83464C4.3763 12.5 4.0013 12.875 4.0013 13.3333C4.0013 13.7917 4.3763 14.1667 4.83464 14.1667ZM4.0013 6.66667C4.0013 7.125 4.3763 7.5 4.83464 7.5H14.8346C15.293 7.5 15.668 7.125 15.668 6.66667C15.668 6.20833 15.293 5.83333 14.8346 5.83333H4.83464C4.3763 5.83333 4.0013 6.20833 4.0013 6.66667Z",
    plus: "M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z",
    arrowDown: "M5.41333 6.19333L8 8.78L10.5867 6.19333C10.8467 5.93333 11.2667 5.93333 11.5267 6.19333C11.7867 6.45333 11.7867 6.87333 11.5267 7.13333L8.46667 10.1933C8.20667 10.4533 7.78667 10.4533 7.52667 10.1933L4.46667 7.13333C4.20667 6.87333 4.20667 6.45333 4.46667 6.19333C4.72667 5.94 5.15333 5.93333 5.41333 6.19333V6.19333Z"
};

export const LogoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 49 35">
    <path d={paths.logoDiamonds[0]} fill="currentColor" />
    <path d={paths.logoDiamonds[1]} fill="currentColor" />
  </svg>
);

export const GoogleIcon = () => (
  <svg className="size-5" viewBox="0 0 20 20" fill="none">
    <path d={paths.google.p1} fill="#FBBC05" />
    <path d={paths.google.p2} fill="#EA4335" />
    <path d={paths.google.p3} fill="#34A853" />
    <path d={paths.google.p4} fill="#4285F4" />
  </svg>
);

export const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d="M2 8C2 8 4.5 3 8 3C9.5 3 10.8 3.9 11.8 5M14 8C14 8 11.5 13 8 13C6.5 13 5.2 12.1 4.2 11M2 2L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.4 6.6C9.8 7 10 7.5 10 8C10 9.1 9.1 10 8 10C7.5 10 7 9.8 6.6 9.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IndividualIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`} style={{ width: 24, height: 24 }}>
     <svg className="absolute top-[4px] left-[6px]" width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.33333 11.6667C9.27885 11.6667 11.6667 9.27885 11.6667 6.33333C11.6667 3.38781 9.27885 1 6.33333 1C3.38781 1 1 3.38781 1 6.33333C1 9.27885 3.38781 11.6667 6.33333 11.6667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
     <svg className="absolute bottom-[2px] left-[3px]" width="21" height="10" viewBox="0 0 21 10" fill="none">
        <path d="M19.6667 9V6.33333C19.6667 4.91885 19.1048 3.56229 18.1046 2.5621C17.1044 1.5619 15.7478 1 14.3333 1H6.33333C4.91885 1 3.56229 1.5619 2.5621 2.5621C1.5619 3.56229 1 4.91885 1 6.33333V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
  </div>
);

export const OrganizationIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="33" height="33" viewBox="0 0 33 33" fill="none">
        <path d="M8.33333 16.3333H5.66667C4.95942 16.3333 4.28115 16.6143 3.78105 17.1144C3.28095 17.6145 3 18.2928 3 19V27C3 27.7072 3.28095 28.3855 3.78105 28.8856C4.28115 29.3857 4.95942 29.6667 5.66667 29.6667H8.33333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.33333 29.6667V5.66667C8.33333 4.95942 8.61429 4.28115 9.11438 3.78105C9.61448 3.28095 10.2928 3 11 3H21.6667C22.3739 3 23.0522 3.28095 23.5523 3.78105C24.0524 4.28115 24.3333 4.95942 24.3333 5.66667V29.6667H8.33333Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24.3333 12.3333H27C27.7072 12.3333 28.3855 12.6143 28.8856 13.1144C29.3857 13.6145 29.6667 14.2928 29.6667 15V27C29.6667 27.7072 29.3857 28.3855 28.8856 28.8856C28.3855 29.3857 27.7072 29.6667 27 29.6667H24.3333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.6111 8.16667H19.0556" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.6111 13.6111H19.0556" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.6111 19.0556H19.0556" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.6111 24.5H19.0556" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d={paths.menu} fill="currentColor" />
  </svg>
);

export const NotificationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 32 32">
    <path d={paths.notification} fill="currentColor" />
  </svg>
);

export const HelpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path d={paths.help.p1} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d={paths.help.p2} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path d={paths.settings.p1} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d={paths.settings.p2} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d={paths.search} fill="currentColor" />
  </svg>
);

export const SortIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d={paths.sort} fill="currentColor" />
  </svg>
);

export const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 20 20">
    <path d={paths.grid} fill="currentColor" />
  </svg>
);

export const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 20 20">
    <path d={paths.list} fill="currentColor" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <path d={paths.plus} fill="currentColor" />
  </svg>
);

export const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 16 16">
    <path d={paths.arrowDown} fill="currentColor" />
  </svg>
);

export const MoreVerticalIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 8.33333H17.5M13.3333 1.66667V5M6.66667 1.66667V5M2.91667 16.6667H17.0833C17.8567 16.6667 18.4167 16.1067 18.4167 15.3333V5C18.4167 4.22667 17.8567 3.66667 17.0833 3.66667H2.91667C2.14333 3.66667 1.58333 4.22667 1.58333 5V15.3333C1.58333 16.1067 2.14333 16.6667 2.91667 16.6667Z" />
  </svg>
);

export const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 20 20" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333ZM10 5V10L13.3333 11.6667" />
  </svg>
);

export const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="2.67">
    <path strokeLinecap="round" strokeLinejoin="round" d="M28 20v5.33A2.67 2.67 0 0125.33 28H6.67A2.67 2.67 0 014 25.33V20M22.67 10.67L16 4l-6.67 6.67M16 4v16" />
  </svg>
);