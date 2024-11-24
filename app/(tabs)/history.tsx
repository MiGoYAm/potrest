import ListSeperator from "@/components/ListSeperator";
import LoadingIndicator from "@/components/LoadingIndicator";
import DeleteSwipeable from "@/components/Swipeable";
import { ThemedText } from "@/components/ThemedText";
import { db } from "@/lib/db";
import { viewHistory } from "@/lib/schema";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { Link } from "expo-router";
import { SectionList, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

const PAGE_SIZE = 30;

export default function HistoryScreen() {
  const { data, isLoading, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => {
      return db
        .select()
        .from(viewHistory)
        .orderBy(desc(viewHistory.viewedAt))
        .limit(PAGE_SIZE)
        .offset(pageParam * PAGE_SIZE);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === 30 ? lastPageParam + 1 : undefined,
    select: ({ pages }) =>
      groupByDate(
        pages.flatMap((page) => page),
        (item) => item.viewedAt.getTime()
      ),
  });

  const mutation = useMutation({
    mutationFn: (slug: string) =>
      db.delete(viewHistory).where(eq(viewHistory.characterSlug, slug)),
    onSettled: () => refetch(),
  });

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <SectionList
      sections={data!}
      onEndReached={() => fetchNextPage()}
      onEndReachedThreshold={0.5}
      keyExtractor={(item) => item.characterSlug}
      stickySectionHeadersEnabled={false}
      ItemSeparatorComponent={ListSeperator}
      renderSectionHeader={({ section: { date } }) => (
        <Animated.View exiting={FadeOut}>
          <ThemedText type="subtitle" style={{ margin: 12, marginTop: 24 }}>
            {format(new Date(date), "EEEE, MMMM d")}
          </ThemedText>
        </Animated.View>
      )}
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

function groupByDate<T>(list: T[], keyExtractor: (item: T) => number) {
  const result: { date: number; data: T[] }[] = [];

  for (const item of list) {
    const key = keyExtractor(item);
    const group = result[result.length - 1];

    if (group && group.date === key) {
      group.data.push(item);
    } else {
      result.push({ date: key, data: [item] });
    }
  }
  return result;
}
