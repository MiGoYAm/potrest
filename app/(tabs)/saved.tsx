import { ThemedText } from "@/components/ThemedText";
import { db } from "@/lib/db";
import { savedCharacters } from "@/lib/schema";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { desc, eq } from "drizzle-orm";
import { Link } from "expo-router";
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated";
import { View } from "react-native";
import DeleteSwipeable from "@/components/Swipeable";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColor } from "@/hooks/useThemeColor";
import ListSeperator from "@/components/ListSeperator";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function SavedScreen() {
  const { data, isLoading, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ["characters", "saved"],
    queryFn: ({ pageParam }) => {
      return db
        .select()
        .from(savedCharacters)
        .orderBy(desc(savedCharacters.savedAt))
        .limit(30)
        .offset(pageParam * 30);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === 30 ? lastPageParam + 1 : undefined,
    select: ({ pages }) => pages.flatMap((page) => page),
  });

  const mutation = useMutation({
    mutationFn: (slug: string) =>
      db.delete(savedCharacters).where(eq(savedCharacters.characterSlug, slug)),
    onSuccess: () => refetch(),
  });

  const tint = useThemeColor({}, "tint");

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (data?.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemedText style={{ textAlign: "center" }}>
          Nothing here yet. To add character click{" "}
          <Ionicons name="bookmark-outline" size={16} color={tint} /> on its
          page or press and hold it on the list.
        </ThemedText>
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={data}
      onEndReached={() => fetchNextPage()}
      keyExtractor={(item) => item.characterSlug}
      itemLayoutAnimation={LinearTransition}
      ItemSeparatorComponent={ListSeperator}
      renderItem={({ item }) => (
        <Animated.View exiting={FadeOut}>
          <DeleteSwipeable onSwipe={() => mutation.mutate(item.characterSlug)}>
            <Link href={`/character/${item.characterSlug}`}>
              <View style={{ padding: 16 }}>
                <ThemedText numberOfLines={1}>{item.characterName}</ThemedText>
              </View>
            </Link>
          </DeleteSwipeable>
        </Animated.View>
      )}
    />
  );
}
