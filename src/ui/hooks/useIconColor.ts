import { useTheme } from '@designSystem/ThemeProvider';
import { Theme } from '@designSystem/theme';

type IconColorVariant = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'navActive' | 'navInactive';

export const useIconColor = (variant: IconColorVariant = 'secondary'): string => {
  const { theme } = useTheme();
  
  const colorMap: Record<IconColorVariant, keyof Theme['colors']> = {
    primary: 'primary',
    secondary: 'textSecondary',
    tertiary: 'textTertiary',
    inverse: 'textInverse',
    navActive: 'navActive',
    navInactive: 'navInactive',
  };

  return theme.colors[colorMap[variant]];
};

