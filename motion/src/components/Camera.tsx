import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { easing } from "../theme/motion";
import { interpolate } from "remotion";

export function Camera({
  children,
  push = 0,
  pull = 0,
  pan = 0,
  rotate = 0,
}: {
  children: ReactNode;
  push?: number;
  pull?: number;
  pan?: number;
  rotate?: number;
}) {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [0, 90, 180], [0, 0.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.inOutExpo,
  });
  const scale = 1 + push * move - pull * move;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        perspective: 1400,
        transform: `translateX(${pan * move}px) scale(${scale}) rotateY(${rotate * move}deg)`,
      }}
    >
      {children}
    </div>
  );
}
