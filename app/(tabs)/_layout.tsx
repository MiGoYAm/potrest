import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { db } from "@/lib/db";
import { viewHistory } from "@/lib/schema";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/HeaderIcon";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          title: "Characters",
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "bookmark" : "bookmark-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "time" : "time-outline"}
              color={color}
            />
          ),
          headerRightContainerStyle: { paddingRight: 16 },
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                ShowAlert({
                  message: "Clear history",
                  description: "Are you sure you want to clear your history?",
                  onSubmit: () => {
                    db.delete(viewHistory).execute();
                    queryClient.invalidateQueries({ queryKey: ["history"] });
                  },
                })
              }
            >
              <Icon name="trash-outline" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

function ShowAlert(props: {
  message: string;
  description: string;
  onSubmit: () => void;
}) {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Clear", "Cancel"],
        message: props.description,
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          props.onSubmit();
        }
      }
    );
  } else {
    Alert.alert(
      props.message,
      props.description,
      [{ text: "Cancel" }, { text: "Clear", onPress: props.onSubmit }],
      { cancelable: false }
    );
  }
}
