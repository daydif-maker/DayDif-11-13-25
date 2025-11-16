import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { Text } from '../Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type OnboardingChoiceCardProps = BoxProps<Theme> & {
  selected: boolean;
  onPress: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  hapticFeedback?: boolean;
};

export const OnboardingChoiceCard: React.FC<OnboardingChoiceCardProps> = ({
  selected,
  onPress,
  label,
  description,
  icon,
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
        padding="lg"
        borderRadius="xl"
        backgroundColor={selected ? 'black' : 'backgroundSecondary'}
        borderWidth={selected ? 0 : 1}
        borderColor={selected ? 'transparent' : 'border'}
        {...props}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          {icon && (
            <Box>
              {icon}
            </Box>
          )}
          <Box flex={1}>
            <Text
              variant="body"
              color={selected ? 'textInverse' : 'textPrimary'}
              fontWeight={selected ? '600' : '400'}
              marginBottom={description ? 'xs' : 0}
            >
              {label}
            </Text>
            {description && (
              <Text
                variant="bodySmall"
                color={selected ? 'textInverse' : 'textSecondary'}
              >
                {description}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

