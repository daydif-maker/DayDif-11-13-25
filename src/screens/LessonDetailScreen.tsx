import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, Button, LoadingState } from '@ui';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { lessonService } from '@services/api/lessonService';
import { Lesson } from '@store/types';
import { useIconColor } from '@ui/hooks/useIconColor';
import { LessonPlayback } from '../components/LessonPlayback';

export const LessonDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { lessonId } = route.params as { lessonId: string };
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'read' | 'play'>('read');
  const iconColorPrimary = useIconColor('primary');
  const iconColorSecondary = useIconColor('secondary');
  const iconColorTertiary = useIconColor('tertiary');
  const iconColorNavActive = useIconColor('navActive');
  const iconColorNavInactive = useIconColor('navInactive');

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const lessonData = await lessonService.getLessonById(lessonId);
        setLesson(lessonData);
      } catch (error) {
        console.error('Failed to load lesson:', error);
      }
    };
    loadLesson();
  }, [lessonId]);

  if (!lesson) {
    return (
      <Screen>
        <LoadingState message="Loading lesson..." />
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Blinkist-style header with back button */}
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="lg"
        paddingTop="md"
        paddingBottom="sm"
        borderBottomWidth={1}
        borderBottomColor="border"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Box marginRight="md">
            <Ionicons name="arrow-back" size={24} color={iconColorPrimary} />
          </Box>
        </TouchableOpacity>
        <Text variant="heading3" flex={1} numberOfLines={1}>
          {lesson.title}
        </Text>
        <TouchableOpacity>
          <Box marginLeft="xs">
            <Ionicons name="bookmark-outline" size={24} color={iconColorSecondary} />
          </Box>
        </TouchableOpacity>
        <TouchableOpacity>
          <Box marginLeft="xs">
            <Ionicons name="ellipsis-horizontal" size={24} color={iconColorSecondary} />
          </Box>
        </TouchableOpacity>
      </Box>

      {/* Action bar - Blinkist style */}
      <Box
        flexDirection="row"
        backgroundColor="navBackground"
        paddingVertical="sm"
        paddingHorizontal="lg"
      >
        <TouchableOpacity
          onPress={() => setActiveTab('read')}
        >
          <Box flex={1} alignItems="center" paddingVertical="xs">
            <Box flexDirection="row" alignItems="center">
              <Box marginRight="xs">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={activeTab === 'read' ? iconColorNavActive : iconColorNavInactive}
                />
              </Box>
              <Text
                variant="bodySmall"
                color={activeTab === 'read' ? 'navActive' : 'navInactive'}
              >
                Read Lesson
              </Text>
            </Box>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('play')}
        >
          <Box flex={1} alignItems="center" paddingVertical="xs">
            <Box flexDirection="row" alignItems="center">
              <Box marginRight="xs">
                <Ionicons
                  name="headset-outline"
                  size={20}
                  color={activeTab === 'play' ? iconColorNavActive : iconColorNavInactive}
                />
              </Box>
              <Text
                variant="bodySmall"
                color={activeTab === 'play' ? 'navActive' : 'navInactive'}
              >
                Play Lesson
              </Text>
            </Box>
          </Box>
        </TouchableOpacity>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Stack gap="lg" padding="lg">
          {/* Lesson title and metadata */}
          <Box>
            <Text variant="heading1" marginBottom="sm">
              {lesson.title}
            </Text>
            <Text variant="body" color="textSecondary" marginBottom="md">
              {lesson.description}
            </Text>
            
            {/* Metadata row */}
            <Box flexDirection="row" alignItems="center" gap="md">
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="time-outline" size={16} color={iconColorTertiary} />
                <Text variant="caption" color="textTertiary" marginLeft="xs">
                  {lesson.duration} min
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="bulb-outline" size={16} color={iconColorTertiary} />
                <Text variant="caption" color="textTertiary" marginLeft="xs">
                  {lesson.difficulty}
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="folder-outline" size={16} color={iconColorTertiary} />
                <Text variant="caption" color="textTertiary" marginLeft="xs">
                  {lesson.category}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* What's it about section */}
          <Card variant="elevated" padding="lg">
            <Text variant="heading3" marginBottom="sm">
              What's it about?
            </Text>
            <Text variant="body" color="textSecondary" lineHeight={24}>
              {lesson.content || lesson.description}
            </Text>
          </Card>

          {/* Play tab content - Full playback interface */}
          {activeTab === 'play' ? (
            <Box marginTop="lg">
              <LessonPlayback lesson={lesson} />
            </Box>
          ) : (
            <Button
              variant="primary"
              onPress={() => {
                // Handle reading
              }}
            >
              Start Reading
            </Button>
          )}
        </Stack>
      </ScrollView>
    </Screen>
  );
};

