import Icon from "@/components/HeaderIcon";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

type Filter = {
  sort: string | null;
  gender: string[] | null;
  house: string[] | null;
  blood_status: string[] | null;
  species: string[] | null;
};

type FilterActions = {
  reset(): void;
  toggle(key: keyof Omit<Filter, "sort">, value: string): void;
  toggleNone(key: keyof Omit<Filter, "sort">): void;
  toggleSort(sort: string): void;
  _filterByList(
    params: URLSearchParams,
    key: keyof Omit<Filter, "sort">,
    predicate?: string
  ): void;
  getFilterCount(): number;
  getSearchParams(): URLSearchParams;
};

type FilterStore = Filter & FilterActions;

const initialState: Filter = {
  sort: null,
  gender: [],
  house: [],
  blood_status: [],
  species: [],
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,
  reset: () => set(initialState),
  toggleSort: (sort: string) =>
    set((state) => ({ sort: state.sort === sort ? null : sort })),
  toggle: (key: keyof Omit<Filter, "sort">, value: string) =>
    set((state) => {
      if (state[key] === null) {
        return { [key]: [value] };
      }
      if (state[key].includes(value)) {
        return { [key]: state[key].filter((v) => v !== value) };
      }
      return { [key]: [...state[key], value] };
    }),
  toggleNone: (key: keyof Omit<Filter, "sort">) =>
    set((state) => ({ [key]: state[key] === null ? [] : null })),
  _filterByList: (
    params: URLSearchParams,
    key: keyof Omit<Filter, "sort">,
    predicate: string = "in_any"
  ) => {
    const state = get();
    if (state[key] === null) {
      params.append(`filter[${key}_null]`, "true");
    } else if (state[key].length > 0) {
      state[key].forEach((value) => {
        params.append(`filter[${key}_${predicate}][]`, value);
      });
    }
  },
  getFilterCount() {
    const state = get();
    let count = 0;
    count += state.sort ? 1 : 0;
    count += state.gender?.length ?? 1;
    count += state.house?.length ?? 1;
    count += state.blood_status?.length ?? 1;
    count += state.species?.length ?? 1;
    return count;
  },
  getSearchParams() {
    const state = get();
    const searchParams = new URLSearchParams();

    if (state.sort) {
      searchParams.append("sort", state.sort);
    }
    this._filterByList(searchParams, "gender", "cont_any");
    this._filterByList(searchParams, "house");
    this._filterByList(searchParams, "blood_status", "cont_any");
    this._filterByList(searchParams, "species", "cont_any");
    return searchParams;
  },
}));

const filters: ListProps[] = [
  {
    name: "Gender",
    type: "gender",
    values: ["Male", "Female", "Unknown"],
  },
  {
    name: "House",
    type: "house",
    values: ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw"],
  },
  {
    name: "Blood status",
    type: "blood_status",
    values: ["Pure-blood", "Half-blood", "Muggle", "Squib", "Half-breed"],
  },
  {
    name: "Species",
    type: "species",
    values: [
      "Human",
      "Goblin",
      "Giant",
      "Veela",
      "Troll",
      "Vampire",
      "House-elf",
    ],
  },
];

export default function FilterScreen() {
  const filterStore = useFilterStore();
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={filters}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: Math.max(insets.bottom, 16),
        gap: 32,
      }}
      keyExtractor={(item) => item.type}
      ListHeaderComponent={
        <>
          <Stack.Screen
            options={{
              headerRight: () => (
                <Icon
                  name="refresh-outline"
                  size={24}
                  onPress={() => filterStore.reset()}
                />
              ),
            }}
          />
          <View style={{ gap: 12 }}>
            <ThemedText type="title">Sort by</ThemedText>
            {Object.entries({
              "Name alphabetical": "name",
              "Name reverse alphabetical": "-name",
            }).map(([key, value]) => (
              <RadioButton
                key={value}
                label={key}
                checked={filterStore.sort === value}
                onPress={() => filterStore.toggleSort(value)}
              />
            ))}
          </View>
        </>
      }
      renderItem={({ item }) => <List {...item} />}
    />
  );
}

type ListProps = {
  name: string;
  values: string[];
  type: keyof Omit<Filter, "sort">;
};

function List(props: ListProps) {
  const filters = useFilterStore((state) => state[props.type]);

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="title">{props.name}</ThemedText>
      {props.values.map((value) => (
        <Checkbox
          key={value}
          label={value}
          checked={filters?.includes(value) ?? false}
          onPress={() => useFilterStore.getState().toggle(props.type, value)}
        />
      ))}
      <Checkbox
        label="None"
        checked={!filters}
        onPress={() => useFilterStore.getState().toggleNone(props.type)}
      />
    </View>
  );
}

type CheckboxProps = {
  label: string;
  checked: boolean;
  onPress?: () => void;
};

function Checkbox(props: CheckboxProps) {
  const markColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "background");

  return (
    <TouchableOpacity
      style={styles.checkbox}
      onPress={props.onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          {
            borderColor: markColor,
            backgroundColor: props.checked ? markColor : undefined,
          },
          styles.checkboxIcon,
        ]}
      >
        {props.checked && (
          <Ionicons name="checkmark-sharp" size={16} color={iconColor} />
        )}
      </View>
      <ThemedText style={{ fontSize: 18 }}>{props.label}</ThemedText>
    </TouchableOpacity>
  );
}

function RadioButton(props: CheckboxProps) {
  const color = useThemeColor({}, "text");

  return (
    <TouchableOpacity
      style={styles.checkbox}
      onPress={props.onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.radio, { borderColor: color }]}>
        {props.checked && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: color,
            }}
          />
        )}
      </View>
      <ThemedText style={{ fontSize: 18 }}>{props.label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  checkboxIcon: {
    height: 20,
    width: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radio: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
