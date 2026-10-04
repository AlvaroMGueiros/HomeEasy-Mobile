import { Easing, interpolate, spring } from "remotion";

export const easing = {
  snapOut: Easing.bezier(0.16, 1, 0.3, 1),
  inOutExpo: Easing.bezier(0.87, 0, 0.13, 1),
  anticipate: Easing.bezier(0.36, 0, 0.66, -0.56),
} as const;

export const duration = {
  explosive: 18,
  main: 42,
  hero: 90,
  stagger: 3,
} as const;
export const uiSpring = { damping: 22, stiffness: 180, mass: 0.9 } as const;

export function reveal(
  frame: number,
  start: number,
  frames: number = duration.main,
) {
  return interpolate(frame, [start, start + frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing.snapOut,
  });
}

export function springReveal(frame: number, start: number, fps: number) {
  return spring({ frame: frame - start, fps, config: uiSpring });
}
