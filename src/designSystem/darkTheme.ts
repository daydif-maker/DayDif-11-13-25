import { createTheme } from '@shopify/restyle';
import { lightTheme } from './theme';

// Dark theme - override semantic colors for dark mode
export const darkTheme = createTheme({
  ...lightTheme,
  colors: {
    // Backgrounds
    background: '#0A0E14',
    backgroundSecondary: '#141920',
    backgroundTertiary: '#1E252E',

    // Surfaces
    surface: '#141920',
    surfaceElevated: '#1E252E',
    surfaceOverlay: 'rgba(0, 0, 0, 0.7)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B8C5D1',
    textTertiary: '#8A9BA8',
    textInverse: '#0A0E14',
    textDisabled: '#4A5560',

    // Borders
    border: '#2A3441',
    borderFocus: '#627D98',
    borderError: '#E63946',

    // Interactive
    primary: '#00C97A', // Blinkist green for dark mode
    primaryLight: '#00E896',
    primaryDark: '#00A86B',
    secondary: '#B8C5D1',
    accent: '#4A9EFF',

    // Navigation - Dark teal matching Blinkist
    navBackground: '#1A3A52',
    navActive: '#00C97A', // Green for active tab
    navInactive: '#FFFFFF',

    // Status
    success: '#00C97A',
    warning: '#FF8C5A',
    error: '#FF4D5E',
    info: '#4A9EFF',

    // Glass morphism
    glassBackground: 'rgba(30, 37, 46, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Pure colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
});

export type DarkTheme = typeof darkTheme;

