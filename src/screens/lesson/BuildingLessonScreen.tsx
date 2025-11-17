import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Text } from '@ui/Text';
import { Card } from '@ui/Card';
import { useTheme } from '@designSystem/ThemeProvider';

type BuildingLessonScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Generating'
>;

// TODO: Replace with actual Lottie animation from design team
// Placeholder path - ensure this asset exists or update path accordingly
const LOTTIE_ANIMATION = require('../../../assets/lottie/lesson-building.json');

const STEPS = [
  "Selecting today's lesson focus",
  'Outlining commute-length session',
  'Adding reflection checkpoints',
  'Drafting memory summary',
  'Preparing progress insights',
] as const;

type StepStatus = 'completed' | 'active' | 'pending';

interface BuildingLessonScreenProps {
  onDone?: () => void;
  // Optional: For future backend-driven progress
  initialProgress?: number;
  initialStepIndex?: number;
}

export const BuildingLessonScreen: React.FC<BuildingLessonScreenProps> = ({
  onDone,
  initialProgress = 0,
  initialStepIndex = 0,
}) => {
  const navigation = useNavigation<BuildingLessonScreenNavigationProp>();
  const { theme } = useTheme();
  const [progress, setProgress] = useState<number>(initialProgress);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStepIndex);
  const [isDone, setIsDone] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lottieRef = useRef<LottieView>(null);

  // Simulate progress with setInterval
  useEffect(() => {
    // Start Lottie animation
    lottieRef.current?.play();

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 0.08, 1);
        
        // Derive currentStepIndex from progress
        const newStepIndex = Math.min(
          Math.floor(newProgress * STEPS.length),
          STEPS.length - 1
        );
        setCurrentStepIndex(newStepIndex);

        if (newProgress >= 1) {
          setIsDone(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 1;
        }
        return newProgress;
      });
    }, 600);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-navigate when done (optional - can be removed if manual navigation preferred)
  useEffect(() => {
    if (isDone && onDone) {
      // Small delay to show completion state
      const timer = setTimeout(() => {
        onDone();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDone, onDone]);

  const handleContinue = () => {
    if (isDone) {
      if (onDone) {
        onDone();
      } else {
        navigation.navigate('PlanReveal');
      }
    }
  };

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStepIndex) {
      return 'completed';
    }
    if (index === currentStepIndex && isDone) {
      return 'completed';
    }
    if (index === currentStepIndex && !isDone) {
      return 'active';
    }
    return 'pending';
  };

  const renderStepIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={theme.colors.success}
          />
        );
      case 'active':
        return (
          <ActivityIndicator
            size="small"
            color={theme.colors.black}
          />
        );
      case 'pending':
        return (
          <View
            style={[
              styles.pendingCircle,
              { borderColor: theme.colors.border },
            ]}
          />
        );
    }
  };

  const progressPercentage = Math.round(progress * 100);
  const captionText = isDone
    ? 'Lesson ready.'
    : 'This usually takes just a few seconds.';
  const buttonLabel = isDone ? 'Continue' : 'Preparing lesson...';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="heading1"
            style={[styles.percentageText, { color: theme.colors.textPrimary }]}
          >
            {progressPercentage}%
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={styles.subtitle}
          >
            We're customizing your commute-learning plan…
          </Text>
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={lottieRef}
              source={LOTTIE_ANIMATION}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Progress.Bar
              progress={progress}
              width={null}
              height={4}
              color={theme.colors.black}
              unfilledColor={theme.colors.border}
              borderWidth={0}
              borderRadius={2}
            />
          </View>

          {/* Caption */}
          <Text
            variant="bodySmall"
            color="textSecondary"
            style={styles.caption}
          >
            {captionText}
          </Text>
        </View>

        {/* Checklist Card */}
        <Card variant="outlined" style={styles.checklistCard}>
          <Text
            variant="body"
            color="textSecondary"
            style={styles.checklistTitle}
          >
            We're setting up:
          </Text>
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  {renderStepIcon(status)}
                </View>
                <Text
                  variant="bodySmall"
                  color="textPrimary"
                  style={styles.stepText}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isDone}
          activeOpacity={0.7}
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.colors.black,
              opacity: isDone ? 1 : 0.5,
            },
          ]}
        >
          <Text
            variant="body"
            color="textInverse"
            style={styles.buttonText}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  centerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  checklistCard: {
    marginBottom: 24,
    padding: 20,
  },
  checklistTitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
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
  },
});

