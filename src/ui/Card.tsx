import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
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
  const getVariantStyles = (): Partial<BoxProps<Theme>> => {
    switch (variant) {
      case 'elevated':
        return {
          // Use theme shadows
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: 'border',
        };
      case 'featured':
        return {
          // Use theme shadows
        };
      case 'flat':
      default:
        return {};
    }
  };

  const getShadowStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        };
      case 'featured':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
        };
      default:
        return {};
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

