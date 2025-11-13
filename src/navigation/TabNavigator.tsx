import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { TodayStack } from './TodayStack';
import { PlansStack } from './PlansStack';
import { GlassTabBar } from '@ui/GlassTabBar';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TodayTab"
        component={TodayStack}
        options={{
          title: 'Today',
        }}
      />
      <Tab.Screen
        name="PlansTab"
        component={PlansStack}
        options={{
          title: 'Plans',
        }}
      />
    </Tab.Navigator>
  );
};


