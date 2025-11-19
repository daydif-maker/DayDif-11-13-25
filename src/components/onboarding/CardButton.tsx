import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Card } from '@ui/Card';
import { Text } from '@ui/Text';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';

type CardButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  index?: number;
};

export const CardButton: React.FC<CardButtonProps> = ({
  title,
  subtitle,
  onPress,
  selected = false,
  disabled = false,
  children,
  index = 0,
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
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
      <Card
        variant={selected ? 'featured' : 'outlined'}
        padding="lg"
        style={[
          styles.card,
          {
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? theme.colors.black : theme.colors.border,
            backgroundColor: selected
              ? theme.colors.backgroundSecondary
              : theme.colors.surface,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children ? (
          children
        ) : (
          <>
            <Text variant="heading4" marginBottom={subtitle ? 'xs' : undefined}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="bodySmall" color="textSecondary">
                {subtitle}
              </Text>
            )}
          </>
        )}
      </Card>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
});

