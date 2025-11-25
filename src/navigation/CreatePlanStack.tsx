import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatePlanStackParamList } from './types';
import { CreatePlanScreen } from '../screens/CreatePlanScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { useAuthStore } from '@store';

const Stack = createNativeStackNavigator<CreatePlanStackParamList>();

export const CreatePlanStack: React.FC = () => {
  const { user } = useAuthStore();
  const isAuthenticated = !!user?.id;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={isAuthenticated ? 'CreatePlan' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
    </Stack.Navigator>
  );
};

