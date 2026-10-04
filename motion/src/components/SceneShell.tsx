import type { ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function SceneShell({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: dark ? colors.tealDeep : colors.background,
        color: dark ? colors.surface : colors.ink,
        padding: width < 1200 ? spacing.mobileMargin : spacing.desktopMargin,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
