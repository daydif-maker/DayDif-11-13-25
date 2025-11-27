import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useOnboarding } from '@context/OnboardingContext';

type EncouragementScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Encouragement'
>;

type BarrierContent = {
  headline: string;
  body: string;
  socialProof: string;
};

const BARRIER_CONTENT: Record<string, BarrierContent> = {
  consistency: {
    headline: 'DayDif makes consistency automatic',
    body: 'Your commute already happens every day. We just fill it with learning. No willpower required — just press play.',
    socialProof: '89% of daily commuters complete their lessons',
  },
  busy: {
    headline: 'Your learning time is already scheduled',
    body: "You don't need to find extra time. Your commute is built into your day — we just make it count.",
    socialProof: 'Users learn an average of 4.2 hours per week without changing their schedule',
  },
  tired: {
    headline: 'Learning that requires zero effort',
    body: "Just listen. No reading, no note-taking, no screens required. Perfect for when you're mentally checked out.",
    socialProof: '73% of users say DayDif is easier than podcasts or audiobooks',
  },
  structure: {
    headline: 'We plan everything for you',
    body: 'No decisions to make. Every day, your lesson is ready and waiting. Just show up and press play.',
    socialProof: 'Our guided paths have helped 50,000+ users finish what they started',
  },
  options: {
    headline: 'One lesson. One day. Simple.',
    body: 'We cut through the noise. Instead of endless choices, you get one perfect lesson each day, curated just for you.',
    socialProof: 'Users who follow our daily picks are 3x more likely to build a learning habit',
  },
};

const DEFAULT_CONTENT: BarrierContent = {
  headline: 'DayDif is designed to work for you',
  body: 'Your commute already happens every day. We just fill it with learning. No extra effort required.',
  socialProof: 'Join 100,000+ learners making their commute count',
};

export const EncouragementScreen: React.FC = () => {
  const navigation = useNavigation<EncouragementScreenNavigationProp>();
  const { state } = useOnboarding();

  const handleContinue = () => {
    navigation.navigate('Pace');
  };

  // Get the selected obstacle from state
  const selectedObstacle = state.obstacles?.[0] || '';
  const content = BARRIER_CONTENT[selectedObstacle] || DEFAULT_CONTENT;

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={17}
      title={content.headline}
      subtitle={content.body}
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Text variant="body" color="textPrimary" style={styles.socialProof}>
            {content.socialProof}
          </Text>
        </Card>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
  },
  card: {
    width: '100%',
  },
  socialProof: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
