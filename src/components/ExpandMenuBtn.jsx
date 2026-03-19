import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { theme } from "../../constants/theme";

const W = 76;
const H = 58;

const BUTTON_PATH =
    "M 1.009785 0.398990 C 1.028540 0.316235 0.773628 -0.009199 0.492039 0.000199 C 0.249199 0.008304 0.000000 0.217547 -0.076073 0.534722 C -0.605114 1.102273 0.228930 0.973485 0.492039 1.000000 C 0.766335 0.978220 1.678977 1.051136 1.079230 0.553662 Z";

const VIEWBOX = "-0.65 -0.04 2.38 1.14";

export default function ExpandMenuBtn({ isExpanded, onPress }) {
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
                    <Svg
                        width={W}
                        height={H}
                        viewBox={VIEWBOX}
                        preserveAspectRatio="xMidYMid meet"
                        style={StyleSheet.absoluteFill}
                    >
                        <Defs>
                            <LinearGradient
                                id={gradId}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                                gradientUnits="objectBoundingBox"
                            >
                                <Stop offset="0" stopColor="#c4ccd8" />
                                <Stop offset="0.45" stopColor="#e8ecf0" />
                                <Stop
                                    offset="1"
                                    stopColor={theme.colors.surface}
                                />
                            </LinearGradient>
                        </Defs>
                        <Path
                            d={BUTTON_PATH}
                            fill={
                                pressed
                                    ? `url(#${gradId})`
                                    : theme.colors.surface
                            }
                        />
                    </Svg>
                    <MaterialCommunityIcons
                        name={isExpanded ? "chevron-down" : "chevron-up"}
                        size={23}
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
        right: 28,
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
        top: 15,
        right: 28,
    },
});
