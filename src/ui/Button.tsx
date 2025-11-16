import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = BoxProps<Theme> & {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  hapticFeedback?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  children,
  hapticFeedback = true,
  ...props
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getVariantStyles = (): BoxProps<Theme> => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? 'border' : 'primary', // Blinkist green
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? 'border' : 'transparent',
          borderWidth: 1,
          borderColor: disabled ? 'border' : 'border',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? 'border' : 'border',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): keyof Theme['colors'] => {
    if (disabled) return 'textDisabled';
    if (variant === 'outline' || variant === 'ghost') return 'primary';
    return 'textInverse';
  };

  const getLoadingIndicatorColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return theme.colors.primary;
    }
    return theme.colors.textInverse;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Box
        paddingHorizontal={variant === 'primary' ? 'xl' : 'lg'}
        paddingVertical="md"
        borderRadius={variant === 'primary' ? 'full' : 'md'}
        alignItems="center"
        justifyContent="center"
        minHeight={48}
        opacity={disabled ? 0.5 : 1}
        width={variant === 'primary' && !props.width ? '100%' : undefined}
        {...getVariantStyles()}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getLoadingIndicatorColor()}
          />
        ) : (
          <Text
            variant="body"
            color={getTextColor()}
            fontWeight={variant === 'primary' ? '600' : '400'}
          >
            {children}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
};

