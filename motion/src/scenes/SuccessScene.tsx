import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Icon } from "../components/Icon";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

export function SuccessScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  const grow = interpolate(frame, [30, 115], [0.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.inOutExpo,
  });
  return (
    <SceneShell>
      <div
        style={{
          position: "absolute",
          top: portrait ? "19%" : "12%",
          left: portrait ? "9%" : "12%",
          fontSize: 30,
          fontWeight: 800,
          color: colors.teal,
          letterSpacing: 5,
        }}
      >
        {copy.sceneLabels[7]}
      </div>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: portrait ? 290 : 240,
            height: portrait ? 290 : 240,
            borderRadius: 200,
            background: colors.success,
            display: "grid",
            placeItems: "center",
            transform: `scale(${grow})`,
            boxShadow: `0 0 0 ${grow * 55}px ${colors.pale}`,
          }}
        >
          <Icon
            name="check"
            size={portrait ? 155 : 125}
            color={colors.surface}
          />
        </div>
        <div
          style={{
            marginTop: 105,
            color: colors.ink,
            fontSize: portrait ? 98 : 145,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            textAlign: "center",
            opacity: reveal(frame, 100),
          }}
        >
          {copy.completedTitle}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 55 }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              style={{
                opacity: reveal(frame, 130 + index * 14),
                transform: `scale(${0.5 + reveal(frame, 130 + index * 14) * 0.5})`,
              }}
            >
              <Icon
                name="star"
                size={portrait ? 60 : 70}
                color={colors.gold}
                filled
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 65 }}>
          <AnimatedText
            words={copy.success.split(" ")}
            start={185}
            size={portrait ? 62 : 70}
            align="center"
          />
        </div>
      </div>
    </SceneShell>
  );
}
