import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandMark } from "../components/BrandMark";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

export function OutroScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  const arrive = interpolate(frame, [0, 105], [0.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.inOutExpo,
  });
  return (
    <SceneShell>
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${arrive})`,
            filter: `blur(${(1 - arrive) * 20}px)`,
          }}
        >
          <BrandMark size={portrait ? 260 : 230} />
        </div>
        <div
          style={{
            marginTop: 40,
            color: colors.ink,
            fontSize: portrait ? 116 : 145,
            fontWeight: 800,
            letterSpacing: "-0.07em",
            opacity: reveal(frame, 75),
          }}
        >
          {copy.brand}
        </div>
        <div
          style={{
            marginTop: 35,
            color: colors.teal,
            fontSize: portrait ? 50 : 62,
            fontWeight: 600,
            opacity: reveal(frame, 125),
          }}
        >
          {copy.tagline}
        </div>
        <div
          style={{
            marginTop: 90,
            paddingTop: 35,
            width: portrait ? 740 : 600,
            borderTop: `3px solid ${colors.border}`,
            fontSize: portrait ? 30 : 33,
            fontWeight: 800,
            letterSpacing: 4,
            color: colors.accent,
            opacity: reveal(frame, 180),
          }}
        >
          {copy.action.toUpperCase()}
        </div>
      </div>
    </SceneShell>
  );
}
