import React from 'react';
import { BoxProps } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { Box } from '@ui/primitives';

type RowProps = BoxProps<Theme> & {
  children: React.ReactNode;
  gap?: keyof Theme['spacing'];
};

export const Row: React.FC<RowProps> = ({
  children,
  gap = 'md',
  ...props
}) => {
  return (
    <Box flexDirection="row" alignItems="center" {...props}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        return (
          <Box key={index} marginLeft={index === 0 ? 0 : gap}>
            {child}
          </Box>
        );
      })}
    </Box>
  );
};

