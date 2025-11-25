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
    primary: '#2D6B5F', // Dark teal for dark mode
    primaryLight: '#3D8B7F',
    primaryDark: '#1B4B43',
    secondary: '#B8C5D1',
    secondaryForeground: '#FFFFFF',
    accent: '#22C55E',
    
    // Progress & CTAs
    progressGreen: '#22C55E',

    // Navigation - Dark teal
    navBackground: '#1A2C42',
    navActive: '#FFFFFF',
    navInactive: 'rgba(255, 255, 255, 0.5)',
    
    // Audio Mode card
    audioCardBackground: '#1A2C42',

    // Status
    success: '#22C55E',
    warning: '#FF8C5A',
    error: '#FF4D5E',
    errorBackground: '#3A1F22', // Dark red background for error messages
    info: '#4A9EFF',

    // Glass morphism
    glassBackground: 'rgba(30, 37, 46, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',

    // Surface gradients (Cal AI-inspired)
    surfaceGradientPrimary: '#141920',
    surfaceGradientSecondary: '#1E252E',

    // Pure colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  // Animation durations (Cal AI-inspired)
  animationDurations: {
    fast: 200,
    normal: 500,
    slow: 600,
  },
  // Haptic feedback styles
  haptics: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
  },
});

export type DarkTheme = typeof darkTheme;

