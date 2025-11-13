import { act } from '@testing-library/react';
import { useUserStore } from '@store/slices/userSlice';

// Simple test helper since renderHook might not be available
const getStoreState = () => useUserStore.getState();

describe('userSlice', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({
      userProfile: null,
      preferences: {
        notificationsEnabled: true,
        audioSpeed: 1.0,
        autoPlay: false,
      },
      themePreference: 'system',
    });
  });

  it('initializes with default state', () => {
    const state = getStoreState();
    expect(state.userProfile).toBeNull();
    expect(state.preferences.notificationsEnabled).toBe(true);
  });

  it('updates user profile', () => {
    act(() => {
      useUserStore.getState().setUserProfile({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      });
    });

    const state = getStoreState();
    expect(state.userProfile?.name).toBe('Test User');
  });

  it('updates preferences', () => {
    act(() => {
      useUserStore.getState().updatePreferences({
        audioSpeed: 1.5,
      });
    });

    const state = getStoreState();
    expect(state.preferences.audioSpeed).toBe(1.5);
    expect(state.preferences.notificationsEnabled).toBe(true);
  });

  it('sets theme preference', () => {
    act(() => {
      useUserStore.getState().setTheme('dark');
    });

    const state = getStoreState();
    expect(state.themePreference).toBe('dark');
  });
});

