import { LearningHistoryEntry, Lesson } from '@store/types';
import { mockLessons } from './mockLessons';

const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockHistory: LearningHistoryEntry[] = [
  {
    date: getDateString(0),
    lessonsCompleted: 1,
    timeSpent: 15,
    lessons: [mockLessons[0]],
  },
  {
    date: getDateString(1),
    lessonsCompleted: 2,
    timeSpent: 27,
    lessons: [mockLessons[0], mockLessons[1]],
  },
  {
    date: getDateString(2),
    lessonsCompleted: 1,
    timeSpent: 12,
    lessons: [mockLessons[1]],
  },
  {
    date: getDateString(5),
    lessonsCompleted: 1,
    timeSpent: 20,
    lessons: [mockLessons[2]],
  },
];

export const getMockHistory = (
  startDate: string,
  endDate: string
): LearningHistoryEntry[] => {
  return mockHistory.filter(
    entry => entry.date >= startDate && entry.date <= endDate
  );
};






