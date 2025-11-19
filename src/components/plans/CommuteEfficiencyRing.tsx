import React from 'react';
import { Box, Text, GoalRing, Card } from '@ui';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';

interface CommuteEfficiencyRingProps {
  convertedMinutes: number;
  totalCommuteMinutes: number;
}

export const CommuteEfficiencyRing: React.FC<CommuteEfficiencyRingProps> = ({
  convertedMinutes,
  totalCommuteMinutes,
}) => {
  const theme = useTheme<Theme>();
  
  // Avoid division by zero
  const percentage = totalCommuteMinutes > 0 
    ? Math.min(100, Math.round((convertedMinutes / totalCommuteMinutes) * 100)) 
    : 0;

  return (
    <Card variant="elevated" padding="lg" backgroundColor="surface">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flex={1} paddingRight="md">
          <Text variant="heading3" marginBottom="xs">Commute Efficiency</Text>
          <Text variant="bodySmall" color="textSecondary">
            <Text fontWeight="700" color="primary">{percentage}%</Text> of your commute was productive this week.
          </Text>
          <Box marginTop="md">
             <Text variant="caption" color="textTertiary">
                {convertedMinutes} min learned / {totalCommuteMinutes} min commute
             </Text>
          </Box>
        </Box>
        
        <Box>
          <GoalRing
            progress={percentage}
            size={80}
            strokeWidth={8}
            showPercentage={true}
            
          />
        </Box>
      </Box>
    </Card>
  );
};

