import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionLayer } from "./components/TransitionLayer";
import { handoffs } from "./handoffs/specs";
import { AppRevealScene } from "./scenes/AppRevealScene";
import { ChatScene } from "./scenes/ChatScene";
import { EcosystemScene } from "./scenes/EcosystemScene";
import { IntroScene } from "./scenes/IntroScene";
import { MapScene } from "./scenes/MapScene";
import { OutroScene } from "./scenes/OutroScene";
import { ProblemsScene } from "./scenes/ProblemsScene";
import { ProfessionalScene } from "./scenes/ProfessionalScene";
import { ProposalScene } from "./scenes/ProposalScene";
import { RequestScene } from "./scenes/RequestScene";
import { SearchScene } from "./scenes/SearchScene";
import { SuccessScene } from "./scenes/SuccessScene";
import { colors } from "./theme/colors";
import { easing } from "./theme/motion";
import { sceneDurations, sceneStarts, overlap } from "./theme/timings";
import { typography } from "./theme/typography";

const scenes = [
  IntroScene,
  ProblemsScene,
  AppRevealScene,
  SearchScene,
  MapScene,
  ProfessionalScene,
  RequestScene,
  ProposalScene,
  ChatScene,
  SuccessScene,
  EcosystemScene,
  OutroScene,
];

export function HomeEasyCampaign() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: colors.background,
        overflow: "hidden",
        fontFamily: typography.family,
      }}
    >
      {scenes.map((Scene, index) => {
        const start = sceneStarts[index];
        const { x, y } = handoffs[index - 1] ?? { x: 50, y: 50 };
        const radius =
          index === 0
            ? 0
            : interpolate(
                frame,
                [start, start + overlap],
                [0, Math.sqrt(width * width + height * height)],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: easing.inOutExpo,
                },
              );
        const clipPath =
          index === 0 || frame >= start + overlap
            ? undefined
            : `circle(${radius}px at ${x}% ${y}%)`;
        return (
          <Sequence
            key={index}
            from={start}
            durationInFrames={sceneDurations[index]}
          >
            <AbsoluteFill style={{ clipPath }}>
              <Scene />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <TransitionLayer />
    </AbsoluteFill>
  );
}
