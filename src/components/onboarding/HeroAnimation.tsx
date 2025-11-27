import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useTheme } from '@designSystem/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ACCENT_COLOR = '#00A86B';
const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 400;
const CENTER_X = VIEWBOX_WIDTH / 2;
const CENTER_Y = VIEWBOX_HEIGHT / 2;

// Get screen width to size the SVG appropriately
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SVG_SIZE = Math.min(SCREEN_WIDTH - 48, 400); // 48 is roughly 2 * theme.spacing.lg

// Particle configuration for the "ascending knowledge" effect
const PARTICLES = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  xOffset: (Math.random() - 0.5) * 120, // Spread horizontally
  size: 3 + Math.random() * 5, // Varying sizes
  delay: Math.random() * 2000,
  duration: 3000 + Math.random() * 2000,
}));

const Particle = ({ xOffset, size, delay, duration }: { xOffset: number; size: number; delay: number; duration: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const cy = interpolate(
      progress.value,
      [0, 1],
      [CENTER_Y + 40, CENTER_Y - 150] // Move upwards
    );
    
    const opacity = interpolate(
      progress.value,
      [0, 0.2, 0.8, 1],
      [0, 0.6, 0.6, 0] // Fade in and out
    );

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.8, 1.2] // Slight growth
    );

    return {
      cy,
      opacity,
      r: size * scale,
    };
  });

  return (
    <AnimatedCircle
      cx={CENTER_X + xOffset}
      fill={ACCENT_COLOR}
      animatedProps={animatedProps}
    />
  );
};

const Ripple = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 3000,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const r = interpolate(
      progress.value,
      [0, 1],
      [20, 140] // Expand outwards
    );
    
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0.4, 0.1, 0] // Fade out
    );

    const strokeWidth = interpolate(
      progress.value,
      [0, 1],
      [2, 0] // Thin out
    );

    return {
      r,
      opacity,
      strokeWidth,
    };
  });

  return (
    <AnimatedCircle
      cx={CENTER_X}
      cy={CENTER_Y}
      stroke={ACCENT_COLOR}
      fill="none"
      animatedProps={animatedProps}
    />
  );
};

const CenterPulse = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      r: 30 * scale.value,
    };
  });

  return (
    <AnimatedCircle
      cx={CENTER_X}
      cy={CENTER_Y}
      fill="url(#centerGradient)"
      animatedProps={animatedProps}
    />
  );
};

export const HeroAnimation = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }));

  return (
    <Animated.View style={containerStyle}>
      <Svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <Defs>
          <RadialGradient
            id="centerGradient"
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            fx="50%"
            fy="50%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0.4" />
          </RadialGradient>
        </Defs>

        {/* Ripples */}
        <Ripple delay={0} />
        <Ripple delay={1000} />
        <Ripple delay={2000} />

        {/* Ascending Particles */}
        {PARTICLES.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Center Hub */}
        <CenterPulse />
      </Svg>
    </Animated.View>
  );
};
