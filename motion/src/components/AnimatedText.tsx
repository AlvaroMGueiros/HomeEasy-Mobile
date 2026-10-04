import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { duration, reveal } from "../theme/motion";
import { typography } from "../theme/typography";

export function AnimatedText({
  words,
  start = 0,
  size = 116,
  light = false,
  align = "left",
  accentIndex,
}: {
  words: readonly string[];
  start?: number;
  size?: number;
  light?: boolean;
  align?: "left" | "center";
  accentIndex?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.22em",
        justifyContent: align === "center" ? "center" : "flex-start",
        maxWidth: "100%",
        color: light ? colors.surface : colors.ink,
        fontSize: size,
        fontWeight: typography.heavy,
        letterSpacing: typography.tracking,
        lineHeight: 0.98,
        textAlign: align,
      }}
    >
      {words.map((word, index) => {
        const visible = reveal(
          frame,
          start + index * duration.stagger * 2,
          duration.main,
        );
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              overflow: "hidden",
              paddingBottom: "0.08em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                color: index === accentIndex ? colors.accent : undefined,
                transform: `translateY(${(1 - visible) * 110}%)`,
                opacity: visible,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
}
