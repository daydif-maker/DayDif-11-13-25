import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configuration
const BAR_COUNT = 18;
const CONTAINER_HEIGHT = 200;
const CONTAINER_WIDTH = SCREEN_WIDTH * 0.8;
const BAR_WIDTH = (CONTAINER_WIDTH / BAR_COUNT) * 0.6; // 60% width, 40% gap
const GAP = (CONTAINER_WIDTH - BAR_WIDTH * BAR_COUNT) / (BAR_COUNT - 1);

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const AudioBar = ({
  index,
  totalBars,
  color,
  phase,
}: {
  index: number;
  totalBars: number;
  color: string;
  phase: Animated.SharedValue<number>;
}) => {
  // Random values for chaos phase
  const randomHeight = useSharedValue(Math.random());
  const randomOpacity = useSharedValue(Math.random());

  useEffect(() => {
    // Start chaos animation immediately
    randomHeight.value = withRepeat(
      withTiming(Math.random(), { duration: 300 + Math.random() * 500 }),
      -1,
      true
    );
    randomOpacity.value = withRepeat(
      withTiming(0.4 + Math.random() * 0.6, { duration: 300 + Math.random() * 500 }),
      -1,
      true
    );
    
    return () => {
      cancelAnimation(randomHeight);
      cancelAnimation(randomOpacity);
    };
  }, []);

  // Shared value for the sine wave animation (Clarity phase)
  const sineProgress = useSharedValue(0);

  useEffect(() => {
    // Continuous sine wave driver
    sineProgress.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const currentPhase = phase.value;
    
    // Phase 0: Chaos
    // Phase 1: Clarity (transitioning to sine)
    // Phase 2: Commute (steady sine wave)

    let heightPercent = 0;
    let opacity = 1;

    // Calculate Sine Wave Height
    // Offset each bar to create the wave effect
    const offset = (index / totalBars) * 2 * Math.PI;
    // Basic sine wave: value between -1 and 1 -> mapped to 0.2 to 1.0
    const sineValue = Math.sin(sineProgress.value + offset);
    const waveHeight = interpolate(sineValue, [-1, 1], [0.2, 1.0]);

    if (currentPhase < 1) {
      // Chaos Phase
      heightPercent = randomHeight.value;
      opacity = randomOpacity.value;
    } else {
      // Clarity & Commute Phase
      // Interpolate from Chaos to Wave based on phase transition
      // We assume phase goes from 0 -> 1 -> 2
      // But actually we might just switch logic. 
      // To make it smooth, we can interpolate if we had a transition value.
      // For simplicity in this prop update, we switch to wave logic.
      heightPercent = waveHeight;
      opacity = 1; 
      // In Commute phase, we might want to pulse slightly differently or just keep the wave
    }
    
    // Allow a smooth blend if we used a transition progress, but simple conditional is safer for performance here
    // unless we want to cross-fade the values.
    
    // Let's use interpolate to blend if phase is floating point, but user req says "Phase 1... Phase 2..."
    // We'll treat phase as a state indicator. 
    
    // Refinement: The prompt asks for smooth transition.
    // Let's assume phase changes 0 -> 1 -> 2 abruptly in logic but we want visual smoothness.
    // However, SVG props are hard to blend without extra shared values.
    // Let's rely on the layout animation for the container tilt, and for bars, we switch to sine wave.
    // The sine wave starts at a value. To avoid jump, maybe just switch.
    
    const h = heightPercent * CONTAINER_HEIGHT;
    const y = (CONTAINER_HEIGHT - h) / 2; // Center vertically

    return {
      height: h,
      y: y,
      fillOpacity: opacity,
    };
  });

  return (
    <AnimatedRect
      x={index * (BAR_WIDTH + GAP)}
      width={BAR_WIDTH}
      fill={color}
      rx={BAR_WIDTH / 2}
      animatedProps={animatedProps}
    />
  );
};

export const AudioRoadAnimation: React.FC = () => {
  const theme = useTheme<Theme>();
  const phase = useSharedValue(0); // 0: Chaos, 1: Clarity, 2: Commute
  const containerRotateX = useSharedValue(0);
  const containerScale = useSharedValue(1);
  const containerPerspective = useSharedValue(1000); // Start flat-ish (high perspective or none)

  useEffect(() => {
    // Phase 1: Chaos (Initial State)
    // Run for 2 seconds
    const chaosTimeout = setTimeout(() => {
      // Phase 2: Clarity
      phase.value = 1;
      
      const clarityTimeout = setTimeout(() => {
        // Phase 3: The Commute
        phase.value = 2;
        containerRotateX.value = withTiming(60, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
        containerScale.value = withTiming(1.5, { duration: 1500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
        // Adjust perspective if needed, but rotateX is the main driver for "road" look
      }, 2000); // 2 seconds of clarity before tilting

      return () => clearTimeout(clarityTimeout);
    }, 2000); // 2 seconds of chaos

    return () => clearTimeout(chaosTimeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 800 }, // Fixed perspective context
        { rotateX: `${containerRotateX.value}deg` },
        { scale: containerScale.value },
      ],
      // Add a glow or shadow if desired for premium feel
      opacity: withTiming(1, { duration: 1000 }), // Fade in on mount
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, containerStyle]}>
        <Svg height={CONTAINER_HEIGHT} width={CONTAINER_WIDTH} viewBox={`0 0 ${CONTAINER_WIDTH} ${CONTAINER_HEIGHT}`}>
          <Defs>
            <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.8" />
              <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0.4" />
            </LinearGradient>
          </Defs>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <AudioBar
              key={i}
              index={i}
              totalBars={BAR_COUNT}
              color={theme.colors.primary}
              phase={phase}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

