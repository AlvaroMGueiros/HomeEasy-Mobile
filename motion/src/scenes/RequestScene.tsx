import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Button } from "../components/Button";
import { Icon, type IconName } from "../components/Icon";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

const stepIcons: IconName[] = ["chat", "calendar", "clock", "camera"];

export function RequestScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  const progress = interpolate(frame, [75, 235], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.snapOut,
  });
  return (
    <SceneShell dark>
      <div
        style={{
          position: "absolute",
          left: portrait ? 70 : 130,
          top: portrait ? 170 : 130,
          width: portrait ? 900 : 1300,
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 5,
            fontWeight: 800,
            color: colors.accent,
          }}
        >
          {copy.sceneLabels[4]}
        </div>
        <div style={{ marginTop: 40 }}>
          <AnimatedText
            words={copy.request.split(" ")}
            size={portrait ? 115 : 145}
            light
            start={20}
            accentIndex={4}
          />
        </div>
        <div
          style={{
            marginTop: 50,
            transform: `scale(${interpolate(frame, [45, 62, 82], [1, 0.96, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            transformOrigin: "left center",
          }}
        >
          <Button label={copy.requestButton} start={35} outlined />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: portrait ? 105 : 185,
          right: portrait ? 105 : 185,
          bottom: portrait ? 270 : 170,
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          justifyContent: "space-between",
          gap: 32,
        }}
      >
        {copy.requestSteps.map((label, index) => (
          <div
            key={label}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: reveal(frame, 85 + index * 30),
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                display: "grid",
                placeItems: "center",
                borderRadius: 24,
                background: colors.surface,
              }}
            >
              <Icon name={stepIcons[index]} size={42} />
            </div>
            <span style={{ fontSize: 29, fontWeight: 800 }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: portrait ? 145 : 225,
          bottom: portrait ? 300 : 210,
          width: portrait ? 7 : `calc(100% - 450px)`,
          height: portrait ? 580 * progress : 7,
          borderRadius: 8,
          background: colors.accent,
          opacity: 0.8,
        }}
      />
    </SceneShell>
  );
}
