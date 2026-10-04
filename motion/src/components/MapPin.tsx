import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { springReveal } from "../theme/motion";
import { Icon, type IconName } from "./Icon";

export function MapPin({
  icon = "person",
  start = 0,
  size = 70,
  count,
}: {
  icon?: IconName;
  start?: number;
  size?: number;
  count?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = springReveal(frame, start, fps);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        border: `5px solid ${colors.surface}`,
        boxShadow: `0 12px 30px ${colors.shadow}`,
        display: "grid",
        placeItems: "center",
        color: colors.surface,
        background: colors.teal,
        transform: `translateY(${(1 - entry) * -100}px) scale(${entry})`,
      }}
    >
      {count ?? <Icon name={icon} size={size * 0.45} color={colors.surface} />}
    </div>
  );
}
