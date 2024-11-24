import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function useQueryFocusAware() {
  const focusedRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;

      return () => (focusedRef.current = false);
    }, [])
  );

  return () => focusedRef.current;
}
