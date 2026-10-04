import { Icon } from "./Icon";
import { colors } from "../theme/colors";

export function Rating({
  value = "4,9",
  size = 22,
}: {
  value?: string;
  size?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: colors.gold,
        fontSize: size,
        fontWeight: 800,
      }}
    >
      <Icon name="star" size={size} color={colors.gold} filled />
      {value}
    </span>
  );
}
