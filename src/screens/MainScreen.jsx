import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import HourlyForecast from "../components/HourlyForecast";
import ToggleVaralBtn, {
    WRAPPER_HALF_HEIGHT,
} from "../components/ToggleVaralBtn";
import { MOCK_HISTORY } from "../data/mockData";
import { useWeather } from "../hooks/useWeather";
import { getSkyColors } from "../utils/weatherUtils";

const TOGGLE_HALF_HEIGHT = WRAPPER_HALF_HEIGHT;
const SKY_EXPANDED_HEIGHT = 100;
const TIMING_CONFIG = {
  duration: 650,
  easing: Easing.inOut(Easing.cubic),
};

export default function HomeScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const SKY_COLLAPSED_HEIGHT = screenHeight * 0.77;

  const { condition, statusText, hourlyForecast, isLoading, error } =
    useWeather();
  const [isClotheslineExposed, setIsClotheslineExposed] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const skyHeight = useSharedValue(SKY_COLLAPSED_HEIGHT);

  const handleSheetToggle = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    skyHeight.value = withTiming(
      willExpand ? SKY_EXPANDED_HEIGHT : SKY_COLLAPSED_HEIGHT,
      TIMING_CONFIG,
    );
  };

  const skyWrapperStyle = useAnimatedStyle(() => ({
    height: skyHeight.value,
  }));

  const floatingToggleStyle = useAnimatedStyle(() => ({
    top: skyHeight.value - TOGGLE_HALF_HEIGHT,
  }));

  // Interpolation bounds are non-linear intentionally:
  // main content fades over the first ~35% of collapse, mini fades in near SKY_EXPANDED_HEIGHT
  const skyMainOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      skyHeight.value,
      [SKY_EXPANDED_HEIGHT + 80, SKY_COLLAPSED_HEIGHT * 0.65],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const skyMiniOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      skyHeight.value,
      [SKY_EXPANDED_HEIGHT + 45, SKY_EXPANDED_HEIGHT + 5],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          skyHeight.value,
          [SKY_EXPANDED_HEIGHT, SKY_EXPANDED_HEIGHT + 45],
          [0, 8],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Gradient lives on the container so rounded panel corners reveal it instead of white */}
      <LinearGradient
        colors={getSkyColors(condition)}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.skyWrapper, skyWrapperStyle]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.skyLayer,
            skyMainOpacity,
          ]}
        >
          <Text style={styles.weatherStatusText}>{statusText}</Text>
          <View style={styles.clotheslinePlaceholder}>
            <Text style={styles.clotheslineText}>
              {isClotheslineExposed ? "VARAL EXPOSTO" : "GUARDADO"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.skyLayer,
            skyMiniOpacity,
          ]}
        >
          <Text style={styles.miniVaralText}>
            {isClotheslineExposed ? "VARAL EXPOSTO" : "GUARDADO"}
          </Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.expandButton}
          activeOpacity={0.7}
          onPress={handleSheetToggle}
        >
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-down" : "chevron-up"}
            size={18}
            color={theme.colors.textDark}
          />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isExpanded}
        >
          <Text style={styles.sectionTitle}>Hoje</Text>
          <HourlyForecast
            items={hourlyForecast}
            isLoading={isLoading}
            error={error}
          />

          <Text style={styles.sectionTitle}>Histórico de Atividade</Text>
          {MOCK_HISTORY.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <Text style={styles.historyText}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <Animated.View
        style={[styles.floatingToggleWrapper, floatingToggleStyle]}
        pointerEvents="box-none"
      >
        <ToggleVaralBtn
          isExposed={isClotheslineExposed}
          onPress={() => setIsClotheslineExposed(!isClotheslineExposed)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skyWrapper: {
    overflow: "hidden",
  },
  skyLayer: {
    alignItems: "center",
    justifyContent: "center",
  },
  weatherStatusText: {
    fontFamily: theme.fonts.black,
    fontSize: 28,
    color: theme.colors.textLight,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  clotheslinePlaceholder: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  clotheslineText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.textLight,
    fontSize: 16,
  },
  miniVaralText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.textLight,
    fontSize: 13,
    letterSpacing: 2,
    opacity: 0.9,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  expandButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.textDark,
    marginTop: 10,
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: theme.colors.backgroundAlt,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  historyText: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
    fontSize: 15,
  },
  floatingToggleWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
});
