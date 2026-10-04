import { useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { springReveal } from "../theme/motion";

export function ChatBubble({
  text,
  start = 0,
  outgoing = false,
}: {
  text: string;
  start?: number;
  outgoing?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = springReveal(frame, start, fps);
  return (
    <div
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        maxWidth: "78%",
        borderRadius: 24,
        borderBottomRightRadius: outgoing ? 5 : 24,
        borderBottomLeftRadius: outgoing ? 24 : 5,
        padding: "22px 25px",
        background: outgoing ? colors.teal : colors.surface,
        color: outgoing ? colors.surface : colors.ink,
        boxShadow: `0 12px 32px ${colors.shadow}`,
        fontSize: 24,
        lineHeight: 1.35,
        transform: `translateY(${(1 - entry) * 40}px) scale(${0.9 + entry * 0.1})`,
        opacity: entry,
      }}
    >
      {text}
    </div>
  );
}
