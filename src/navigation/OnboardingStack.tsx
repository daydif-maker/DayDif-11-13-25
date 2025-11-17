import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@designSystem/ThemeProvider';
import { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { GenderScreen } from '../screens/onboarding/GenderScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { MotivationScreen } from '../screens/onboarding/MotivationScreen';
import { CommuteTimeOfDayScreen } from '../screens/onboarding/CommuteTimeOfDayScreen';
import { CommuteDurationScreen } from '../screens/onboarding/CommuteDurationScreen';
import { LearningStyleScreen } from '../screens/onboarding/LearningStyleScreen';
import { ObstaclesScreen } from '../screens/onboarding/ObstaclesScreen';
import { EncouragementScreen } from '../screens/onboarding/EncouragementScreen';
import { ProjectionScreen } from '../screens/onboarding/ProjectionScreen';
import { PaceScreen } from '../screens/onboarding/PaceScreen';
import { SocialProofScreen } from '../screens/onboarding/SocialProofScreen';
import { WorkoutFrequencyScreen } from '../screens/onboarding/WorkoutFrequencyScreen';
import { AllSetScreen } from '../screens/onboarding/AllSetScreen';
import { GeneratingScreen } from '../screens/onboarding/GeneratingScreen';
import { PlanRevealScreen } from '../screens/onboarding/PlanRevealScreen';
import { SaveProgressScreen } from '../screens/onboarding/SaveProgressScreen';
import { PaywallScreen } from '../screens/onboarding/PaywallScreen';
import { SuccessScreen } from '../screens/onboarding/SuccessScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 100,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Motivation" component={MotivationScreen} />
      <Stack.Screen name="CommuteTimeOfDay" component={CommuteTimeOfDayScreen} />
      <Stack.Screen name="CommuteDuration" component={CommuteDurationScreen} />
      <Stack.Screen name="LearningStyle" component={LearningStyleScreen} />
      <Stack.Screen name="Obstacles" component={ObstaclesScreen} />
      <Stack.Screen name="Encouragement" component={EncouragementScreen} />
      <Stack.Screen name="Projection" component={ProjectionScreen} />
      <Stack.Screen name="Pace" component={PaceScreen} />
      <Stack.Screen name="SocialProof" component={SocialProofScreen} />
      <Stack.Screen name="WorkoutFrequency" component={WorkoutFrequencyScreen} />
      <Stack.Screen name="AllSet" component={AllSetScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} />
      <Stack.Screen name="PlanReveal" component={PlanRevealScreen} />
      <Stack.Screen name="SaveProgress" component={SaveProgressScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
};
