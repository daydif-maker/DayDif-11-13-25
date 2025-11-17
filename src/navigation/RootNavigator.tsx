import React, { useEffect } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OnboardingStack } from './OnboardingStack';
import { CreatePlanStack } from './CreatePlanStack';
import { useTheme } from '@designSystem/ThemeProvider';
import { useAuthStore } from '@store';
import { useUserStateStore } from '@store';
import { useOnboarding } from '@context/OnboardingContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootStack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { navigationTheme, theme } = useTheme();
  const { user, isLoading } = useAuthStore();
  const { hasPlan } = useUserStateStore();
  const { state: onboardingState, isLoading: isLoadingOnboarding } = useOnboarding();
  const navigationRef = useNavigationContainerRef();

  // Safely check onboarding completion - default to false if state is unclear
  const hasCompletedOnboarding = onboardingState?.isCompleted === true;
  const userHasPlan = hasPlan();

  // Debug logging
  console.log('RootNavigator state:', {
    isLoading,
    isLoadingOnboarding,
    hasCompletedOnboarding,
    onboardingState: onboardingState?.isCompleted,
    userHasPlan,
    user: !!user,
  });

  // Show loading while checking auth or onboarding state
  // Note: This should rarely show since App.tsx handles isInitialized
  // But keeping it as a safety check
  if (isLoading || isLoadingOnboarding) {
    return (
      <SafeAreaView 
        style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]} 
        edges={['top', 'bottom']}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  // Determine current route based on user state
  const getCurrentRoute = () => {
    if (!hasCompletedOnboarding) {
      console.log('Routing to: Onboarding');
      return 'Onboarding';
    }
    if (!userHasPlan) {
      console.log('Routing to: CreatePlanFlow');
      return 'CreatePlanFlow';
    }
    console.log('Routing to: MainTabs');
    return 'MainTabs';
  };

  // Navigate based on state changes
  useEffect(() => {
    if (!navigationRef.isReady()) return;

    const currentRoute = getCurrentRoute();
    const currentRouteName = navigationRef.getCurrentRoute()?.name;

    if (currentRouteName !== currentRoute) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: currentRoute }],
      });
    }
  }, [hasCompletedOnboarding, userHasPlan, navigationRef]);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootStack.Navigator
        initialRouteName={getCurrentRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <RootStack.Screen 
          name="Onboarding" 
          component={OnboardingStack}
          options={{
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
        <RootStack.Screen name="CreatePlanFlow" component={CreatePlanStack} />
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

