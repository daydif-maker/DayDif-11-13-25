import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  useDerivedValue,
  withRepeat,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = SCREEN_WIDTH - 80;

type BuildingLessonScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Generating'
>;

// Processing steps with timing
const STEPS = [
  { text: 'Analyzing your interests...', duration: 1200 },
  { text: 'Selecting your first lessons...', duration: 1400 },
  { text: 'Optimizing for your schedule...', duration: 1100 },
  { text: 'Calibrating difficulty level...', duration: 1300 },
  { text: 'Creating your learning path...', duration: 1500 },
  { text: 'Finalizing your daily plan...', duration: 1000 },
] as const;

// Plan includes items
const PLAN_INCLUDES = [
  'Personalized lesson schedule',
  'Adaptive difficulty levels',
  'Progress tracking',
  'Daily learning goals',
  'Smart reminders',
];

// Gradient colors (Pink/Coral to Blue)
const GRADIENT_COLORS = ['#FF6B6B', '#E056A0', '#9B59B6', '#4DABF7'] as const;

interface BuildingLessonScreenProps {
  onDone?: () => void;
  initialProgress?: number;
  initialStepIndex?: number;
}

// Animated text component for the percentage
const AnimatedPercentage: React.FC<{ progress: Animated.SharedValue<number> }> = ({ progress }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { theme } = useTheme();

  useDerivedValue(() => {
    const value = Math.round(progress.value * 100);
    runOnJS(setDisplayValue)(value);
  });

  return (
    <Text style={[styles.percentageText, { color: theme.colors.textPrimary }]}>
      {displayValue}%
    </Text>
  );
};

// Animated gradient progress bar
const GradientProgressBar: React.FC<{
  progress: Animated.SharedValue<number>;
  shimmer: Animated.SharedValue<number>;
}> = ({ progress, shimmer }) => {
  const { theme } = useTheme();

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.max(progress.value * 100, 2)}%`,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-100, PROGRESS_BAR_WIDTH]
    );
    return {
      transform: [{ translateX }],
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.6, 0]),
    };
  });

  return (
    <View style={[styles.progressBarTrack, { backgroundColor: theme.colors.border }]}>
      <Animated.View style={[styles.progressBarFill, progressStyle]}>
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Animated step text
const AnimatedStepText: React.FC<{
  step: string;
  index: number;
}> = ({ step, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const { theme } = useTheme();

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 10;
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
        {step}
      </Text>
    </Animated.View>
  );
};

// Completion checkmark animation
const CompletionCheckmark: React.FC<{ visible: boolean }> = ({ visible }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-45);
  const { theme } = useTheme();

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      rotation.value = withSpring(0, { damping: 15, stiffness: 100 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.checkmarkContainer, animatedStyle]}>
      <LinearGradient
        colors={['#22C55E', '#16A34A']}
        style={styles.checkmarkCircle}
      >
        <Ionicons name="checkmark" size={32} color="white" />
      </LinearGradient>
    </Animated.View>
  );
};

export const BuildingLessonScreen: React.FC<BuildingLessonScreenProps> = ({
  onDone,
}) => {
  const navigation = useNavigation<BuildingLessonScreenNavigationProp>();
  const { theme } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Animated values
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  // Calculate total duration for progress timing
  const totalDuration = STEPS.reduce((sum, step) => sum + step.duration, 0);

  // Start animations
  useEffect(() => {
    // Start shimmer animation (repeating)
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    // Animate card entrance
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    cardTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }));

    // Progress through steps
    let cumulativeDuration = 0;
    const stepTimeouts: NodeJS.Timeout[] = [];

    STEPS.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStepIndex(index);
        
        // Calculate target progress for this step
        const stepProgress = (index + 1) / STEPS.length;
        progress.value = withTiming(stepProgress, {
          duration: step.duration,
          easing: Easing.out(Easing.cubic),
        });

        // Check if this is the last step
        if (index === STEPS.length - 1) {
          setTimeout(() => {
            setIsDone(true);
          }, step.duration);
        }
      }, cumulativeDuration);

      stepTimeouts.push(timeout);
      cumulativeDuration += step.duration;
    });

    return () => {
      stepTimeouts.forEach(clearTimeout);
    };
  }, []);

  // Auto-navigate when done
  useEffect(() => {
    if (isDone && onDone) {
      const timer = setTimeout(() => {
        onDone();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDone, onDone]);

  const handleContinue = useCallback(() => {
    if (isDone) {
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      if (onDone) {
        onDone();
      } else {
        navigation.navigate('PlanReveal');
      }
    }
  }, [isDone, onDone, navigation]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const subtitleText = isDone
    ? 'Your plan is ready!'
    : "We're setting everything up for you";

  const buttonLabel = isDone ? 'Continue' : 'Preparing...';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {/* Top Section - Centered Percentage & Subtitle */}
        <View style={styles.topSection}>
          <View style={styles.percentageContainer}>
            <CompletionCheckmark visible={isDone} />
            {!isDone && <AnimatedPercentage progress={progress} />}
            {isDone && (
              <Animated.View>
                <Text style={[styles.doneText, { color: theme.colors.textPrimary }]}>
                  All done!
                </Text>
              </Animated.View>
            )}
          </View>
          
          <Text style={[styles.subtitleText, { color: theme.colors.textPrimary }]}>
            {subtitleText}
          </Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <GradientProgressBar progress={progress} shimmer={shimmer} />
          
          <View style={styles.stepTextContainer}>
            {!isDone && (
              <AnimatedStepText
                step={STEPS[currentStepIndex].text}
                index={currentStepIndex}
              />
            )}
          </View>
        </View>

        {/* Plan Includes Card */}
        <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              Your personalized plan includes:
            </Text>
            
            <View style={styles.bulletList}>
              {PLAN_INCLUDES.map((item, index) => (
                <View key={item} style={styles.bulletItem}>
                  <View style={[styles.bullet, { backgroundColor: theme.colors.textSecondary }]} />
                  <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isDone}
            activeOpacity={0.8}
            style={[
              styles.continueButton,
              {
                backgroundColor: isDone ? theme.colors.black : theme.colors.textTertiary,
              },
            ]}
          >
            <Text style={styles.buttonText}>
              {buttonLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
  },
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  percentageText: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '700',
    letterSpacing: -2,
    fontFamily: 'DMSans_700Bold',
    includeFontPadding: false,
  },
  doneText: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
    fontFamily: 'DMSans_700Bold',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 30,
    fontFamily: 'DMSans_500Medium',
  },
  progressSection: {
    paddingTop: 40,
    paddingBottom: 28,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
  stepTextContainer: {
    height: 28,
    marginTop: 16,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  cardWrapper: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: 'DMSans_500Medium',
  },
  bulletList: {
    gap: 14,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 14,
  },
  bulletText: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
  },
  checkmarkContainer: {
    marginBottom: 8,
  },
  checkmarkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'DMSans_500Medium',
  },
});
