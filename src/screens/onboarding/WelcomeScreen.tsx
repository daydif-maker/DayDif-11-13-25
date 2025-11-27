import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingLayout } from '@ui/layout/OnboardingLayout';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@navigation/types';
import { Text } from '@ui/Text';
import { AudioRoadAnimation } from '@components/onboarding';
import { useOnboarding } from '@context/OnboardingContext';
import { useUserStateStore, useLessonsStore, usePlansStore, usePlaybackStore, DEMO_PLAN_ID } from '@store';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { completeOnboarding } = useOnboarding();
  const theme = useTheme<Theme>();
  const setActivePlanId = useUserStateStore((state) => state.setActivePlanId);
  const resetUserState = useUserStateStore((state) => state.reset);
  const resetLessons = useLessonsStore((state) => state.reset);
  const resetPlans = usePlansStore((state) => state.reset);
  const resetPlayback = usePlaybackStore((state) => state.reset);

  const handleContinue = () => {
    navigation.navigate('CommuteDuration');
  };

  const handleSkipOnboarding = async () => {
    // Clear all stores first to ensure clean state
    resetLessons();
    resetPlans();
    resetPlayback();
    await resetUserState();
    
    // Set a demo plan ID so the router goes to MainTabs
    setActivePlanId(DEMO_PLAN_ID);
    // Mark onboarding as complete
    await completeOnboarding();
  };

  return (
    <OnboardingLayout
      currentStep={0}
      totalSteps={17}
      title="Turn your commute into your classroom"
      onContinue={handleContinue}
      ctaLabel="Get Started"
      showBackButton={false}
      showLanguageSelector={true}
      scrollEnabled={false}
    >
      <View style={styles.container}>
        {/* Animation Container with subtle background */}
        <View 
          style={[
            styles.animationContainer,
            { backgroundColor: theme.colors.backgroundSecondary }
          ]}
        >
          <AudioRoadAnimation />
        </View>

        <View style={styles.footerContent}>
          <Animated.View
            entering={FadeInDown.delay(3000).duration(800).springify()}
          >
            <TouchableOpacity 
              onPress={handleSkipOnboarding}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text 
                variant="bodySmall" 
                color="textSecondary" 
              >
                Skip Onboarding →
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View
            entering={FadeInDown.delay(3200).duration(800).springify()}
          >
            <TouchableOpacity 
              onPress={handleSkipOnboarding}
              style={styles.signInButton}
              activeOpacity={0.7}
            >
              <Text 
                variant="body" 
                color="textSecondary" 
              >
                Already have an account? <Text variant="body" color="textPrimary" fontWeight="600">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: -20,
    zIndex: 1,
    // Add overflow visible to allow the 3D tilt to extend if needed, 
    // though the component handles its own sizing.
  },
  footerContent: {
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  signInButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
