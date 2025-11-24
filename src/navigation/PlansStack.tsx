import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlansStackParamList } from './types';
import { PlansScreen } from '../screens/PlansScreen';
import { DayDetailScreen } from '../screens/DayDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator<PlansStackParamList>();

export const PlansStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Plans" component={PlansScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
    </Stack.Navigator>
  );
};







