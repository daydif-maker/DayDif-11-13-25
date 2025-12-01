// Jest setup file
// Note: @testing-library/jest-native provides additional matchers for React Native testing
// If the module is not installed, tests will still run but without the custom matchers
try {
  require('@testing-library/jest-native/extend-expect');
} catch (e) {
  console.warn('jest-native extend-expect not available, continuing without custom matchers');
}

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));









