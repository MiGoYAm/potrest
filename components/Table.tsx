import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export default function Table({
  items,
  header,
}: {
  items: Record<string, string | undefined>;
  header: string;
}) {
  const data = Object.entries(items).filter(([, v]) => v);
  if (data.length === 0) {
    return null;
  }

  return (
    <ThemedView>
      <ThemedText type="defaultSemiBold">{header}:</ThemedText>
      <View style={{ gap: 2 }}>
        {data.map(([k, v], i) => (
          <ThemedText key={i}>
            {k}: {v}
          </ThemedText>
        ))}
      </View>
    </ThemedView>
  );
}
