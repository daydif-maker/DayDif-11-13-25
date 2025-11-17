import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useOnboarding } from '@context/OnboardingContext';

export const SuccessScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();

  const handleContinue = async () => {
    // Complete onboarding - RootNavigator will automatically navigate to MainTabs
    await completeOnboarding();
  };

  return (
    <OnboardingLayout
      currentStep={16}
      totalSteps={17}
      title="You're all set!"
      subtitle="Your first lesson is ready anytime."
      onContinue={handleContinue}
      ctaLabel="Go to Today"
      showBackButton={false}
    >
      <View style={styles.content} />
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});

