import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { theme } from "../../constants/theme";

export default function HourlyForecast({
  items,
  isLoading,
  error,
  showLoadingOverlay = false,
}) {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="small" color={theme.colors.textMuted} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.feedbackText}>{error}</Text>
      </View>
    );
  }

  if (!items || items.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.feedbackText}>Sem previsão disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <View style={styles.item}>
              <Text style={styles.time}>{item.time}</Text>
              <MaterialCommunityIcons
                name={item.icon}
                size={32}
                color={item.iconColor}
                style={styles.icon}
              />
              <Text style={styles.temp}>{item.temp}</Text>
            </View>
            {index < items.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </ScrollView>

      {showLoadingOverlay && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={theme.colors.textMuted} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 20,
    overflow: "hidden",
    minHeight: 100,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 6,
    alignItems: "center",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  time: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  icon: {
    marginBottom: 8,
  },
  temp: {
    fontFamily: theme.fonts.black,
    fontSize: 18,
    color: theme.colors.textDark,
  },
  separator: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginHorizontal: 5,
  },
  feedbackText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
