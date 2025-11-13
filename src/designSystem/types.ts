import { Theme } from './theme';
import { Theme as NavigationTheme } from '@react-navigation/native';

export type { Theme };

export type ThemeVariant = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  themeVariant: ThemeVariant;
  toggleTheme: () => void;
  navigationTheme: NavigationTheme;
}

