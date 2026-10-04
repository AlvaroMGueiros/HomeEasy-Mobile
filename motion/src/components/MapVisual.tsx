import { useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { Icon } from "./Icon";
import { MapPin } from "./MapPin";

const roads = [
  "M-40 180 C220 150 250 350 530 300 S870 50 1300 160",
  "M-50 560 C260 420 310 670 600 590 S920 390 1300 490",
  "M160 -30 C240 290 380 350 340 820",
  "M650 -30 C610 220 800 410 760 830",
  "M1030 -30 C900 250 1100 510 1050 830",
];

export function MapVisual({
  detailed = true,
  badge = true,
}: {
  detailed?: boolean;
  badge?: boolean;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: colors.pale,
      }}
    >
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <path d="M0 0h1200v800H0z" fill={colors.background} />
        <path
          d="M0 130C170 50 270 190 410 110S750 60 880 140 1040 65 1200 100v180c-140-60-230 10-370-35S510 230 390 320 140 230 0 300Z"
          fill={colors.pale}
        />
        <path
          d="M0 600c180-130 280-40 390-100s280 30 450-70 240 30 360-40v410H0Z"
          fill={colors.paleBlue}
        />
        {roads.map((road, index) => (
          <path
            key={road}
            d={road}
            fill="none"
            stroke={index % 2 ? colors.surface : colors.border}
            strokeWidth={index % 2 ? 32 : 25}
            strokeLinecap="round"
          />
        ))}
        {roads.map((road) => (
          <path
            key={`inner-${road}`}
            d={road}
            fill="none"
            stroke={colors.surface}
            strokeWidth="12"
            strokeLinecap="round"
          />
        ))}
        <path
          d="M0 380C290 340 410 490 710 270s300-80 490-220"
          fill="none"
          stroke={colors.accent}
          strokeWidth="7"
          opacity="0.22"
        />
        <circle cx="590" cy="400" r="110" fill={colors.accent} opacity="0.09" />
        <circle cx="590" cy="400" r="46" fill={colors.accent} opacity="0.18" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "48%",
          top: "48%",
          width: 27,
          height: 27,
          borderRadius: 99,
          border: `6px solid ${colors.surface}`,
          background: colors.teal,
          boxShadow: `0 0 0 17px ${colors.paleBlue}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "42%",
          top: "53%",
          color: colors.ink,
          fontSize: 26,
          fontWeight: 800,
        }}
      >
        {copy.mapCity}
      </div>
      {detailed && (
        <>
          <div style={{ position: "absolute", left: "19%", top: "23%" }}>
            <MapPin icon="bolt" start={30} />
          </div>
          <div style={{ position: "absolute", left: "69%", top: "27%" }}>
            <MapPin icon="tools" start={60} />
          </div>
          <div style={{ position: "absolute", left: "76%", top: "67%" }}>
            <MapPin icon="person" start={90} />
          </div>
          <div style={{ position: "absolute", left: "27%", top: "70%" }}>
            <MapPin icon="sparkle" start={120} />
          </div>
          {badge && (
            <div
              style={{
                position: "absolute",
                right: 28,
                top: 26,
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "13px 19px",
                borderRadius: 20,
                background: colors.surface,
                boxShadow: `0 10px 30px ${colors.shadow}`,
                color: colors.teal,
                fontSize: 18,
                fontWeight: 800,
                opacity: frame > 45 ? 1 : 0,
              }}
            >
              <Icon name="pin" size={24} /> {copy.nearby}
            </div>
          )}
        </>
      )}
    </div>
  );
}
