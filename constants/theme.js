import { Platform } from "react-native";
import { crooglaFonts } from "./typography";

export const theme = {
    colors: {
        sky: {
            sunny: ["#87c7ed", "#cfdfbb", "#f8eeae"],
            rainy: ["#4a5568", "#2d3748", "#1a202c"],
            night: ["#040a2d", "#0f1737", "#242b3b"],
        },
        surface: "#ffffff",
        backgroundTransparent: "rgba(248, 250, 252, 0.88)",
        toggleMenuGradient: {
            baseHex: "#ffffff",
            topOpacity: 1,
            middleOpacity: 1,
            bottomOpacity: 0.5,
        },
        backgroundAlt: "#f7fafc",
        textDark: "#2d3748",
        textMuted: "#4b5e75",
        calendarDayText: "#304258",
        textLight: "#ffffff",
        primary: "#2d3748",
        accent: "#4fd1c5",
    },
    fonts: {
        regular:
            Platform.OS === "web"
                ? `${crooglaFonts.regular}, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
                : crooglaFonts.regular,
        bold:
            Platform.OS === "web"
                ? `${crooglaFonts.bold}, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
                : crooglaFonts.bold,
        black:
            Platform.OS === "web"
                ? `${crooglaFonts.bold}, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
                : crooglaFonts.bold,
    },
};
