import { useNavigation } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
import { SearchBarProps, type SearchBarCommands } from "react-native-screens";
import { useThemeColor } from "./useThemeColor";

export default function useSearchBar(initialOptions?: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [text, setText] = useState("");

  const searchBarRef = useRef<SearchBarCommands>(null);
  const navigation = useNavigation();
  const color = useThemeColor({}, "text");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        headerIconColor: color,
        textColor: color,
        hintTextColor: color,

        placeholder: "Search",
        ref: searchBarRef,
        onChangeText: (e: any) => setText(e.nativeEvent.text),
        onClose: () => setText(""),
        onCancelButtonPress: () => setText(""),

        onFocus: () => setIsSearching(true),
        onBlur: () => setIsSearching(false),
        ...initialOptions,
      },
    });
  }, [navigation]);

  function setSearch(value: string) {
    searchBarRef.current?.setText(value);
    setText(value);
  }

  function blur() {
    searchBarRef.current?.blur();
    setIsSearching(false);
  }

  return { search: text, setSearch, isSearching, blur };
}
