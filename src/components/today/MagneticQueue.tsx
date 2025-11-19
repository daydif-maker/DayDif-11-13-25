import React, { useRef } from 'react';
import { Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Box, Text, Card } from '@ui';
import { Lesson } from '@store/types';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.7;
const SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + SPACING;

interface MagneticQueueProps {
  lessons: Lesson[];
  onLessonPress: (lesson: Lesson) => void;
}

const QueueItem: React.FC<{
  item: Lesson;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: () => void;
}> = ({ item, index, scrollX, onPress }) => {
  const theme = useTheme<Theme>();
  
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_INTERVAL,
      index * SNAP_INTERVAL,
      (index + 1) * SNAP_INTERVAL,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1.05, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress}>
        <Card
          variant="elevated"
          padding="lg"
          width={ITEM_WIDTH}
          backgroundColor="surface"
          style={{
             marginRight: SPACING,
             height: 160,
             justifyContent: 'center'
          }}
        >
          <Box gap="sm">
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="caption" color="textTertiary" style={{ textTransform: 'uppercase' }}>
                {item.category}
              </Text>
              <Text variant="caption" color="textTertiary">{item.duration}m</Text>
            </Box>
            <Text variant="heading4" numberOfLines={2}>
              {item.title}
            </Text>
             <Text variant="bodySmall" color="textSecondary" numberOfLines={2}>
              {item.description}
            </Text>
          </Box>
        </Card>
      </Pressable>
    </Animated.View>
  );
};

export const MagneticQueue: React.FC<MagneticQueueProps> = ({ lessons, onLessonPress }) => {
  const theme = useTheme<Theme>();
  const scrollX = useSharedValue(0);
  const currentIndex = useRef(0);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      
      const index = Math.round(event.contentOffset.x / SNAP_INTERVAL);
      if (index !== currentIndex.current) {
          currentIndex.current = index;
          runOnJS(Haptics.selectionAsync)();
      }
    },
  });

  return (
    <Box>
      <Text variant="heading3" marginLeft="lg" marginBottom="md" fontWeight="600">
        Next Up
      </Text>
      <Animated.FlatList
        data={lessons}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
          paddingVertical: theme.spacing.md,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <QueueItem
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onLessonPress(item);
            }}
          />
        )}
      />
    </Box>
  );
};

