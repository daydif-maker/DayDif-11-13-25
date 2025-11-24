import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/designSystem/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { useAuthStore } from './src/store';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import 'react-native-gesture-handler';

enableScreens();

// Loading component that uses theme
const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  return (
    <SafeAreaView 
      style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]} 
      edges={['top', 'bottom']}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading...
      </Text>
    </SafeAreaView>
  );
};

const AppContent: React.FC = () => {
  const { bootstrapAuth, isInitialized } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    // Bootstrap auth on app start
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    if (fontError) {
      console.warn('Error loading DM Sans fonts:', fontError);
      // App will fall back to system fonts if custom fonts fail to load
    }
  }, [fontError]);

  // Show loading state while initializing auth or loading fonts
  if (!isInitialized || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <OnboardingProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </OnboardingProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
