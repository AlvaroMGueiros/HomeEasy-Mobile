import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Icon, type IconName } from "../components/Icon";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

const serviceIcons: IconName[] = ["bolt", "sparkle", "brush", "pipe", "tools"];

export function ProblemsScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  return (
    <SceneShell dark>
      <div
        style={{
          position: "absolute",
          left: portrait ? 65 : 125,
          top: portrait ? 280 : 130,
          zIndex: 2,
          maxWidth: portrait ? 850 : 1300,
        }}
      >
        <AnimatedText
          words={copy.problems.split(" ")}
          start={50}
          size={portrait ? 90 : 112}
          light
          accentIndex={7}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: "-5%",
          bottom: portrait ? "26%" : "9%",
          display: "flex",
          gap: 22,
          transform: `translateX(${interpolate(frame, [0, 330], [width * 0.4, -width * 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easing.snapOut })}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {copy.services.map((label, index) => (
          <div
            key={label}
            style={{
              width: portrait ? 300 : 345,
              height: portrait ? 280 : 320,
              flexShrink: 0,
              padding: 36,
              borderRadius: 28,
              background: index === 2 ? colors.accent : colors.surface,
              color: index === 2 ? colors.surface : colors.teal,
              transform: `translateY(${index % 2 ? 65 : -35}px) rotate(${(index - 2) * 2}deg)`,
              opacity: reveal(frame, 12 + index * 4),
            }}
          >
            <Icon
              name={serviceIcons[index]}
              size={90}
              color={index === 2 ? colors.surface : colors.teal}
            />
            <div style={{ marginTop: 45, fontSize: 35, fontWeight: 800 }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 100,
          bottom: 80,
          fontSize: 190,
          fontWeight: 800,
          letterSpacing: "-0.08em",
          opacity: 0.07,
        }}
      >
        {copy.resolveWatermark}
      </div>
    </SceneShell>
  );
}
