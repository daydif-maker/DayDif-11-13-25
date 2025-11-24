import { NavigatorScreenParams } from '@react-navigation/native';

export type TodayStackParamList = {
  Today: undefined;
  LessonDetail: { lessonId: string };
  AvatarSettings: undefined;
  CreatePlan: undefined;
};

export type PlansStackParamList = {
  Plans: undefined;
  DayDetail: { date: string };
  Calendar: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Goal: undefined;
  Motivation: undefined;
  CommuteTimeOfDay: undefined;
  CommuteDuration: undefined;
  LearningStyle: undefined;
  Obstacles: undefined;
  Encouragement: undefined;
  Projection: undefined;
  Pace: undefined;
  SocialProof: undefined;
  AllSet: undefined;
  Generating: undefined;
  PlanReveal: undefined;
  SaveProgress: undefined;
  Paywall: undefined;
  Success: undefined;
};

export type CreatePlanStackParamList = {
  CreatePlan: undefined;
};

export type RootTabParamList = {
  TodayTab: NavigatorScreenParams<TodayStackParamList>;
  PlansTab: NavigatorScreenParams<PlansStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

