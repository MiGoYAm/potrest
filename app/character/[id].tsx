import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as WebBrowser from "expo-web-browser";
import { CharacterAttributes } from "@/lib/api";
import { useCallback } from "react";
import { db } from "@/lib/db";
import { savedCharacters, startOfDay, viewHistory } from "@/lib/schema";
import { canBeSlugized, slugize } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useToggleBookmark } from "@/hooks/useToggleBookmark";
import { characterOptions } from "@/lib/query";
import Table from "@/components/Table";

export default function CharacterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, error } = useQuery(characterOptions(id));

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: CharacterAttributes) => {
      return db
        .insert(viewHistory)
        .values({ characterSlug: data.slug, characterName: data.name })
        .onConflictDoUpdate({
          target: viewHistory.characterSlug,
          set: { characterName: data.name, viewedAt: startOfDay },
        });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["history"] }),
  });

  useFocusEffect(
    useCallback(() => {
      if (data) {
        mutation.mutate(data);
      }
    }, [data])
  );

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <Stack.Screen options={{ headerRight: undefined }} />
        <ThemedText>
          {error.response?.status === 404
            ? "Character not found"
            : "An error occurred while loading the character"}
        </ThemedText>
      </View>
    );
  }

  if (isPending || !data) {
    return <ActivityIndicator size="large" style={{ flex: 1, padding: 16 }} />;
  }

  return (
    <ParallaxScrollView
      contentStyle={{ gap: 8 }}
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          recyclingKey={data.slug}
          style={{ width: "100%", aspectRatio: data.image ? 1 : 2 }}
          source={data.image}
        />
      }
    >
      <Stack.Screen
        options={{ headerRight: () => <BookmarkButton slug={id} /> }}
      />
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        {data.name}
      </ThemedText>

      {data.alias_names.length > 0 && (
        <ThemedText>Also known as: {data.alias_names.join(", ")}</ThemedText>
      )}
      {data.titles.length > 0 && (
        <ThemedText>Titles: {data.titles.join(", ")}</ThemedText>
      )}

      <Table
        header="Basic Info"
        items={{
          Species: data.species,
          Born: data.born,
          Died: data.died,
          Gender: data.gender,
          Nationality: data.nationality,
          "Blood Status": data.blood_status,
        }}
      />

      <Table
        header="Physical Characteristics"
        items={{
          Height: data.height,
          Weight: data.weight,
          "Eye color": data.eye_color,
          "Hair color": data.hair_color,
          "Skin color": data.skin_color,
        }}
      />

      {data?.marital_status && (
        <ThemedText>Marital Status: {data?.marital_status}</ThemedText>
      )}
      {data.romances.length > 0 && (
        <ThemedText>Romances: {data.romances.join(", ")}</ThemedText>
      )}

      {data.family_members.length > 0 && (
        <ThemedView>
          <ThemedText type="defaultSemiBold">Family Members:</ThemedText>
          <View style={{ gap: 2 }}>
            {data.family_members.map((member, i) =>
              canBeSlugized(member) ? (
                <Link href={`/character/${slugize(member)}`} push key={i}>
                  <ThemedText>⁃ </ThemedText>
                  <ThemedText type="link">{member}</ThemedText>
                </Link>
              ) : (
                <ThemedText key={i}>⁃ {member}</ThemedText>
              )
            )}
          </View>
        </ThemedView>
      )}

      <Table
        header="Magical Characteristics"
        items={{
          House: data.house,
          Patronus: data.patronus,
          "Animagus Form": data.animagus,
          Boggart: data.boggart,
        }}
      />

      {data.wands.length > 0 && (
        <ThemedText>Wands: {data.wands.join(", ")}</ThemedText>
      )}

      {data.jobs.length > 0 && (
        <ThemedView>
          <ThemedText type="defaultSemiBold">Occupations:</ThemedText>
          <View style={{ gap: 2 }}>
            {data.jobs.map((job, i) => (
              <ThemedText key={i}>- {job}</ThemedText>
            ))}
          </View>
        </ThemedView>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={async () => await WebBrowser.openBrowserAsync(data.wiki!)}
      >
        <ThemedText type="link">View on Wiki</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

export function BookmarkButton({ slug }: { slug: string }) {
  const color = useThemeColor({}, "tint");

  const {
    data: [data],
  } = useLiveQuery(
    db
      .select()
      .from(savedCharacters)
      .where(eq(savedCharacters.characterSlug, slug))
  );
  const mutation = useToggleBookmark();

  return (
    <TouchableOpacity onPress={() => mutation.mutate(slug)}>
      <Ionicons
        name={data ? "bookmark" : "bookmark-outline"}
        size={24}
        color={color}
      />
    </TouchableOpacity>
  );
}
