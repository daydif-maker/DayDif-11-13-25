import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@store';
import { progressService } from '@services/api/progressService';
import { LearningHistoryEntry } from '@store/types';

export interface UseCalendarReturn {
  entries: LearningHistoryEntry[];
  isLoading: boolean;
  error: string | null;
  loadRange: (startDate: string, endDate: string) => Promise<void>;
}

export const useCalendar = (): UseCalendarReturn => {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LearningHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRange = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await progressService.getCalendarRange(
          user.id,
          startDate,
          endDate
        );

        setEntries(data);
        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load calendar data';
        setError(errorMessage);
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  // Load current month by default
  useEffect(() => {
    if (!user?.id) return;

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    loadRange(startDate, endDate);
  }, [user?.id, loadRange]);

  return {
    entries,
    isLoading,
    error,
    loadRange,
  };
};

