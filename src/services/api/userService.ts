import apiClient from './client';
import {
  GetUserProfileResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  GetUserPreferencesResponse,
  ApiResponse,
} from './types';
import { UserProfile, UserPreferences } from '@store/types';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';

const mockProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: undefined,
  createdAt: new Date().toISOString(),
};

const mockPreferences: UserPreferences = {
  notificationsEnabled: true,
  audioSpeed: 1.0,
  autoPlay: false,
};

export const userService = {
  /**
   * Fetch user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProfile;
    }

    try {
      const response = await apiClient.get<ApiResponse<GetUserProfileResponse>>(
        '/user/profile'
      );
      return response.data.data.profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(
    data: UpdateUserProfileRequest
  ): Promise<UserProfile> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { ...mockProfile, ...data };
    }

    try {
      const response = await apiClient.put<ApiResponse<UpdateUserProfileResponse>>(
        '/user/profile',
        data
      );
      return response.data.data.profile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  /**
   * Fetch user preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockPreferences;
    }

    try {
      const response = await apiClient.get<
        ApiResponse<GetUserPreferencesResponse>
      >('/user/preferences');
      return response.data.data.preferences;
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
      throw error;
    }
  },
};






