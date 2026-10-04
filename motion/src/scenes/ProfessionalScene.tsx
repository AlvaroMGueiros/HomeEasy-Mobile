import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Rating } from "../components/Rating";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";

export function ProfessionalScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  return (
    <SceneShell>
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          flexDirection: portrait ? "column" : "row",
          gap: portrait ? 80 : 140,
        }}
      >
        <div
          style={{
            width: portrait ? 900 : 740,
            padding: portrait ? 70 : 55,
            borderRadius: 40,
            background: colors.surface,
            boxShadow: `0 40px 100px ${colors.shadow}`,
            transform: `translateY(${(1 - reveal(frame, 10)) * 90}px)`,
          }}
        >
          <div
            style={{
              width: portrait ? 235 : 170,
              height: portrait ? 235 : 170,
              borderRadius: 150,
              background: colors.pale,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name="person" size={portrait ? 130 : 95} />
          </div>
          <div
            style={{
              marginTop: 35,
              color: colors.ink,
              fontSize: portrait ? 58 : 46,
              fontWeight: 800,
            }}
          >
            {copy.selectedProfessional.name}
          </div>
          <div style={{ marginTop: 10, fontSize: 26, color: colors.muted }}>
            {copy.selectedProfessional.location}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              margin: "30px 0 35px",
            }}
          >
            <Rating size={30} />
            <span style={{ fontSize: 25, color: colors.muted }}>
              {copy.selectedProfessional.completed}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              color: colors.success,
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 35,
            }}
          >
            <Icon name="shield" size={30} color={colors.success} /> {copy.selectedProfessional.verified}
          </div>
          <div
            style={{
              padding: 25,
              background: colors.background,
              borderRadius: 20,
              color: colors.ink,
              fontSize: 24,
            }}
          >
            {copy.selectedProfessional.review}
          </div>
          <div style={{ marginTop: 30 }}>
            <Button label={copy.requestButton} start={120} width="100%" />
          </div>
        </div>
        <div style={{ width: portrait ? "100%" : 800 }}>
          <div
            style={{
              color: colors.teal,
              fontWeight: 800,
              letterSpacing: 4,
              fontSize: 23,
            }}
          >
            {copy.sceneLabels[3]}
          </div>
          <div style={{ marginTop: 32 }}>
            <AnimatedText
              words={copy.trust.split(" ")}
              start={50}
              size={portrait ? 115 : 140}
              accentIndex={2}
            />
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
