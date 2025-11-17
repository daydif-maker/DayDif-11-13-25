import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';
import { useTheme } from '@designSystem/ThemeProvider';

type PlanRevealScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'PlanReveal'
>;

const WEEK_PLAN = [
  'Day 1 – Topic placeholder',
  'Day 2 – Topic placeholder',
  'Day 3 – Topic placeholder',
  'Day 4 – Topic placeholder',
  'Day 5 – Topic placeholder',
  'Day 6 – Reflection and review',
  'Day 7 – Weekly summary',
];

export const PlanRevealScreen: React.FC = () => {
  const navigation = useNavigation<PlanRevealScreenNavigationProp>();
  const { state } = useOnboarding();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('SaveProgress');
  };

  return (
    <OnboardingLayout
      currentStep={13}
      totalSteps={17}
      title="Your custom learning path is ready!"
      subtitle="Here's what your first week looks like."
      onContinue={handleContinue}
      ctaLabel="Start My Plan"
      showBackButton={true}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" padding="lg" style={styles.card}>
          {WEEK_PLAN.map((day, index) => (
            <View
              key={index}
              style={[
                styles.dayItem,
                index < WEEK_PLAN.length - 1 && styles.dayItemBorder,
              ]}
            >
              <Text variant="body" color="textPrimary">
                {day}
              </Text>
            </View>
          ))}
          <View style={styles.summary}>
            <Text variant="bodySmall" color="textSecondary">
              Your commute time: {state.commuteDurationMinutes} minutes
            </Text>
            <Text variant="bodySmall" color="textSecondary" marginTop="xs">
              Recommended lesson pace: {state.pace}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  card: {
    width: '100%',
  },
  dayItem: {
    paddingVertical: 12,
  },
  dayItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

