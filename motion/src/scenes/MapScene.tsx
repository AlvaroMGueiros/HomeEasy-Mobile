import { useCurrentFrame, useVideoConfig } from "remotion";
import { Camera } from "../components/Camera";
import { Icon } from "../components/Icon";
import { MapVisual } from "../components/MapVisual";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";

export function MapScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  return (
    <SceneShell dark>
      <Camera pull={0.07}>
        <div
          style={{
            position: "absolute",
            inset: portrait ? 45 : 70,
            borderRadius: 45,
            overflow: "hidden",
            boxShadow: `0 40px 100px ${colors.shadow}`,
          }}
        >
          <MapVisual />
          <div
            style={{
              position: "absolute",
              left: portrait ? 45 : 85,
              top: portrait ? 55 : 70,
              padding: "22px 32px",
              background: colors.surface,
              borderRadius: 27,
              display: "flex",
              alignItems: "center",
              gap: 15,
              color: colors.ink,
              fontSize: 28,
              fontWeight: 800,
              opacity: reveal(frame, 30),
            }}
          >
            <Icon name="pin" size={34} /> {copy.city}
          </div>
          <div
            style={{
              position: "absolute",
              right: portrait ? 25 : 70,
              bottom: portrait ? 130 : 65,
              transform: portrait ? "scale(.82)" : undefined,
              transformOrigin: "right bottom",
            }}
          >
            <ProfessionalCard
              name={copy.selectedProfessional.name}
              service={copy.selectedProfessional.mapDetail}
              start={95}
              selected
            />
          </div>
        </div>
      </Camera>
    </SceneShell>
  );
}
