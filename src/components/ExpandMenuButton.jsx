import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { theme } from "../../constants/theme";

const W = 58;
const H = 44;

const BUTTON_PATH =
  "M 4 24 A 24 24 0 0 1 28 0 A 24 24 0 0 1 52 24 C 52 26 52.35 29 53.2 31.5 C 54.2 34.5 55.4 37 56 38.2 C 49 40 7 40 0 38.2 C 0.6 37 1.8 34.5 2.8 31.5 C 3.65 29 4 26 4 24 Z";

export default function ExpandMenuButton({ isExpanded, onPress }) {
  const gradId = useRef(
    `expandBtnGrad-${Math.random().toString(36).slice(2, 11)}`,
  ).current;

  return (
    <Pressable
      android_ripple={null}
      onPress={onPress}
      style={styles.hitArea}
    >
      {({ pressed }) => (
        <View style={styles.layer} pointerEvents="box-none">
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#c4ccd8" />
                <Stop offset="0.45" stopColor="#e8ecf0" />
                <Stop offset="1" stopColor={theme.colors.surface} />
              </LinearGradient>
            </Defs>
            <Path
              d={BUTTON_PATH}
              fill={
                pressed ? `url(#${gradId})` : theme.colors.surface
              }
            />
          </Svg>
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={26}
            color={theme.colors.textDark}
            style={styles.icon}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: "absolute",
    top: -32,
    right: 30,
    width: W,
    height: H,
    zIndex: 10,
  },
  layer: {
    width: W,
    height: H,
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    top: 5,
  },
});
