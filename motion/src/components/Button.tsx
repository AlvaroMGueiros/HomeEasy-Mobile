import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { springReveal } from "../theme/motion";
import { Icon, type IconName } from "./Icon";

export function Button({
  label,
  start = 0,
  icon,
  outlined = false,
  width,
}: {
  label: string;
  start?: number;
  icon?: IconName;
  outlined?: boolean;
  width?: number | string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const press = springReveal(frame, start, fps);
  return (
    <div
      style={{
        display: "inline-flex",
        width,
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        borderRadius: 22,
        padding: "22px 34px",
        background: outlined ? colors.surface : colors.teal,
        border: `2px solid ${colors.teal}`,
        color: outlined ? colors.teal : colors.surface,
        fontSize: 25,
        fontWeight: 800,
        transform: `scale(${0.96 + press * 0.04})`,
      }}
    >
      {icon && (
        <Icon
          name={icon}
          color={outlined ? colors.teal : colors.surface}
          size={26}
        />
      )}{" "}
      {label}
    </div>
  );
}
