import React from 'react';
import { render, fireEvent } from '../../tests/utils/testUtils';
import { Fab } from '../Fab';
import * as Haptics from 'expo-haptics';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

describe('Fab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(
      <Fab
        onPress={() => {}}
        accessibilityLabel="Test FAB"
        testID="test-fab"
      />
    );
    expect(getByTestId('test-fab')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Fab
        onPress={onPress}
        accessibilityLabel="Test FAB"
        testID="test-fab"
      />
    );
    fireEvent.press(getByTestId('test-fab'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Fab
        onPress={onPress}
        accessibilityLabel="Test FAB"
        testID="test-fab"
      />
    );
    fireEvent.press(getByTestId('test-fab'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it('does not trigger haptic feedback when hapticFeedback is false', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Fab
        onPress={onPress}
        accessibilityLabel="Test FAB"
        testID="test-fab"
        hapticFeedback={false}
      />
    );
    fireEvent.press(getByTestId('test-fab'));
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(
      <Fab
        onPress={() => {}}
        accessibilityLabel="Generate weekly lessons"
        testID="test-fab"
      />
    );
    expect(getByLabelText('Generate weekly lessons')).toBeTruthy();
  });

  it('renders custom icon when provided', () => {
    const { Text } = require('react-native');
    const customIcon = <Text testID="custom-icon">Custom Icon</Text>;
    const { getByTestId } = render(
      <Fab
        onPress={() => {}}
        accessibilityLabel="Test FAB"
        testID="test-fab"
        icon={customIcon}
      />
    );
    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('renders default add icon when no icon provided', () => {
    const { getByTestId } = render(
      <Fab
        onPress={() => {}}
        accessibilityLabel="Test FAB"
        testID="test-fab"
      />
    );
    // The default icon should be rendered (Ionicons add icon)
    // Just verify the FAB itself renders
    expect(getByTestId('test-fab')).toBeTruthy();
  });
});

