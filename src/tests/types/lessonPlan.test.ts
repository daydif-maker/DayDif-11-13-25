/**
 * Tests for Lesson Plan types and utility functions
 * These tests verify the contract between frontend and backend
 */

import {
  daysPerWeekToLessonCount,
  lessonDurationToMinutes,
  formDataToApiRequest,
  validateCreatePlanRequest,
  LESSON_DURATION_MAP,
  DaysPerWeekOption,
  LessonDurationOption,
  CreatePlanFormData,
} from '@/types/lessonPlan';

describe('lessonPlan types', () => {
  describe('daysPerWeekToLessonCount', () => {
    it('returns 1 lesson for 1 day', () => {
      expect(daysPerWeekToLessonCount(1)).toBe(1);
    });

    it('returns 4 lessons for 2 days', () => {
      expect(daysPerWeekToLessonCount(2)).toBe(4);
    });

    it('returns 6 lessons for 3 days', () => {
      expect(daysPerWeekToLessonCount(3)).toBe(6);
    });

    it('returns 8 lessons for 4 days', () => {
      expect(daysPerWeekToLessonCount(4)).toBe(8);
    });

    it('returns 10 lessons for 5 days', () => {
      expect(daysPerWeekToLessonCount(5)).toBe(10);
    });

    // Edge case: formula is days * 2 for days > 1
    it.each([
      [1, 1],
      [2, 4],
      [3, 6],
      [4, 8],
      [5, 10],
    ] as [DaysPerWeekOption, number][])(
      'daysPerWeekToLessonCount(%i) returns %i',
      (days, expected) => {
        expect(daysPerWeekToLessonCount(days)).toBe(expected);
      }
    );
  });

  describe('lessonDurationToMinutes', () => {
    it('returns 5 for "5"', () => {
      expect(lessonDurationToMinutes('5')).toBe(5);
    });

    it('returns 10 (upper bound) for "8-10"', () => {
      expect(lessonDurationToMinutes('8-10')).toBe(10);
    });

    it('returns 15 (upper bound) for "10-15"', () => {
      expect(lessonDurationToMinutes('10-15')).toBe(15);
    });

    it('returns 20 (upper bound) for "15-20"', () => {
      expect(lessonDurationToMinutes('15-20')).toBe(20);
    });

    // Verify all options in LESSON_DURATION_MAP
    it.each(Object.entries(LESSON_DURATION_MAP))(
      'lessonDurationToMinutes("%s") returns %i',
      (option, expected) => {
        expect(lessonDurationToMinutes(option as LessonDurationOption)).toBe(expected);
      }
    );
  });

  describe('formDataToApiRequest', () => {
    const validFormData: CreatePlanFormData = {
      topicPrompt: 'Learn about machine learning',
      daysPerWeek: 2,
      lessonDuration: '8-10',
    };
    const userId = 'test-user-123';

    it('converts valid form data to API request', () => {
      const result = formDataToApiRequest(validFormData, userId);
      
      expect(result).not.toBeNull();
      expect(result).toEqual({
        topic: 'Learn about machine learning',
        numberOfLessons: 4, // 2 days * 2 = 4 lessons
        durationMinutes: 10, // Upper bound of 8-10
        userLevel: 'intermediate',
        userId: 'test-user-123',
        daysPerWeek: 2,
        lessonDuration: '8-10',
      });
    });

    it('uses custom userLevel when provided', () => {
      const result = formDataToApiRequest(validFormData, userId, 'advanced');
      
      expect(result?.userLevel).toBe('advanced');
    });

    it('trims topic whitespace', () => {
      const formDataWithWhitespace: CreatePlanFormData = {
        ...validFormData,
        topicPrompt: '  Learn about AI  ',
      };
      const result = formDataToApiRequest(formDataWithWhitespace, userId);
      
      expect(result?.topic).toBe('Learn about AI');
    });

    it('returns null for empty topic', () => {
      const emptyTopicFormData: CreatePlanFormData = {
        ...validFormData,
        topicPrompt: '  ',
      };
      const result = formDataToApiRequest(emptyTopicFormData, userId);
      
      expect(result).toBeNull();
    });

    it('returns null for null daysPerWeek', () => {
      const nullDaysFormData: CreatePlanFormData = {
        ...validFormData,
        daysPerWeek: null,
      };
      const result = formDataToApiRequest(nullDaysFormData, userId);
      
      expect(result).toBeNull();
    });

    it('returns null for null lessonDuration', () => {
      const nullDurationFormData: CreatePlanFormData = {
        ...validFormData,
        lessonDuration: null,
      };
      const result = formDataToApiRequest(nullDurationFormData, userId);
      
      expect(result).toBeNull();
    });
  });

  describe('validateCreatePlanRequest', () => {
    const validRequest = {
      topic: 'Learn about AI',
      numberOfLessons: 4,
      durationMinutes: 10,
      userLevel: 'intermediate' as const,
      userId: 'test-user-123',
    };

    it('returns null for valid request', () => {
      expect(validateCreatePlanRequest(validRequest)).toBeNull();
    });

    it('returns error for empty topic', () => {
      const error = validateCreatePlanRequest({ ...validRequest, topic: '' });
      expect(error).toBe('Topic is required');
    });

    it('returns error for whitespace-only topic', () => {
      const error = validateCreatePlanRequest({ ...validRequest, topic: '   ' });
      expect(error).toBe('Topic is required');
    });

    it('returns error for non-number numberOfLessons', () => {
      const error = validateCreatePlanRequest({ ...validRequest, numberOfLessons: 'four' as any });
      expect(error).toBe('numberOfLessons must be a valid number');
    });

    it('returns error for NaN numberOfLessons', () => {
      const error = validateCreatePlanRequest({ ...validRequest, numberOfLessons: NaN });
      expect(error).toBe('numberOfLessons must be a valid number');
    });

    it('returns error for numberOfLessons below minimum', () => {
      const error = validateCreatePlanRequest({ ...validRequest, numberOfLessons: 0 });
      expect(error).toContain('must be between');
    });

    it('returns error for numberOfLessons above maximum', () => {
      const error = validateCreatePlanRequest({ ...validRequest, numberOfLessons: 25 });
      expect(error).toContain('must be between');
    });

    it('returns error for non-number durationMinutes', () => {
      const error = validateCreatePlanRequest({ ...validRequest, durationMinutes: 'ten' as any });
      expect(error).toBe('durationMinutes must be a valid number');
    });

    it('returns error for durationMinutes below minimum', () => {
      const error = validateCreatePlanRequest({ ...validRequest, durationMinutes: 2 });
      expect(error).toContain('must be between');
    });

    it('returns error for durationMinutes above maximum', () => {
      const error = validateCreatePlanRequest({ ...validRequest, durationMinutes: 60 });
      expect(error).toContain('must be between');
    });

    it('returns error for empty userId', () => {
      const error = validateCreatePlanRequest({ ...validRequest, userId: '' });
      expect(error).toBe('userId is required');
    });
  });

  describe('Integration: Form to API conversion', () => {
    it.each([
      // [daysPerWeek, expectedLessons, durationOption, expectedMinutes]
      [1, 1, '5' as LessonDurationOption, 5],
      [2, 4, '8-10' as LessonDurationOption, 10],
      [3, 6, '10-15' as LessonDurationOption, 15],
      [4, 8, '15-20' as LessonDurationOption, 20],
      [5, 10, '5' as LessonDurationOption, 5],
    ])(
      'converts daysPerWeek=%i to %i lessons, duration=%s to %i minutes',
      (daysPerWeek, expectedLessons, durationOption, expectedMinutes) => {
        const formData: CreatePlanFormData = {
          topicPrompt: 'Test topic',
          daysPerWeek: daysPerWeek as DaysPerWeekOption,
          lessonDuration: durationOption,
        };
        
        const result = formDataToApiRequest(formData, 'user-123');
        
        expect(result?.numberOfLessons).toBe(expectedLessons);
        expect(result?.durationMinutes).toBe(expectedMinutes);
      }
    );

    // This test verifies the bug scenario from the issue:
    // "4 lessons per week" should map to 2 days with 4 lessons
    it('handles "4 lessons per week" scenario correctly', () => {
      const formData: CreatePlanFormData = {
        topicPrompt: 'Learn about behavioral economics',
        daysPerWeek: 2, // "2 days (4 lessons)"
        lessonDuration: '8-10', // "8-10 minutes"
      };
      
      const result = formDataToApiRequest(formData, 'user-123');
      
      expect(result).not.toBeNull();
      expect(result?.numberOfLessons).toBe(4);
      expect(result?.durationMinutes).toBe(10);
    });
  });
});


