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
import { Ionicons } from '@expo/vector-icons';

type PlanRevealScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'PlanReveal'
>;

export const PlanRevealScreen: React.FC = () => {
  const navigation = useNavigation<PlanRevealScreenNavigationProp>();
  const { state } = useOnboarding();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('SaveProgress');
  };

  // Get lessons per week based on pace
  const lessonsPerWeek = state.pace === 'Light' ? '3-5' : state.pace === 'Fast' ? '10+' : '7';

  return (
    <OnboardingLayout
      currentStep={12}
      totalSteps={17}
      title="Your learning journey starts now"
      onContinue={handleContinue}
      ctaLabel="Let's Go"
      showBackButton={true}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Ready Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: theme.colors.success || '#00A86B' }]}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text variant="bodySmall" style={styles.badgeText}>
              Your plan is ready
            </Text>
          </View>
        </View>

        {/* Summary Card */}
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Text variant="heading4" color="textPrimary" marginBottom="md">
            Your personalized plan
          </Text>
          
          <View style={styles.summaryItem}>
            <Text variant="body" color="textSecondary">
              First topic:
            </Text>
            <Text variant="body" color="textPrimary" fontWeight="600">
              {state.goal || 'Personal Development'}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text variant="body" color="textSecondary">
              Daily goal:
            </Text>
            <Text variant="body" color="textPrimary" fontWeight="600">
              {state.commuteDurationMinutes} minutes
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text variant="body" color="textSecondary">
              Weekly target:
            </Text>
            <Text variant="body" color="textPrimary" fontWeight="600">
              {lessonsPerWeek} lessons
            </Text>
          </View>
        </Card>

        {/* First Lesson Preview */}
        <Card variant="outlined" padding="lg" style={styles.previewCard}>
          <Text variant="bodySmall" color="textSecondary" marginBottom="sm">
            Your first lesson
          </Text>
          <View style={styles.lessonPreview}>
            <View style={[styles.lessonThumbnail, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.lessonInfo}>
              <Text variant="body" color="textPrimary" fontWeight="600">
                Introduction to {state.goal || 'Your Topic'}
              </Text>
              <Text variant="bodySmall" color="textSecondary">
                {state.commuteDurationMinutes} min · {state.goal || 'Personal Development'}
              </Text>
            </View>
          </View>
        </Card>

        <Text variant="bodySmall" color="textSecondary" style={styles.footnote}>
          You can adjust your plan anytime in Settings.
        </Text>
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
    paddingBottom: 16,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  previewCard: {
    width: '100%',
    marginBottom: 16,
  },
  lessonPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  lessonThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
    gap: 4,
  },
  footnote: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
