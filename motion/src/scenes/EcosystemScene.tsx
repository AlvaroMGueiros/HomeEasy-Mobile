import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Camera } from "../components/Camera";
import { Icon, type IconName } from "../components/Icon";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { easing, reveal } from "../theme/motion";

const ecosystem: {
  icon: IconName;
  label: string;
  x: number;
  y: number;
  depth: number;
}[] = [
  { icon: "pin", label: "Perto de você", x: 12, y: 20, depth: 1 },
  { icon: "person", label: "Profissionais", x: 69, y: 16, depth: 0.8 },
  { icon: "chat", label: "Conversa", x: 6, y: 64, depth: 0.75 },
  { icon: "calendar", label: "Agenda", x: 69, y: 67, depth: 1.1 },
  { icon: "star", label: "Avaliações", x: 39, y: 7, depth: 0.7 },
  { icon: "bell", label: "Notificações", x: 36, y: 75, depth: 0.85 },
];

export function EcosystemScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  const converge = interpolate(frame, [190, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.inOutExpo,
  });
  return (
    <SceneShell dark>
      <Camera pull={0.09}>
        <div
          style={{
            position: "absolute",
            left: portrait ? 65 : 130,
            top: portrait ? "39%" : "31%",
            width: portrait ? 900 : 1300,
            zIndex: 4,
          }}
        >
          <AnimatedText
            words={copy.ecosystem.split(" ")}
            start={55}
            size={portrait ? 110 : 145}
            light
            accentIndex={2}
          />
        </div>
        {ecosystem.map((tile, index) => (
          <div
            key={tile.label}
            style={{
              position: "absolute",
              left: `${tile.x + converge * (48 - tile.x)}%`,
              top: `${tile.y + converge * (48 - tile.y)}%`,
              display: "flex",
              gap: 20,
              alignItems: "center",
              padding: "25px 32px",
              borderRadius: 25,
              background: colors.surface,
              color: colors.ink,
              boxShadow: `0 30px 80px ${colors.shadow}`,
              fontSize: portrait ? 24 : 28,
              fontWeight: 800,
              opacity: reveal(frame, 15 + index * 14) * (1 - converge),
              transform: `scale(${tile.depth * (1 - converge * 0.7)}) rotateY(${(index - 3) * 2}deg)`,
            }}
          >
            <Icon name={tile.icon} size={42} />
            {tile.label}
          </div>
        ))}
      </Camera>
    </SceneShell>
  );
}
