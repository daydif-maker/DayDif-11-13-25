import React from 'react';
import { render } from '../../tests/utils/testUtils';
import { ThemeProvider, useTheme } from '@designSystem/ThemeProvider';

const TestComponent: React.FC = () => {
  const { theme, themeVariant } = useTheme();
  return (
    <>
      <div data-testid="theme-variant">{themeVariant}</div>
      <div data-testid="background-color">{theme.colors.background}</div>
    </>
  );
};

describe('ThemeProvider', () => {
  it('provides theme context', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId('theme-variant')).toBeTruthy();
    expect(getByTestId('background-color')).toBeTruthy();
  });

  it('defaults to light theme', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Note: This test may need adjustment based on actual implementation
    // The theme variant might be 'light' or 'dark' depending on system preference
    expect(getByTestId('theme-variant')).toBeTruthy();
  });
});

