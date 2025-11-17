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
      style={{ borderRadius: 24, overflow: 'hidden' }}
    >
      <Box
        paddingVertical="lg"
        paddingHorizontal="xl"
        borderRadius="xl"
        backgroundColor={selected ? 'black' : 'background'}
        borderWidth={0}
        style={{
          minHeight: 72,
          justifyContent: 'center',
        }}
        {...props}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          {icon && (
            <Box
              style={{
                width: 40,
                height: 40,
                backgroundColor: selected ? 'rgba(255, 255, 255, 0.2)' : theme.colors.backgroundSecondary,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Box flex={1}>
            <Text
              variant="body"
              color={selected ? 'textInverse' : 'textPrimary'}
              fontWeight="600"
              fontSize={18}
              marginBottom={description ? 'xs' : 0}
            >
              {label}
            </Text>
            {description && (
              <Text
                variant="bodySmall"
                color={selected ? 'textInverse' : 'textSecondary'}
                fontSize={14}
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

