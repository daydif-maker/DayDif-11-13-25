import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@designSystem/ThemeProvider';
import { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ChooseGoalScreen } from '../screens/onboarding/ChooseGoalScreen';
import { CommuteInputScreen } from '../screens/onboarding/CommuteInputScreen';
import { LessonSettingsScreen } from '../screens/onboarding/LessonSettingsScreen';
import { GeneratePlanScreen } from '../screens/onboarding/GeneratePlanScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ChooseGoal" component={ChooseGoalScreen} />
      <Stack.Screen name="CommuteInput" component={CommuteInputScreen} />
      <Stack.Screen name="LessonSettings" component={LessonSettingsScreen} />
      <Stack.Screen name="GeneratePlan" component={GeneratePlanScreen} />
    </Stack.Navigator>
  );
};

