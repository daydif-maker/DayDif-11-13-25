import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { ThemeProvider } from './src/designSystem/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useAuthStore } from './src/store';
import 'react-native-gesture-handler';

enableScreens();

export default function App() {
  const { bootstrapAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    // Bootstrap auth on app start
    bootstrapAuth();
  }, [bootstrapAuth]);

  // Show loading state while initializing auth
  if (!isInitialized) {
    return null; // Or show a loading screen
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
