import { colors } from "../theme/colors";

export function BrandMark({
  size = 150,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-label="Home Easy"
    >
      <path
        d="M14 56 60 18l46 38v48H14V56Z"
        stroke={light ? colors.surface : colors.teal}
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M43 104V66h34v38"
        stroke={light ? colors.surface : colors.teal}
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="m51 75 8 8 17-20"
        stroke={colors.accent}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
