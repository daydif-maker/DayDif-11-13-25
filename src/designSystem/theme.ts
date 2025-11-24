import { createTheme } from '@shopify/restyle';

// Palette tokens - Cal AI-inspired aesthetic
const palette = {
  // Warm Gray Scale (Cal AI Backgrounds)
  warmGray50: '#F9F9F9',   // Main background
  warmGray100: '#F5F5F5',  // Secondary background
  warmGray200: '#EFEFEF',  // Borders/Separators
  warmGray300: '#E0E0E0',
  warmGray400: '#BDBDBD',
  warmGray500: '#9E9E9E',

  // Neutral Scale
  white: '#FFFFFF',
  black: '#000000',
  offWhite: '#F7F8FA', // Next Up card backgrounds

  // Text Colors
  textPrimary: '#111111',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Action Colors
  primaryBlack: '#000000', // Main action color
  emeraldGreen: '#00BFA5', // Primary accent for play buttons, progress rings
  deepSlateBlue: '#1A2C42', // Navigation background

  // Status Colors (Subtle/Pastel for Cal AI feel)
  success: '#00BFA5', // Updated to Emerald Green
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  transparent: 'transparent',
};

// Typography scale - DM Sans Font Family
const typography = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_500Medium', // Map semibold to medium since DM Sans doesn't have 600
  bold: 'DMSans_700Bold',

  fontSize10: 10,
  fontSize12: 12,
  fontSize14: 14,
  fontSize16: 16,
  fontSize18: 18,
  fontSize20: 20,
  fontSize24: 24,
  fontSize28: 28,
  fontSize32: 32,
  fontSize36: 36,
  fontSize40: 40,
  fontSize48: 48,

  lineHeight12: 12,
  lineHeight16: 16,
  lineHeight20: 20,
  lineHeight24: 24,
  lineHeight28: 28,
  lineHeight32: 32,
  lineHeight40: 40,
  lineHeight48: 48,
  lineHeight56: 56,

  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 1.5, // Increased for "LESSON OF THE DAY" style caps
};

const textVariants = {
  heading1: {
    fontSize: typography.fontSize36,
    lineHeight: typography.lineHeight40,
    fontFamily: typography.bold,
    letterSpacing: typography.letterSpacingTight,
    fontWeight: '700' as const, // DM Sans Bold (no 800 weight available)
    color: 'textPrimary',
  },
  heading2: {
    fontSize: typography.fontSize28,
    lineHeight: typography.lineHeight32,
    fontFamily: typography.bold,
    letterSpacing: typography.letterSpacingTight,
    fontWeight: '700' as const, // DM Sans Bold for hero titles
    color: 'textPrimary',
  },
  heading3: {
    fontSize: typography.fontSize20,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.medium,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '500' as const, // DM Sans Medium for "Good Morning, Alex"
    color: 'textPrimary',
  },
  heading4: {
    fontSize: typography.fontSize18,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.medium,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '500' as const, // DM Sans Medium
    color: 'textPrimary',
  },
  body: {
    fontSize: typography.fontSize16,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
    color: 'textPrimary',
  },
  bodyMedium: {
    fontSize: typography.fontSize16,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.medium,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '500' as const,
    color: 'textPrimary',
  },
  bodySmall: {
    fontSize: typography.fontSize14,
    lineHeight: typography.lineHeight20,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
    color: 'textSecondary',
  },
  caption: {
    fontSize: typography.fontSize12,
    lineHeight: typography.lineHeight16,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
    color: 'textTertiary',
  },
  // Bold caption with wide letter spacing (for "LESSON OF THE DAY" style labels)
  label: {
    fontSize: typography.fontSize12,
    lineHeight: typography.lineHeight16,
    fontFamily: typography.bold,
    letterSpacing: typography.letterSpacingWide,
    fontWeight: '700' as const,
    color: 'textPrimary',
  },
  // Large metric numbers
  metric: {
    fontSize: typography.fontSize32,
    lineHeight: typography.lineHeight40,
    fontFamily: typography.bold,
    fontWeight: '700' as const,
    color: 'textPrimary',
  },
};

// Spacing scale
const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 64,
};

// Border radius
const borderRadii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 20,  // Standard card radius
  xl: 28,
  full: 9999,
};

// Elevation/shadow tokens - Soft, diffused shadows
const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
};

export const lightTheme = createTheme({
  colors: {
    // Backgrounds
    background: palette.warmGray50,
    backgroundSecondary: palette.warmGray100,
    backgroundTertiary: palette.warmGray200,

    // Surfaces
    surface: palette.white,
    surfaceElevated: palette.white,
    surfaceOverlay: 'rgba(0, 0, 0, 0.5)',

    // Text
    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textInverse: palette.white,
    textDisabled: palette.warmGray400,

    // Borders
    border: palette.warmGray200,
    borderFocus: palette.black,
    borderError: palette.error,

    // Interactive
    primary: palette.emeraldGreen,
    primaryLight: '#33CDB5',
    primaryDark: '#008C7A',
    secondary: palette.warmGray200,
    secondaryForeground: palette.black, // Text on secondary button
    accent: palette.emeraldGreen,

    // Navigation
    navBackground: palette.deepSlateBlue,
    navActive: palette.white,
    navInactive: 'rgba(255, 255, 255, 0.5)',

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    errorBackground: '#FFEBEE',
    info: palette.info,

    // Glass morphism
    glassBackground: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',

    // Pure colors
    white: palette.white,
    black: palette.black,
    transparent: palette.transparent,
  },
  spacing,
  borderRadii,
  typography,
  textVariants,
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  shadows: elevation,
  animationDurations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  haptics: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
  },
});

export type Theme = typeof lightTheme;
