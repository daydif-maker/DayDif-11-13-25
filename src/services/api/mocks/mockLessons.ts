import { Lesson } from '@store/types';

export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Introduction to Cognitive Science',
    description: 'Explore the fundamentals of how the mind works',
    content: 'Cognitive science is an interdisciplinary field...',
    duration: 15,
    category: 'Science',
    difficulty: 'beginner',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'The Power of Habit Formation',
    description: 'Learn how habits shape our daily lives',
    content: 'Habits are the invisible architecture of daily life...',
    duration: 12,
    category: 'Psychology',
    difficulty: 'intermediate',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Introduction to Machine Learning',
    description: 'Understanding AI and machine learning basics',
    content: 'Machine learning is a subset of artificial intelligence...',
    duration: 20,
    category: 'Technology',
    difficulty: 'advanced',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const getMockDailyLesson = (): Lesson => mockLessons[0];

export const getMockLessonQueue = (): Lesson[] => mockLessons.slice(1);

export const getMockLessonById = (id: string): Lesson | null => {
  return mockLessons.find(lesson => lesson.id === id) || null;
};

