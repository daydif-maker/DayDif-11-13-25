import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';

type PaywallScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Paywall'
>;

const BENEFITS = [
  'Daily audio-first lessons',
  'Personalized weekly outlines',
  'Progress tracking and streaks',
  'Smart memory summaries',
  'Unlimited topics and lesson generation',
];

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  const { theme } = useTheme();

  const handleContinue = () => {
    navigation.navigate('Success');
  };

  const handleRestore = () => {
    // TODO: Implement restore purchases
  };

  return (
    <OnboardingLayout
      currentStep={15}
      totalSteps={17}
      title="Unlock DayDif to make every commute count"
      subtitle="Start with your personalized plan. No payment due today."
      onContinue={handleContinue}
      showBackButton={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text variant="body" color="textPrimary">
                • {benefit}
              </Text>
            </View>
          ))}
        </Card>
        <View style={styles.pricing}>
          <Text variant="heading3" style={styles.pricingText}>
            Just $29.99 per year
          </Text>
          <Text variant="body" color="textSecondary" style={styles.pricingSubtext}>
            (about $2.49 per month)
          </Text>
        </View>
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text variant="bodySmall" color="textSecondary">
            Restore
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  card: {
    width: '100%',
    marginBottom: 24,
  },
  benefitItem: {
    marginTop: 12,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingText: {
    textAlign: 'center',
  },
  pricingSubtext: {
    textAlign: 'center',
    marginTop: 4,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

