import { ActivityIndicator, View } from "react-native";

export default function LoadingIndicator() {
  return (
    <View style={{ padding: 16 }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
