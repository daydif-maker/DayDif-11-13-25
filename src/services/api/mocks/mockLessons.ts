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

/**
 * Generate mock lessons based on plan customizations
 * Uses the shared LESSON_DURATION_MAP for consistent duration calculation
 */
export const generateMockLessonsForPlan = (
  topicPrompt: string,
  lessonCount: number,
  durationMinutes: number
): Lesson[] => {
  // Extract topic keywords from prompt for better lesson titles
  const topicKeywords = topicPrompt
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 3);

  const topicName = topicKeywords.length > 0
    ? topicKeywords[0].charAt(0).toUpperCase() + topicKeywords[0].slice(1)
    : 'Learning';

  // Use provided duration
  const duration = durationMinutes;

  // Generate lesson titles based on topic
  const lessonTitles = [
    `Introduction to ${topicName}`,
    `Fundamentals of ${topicName}`,
    `Advanced Concepts in ${topicName}`,
    `Practical Applications of ${topicName}`,
    `Deep Dive into ${topicName}`,
    `Mastering ${topicName}`,
    `Exploring ${topicName}`,
    `Understanding ${topicName}`,
    `Getting Started with ${topicName}`,
    `Expert Insights on ${topicName}`,
  ];

  const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
  const categories = ['Science', 'Technology', 'Business', 'Psychology', 'Education', 'Philosophy'];

  const lessons: Lesson[] = [];

  for (let i = 0; i < lessonCount; i++) {
    const titleIndex = i % lessonTitles.length;
    const difficultyIndex = Math.floor(i / 3) % difficulties.length;

    lessons.push({
      id: `lesson-${Date.now()}-${i}`,
      title: lessonTitles[titleIndex],
      description: `Learn about ${topicPrompt.toLowerCase()} - Lesson ${i + 1} of ${lessonCount}`,
      content: `This lesson covers important aspects of ${topicPrompt.toLowerCase()}. You'll explore key concepts, practical examples, and real-world applications. This is part of your personalized learning plan focused on ${topicPrompt}.`,
      duration,
      category: categories[i % categories.length],
      difficulty: difficulties[difficultyIndex],
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  return lessons;
};


