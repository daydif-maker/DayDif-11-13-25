import { useEffect, useMemo } from 'react';
import { 
  usePlansStore, 
  useUserStore, 
  useAuthStore, 
  useLessonsStore, 
  useUserStateStore, 
  DEMO_PLAN_ID 
} from '@store';
import { lessonService } from '@services/api/lessonService';

interface WeeklyProgressResult {
  lessons: number;
  minutes: number;
  percentage: number;
}

export interface TodayScreenData {
  greeting: string;
  userName: string | null;
  todayLesson: ReturnType<typeof useLessonsStore>['dailyLesson'];
  nextUp: ReturnType<typeof useLessonsStore>['nextUpQueue'];
  weeklyProgress: WeeklyProgressResult;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useTodayScreen = (): TodayScreenData => {
  const { user } = useAuthStore();
  const { userProfile } = useUserStore();
  const {
    todayLesson,
    getWeeklyProgress,
    isLoading,
    error,
    loadTodayLesson,
    loadWeeklyProgress,
    refreshAll,
  } = usePlansStore();
  const { dailyLesson, nextUpQueue, setDailyLesson, addToQueue } = useLessonsStore();
  const activePlanId = useUserStateStore((state) => state.activePlanId);
  const isDemoPlan = activePlanId === DEMO_PLAN_ID;

  const userId = user?.id;

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Load data when userId is available
  useEffect(() => {
    if (!userId || isDemoPlan) return;

    const loadData = async () => {
      try {
        await Promise.all([
          loadTodayLesson(userId),
          loadWeeklyProgress(userId),
        ]);

        // Also load lesson queue
        const queue = await lessonService.getLessonQueue(userId);
        queue.forEach(l => addToQueue(l));
      } catch (err) {
        console.error('Failed to load today screen data:', err);
      }
    };

    loadData();
  }, [userId, loadTodayLesson, loadWeeklyProgress, addToQueue, isDemoPlan]);

  // Sync planSlice todayLesson with lessonsSlice dailyLesson
  useEffect(() => {
    if (todayLesson && todayLesson.id !== dailyLesson?.id) {
      setDailyLesson(todayLesson);
    }
  }, [todayLesson, dailyLesson, setDailyLesson]);

  const refresh = async () => {
    if (!userId || isDemoPlan) return;
    await refreshAll(userId);
    
    // Also refresh lesson queue
    const queue = await lessonService.getLessonQueue(userId);
    queue.forEach(l => addToQueue(l));
  };

  return {
    greeting,
    userName: userProfile?.name || null,
    todayLesson: dailyLesson || todayLesson,
    nextUp: nextUpQueue,
    weeklyProgress: getWeeklyProgress(),
    isLoading,
    error,
    refresh,
  };
};
