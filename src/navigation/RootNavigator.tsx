import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { useTheme } from '@designSystem/ThemeProvider';

export const RootNavigator: React.FC = () => {
  const { navigationTheme } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};

