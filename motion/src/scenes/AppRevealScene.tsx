import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Camera } from "../components/Camera";
import { HomePhoneContent, PhoneMockup } from "../components/PhoneMockup";
import { SceneShell } from "../components/SceneShell";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

export function AppRevealScene() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = width < 1200;
  const phoneScale = interpolate(
    frame,
    [0, 95],
    [0.45, portrait ? 1.5 : 0.95],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easing.snapOut,
    },
  );
  return (
    <SceneShell>
      <Camera push={0.03}>
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: portrait ? "column" : "row",
            justifyContent: "space-between",
            gap: 60,
          }}
        >
          <div
            style={{
              width: portrait ? "100%" : "48%",
              marginTop: portrait ? 110 : 0,
            }}
          >
            <div
              style={{
                fontSize: 25,
                letterSpacing: 5,
                fontWeight: 800,
                opacity: reveal(frame, 50),
              }}
            >
              {copy.sceneLabels[1]}
            </div>
            <div style={{ marginTop: 28 }}>
              <AnimatedText
                words={copy.app.split(" ")}
                start={65}
                size={portrait ? 105 : 125}
                accentIndex={3}
              />
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: portrait ? 750 : 690,
              height: portrait ? height * 0.62 : 900,
              display: "grid",
              placeItems: "center",
              transform: `rotateY(${interpolate(frame, [0, 95], [6, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg) scale(${phoneScale})`,
            }}
          >
            <PhoneMockup>
              <HomePhoneContent />
            </PhoneMockup>
          </div>
        </div>
      </Camera>
    </SceneShell>
  );
}
