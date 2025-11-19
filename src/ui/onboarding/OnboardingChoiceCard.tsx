import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
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
  index?: number;
};

export const OnboardingChoiceCard: React.FC<OnboardingChoiceCardProps> = ({
  selected,
  onPress,
  label,
  description,
  icon,
  hapticFeedback = true,
  index = 0,
  ...props
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 50; // 50ms delay between each button
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
    opacity.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
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
    </Animated.View>
  );
};

