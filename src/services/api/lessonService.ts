import apiClient from './client';
import {
  GetDailyLessonResponse,
  GetLessonQueueResponse,
  GetLessonByIdResponse,
  MarkLessonCompleteRequest,
  MarkLessonCompleteResponse,
  ApiResponse,
} from './types';
import { Lesson } from '@store/types';
import { getMockDailyLesson, getMockLessonQueue, getMockLessonById } from './mocks/mockLessons';

// Feature flag to switch between mock and real API
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

export const lessonService = {
  /**
   * Fetch today's daily lesson
   */
  async getDailyLesson(): Promise<Lesson> {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getMockDailyLesson();
    }

    try {
      const response = await apiClient.get<ApiResponse<GetDailyLessonResponse>>(
        '/lessons/daily'
      );
      return response.data.data.lesson;
    } catch (error) {
      console.error('Failed to fetch daily lesson:', error);
      throw error;
    }
  },

  /**
   * Fetch the next up lesson queue
   */
  async getLessonQueue(): Promise<Lesson[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockLessonQueue();
    }

    try {
      const response = await apiClient.get<ApiResponse<GetLessonQueueResponse>>(
        '/lessons/queue'
      );
      return response.data.data.lessons;
    } catch (error) {
      console.error('Failed to fetch lesson queue:', error);
      throw error;
    }
  },

  /**
   * Fetch a specific lesson by ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const lesson = getMockLessonById(id);
      if (!lesson) {
        throw new Error(`Lesson with id ${id} not found`);
      }
      return lesson;
    }

    try {
      const response = await apiClient.get<ApiResponse<GetLessonByIdResponse>>(
        `/lessons/${id}`
      );
      return response.data.data.lesson;
    } catch (error) {
      console.error(`Failed to fetch lesson ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark a lesson as complete
   */
  async markLessonComplete(
    lessonId: string
  ): Promise<MarkLessonCompleteResponse> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    }

    try {
      const request: MarkLessonCompleteRequest = {
        lessonId,
        completedAt: new Date().toISOString(),
      };
      const response = await apiClient.post<
        ApiResponse<MarkLessonCompleteResponse>
      >('/lessons/complete', request);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to mark lesson ${lessonId} as complete:`, error);
      throw error;
    }
  },
};

