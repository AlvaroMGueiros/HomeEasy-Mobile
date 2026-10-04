import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { BrandMark } from "../components/BrandMark";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

export function IntroScene() {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const portrait = width < 1200;
  const point = spring({
    frame: frame - 24,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const zoom = interpolate(frame, [260, 350], [1, portrait ? 18 : 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.inOutExpo,
  });
  return (
    <SceneShell>
      <div
        style={{
          position: "absolute",
          top: portrait ? "26%" : "19%",
          left: portrait ? "8%" : "10%",
          transform: `scale(${zoom})`,
          transformOrigin: "45% 60%",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            position: "relative",
            marginBottom: 100,
            transform: `scale(${0.12 + point * 0.88})`,
            filter: `blur(${(1 - point) * 18}px)`,
          }}
        >
          <BrandMark size={150} />
        </div>
        <AnimatedText
          words={copy.hook}
          start={85}
          size={portrait ? 124 : 193}
          accentIndex={0}
        />
        <div
          style={{
            marginTop: 65,
            color: colors.muted,
            fontSize: portrait ? 30 : 36,
            fontWeight: 600,
            opacity: reveal(frame, 170),
          }}
        >
          {copy.introSubline}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 95,
          right: 110,
          fontSize: 20,
          fontWeight: 800,
          color: colors.teal,
          letterSpacing: 5,
          opacity: reveal(frame, 140),
        }}
      >
        {copy.sceneLabels[0]}
      </div>
    </SceneShell>
  );
}
