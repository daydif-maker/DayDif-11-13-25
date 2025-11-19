import React from 'react';
import { Dimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  Extrapolation,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Box, Text } from '@ui';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '@store/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard heights
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.55;
const COMMUTE_HEADER_HEIGHT = SCREEN_HEIGHT;

interface ParallaxHeaderProps {
  scrollY: SharedValue<number>;
  lesson: Lesson;
  onPlayPress: () => void;
  isCommuteMode: boolean;
  onToggleCommuteMode: () => void;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const normalized = category.toLowerCase();
  if (
    normalized.includes('science') ||
    normalized.includes('biology') ||
    normalized.includes('physics')
  )
    return 'flask';
  if (
    normalized.includes('business') ||
    normalized.includes('finance') ||
    normalized.includes('money')
  )
    return 'cash';
  if (normalized.includes('tech') || normalized.includes('code') || normalized.includes('computer'))
    return 'hardware-chip';
  if (
    normalized.includes('art') ||
    normalized.includes('design') ||
    normalized.includes('creative')
  )
    return 'color-palette';
  if (normalized.includes('history') || normalized.includes('culture')) return 'hourglass';
  if (
    normalized.includes('health') ||
    normalized.includes('wellness') ||
    normalized.includes('fitness')
  )
    return 'fitness';
  if (normalized.includes('music') || normalized.includes('audio')) return 'musical-notes';
  if (normalized.includes('psychology') || normalized.includes('mind')) return 'school';
  return 'library'; // Default
};

const getDateContext = () => {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const day = days[now.getDay()];

  const hour = now.getHours();
  let timeOfDay = 'MORNING';
  if (hour >= 12 && hour < 17) timeOfDay = 'AFTERNOON';
  if (hour >= 17) timeOfDay = 'EVENING';

  return `${day} • ${timeOfDay}`;
};

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
  scrollY,
  lesson,
  onPlayPress,
  isCommuteMode,
  onToggleCommuteMode,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();

  const headerHeight = isCommuteMode ? COMMUTE_HEADER_HEIGHT : HEADER_HEIGHT;
  const watermarkIcon = getCategoryIcon(lesson.category);
  const dateContext = getDateContext();

  const containerStyle = useAnimatedStyle(() => {
    const height = withSpring(headerHeight, {
      damping: 20,
      stiffness: 100,
    });

    const translateY = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [-50, 0, 50], // Parallax effect
      Extrapolation.CLAMP
    );

    const scale = interpolate(scrollY.value, [-100, 0], [1.2, 1], Extrapolation.CLAMP);

    return {
      height,
      transform: [
        { translateY: isCommuteMode ? 0 : translateY },
        { scale: isCommuteMode ? 1 : scale },
      ],
    };
  });

  const contentOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, HEADER_HEIGHT / 2], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: isCommuteMode ? 1 : opacity,
    };
  });

  const playButtonAnimatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isCommuteMode ? 0 : 1, {
      damping: 15,
    });
    const translateY = interpolate(scrollY.value, [0, 100], [0, -50], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      opacity: withTiming(isCommuteMode ? 0 : 1),
    };
  });

  const commuteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCommuteMode ? 1 : 0),
      transform: [{ scale: withSpring(isCommuteMode ? 1 : 0.8) }],
    };
  });

  const watermarkStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, 100],
      [-20, 0, 30], // Slower movement for depth
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { rotate: '-15deg' }],
    };
  });

  const titleSize = isCommuteMode ? 48 : 36;
  const titleLineHeight = isCommuteMode ? 56 : 44; // Increased line height for editorial feel

  return (
    <Box position="absolute" top={0} left={0} right={0} zIndex={1}>
      <Animated.View style={[styles.container, containerStyle]}>
        <LinearGradient
          colors={['#0F2027', '#203A43']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Watermark Background */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: -50,
              bottom: -50,
              opacity: 0.07,
              zIndex: 0,
            },
            watermarkStyle,
          ]}
        >
          <Ionicons name={watermarkIcon} size={350} color="white" />
        </Animated.View>

        <Box
          flex={1}
          justifyContent="flex-end"
          padding="lg"
          paddingBottom="xxxl"
          style={{ paddingTop: insets.top }}
        >
          <Animated.View style={contentOpacityStyle}>
            {/* Context Header (Top Left) */}
            <Box position="absolute" top={-insets.top - 20} left={0}>
              <Text variant="caption" color="white" opacity={0.7} style={{ letterSpacing: 2 }}>
                {dateContext}
              </Text>
            </Box>

            <Box
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              marginBottom="md"
              style={{ gap: 8 }}
            >
              <Box
                style={{
                  borderWidth: 1,
                  borderColor: 'white',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  variant="caption"
                  style={{ textTransform: 'uppercase', color: 'white', fontWeight: '700' }}
                >
                  {lesson.category}
                </Text>
              </Box>
              <Box
                style={{
                  borderWidth: 1,
                  borderColor: 'white',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Ionicons name="time" size={12} color="white" />
                <Text variant="caption" style={{ color: 'white', fontWeight: '700' }}>
                  {lesson.duration} min
                </Text>
              </Box>
            </Box>

            <Text
              variant="heading1"
              color="textInverse"
              style={{
                fontSize: titleSize,
                lineHeight: titleLineHeight,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowRadius: 10,
                textShadowOffset: { width: 0, height: 2 },
              }}
              numberOfLines={3}
            >
              {lesson.title}
            </Text>

            <Box marginTop="sm">
              <Text variant="body" color="textInverse" numberOfLines={isCommuteMode ? 5 : 2}>
                {lesson.description}
              </Text>
            </Box>

            {/* Commute Mode Start Button */}
            {isCommuteMode && (
              <Animated.View style={[commuteButtonStyle, { marginTop: theme.spacing.xl }]}>
                <Pressable
                  onPress={onPlayPress}
                  style={({ pressed }) => ({
                    backgroundColor: theme.colors.success,
                    paddingVertical: theme.spacing.lg,
                    borderRadius: theme.borderRadius.xl,
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Text variant="heading3" color="white">
                    Start Commute
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        </Box>

        {/* Commute Mode Toggle - Absolute Positioned Glass Pill */}
        <Box position="absolute" top={insets.top + 16} right={16} zIndex={20}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onToggleCommuteMode();
            }}
            hitSlop={20}
          >
            <BlurView
              intensity={20}
              tint="default"
              style={{
                borderRadius: 20, // Full rounded for circle
                overflow: 'hidden',
              }}
            >
              <Box
                width={40}
                height={40}
                alignItems="center"
                justifyContent="center"
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 1,
                  borderRadius: 20,
                }}
              >
                <Ionicons name={isCommuteMode ? 'contract' : 'car-sport'} size={20} color="white" />
              </Box>
            </BlurView>
          </Pressable>
        </Box>
      </Animated.View>

      {/* Floating Play Button (Regular Mode) */}
      {!isCommuteMode && (
        <Animated.View
          style={[
            styles.playButtonContainer,
            {
              top: HEADER_HEIGHT - 32, // Half of 64px button
              right: theme.spacing.lg,
            },
            playButtonAnimatedStyle,
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPlayPress();
            }}
            style={({ pressed }) => [
              styles.playButton,
              {
                backgroundColor: theme.colors.success,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="play" size={32} color={theme.colors.white} style={{ marginLeft: 4 }} />
          </Pressable>
        </Animated.View>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  playButtonContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
