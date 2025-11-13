import apiClient from './client';
import {
  GetLearningHistoryRequest,
  GetLearningHistoryResponse,
  GetKPIsResponse,
  UpdateWeeklyGoalRequest,
  UpdateWeeklyGoalResponse,
  GetStreakDataResponse,
  CreatePlanRequest,
  CreatePlanResponse,
  ApiResponse,
} from './types';
import {
  LearningHistoryEntry,
  KPIs,
  WeeklyGoal,
  Streak,
  Plan,
} from '@store/types';
import {
  getMockKPIs,
  getMockStreak,
  getMockWeeklyGoal,
} from './mocks/mockKPIs';
import { getMockHistory } from './mocks/mockHistory';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

export const plansService = {
  /**
   * Fetch learning history for a date range
   */
  async getLearningHistory(
    startDate: string,
    endDate: string
  ): Promise<LearningHistoryEntry[]> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return getMockHistory(startDate, endDate);
    }

    try {
      const request: GetLearningHistoryRequest = { startDate, endDate };
      const response = await apiClient.get<
        ApiResponse<GetLearningHistoryResponse>
      >('/plans/history', { params: request });
      return response.data.data.history;
    } catch (error) {
      console.error('Failed to fetch learning history:', error);
      throw error;
    }
  },

  /**
   * Fetch KPI tiles data
   */
  async getKPIs(): Promise<KPIs> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getMockKPIs();
    }

    try {
      const response = await apiClient.get<ApiResponse<GetKPIsResponse>>(
        '/plans/kpis'
      );
      return response.data.data.kpis;
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  },

  /**
   * Update weekly goal
   */
  async updateWeeklyGoal(data: UpdateWeeklyGoalRequest): Promise<WeeklyGoal> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...getMockWeeklyGoal(), ...data };
    }

    try {
      const response = await apiClient.put<
        ApiResponse<UpdateWeeklyGoalResponse>
      >('/plans/goal', data);
      return response.data.data.goal;
    } catch (error) {
      console.error('Failed to update weekly goal:', error);
      throw error;
    }
  },

  /**
   * Fetch streak data
   */
  async getStreakData(): Promise<Streak> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockStreak();
    }

    try {
      const response = await apiClient.get<ApiResponse<GetStreakDataResponse>>(
        '/plans/streak'
      );
      return response.data.data.streak;
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
      throw error;
    }
  },

  /**
   * Create a new learning plan
   */
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Generate a mock plan
      const mockPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: `Learning Plan: ${data.topicPrompt.substring(0, 30)}...`,
        goal: {
          targetLessons: data.lessonCount,
          targetMinutes: data.lessonCount * (data.lessonDuration === '8-10' ? 9 : data.lessonDuration === '10-15' ? 12.5 : 17.5),
          currentLessons: 0,
          currentMinutes: 0,
          weekStart: new Date().toISOString().split('T')[0],
        },
        topics: [data.topicPrompt],
        schedule: {
          frequency: 'weekly',
          daysOfWeek: [],
        },
        createdAt: new Date().toISOString(),
        isActive: true,
        topicPrompt: data.topicPrompt,
        daysPerWeek: data.daysPerWeek,
        lessonDuration: data.lessonDuration,
        lessonCount: data.lessonCount,
      };
      return mockPlan;
    }

    try {
      const response = await apiClient.post<ApiResponse<CreatePlanResponse>>(
        '/plans',
        data
      );
      return response.data.data.plan;
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  },
};


