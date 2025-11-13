import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type CardVariant = 'elevated' | 'flat' | 'outlined' | 'featured';

type CardProps = BoxProps<Theme> & {
  variant?: CardVariant;
  onPress?: () => void;
  children: React.ReactNode;
  hapticFeedback?: boolean;
};

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  onPress,
  children,
  hapticFeedback = true,
  padding = 'lg',
  borderRadius = 'lg',
  backgroundColor = 'surface',
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = (): Partial<BoxProps<Theme>> => {
    switch (variant) {
      case 'elevated':
        return {
          // Shadow applied via style prop using theme tokens
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: 'border',
        };
      case 'featured':
        return {
          // Shadow applied via style prop using theme tokens
        };
      case 'flat':
      default:
        return {};
    }
  };

  const getShadowStyle = () => {
    switch (variant) {
      case 'elevated':
        return theme.shadows.md;
      case 'featured':
        return theme.shadows.lg;
      default:
        return theme.shadows.none;
    }
  };

  const content = (
    <Box
      padding={padding}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      {...getVariantStyles()}
      {...props}
      style={[
        getShadowStyle(),
        props.style,
      ]}
    >
      {children}
    </Box>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress();
        }}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

