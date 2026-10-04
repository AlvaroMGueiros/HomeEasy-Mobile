import type { CSSProperties } from "react";
import { colors } from "../theme/colors";

export type IconName =
  | "home"
  | "search"
  | "pin"
  | "bolt"
  | "sparkle"
  | "brush"
  | "pipe"
  | "tools"
  | "person"
  | "star"
  | "check"
  | "chat"
  | "calendar"
  | "camera"
  | "shield"
  | "arrow"
  | "bell"
  | "clock"
  | "paperclip";

const paths: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5V21H3z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bolt: <path d="m13 2-9 11h7l-1 9 10-12h-7z" />,
  sparkle: (
    <>
      <path d="m12 2 2.1 7.9L22 12l-7.9 2.1L12 22l-2.1-7.9L2 12l7.9-2.1z" />
    </>
  ),
  brush: (
    <>
      <path d="M4 4h16v5H4zM12 9v4m0 0c-2 0-3 2-3 4v3h6v-3c0-2-1-4-3-4Z" />
    </>
  ),
  pipe: (
    <>
      <path d="M4 4v7h7V4h6v7h3v5H9a5 5 0 0 1-5-5V4Z" />
    </>
  ),
  tools: (
    <>
      <path d="m4 20 10-10M13 5a5 5 0 0 0 6 6l-9 9-6-6 9-9Z" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-5 3-7 8-7s8 2 8 7" />
    </>
  ),
  star: (
    <path d="m12 2 3.1 6.4 7 1-5.1 5 1.2 7-6.2-3.3-6.2 3.3 1.2-7-5.1-5 7-1z" />
  ),
  check: <path d="m4 12 5 5L20 6" />,
  chat: <path d="M4 4h16v13H9l-5 4z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 2v6m10-6v6M3 10h18" />
    </>
  ),
  camera: (
    <>
      <rect x="2" y="6" width="20" height="15" rx="3" />
      <circle cx="12" cy="13" r="4" />
      <path d="m7 6 1.5-3h7L17 6" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 6-4 9-8 11-4-2-8-5-8-11V5z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  bell: (
    <>
      <path d="M6 17V9a6 6 0 0 1 12 0v8l2 2H4zM10 21h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  paperclip: <path d="m8 12 7-7a4 4 0 0 1 6 6L11 21a6 6 0 0 1-8-8L13 3" />,
};

export function Icon({
  name,
  size = 32,
  color = colors.teal,
  filled = false,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
