import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Rating } from "../components/Rating";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";

export function ProposalScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  return (
    <SceneShell>
      <div
        style={{
          position: "absolute",
          top: portrait ? 170 : 125,
          left: portrait ? 70 : 125,
        }}
      >
        <div
          style={{
            color: colors.teal,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 5,
          }}
        >
          {copy.sceneLabels[5]}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: portrait ? "column" : "row",
            gap: portrait ? 0 : 22,
            marginTop: 27,
          }}
        >
          {copy.proposal.map((word, index) => (
            <div key={word} style={{ opacity: reveal(frame, 35 + index * 30) }}>
              <AnimatedText
                words={[word]}
                start={35 + index * 30}
                size={portrait ? 112 : 126}
                accentIndex={index === 2 ? 0 : undefined}
              />
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: portrait ? 70 : 125,
          right: portrait ? 70 : 125,
          bottom: portrait ? 210 : 130,
          display: "flex",
          flexDirection: portrait ? "column" : "row",
          gap: 24,
        }}
      >
        {copy.proposals.map((proposal, index) => (
          <div
            key={proposal.name}
            style={{
              flex: 1,
              minHeight: portrait ? 255 : 390,
              padding: portrait ? 35 : 42,
              borderRadius: 34,
              border: `3px solid ${index === 0 ? colors.accent : colors.border}`,
              background: colors.surface,
              boxShadow: `0 30px 70px ${colors.shadow}`,
              transform: `translateY(${(1 - reveal(frame, 55 + index * 30)) * 100}px)`,
              opacity: reveal(frame, 55 + index * 30),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 50,
                  background: colors.pale,
                }}
              >
                <Icon name="person" size={36} />
              </div>
              <Rating size={25} />
            </div>
            <div
              style={{
                marginTop: portrait ? 15 : 40,
                color: colors.ink,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {proposal.name}
            </div>
            <div style={{ color: colors.muted, fontSize: 22, marginTop: 10 }}>
              {proposal.time}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                marginTop: portrait ? 15 : 34,
              }}
            >
              <div
                style={{
                  fontSize: portrait ? 44 : 55,
                  fontWeight: 800,
                  color: colors.teal,
                }}
              >
                {proposal.price}
              </div>
              {index === 0 && !portrait && (
                <Button label={copy.chooseButton} start={135} />
              )}
            </div>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}
