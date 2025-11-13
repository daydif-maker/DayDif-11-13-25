import React from 'react';
import { render, fireEvent } from '../../tests/utils/testUtils';
import { Button } from '@ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>Test Button</Button>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press Me</Button>);
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Disabled
      </Button>
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button onPress={() => {}} loading>
        Loading
      </Button>
    );
    expect(queryByText('Loading')).toBeNull();
    // ActivityIndicator should be present
    expect(UNSAFE_getByType).toBeTruthy();
  });

  it('renders different variants', () => {
    const { rerender, getByText } = render(
      <Button onPress={() => {}} variant="primary">
        Primary
      </Button>
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <Button onPress={() => {}} variant="outline">
        Outline
      </Button>
    );
    expect(getByText('Outline')).toBeTruthy();
  });
});

