import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { useTheme } from '@designSystem/ThemeProvider';
import { useAuthStore } from '@store';
import { View, ActivityIndicator } from 'react-native';

export const RootNavigator: React.FC = () => {
  const { navigationTheme } = useTheme();
  const { user, isLoading } = useAuthStore();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // TODO: Add auth screens for when user is not signed in
  // For now, show TabNavigator regardless of auth state
  // In production, you'd conditionally render auth screens here

  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};

