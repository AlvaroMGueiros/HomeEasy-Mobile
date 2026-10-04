import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { reveal } from "../theme/motion";
import { Icon, type IconName } from "./Icon";

export function ServiceCard({
  label,
  icon,
  start = 0,
  compact = false,
}: {
  label: string;
  icon: IconName;
  start?: number;
  compact?: boolean;
}) {
  const frame = useCurrentFrame();
  const entry = reveal(frame, start);
  return (
    <div
      style={{
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        flexDirection: compact ? "row" : "column",
        gap: compact ? 15 : 36,
        width: compact ? 300 : 370,
        minHeight: compact ? 110 : 250,
        padding: compact ? 22 : 36,
        borderRadius: 30,
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        boxShadow: `0 24px 60px ${colors.shadow}`,
        transform: `translateY(${(1 - entry) * 90}px) rotate(${(1 - entry) * -5}deg)`,
        opacity: entry,
      }}
    >
      <Icon name={icon} size={compact ? 39 : 74} />
      <span
        style={{
          fontSize: compact ? 22 : 34,
          fontWeight: 800,
          color: colors.ink,
        }}
      >
        {label}
      </span>
    </div>
  );
}
