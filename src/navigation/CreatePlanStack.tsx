import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatePlanStackParamList } from './types';
import { CreatePlanScreen } from '../screens/CreatePlanScreen';

const Stack = createNativeStackNavigator<CreatePlanStackParamList>();

export const CreatePlanStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
    </Stack.Navigator>
  );
};

