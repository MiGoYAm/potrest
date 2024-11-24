import { View, StyleSheet, useColorScheme } from "react-native";

export default function ListSeperator() {
  const underlineColor = useColorScheme() === "dark" ? "#333" : "#bbb";

  return (
    <View
      style={{
        width: "100%",
        height: StyleSheet.hairlineWidth,
        backgroundColor: underlineColor,
      }}
    />
  );
}
