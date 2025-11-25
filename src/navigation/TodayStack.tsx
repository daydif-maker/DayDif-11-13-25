import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayStackParamList } from './types';
import { TodayScreen } from '../screens/TodayScreen';
import { LessonDetailScreen } from '../screens/LessonDetailScreen';
import { CreatePlanScreen } from '../screens/CreatePlanScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator<TodayStackParamList>();

export const TodayStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Today" component={TodayScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
    </Stack.Navigator>
  );
};


