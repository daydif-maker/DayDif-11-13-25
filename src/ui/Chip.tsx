import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from './Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type ChipProps = BoxProps<Theme> & {
  selected?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  hapticFeedback?: boolean;
};

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  onPress,
  children,
  hapticFeedback = true,
  ...props
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Box
        paddingHorizontal="md"
        paddingVertical="sm"
        borderRadius="full"
        borderWidth={1}
        borderColor={selected ? 'primary' : 'border'}
        backgroundColor={selected ? 'primary' : 'surface'}
        {...props}
      >
        <Text
          variant="bodySmall"
          color={selected ? 'textInverse' : 'textPrimary'}
        >
          {children}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

