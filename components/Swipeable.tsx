import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet, Text } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export default function DeleteSwipeable(props: {
  children: React.ReactNode;
  onSwipe: () => void;
}) {
  return (
    <Swipeable
      rightThreshold={ACTION_WIDTH}
      childrenContainerStyle={{ flex: 1 }}
      onSwipeableWillOpen={props.onSwipe}
      renderRightActions={RightAction}
    >
      {props.children}
    </Swipeable>
  );
}

function RightAction(progress: SharedValue<number>, drag: SharedValue<number>) {
  const dimensions = useWindowDimensions();

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drag.value + dimensions.width }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          drag.value < -ACTION_WIDTH ? -(drag.value + ACTION_WIDTH) : 0,
      },
    ],
  }));

  return (
    <Animated.View style={[containerStyle, styles.rightAction]}>
      <Animated.View style={[styles.icon, iconStyle]}>
        <Ionicons name="trash" size={24} color="white" />
        <Text style={{ color: "white" }}>Delete</Text>
      </Animated.View>
    </Animated.View>
  );
}

const ACTION_WIDTH = 96;

const styles = StyleSheet.create({
  rightAction: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
  },
  icon: {
    height: "100%",
    width: ACTION_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
});
