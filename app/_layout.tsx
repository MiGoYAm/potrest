import "@/lib/gesture-handler";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import NetInfo from "@react-native-community/netinfo";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { db } from "@/lib/db";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { AppState, useColorScheme } from "react-native";
import { configureReanimatedLogger } from "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
);

focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (status) =>
    setFocused(status === "active")
  );
  return () => subscription.remove();
});

// swipeable
configureReanimatedLogger({
  strict: false,
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { success } = useMigrations(db, migrations);

  useEffect(() => {
    if (loaded && success) {
      SplashScreen.hideAsync();
    }
  }, [loaded, success]);

  if (!loaded || !success) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerTitle: "" }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="character/[id]" />
              <Stack.Screen
                name="character/filter"
                options={{
                  headerTitle: "Filter and sorting",
                }}
              />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
