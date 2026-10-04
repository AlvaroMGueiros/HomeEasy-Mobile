import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Icon } from "../components/Icon";
import { ProfessionalCard } from "../components/ProfessionalCard";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";

export function SearchScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  const query = copy.searchQuery.slice(
    0,
    Math.max(0, Math.floor((frame - 30) / 3)),
  );
  return (
    <SceneShell>
      <div
        style={{
          position: "absolute",
          left: portrait ? 65 : 135,
          top: portrait ? 200 : 130,
          width: portrait ? 930 : 1400,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: colors.teal,
            letterSpacing: 5,
          }}
        >
          {copy.sceneLabels[2]}
        </div>
        <div style={{ marginTop: 32 }}>
          <AnimatedText
            words={copy.search.split(" ")}
            start={20}
            size={portrait ? 100 : 126}
            accentIndex={2}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            marginTop: 60,
            width: portrait ? 900 : 1030,
            height: 110,
            borderRadius: 30,
            padding: "0 34px",
            background: colors.surface,
            border: `3px solid ${colors.border}`,
            boxShadow: `0 26px 65px ${colors.shadow}`,
            fontSize: 44,
            fontWeight: 600,
            color: colors.ink,
          }}
        >
          <Icon name="search" size={48} />
          {query}
          <span
            style={{ opacity: frame % 30 < 16 ? 1 : 0, color: colors.accent }}
          >
            |
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: portrait ? 290 : 100,
          left: portrait ? 65 : 150,
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          gap: 22,
          opacity: reveal(frame, 96),
        }}
      >
        <ProfessionalCard
          name={copy.searchResults[0].name}
          service={copy.searchResults[0].detail}
          start={97}
          selected
        />
        <ProfessionalCard
          name={copy.searchResults[1].name}
          service={copy.searchResults[1].detail}
          start={111}
        />
        <ProfessionalCard
          name={copy.searchResults[2].name}
          service={copy.searchResults[2].detail}
          start={125}
        />
      </div>
    </SceneShell>
  );
}
