import SearchSuggestion from "@/components/SearchSuggestion";
import { ThemedText } from "@/components/ThemedText";
import { api, CharacterAttributes, Pagination } from "@/lib/api";
import useSearchBar from "@/hooks/useSearchBar";
import { db } from "@/lib/db";
import { savedCharacters, searchHistory } from "@/lib/schema";
import { FlashList } from "@shopify/flash-list";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { sql, eq } from "drizzle-orm";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  View,
  Pressable,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useFilterStore } from "../../character/filter";
import { useToggleBookmark } from "@/hooks/useToggleBookmark";
import { Ionicons } from "@expo/vector-icons";
import { characterOptions } from "@/lib/query";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import MissingCharacter from "../../../assets/images/missing_character.svg";
import { useIsFocused } from "@react-navigation/native";
import { useMemo } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function CharactersScreen() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (query: string) =>
      db
        .insert(searchHistory)
        .values({ query })
        .onConflictDoUpdate({
          target: searchHistory.query,
          set: { usedAt: sql`(unixepoch())` },
        }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["suggestions"] }),
  });

  const { search, setSearch, isSearching, blur } = useSearchBar({
    placeholder: "Search",
    hideWhenScrolling: false,
    onSearchButtonPress: (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      mutation.mutate(e.nativeEvent.text);
      blur();
    },
  });

  const isFocused = useIsFocused();
  const filterStore = useMemo(() => useFilterStore.getState(), [!isFocused]);

  const { data, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: ["characters", search, filterStore],
    queryFn: async ({ pageParam, signal }) => {
      const params = filterStore.getSearchParams();
      params.set("page[number]", pageParam.toString());
      params.set("filter[name_cont]", search);

      const response = await api.get("/characters", { signal, params });
      return response.data as Pagination<CharacterAttributes>;
    },
    enabled: !isSearching,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.meta.pagination.next,
    select: (data) => data.pages.flatMap((page) => page.data),
  });

  if (isSearching) {
    return (
      <SearchSuggestion
        query={search}
        selectSuggestion={(value) => {
          mutation.mutate(value);
          setSearch(value);
          blur();
        }}
      />
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (data?.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText type="title">No results</ThemedText>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={{ flex: 1 }}>
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        data={data}
        estimatedItemSize={230}
        numColumns={2}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.5}
        onEndReached={fetchNextPage}
        renderItem={({ item }) => <Character character={item.attributes} />}
      />
    </Animated.View>
  );
}

function Character(props: { character: CharacterAttributes }) {
  const queryClient = useQueryClient();
  const {
    data: [data],
  } = useLiveQuery(
    db
      .select()
      .from(savedCharacters)
      .where(eq(savedCharacters.characterSlug, props.character.slug))
  );
  const mutation = useToggleBookmark();

  const bookmarkScale = useSharedValue(0);
  const icon = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const opacity = useSharedValue(1);
  const container = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value),
  }));

  return (
    <Pressable
      onPressIn={() => (opacity.value = 0.7)}
      onPressOut={() => (opacity.value = 1)}
      onPress={() => {
        queryClient.setQueryData(
          characterOptions(props.character.slug).queryKey,
          props.character
        );
        router.navigate(`/character/${props.character.slug}`);
      }}
      onLongPress={() => {
        bookmarkScale.value = withSequence(withTiming(1), withTiming(0));
        mutation.mutate(props.character.slug);
      }}
      style={{ padding: 8 }}
    >
      <Animated.View style={container}>
        {props.character.image ? (
          <Image
            recyclingKey={props.character.slug}
            source={props.character.image}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: "grey" }]}>
            <MissingCharacter height="100%" width="100%" />
          </View>
        )}

        <ThemedText style={{ paddingHorizontal: 4 }}>
          {props.character.name}
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.bookmark, icon]}>
        <Ionicons
          name={data ? "bookmark" : "bookmark-outline"}
          size={72}
          color="white"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
  },
  bookmark: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",

    aspectRatio: 1,
    top: 0,
    left: 0,
    right: 0,
  },
});
