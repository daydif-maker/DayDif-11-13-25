import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';
import { useTheme } from '@designSystem/ThemeProvider';

type ProjectionScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Projection'
>;

// Calculate projections based on pace
const getProjections = (pace: 'Light' | 'Standard' | 'Fast') => {
  const lessonsPerWeek = pace === 'Light' ? 4 : pace === 'Standard' ? 7 : 10;
  return {
    week1: lessonsPerWeek,
    month1: lessonsPerWeek * 4,
    month3: lessonsPerWeek * 12,
    month6: lessonsPerWeek * 24,
    topicsMonth6: pace === 'Light' ? 6 : pace === 'Standard' ? 12 : 18,
  };
};

interface AnimatedBarProps {
  targetWidth: string;
  delay: number;
  color: string;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({ targetWidth, delay, color }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const numericWidth = parseFloat(targetWidth);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: numericWidth,
      duration: 1400,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [numericWidth, delay]);

  return (
    <Animated.View
      style={[
        styles.chartBar,
        {
          backgroundColor: color,
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        },
      ]}
    />
  );
};

export const ProjectionScreen: React.FC = () => {
  const navigation = useNavigation<ProjectionScreenNavigationProp>();
  const { state } = useOnboarding();
  const { theme } = useTheme();
  
  const projections = getProjections(state.pace);

  const handleContinue = () => {
    navigation.navigate('CommuteTimeOfDay');
  };

  const barData = [
    { label: 'Week 1', width: '20', value: projections.week1, delay: 200 },
    { label: 'Month 1', width: '40', value: projections.month1, delay: 400 },
    { label: 'Month 3', width: '70', value: projections.month3, delay: 600 },
    { label: 'Month 6', width: '100', value: projections.month6, delay: 800 },
  ];

  return (
    <OnboardingLayout
      currentStep={8}
      totalSteps={17}
      title=""
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <View style={styles.centeredContent}>
          {/* Title positioned just above the graph */}
          <Text variant="heading1" style={styles.title}>
            You're setting yourself up for real progress
          </Text>
          
          {/* Progress Chart Representation */}
          <Card variant="outlined" padding="lg" style={styles.card}>
            <View style={styles.chartContainer}>
              {barData.map((item) => (
                <View key={item.label} style={styles.chartRow}>
                  <Text variant="bodySmall" color="textSecondary" style={styles.chartLabel}>
                    {item.label}
                  </Text>
                  <View style={styles.barContainer}>
                    <AnimatedBar
                      targetWidth={item.width}
                      delay={item.delay}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text variant="bodySmall" color="textPrimary" style={styles.chartValue}>
                    {item.value} lessons
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.summaryContainer}>
            <Text variant="body" color="textSecondary" style={styles.summaryText}>
              At your pace, you'll complete {projections.month6} lessons and master {projections.topicsMonth6} topics over the next 6 months. That's more than most people learn in years.
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 32,
  },
  card: {
    width: '100%',
  },
  chartContainer: {
    gap: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartLabel: {
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 8,
  },
  chartBar: {
    height: 8,
    borderRadius: 4,
    minWidth: 8,
  },
  chartValue: {
    width: 80,
    textAlign: 'right',
  },
  summaryContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  summaryText: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
