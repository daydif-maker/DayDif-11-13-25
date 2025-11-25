import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import { useOnboarding } from '@context/OnboardingContext';
import { useUserStateStore } from '@store';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { completeOnboarding } = useOnboarding();
  const setActivePlanId = useUserStateStore((state) => state.setActivePlanId);

  const handleContinue = () => {
    navigation.navigate('Goal');
  };

  const handleSkipOnboarding = async () => {
    // Set a demo plan ID so the router goes to MainTabs
    setActivePlanId('demo-plan');
    // Mark onboarding as complete
    await completeOnboarding();
  };

  return (
    <OnboardingLayout
      currentStep={0}
      totalSteps={17}
      title="Welcome to DayDif"
      subtitle="Let's personalize your commute-learning plan."
      onContinue={handleContinue}
      showBackButton={false}
      showLanguageSelector={true}
    >
      <View style={styles.content}>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Text variant="body" color="textPrimary">
            Your privacy and security matter to us.
          </Text>
          <Text variant="bodySmall" color="textSecondary" marginTop="xs">
            Your data stays private and is only used to tailor your learning experience.
          </Text>
        </Card>
        
        <TouchableOpacity 
          onPress={handleSkipOnboarding}
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text 
            variant="body" 
            color="textSecondary" 
            style={styles.skipText}
          >
            Skip onboarding →
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
  },
  skipButton: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    textDecorationLine: 'underline',
  },
});
