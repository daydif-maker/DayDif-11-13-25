import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { useColorScheme } from 'react-native';
import { lightTheme, Theme } from './theme';
import { darkTheme } from './darkTheme';
import { ThemeVariant, ThemeContextValue } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@daydif/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference or use system default
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeVariant(savedTheme);
        } else {
          // Use system preference if no saved preference
          setThemeVariant(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setThemeVariant(systemColorScheme === 'dark' ? 'dark' : 'light');
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme: ThemeVariant = themeVariant === 'light' ? 'dark' : 'light';
    setThemeVariant(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const theme: Theme = useMemo(() => {
    return themeVariant === 'dark' ? darkTheme : lightTheme;
  }, [themeVariant]);

  // Navigation theme colors derived from Restyle theme
  const navigationTheme = useMemo(() => {
    return {
      dark: themeVariant === 'dark',
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
      fonts: {
        regular: {
          fontFamily: theme.typography.regular,
          fontWeight: '400' as const,
        },
        medium: {
          fontFamily: theme.typography.medium,
          fontWeight: '500' as const,
        },
        bold: {
          fontFamily: theme.typography.bold,
          fontWeight: '700' as const,
        },
        heavy: {
          fontFamily: theme.typography.bold,
          fontWeight: '900' as const,
        },
      },
    };
  }, [theme, themeVariant]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeVariant,
      toggleTheme,
      navigationTheme,
    }),
    [theme, themeVariant, navigationTheme]
  );

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <RestyleThemeProvider theme={theme}>{children}</RestyleThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export navigation theme getter
export const useNavigationTheme = () => {
  const { navigationTheme } = useTheme();
  return navigationTheme;
};

