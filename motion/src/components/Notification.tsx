import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { reveal } from "../theme/motion";
import { Icon } from "./Icon";

export function Notification({
  text,
  start = 0,
}: {
  text: string;
  start?: number;
}) {
  const frame = useCurrentFrame();
  const entry = reveal(frame, start, 24);
  return (
    <div
      style={{
        display: "flex",
        gap: 17,
        alignItems: "center",
        padding: "24px 30px",
        borderRadius: 25,
        background: colors.surface,
        color: colors.ink,
        boxShadow: `0 25px 70px ${colors.shadow}`,
        fontSize: 25,
        fontWeight: 600,
        transform: `translateY(${(1 - entry) * -70}px)`,
        opacity: entry,
      }}
    >
      <Icon name="bell" size={34} />
      {text}
    </div>
  );
}
