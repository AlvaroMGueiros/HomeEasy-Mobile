import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { reveal } from "../theme/motion";
import { Icon } from "./Icon";
import { Rating } from "./Rating";

export function ProfessionalCard({
  name,
  service,
  start = 0,
  selected = false,
  compact = false,
}: {
  name: string;
  service: string;
  start?: number;
  selected?: boolean;
  compact?: boolean;
}) {
  const frame = useCurrentFrame();
  const entry = reveal(frame, start);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        width: compact ? 350 : 520,
        minHeight: compact ? 105 : 154,
        padding: compact ? 20 : 28,
        borderRadius: 28,
        background: colors.surface,
        border: `3px solid ${selected ? colors.accent : colors.border}`,
        boxShadow: `0 28px 70px ${colors.shadow}`,
        opacity: entry,
        transform: `translateY(${(1 - entry) * 70}px)`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: compact ? 62 : 90,
          height: compact ? 62 : 90,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: colors.pale,
        }}
      >
        <Icon name="person" size={compact ? 37 : 54} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: compact ? 20 : 29,
            fontWeight: 800,
            color: colors.ink,
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: compact ? 16 : 22,
            color: colors.muted,
          }}
        >
          {service}
        </div>
      </div>
      <Rating size={compact ? 18 : 23} />
    </div>
  );
}
