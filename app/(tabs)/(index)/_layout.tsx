import { useFilterStore } from "@/app/character/filter";
import Icon from "@/components/HeaderIcon";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function CharacterLayout() {
  const queryClient = useQueryClient();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Characters",
          headerSearchBarOptions: {
            placeholder: "Search",
            hideWhenScrolling: false,
          },
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Link
                href="/character/random"
                onPress={() =>
                  queryClient.resetQueries({
                    queryKey: ["character", "random"],
                  })
                }
              >
                <Icon name="help-outline" size={24} />
              </Link>

              <FilterButton />
            </View>
          ),
        }}
      />
    </Stack>
  );
}

function FilterButton() {
  const color = useThemeColor({}, "tint");
  const filterCount = useFilterStore((state) => state.getFilterCount());

  return (
    <Link href="/character/filter">
      <View>
        <Icon name="filter" size={24} />
        {filterCount > 0 && (
          <View
            style={{
              backgroundColor: color,
              borderRadius: 8,
              width: 20,
              height: 20,
              position: "absolute",
              right: -10,
              bottom: -10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 14 }}>{filterCount}</Text>
          </View>
        )}
      </View>
    </Link>
  );
}
