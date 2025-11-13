import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Stack, Text, Card, Button } from '@ui';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box } from '@ui/primitives';
import { Ionicons } from '@expo/vector-icons';
import { lessonService } from '@services/api/lessonService';
import { Lesson } from '@store/types';

export const LessonDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { lessonId } = route.params as { lessonId: string };
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'read' | 'play'>('read');

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
        <Box padding="lg">
          <Text variant="body">Loading...</Text>
        </Box>
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
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text variant="heading3" flex={1} numberOfLines={1}>
          {lesson.title}
        </Text>
        <TouchableOpacity style={{ marginLeft: 8 }}>
          <Ionicons name="bookmark-outline" size={24} color="#616161" />
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#616161" />
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
          style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
        >
          <Box flexDirection="row" alignItems="center">
            <Ionicons
              name="document-text-outline"
              size={20}
              color={activeTab === 'read' ? '#00A86B' : '#FFFFFF'}
              style={{ marginRight: 6 }}
            />
            <Text
              variant="bodySmall"
              color={activeTab === 'read' ? 'navActive' : 'navInactive'}
              style={{ fontWeight: activeTab === 'read' ? '600' : '400' }}
            >
              Read Lesson
            </Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('play')}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
        >
          <Box flexDirection="row" alignItems="center">
            <Ionicons
              name="headset-outline"
              size={20}
              color={activeTab === 'play' ? '#00A86B' : '#FFFFFF'}
              style={{ marginRight: 6 }}
            />
            <Text
              variant="bodySmall"
              color={activeTab === 'play' ? 'navActive' : 'navInactive'}
              style={{ fontWeight: activeTab === 'play' ? '600' : '400' }}
            >
              Play Lesson
            </Text>
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
                <Ionicons name="time-outline" size={16} color="#757575" />
                <Text variant="caption" color="textTertiary" marginLeft="xs">
                  {lesson.duration} min
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="bulb-outline" size={16} color="#757575" />
                <Text variant="caption" color="textTertiary" marginLeft="xs">
                  {lesson.difficulty}
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <Ionicons name="folder-outline" size={16} color="#757575" />
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

          {/* Action button */}
          <Button
            variant="primary"
            onPress={() => {
              if (activeTab === 'play') {
                // Handle audio playback
              } else {
                // Handle reading
              }
            }}
          >
            {activeTab === 'play' ? 'Start Listening' : 'Start Reading'}
          </Button>
        </Stack>
      </ScrollView>
    </Screen>
  );
};

