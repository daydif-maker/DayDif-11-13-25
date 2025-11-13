import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';

type StackProps = BoxProps<Theme> & {
  children: React.ReactNode;
  gap?: keyof Theme['spacing'];
};

export const Stack: React.FC<StackProps> = ({
  children,
  gap = 'md',
  ...props
}) => {
  return (
    <Box flexDirection="column" {...props}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        return (
          <Box key={index} marginTop={index === 0 ? 0 : gap}>
            {child}
          </Box>
        );
      })}
    </Box>
  );
};

