import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';
import { useTheme } from '@designSystem/ThemeProvider';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  borderRadius,
  backgroundColor = 'surface',
  ...props
}) => {
  const { theme } = useTheme();

  // Cal AI-inspired border radius: xl for featured, lg for standard
  const defaultBorderRadius = borderRadius || (variant === 'featured' ? 'xl' : 'lg');

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
      borderRadius={defaultBorderRadius}
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
    // Cal AI-inspired card lift animation
    return <CardWithAnimation 
      content={content}
      onPress={onPress}
      hapticFeedback={hapticFeedback}
    />;
  }

  return content;
};

// Separate component for animated card to avoid re-creation issues
const CardWithAnimation: React.FC<{
  content: React.ReactNode;
  onPress: () => void;
  hapticFeedback: boolean;
}> = ({ content, onPress, hapticFeedback }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    translateY.value = withTiming(-2, { duration: 150 });
    opacity.value = withTiming(0.95, { duration: 150 });
  };

  const handlePressOut = () => {
    translateY.value = withTiming(0, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    </TouchableOpacity>
  );
};

