import { createTheme } from '@shopify/restyle';

// Palette tokens - Blinkist-inspired premium colors
const palette = {
  // Primary colors - Dark teal/blue for navigation (Blinkist style)
  primary50: '#F0F4F8',
  primary100: '#D9E2EC',
  primary200: '#BCCCDC',
  primary300: '#9FB3C8',
  primary400: '#829AB1',
  primary500: '#627D98',
  primary600: '#486581',
  primary700: '#334E68',
  primary800: '#243B53', // Dark teal navigation
  primary900: '#1A3A52', // Darker teal for deep navigation

  // Neutral colors - Refined grays for Blinkist aesthetic
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral900: '#212121',

  // Accent colors - Blinkist green for active states
  accentBlue: '#0066CC',
  accentGreen: '#00A86B', // Blinkist green accent
  accentGreenLight: '#00C896', // Lighter green variant
  accentOrange: '#FF6B35',
  accentPurple: '#7B68EE',

  // Navigation colors - Dark teal matching Blinkist
  navDark: '#1A3A52', // Dark teal navigation bar
  navDarkAlt: '#243B53', // Alternative dark teal

  // Semantic colors
  success: '#00A86B', // Blinkist green
  warning: '#FF6B35',
  error: '#E63946',
  info: '#0066CC',

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Typography scale - Refined for Blinkist aesthetic
const typography = {
  // Font families
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',

  // Font sizes - Blinkist-style hierarchy
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
  fontSize44: 44, // Large display headings

  // Line heights - Generous spacing for readability
  lineHeight12: 12,
  lineHeight16: 16,
  lineHeight20: 20,
  lineHeight24: 24,
  lineHeight28: 28,
  lineHeight32: 32,
  lineHeight40: 40,
  lineHeight48: 48,
  lineHeight52: 52, // For large headings

  // Letter spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
};

const textVariants = {
  heading1: {
    fontSize: typography.fontSize36,
    lineHeight: typography.lineHeight48,
    fontFamily: typography.bold,
    letterSpacing: typography.letterSpacingTight,
    fontWeight: '700' as const,
  },
  heading2: {
    fontSize: typography.fontSize28,
    lineHeight: typography.lineHeight40,
    fontFamily: typography.bold,
    letterSpacing: typography.letterSpacingTight,
    fontWeight: '700' as const,
  },
  heading3: {
    fontSize: typography.fontSize20,
    lineHeight: typography.lineHeight28,
    fontFamily: typography.semibold,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '600' as const,
  },
  heading4: {
    fontSize: typography.fontSize18,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.semibold,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: typography.fontSize16,
    lineHeight: typography.lineHeight24,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: typography.fontSize14,
    lineHeight: typography.lineHeight20,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: typography.fontSize12,
    lineHeight: typography.lineHeight16,
    fontFamily: typography.regular,
    letterSpacing: typography.letterSpacingNormal,
    fontWeight: '400' as const,
  },
};

// Spacing scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Elevation/shadow tokens
const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Light theme - semantic color roles (Blinkist-inspired)
export const lightTheme = createTheme({
  colors: {
    // Backgrounds - Clean whites and light grays
    background: palette.white,
    backgroundSecondary: palette.neutral50,
    backgroundTertiary: palette.neutral100,

    // Surfaces
    surface: palette.white,
    surfaceElevated: palette.white,
    surfaceOverlay: 'rgba(0, 0, 0, 0.5)',

    // Text - Refined hierarchy
    textPrimary: palette.neutral900,
    textSecondary: palette.neutral700,
    textTertiary: palette.neutral600,
    textInverse: palette.white,
    textDisabled: palette.neutral400,

    // Borders
    border: palette.neutral200,
    borderFocus: palette.accentGreen,
    borderError: palette.error,

    // Interactive - Blinkist green for primary actions
    primary: palette.accentGreen, // Blinkist green
    primaryLight: palette.accentGreenLight,
    primaryDark: palette.primary900,
    secondary: palette.neutral700,
    accent: palette.accentGreen, // Green accent throughout

    // Navigation - Dark teal matching Blinkist
    navBackground: palette.navDark,
    navActive: palette.accentGreen, // Green for active tab
    navInactive: palette.white,

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    errorBackground: '#FFEBEE', // Light red background for error messages
    info: palette.info,

    // Glass morphism
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.18)',

    // Surface gradients (Cal AI-inspired)
    surfaceGradientPrimary: palette.white,
    surfaceGradientSecondary: palette.neutral50,

    // Pure colors (for direct use when needed)
    white: palette.white,
    black: palette.black,
    transparent: palette.transparent,
  },
  spacing,
  borderRadius,
  typography,
  textVariants,
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  shadows: elevation,
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

export type Theme = typeof lightTheme;
