import React, { useMemo } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Box, Text } from '@ui';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';
import { LearningHistoryEntry } from '@store/types';

interface ContributionHeatmapProps {
  history: LearningHistoryEntry[];
  onDayPress?: (date: string, entry?: LearningHistoryEntry) => void;
}

const CELL_SIZE = 16;
const GAP = 4;
const WEEKS_TO_SHOW = 16; // Show last ~4 months

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ 
  history, 
  onDayPress 
}) => {
  const theme = useTheme<Theme>();

  const gridData = useMemo(() => {
    const today = new Date();
    const data: { date: string; entry?: LearningHistoryEntry }[][] = []; // Array of weeks
    
    // Generate weeks backwards from today
    // Align to end of week (Saturday)
    const dayOfWeek = today.getDay(); // 0-6
    const daysSinceEndOfWeek = 6 - dayOfWeek;
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysSinceEndOfWeek);

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const week: { date: string; entry?: LearningHistoryEntry }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - (w * 7) - (6 - d)); // 6-d to reverse order within week (Sun->Sat)
        
        const dateStr = date.toISOString().split('T')[0];
        const entry = history.find(h => h.date === dateStr);
        week.push({ date: dateStr, entry });
      }
      data.unshift(week); // Add to front to show chronological L->R
    }
    return data;
  }, [history]);

  const getCellColor = (minutes: number, goalMet: boolean) => {
    if (minutes === 0) return theme.colors.backgroundTertiary; // gray200 equiv
    if (goalMet) return theme.colors.primary;
    if (minutes <= 10) return `${theme.colors.primary}4D`; // 30% opacity hex
    if (minutes <= 20) return `${theme.colors.primary}99`; // 60% opacity hex
    return theme.colors.primary;
  };

  return (
    <Box>
      <Text variant="heading4" marginBottom="md">Consistency Map</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Box flexDirection="row" gap="xs">
          {gridData.map((week, wIndex) => (
            <Box key={wIndex} gap="xs">
              {week.map((day, dIndex) => {
                 const minutes = day.entry?.timeSpent || 0;
                 // Simplified goal check: > 20 mins is "Goal Met" for now, or use entry data
                 const goalMet = minutes > 20; 
                 const color = getCellColor(minutes, goalMet);
                 
                 return (
                  <Pressable 
                    key={day.date}
                    onPress={() => onDayPress?.(day.date, day.entry)}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1
                    })}
                  >
                    <Box 
                      width={CELL_SIZE} 
                      height={CELL_SIZE} 
                      borderRadius="sm"
                      backgroundColor="surface" // fallback
                      style={{ backgroundColor: color }}
                    />
                  </Pressable>
                );
              })}
            </Box>
          ))}
        </Box>
      </ScrollView>
      
      {/* Legend */}
      <Box flexDirection="row" alignItems="center" gap="sm" marginTop="md">
        <Text variant="caption" color="textTertiary">Less</Text>
        <Box width={12} height={12} borderRadius="sm" style={{ backgroundColor: theme.colors.backgroundTertiary }} />
        <Box width={12} height={12} borderRadius="sm" style={{ backgroundColor: `${theme.colors.primary}4D` }} />
        <Box width={12} height={12} borderRadius="sm" style={{ backgroundColor: `${theme.colors.primary}99` }} />
        <Box width={12} height={12} borderRadius="sm" style={{ backgroundColor: theme.colors.primary }} />
        <Text variant="caption" color="textTertiary">More</Text>
      </Box>
    </Box>
  );
};

