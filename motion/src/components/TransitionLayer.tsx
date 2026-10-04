import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme/colors";
import { easing } from "../theme/motion";
import { boundaries, overlap } from "../theme/timings";
import { handoffs } from "../handoffs/specs";
import { Icon } from "./Icon";

export function TransitionLayer() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {boundaries.slice(1, -1).map((boundary, index) => {
        const first = boundary - overlap;
        if (frame < first || frame > boundary) return null;
        const progress = interpolate(frame, [first, boundary], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easing.inOutExpo,
        });
        const radius = Math.sqrt(width * width + height * height) * progress;
        const { x, y, icon } = handoffs[index];
        return (
          <div
            key={boundary}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              border: `6px solid ${index % 2 ? colors.teal : colors.accent}`,
              boxShadow: `0 0 55px ${colors.shadow}`,
              transform: "translate(-50%,-50%)",
              opacity: 1 - progress,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                opacity: progress < 0.45 ? 1 : 0,
              }}
            >
              <Icon
                name={icon}
                size={60}
                color={index % 2 ? colors.teal : colors.surface}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
