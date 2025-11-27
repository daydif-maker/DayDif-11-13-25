import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@designSystem/ThemeProvider';
import { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CommuteDurationScreen } from '../screens/onboarding/CommuteDurationScreen';
import { CommuteTypeScreen } from '../screens/onboarding/CommuteTypeScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { MotivationScreen } from '../screens/onboarding/MotivationScreen';
import { ObstaclesScreen } from '../screens/onboarding/ObstaclesScreen';
import { EncouragementScreen } from '../screens/onboarding/EncouragementScreen';
import { PaceScreen } from '../screens/onboarding/PaceScreen';
import { ProjectionScreen } from '../screens/onboarding/ProjectionScreen';
import { CommuteTimeOfDayScreen } from '../screens/onboarding/CommuteTimeOfDayScreen';
import { SocialProofScreen } from '../screens/onboarding/SocialProofScreen';
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
      {/* Phase 1: Hook & Entry */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      
      {/* Phase 2: Personal Context Collection */}
      <Stack.Screen name="CommuteDuration" component={CommuteDurationScreen} />
      <Stack.Screen name="CommuteType" component={CommuteTypeScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      
      {/* Phase 3: Goals & Motivation */}
      <Stack.Screen name="Motivation" component={MotivationScreen} />
      <Stack.Screen name="Obstacles" component={ObstaclesScreen} />
      <Stack.Screen name="Encouragement" component={EncouragementScreen} />
      <Stack.Screen name="Pace" component={PaceScreen} />
      <Stack.Screen name="Projection" component={ProjectionScreen} />
      
      {/* Phase 4: Trust & Personalization */}
      <Stack.Screen name="CommuteTimeOfDay" component={CommuteTimeOfDayScreen} />
      
      {/* Phase 5: Social Proof */}
      <Stack.Screen name="SocialProof" component={SocialProofScreen} />
      
      {/* Phase 6: Plan Generation & Reveal */}
      <Stack.Screen name="AllSet" component={AllSetScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} />
      <Stack.Screen name="PlanReveal" component={PlanRevealScreen} />
      <Stack.Screen name="SaveProgress" component={SaveProgressScreen} />
      
      {/* Phase 7: Paywall */}
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      
      {/* Phase 8: App Entry */}
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
};
