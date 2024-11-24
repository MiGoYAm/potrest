import { searchHistory } from "@/lib/schema";
import { db } from "@/lib/db";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { desc, like } from "drizzle-orm";
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function SearchSuggestion(props: {
  query: string;
  selectSuggestion: (value: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["suggestions", props.query],
    queryFn: () => {
      return db
        .select({ id: searchHistory.id, query: searchHistory.query })
        .from(searchHistory)
        .where(like(searchHistory.query, `%${props.query}%`))
        .orderBy(desc(searchHistory.usedAt))
        .limit(10);
    },
    placeholderData: keepPreviousData,
  });

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Animated.FlatList
        refreshing={isLoading}
        data={data}
        entering={FadeIn}
        exiting={FadeOut}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <ListSeperator />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => props.selectSuggestion(item.query)}
            style={styles.item}
          >
            <Ionicons name="search" size={16} color="#888" />
            <ThemedText>{item.query}</ThemedText>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

function ListSeperator() {
  const underlineColor = useColorScheme() === "dark" ? "#333" : "#bbb";

  return (
    <View
      style={{
        marginVertical: 8,
        height: StyleSheet.hairlineWidth,
        backgroundColor: underlineColor,
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
