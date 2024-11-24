import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export default function Icon(
  props: Omit<typeof Ionicons.defaultProps, "color">
) {
  const color = useThemeColor({}, "text");
  return <Ionicons {...props} color={color} />;
}
