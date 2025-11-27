import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '@designSystem/ThemeProvider';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animation configuration
const BAR_COUNT = 18;
const ANIMATION_WIDTH = SCREEN_WIDTH * 0.85;
const BAR_SPACING = ANIMATION_WIDTH / BAR_COUNT;
const BAR_STROKE_WIDTH = 4;
const MAX_BAR_HEIGHT = 80;
const MIN_BAR_HEIGHT = 12;
const SVG_HEIGHT = 160;
const SVG_CENTER_Y = SVG_HEIGHT / 2;

// Phase timing (in ms)
const CHAOS_DURATION = 2500;
const TRANSITION_DURATION = 800;
const CLARITY_START = CHAOS_DURATION;
const ROAD_START = CLARITY_START + TRANSITION_DURATION + 1500;

interface BarProps {
  index: number;
  phase: SharedValue<number>;
  chaosOffset: SharedValue<number>;
  sinePhase: SharedValue<number>;
  primaryColor: string;
}

const AnimatedBar: React.FC<BarProps> = ({
  index,
  phase,
  chaosOffset,
  sinePhase,
  primaryColor,
}) => {
  // Each bar has a unique random seed for chaos phase
  const randomSeed = useMemo(() => Math.random() * Math.PI * 2, []);
  const randomSpeed = useMemo(() => 0.8 + Math.random() * 0.4, []);
  
  // Calculate position along the bar row
  const xPosition = (index + 0.5) * BAR_SPACING;
  
  // Derive animated height based on current phase
  const animatedHeight = useDerivedValue(() => {
    const currentPhase = phase.value;
    
    // Phase 0: Chaos - random pulsing
    const chaosHeight =
      MIN_BAR_HEIGHT +
      (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) *
        (0.5 + 0.5 * Math.sin(chaosOffset.value * randomSpeed + randomSeed));
    
    // Phase 1: Clarity - sine wave synchronized
    const sinePosition = (index / BAR_COUNT) * Math.PI * 2;
    const clarityHeight =
      MIN_BAR_HEIGHT +
      (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) *
        (0.5 + 0.4 * Math.sin(sinePhase.value + sinePosition));
    
    // Phase 2: Road - continues sine wave with slight dampening at edges
    const edgeFactor = 1 - Math.abs((index - BAR_COUNT / 2) / (BAR_COUNT / 2)) * 0.3;
    const roadHeight =
      MIN_BAR_HEIGHT +
      (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) *
        (0.5 + 0.35 * Math.sin(sinePhase.value + sinePosition)) *
        edgeFactor;
    
    // Interpolate between phases
    if (currentPhase < 1) {
      return interpolate(currentPhase, [0, 1], [chaosHeight, clarityHeight]);
    } else {
      return interpolate(currentPhase, [1, 2], [clarityHeight, roadHeight]);
    }
  });
  
  // Derive opacity based on phase and position
  const animatedOpacity = useDerivedValue(() => {
    const currentPhase = phase.value;
    
    // Phase 0: Chaos - random opacity
    const chaosOpacity =
      0.4 + 0.6 * Math.abs(Math.sin(chaosOffset.value * randomSpeed * 1.3 + randomSeed * 2));
    
    // Phase 1 & 2: Full opacity with subtle variation
    const clarityOpacity = 0.85 + 0.15 * Math.sin(sinePhase.value + index * 0.3);
    
    if (currentPhase < 1) {
      return interpolate(currentPhase, [0, 1], [chaosOpacity, clarityOpacity]);
    }
    return clarityOpacity;
  });
  
  const animatedProps = useAnimatedProps(() => {
    const height = animatedHeight.value;
    return {
      y1: SVG_CENTER_Y - height / 2,
      y2: SVG_CENTER_Y + height / 2,
      opacity: animatedOpacity.value,
    };
  });
  
  return (
    <AnimatedLine
      x1={xPosition}
      x2={xPosition}
      stroke={primaryColor}
      strokeWidth={BAR_STROKE_WIDTH}
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
};

export const SpectrumRoadAnimation: React.FC = () => {
  const { theme } = useTheme();
  const primaryColor = theme.colors.primary;
  
  // Animation phase: 0 = chaos, 1 = clarity, 2 = road
  const phase = useSharedValue(0);
  
  // Chaos phase oscillator
  const chaosOffset = useSharedValue(0);
  
  // Sine wave phase for clarity/road
  const sinePhase = useSharedValue(0);
  
  // 3D perspective rotation
  const rotateX = useSharedValue(0);
  const perspective = useSharedValue(800);
  
  useEffect(() => {
    // Start chaos phase oscillation
    chaosOffset.value = withRepeat(
      withTiming(Math.PI * 8, {
        duration: CHAOS_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    
    // Continuous sine wave animation
    sinePhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    
    // Phase transitions
    // Phase 0 -> 1: Chaos to Clarity
    phase.value = withSequence(
      withTiming(0, { duration: CHAOS_DURATION - 500, easing: Easing.linear }),
      withTiming(1, { duration: TRANSITION_DURATION, easing: Easing.inOut(Easing.ease) }),
      withDelay(
        1500,
        withTiming(2, { duration: TRANSITION_DURATION, easing: Easing.inOut(Easing.ease) })
      )
    );
    
    // 3D Road perspective animation
    rotateX.value = withDelay(
      ROAD_START,
      withTiming(25, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
    
    perspective.value = withDelay(
      ROAD_START,
      withTiming(600, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);
  
  // Animated container style for 3D perspective
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: perspective.value },
        { rotateX: `${rotateX.value}deg` },
      ],
    };
  });
  
  // Generate bars
  const bars = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, index) => (
      <AnimatedBar
        key={index}
        index={index}
        phase={phase}
        chaosOffset={chaosOffset}
        sinePhase={sinePhase}
        primaryColor={primaryColor}
      />
    ));
  }, [phase, chaosOffset, sinePhase, primaryColor]);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgContainer, containerStyle]}>
        <Svg
          width={ANIMATION_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${ANIMATION_WIDTH} ${SVG_HEIGHT}`}
        >
          {bars}
        </Svg>
      </Animated.View>
      
      {/* Subtle ground shadow for depth */}
      <View
        style={[
          styles.shadow,
          {
            backgroundColor: theme.colors.border,
            width: ANIMATION_WIDTH * 0.7,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    height: 3,
    borderRadius: 2,
    marginTop: 20,
    opacity: 0.3,
  },
});

