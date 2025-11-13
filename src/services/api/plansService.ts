import apiClient from './client';
import {
  GetLearningHistoryRequest,
  GetLearningHistoryResponse,
  GetKPIsResponse,
  UpdateWeeklyGoalRequest,
  UpdateWeeklyGoalResponse,
  GetStreakDataResponse,
  ApiResponse,
} from './types';
import {
  LearningHistoryEntry,
  KPIs,
  WeeklyGoal,
  Streak,
} from '@store/types';
import {
  getMockHistory,
  getMockKPIs,
  getMockStreak,
  getMockWeeklyGoal,
} from './mocks/mockKPIs';

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
};

