import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';

const LINES_COUNT = 8;
const OUTER_RADIUS = 82;
const INNER_RADIUS = 46;
const ANIMATION_DURATION = 650;

// Wrapper oversized so lines don't get clipped as they expand outward
const WRAPPER_W = 340;
const WRAPPER_H = 220;

// Consumed by HomeScreen to vertically center this button on the sky/panel boundary
export const WRAPPER_HALF_HEIGHT = WRAPPER_H / 2;

function Line({ angle, progress }) {
    const style = useAnimatedStyle(() => {
        const dist = interpolate(
            progress.value,
            [0, 1],
            [INNER_RADIUS, OUTER_RADIUS],
            'clamp'
        );
        const opacity = interpolate(
            progress.value,
            [0, 0.08, 0.65, 1],
            [0, 1, 0.8, 0]
        );
        return {
            opacity,
            transform: [
                { translateX: dist * Math.cos(angle) },
                { translateY: dist * Math.sin(angle) },
                { rotate: `${angle + Math.PI / 2}rad` },
            ],
        };
    });

    return <Animated.View style={[styles.line, style]} />;
}

export default function WardrobeButton({ isExposed, onPress }) {
    const progress = useSharedValue(0);

    const handlePress = useCallback(() => {
        progress.value = 0;
        progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.cubic),
        });
        onPress();
    }, [onPress, progress]);

    const angles = Array.from({ length: LINES_COUNT }, (_, i) =>
        (i / LINES_COUNT) * 2 * Math.PI
    );

    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? '#1a202c' : theme.colors.primary },
                ]}
            >
                <Text style={styles.label}>
                    {isExposed ? 'RECOLHER' : 'EXPOR'}
                </Text>
            </Pressable>

            {/* Rendered after button so lines appear in front */}
            <View style={styles.linesLayer} pointerEvents="none">
                {angles.map((angle, i) => (
                    <Line key={i} angle={angle} progress={progress} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: WRAPPER_W,
        height: WRAPPER_H,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linesLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    line: {
        position: 'absolute',
        width: 3,
        height: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 2,
    },
    button: {
        width: 160,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontFamily: theme.fonts.bold,
        color: theme.colors.textLight,
        fontSize: 14,
        letterSpacing: 1.5,
    },
});
