import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";
import { spacing } from "../theme/spacing";
import { Icon } from "./Icon";
import { MapVisual } from "./MapVisual";
import { ProfessionalCard } from "./ProfessionalCard";

export function PhoneMockup({
  children,
  scale = 1,
}: {
  children?: ReactNode;
  scale?: number;
}) {
  return (
    <div
      style={{
        width: 500,
        height: 900,
        flexShrink: 0,
        borderRadius: spacing.phoneRadius,
        padding: 13,
        background: colors.ink,
        boxShadow: `0 48px 100px ${colors.shadow}`,
        transform: `scale(${scale})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 42,
          background: colors.background,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 31,
            background: colors.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 27px",
            fontSize: 12,
            fontWeight: 800,
            color: colors.ink,
          }}
        >
          9:41 <span>● ▰</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function HomePhoneContent() {
  const frame = useCurrentFrame();
  return (
    <div style={{ height: "calc(100% - 31px)", position: "relative" }}>
      <div style={{ height: "42%", position: "relative", overflow: "hidden" }}>
        <MapVisual badge={false} />
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 20,
            padding: "12px 18px",
            borderRadius: 18,
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: colors.surface,
            fontWeight: 800,
            color: colors.ink,
            fontSize: 16,
          }}
        >
          <Icon name="pin" size={21} /> {copy.city}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "38%",
          width: "100%",
          height: "63%",
          padding: "23px 22px",
          borderRadius: "34px 34px 0 0",
          background: colors.surface,
          boxShadow: `0 -12px 35px ${colors.shadow}`,
        }}
      >
        <div
          style={{
            width: 40,
            height: 5,
            borderRadius: 5,
            background: colors.border,
            margin: "0 auto 22px",
          }}
        />
        <div style={{ color: colors.muted, fontSize: 15 }}>{copy.greeting}</div>
        <div
          style={{
            color: colors.ink,
            fontSize: 26,
            fontWeight: 800,
            margin: "8px 0 19px",
            lineHeight: 1.15,
          }}
        >
          {copy.homeQuestion}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            border: `1px solid ${colors.border}`,
            padding: 15,
            borderRadius: 16,
            color: colors.muted,
            fontSize: 16,
          }}
        >
          <Icon name="search" size={21} />
          {copy.searchPlaceholder}
        </div>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}
        >
          {(["bolt", "sparkle", "person", "tools"] as const).map(
            (icon, index) => (
              <div
                key={icon}
                style={{
                  opacity: reveal(frame, index * 4),
                  width: 93,
                  height: 82,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  color: colors.teal,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <Icon name={icon} size={26} />
                {copy.compactServices[index]}
              </div>
            ),
          )}
        </div>
        <div
          style={{
            color: colors.ink,
            fontSize: 20,
            fontWeight: 800,
            marginTop: 18,
          }}
        >
          {copy.recommended}
        </div>
        <div
          style={{
            marginTop: 14,
            transform: "scale(.69)",
            transformOrigin: "top left",
          }}
        >
          <ProfessionalCard
            name={copy.selectedProfessional.name}
            service={copy.city}
            start={30}
            compact
          />
        </div>
      </div>
    </div>
  );
}
