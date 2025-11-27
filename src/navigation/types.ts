import { NavigatorScreenParams } from '@react-navigation/native';

export type TodayStackParamList = {
  Today: undefined;
  LessonDetail: { lessonId: string };
  AvatarSettings: undefined;
  Login: undefined;
  CreatePlan: undefined;
};

export type PlansStackParamList = {
  Plans: undefined;
  DayDetail: { date: string };
  Calendar: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  CommuteDuration: undefined;
  CommuteType: undefined;
  Goal: undefined;
  Motivation: undefined;
  Obstacles: undefined;
  Encouragement: undefined;
  Pace: undefined;
  Projection: undefined;
  CommuteTimeOfDay: undefined;
  SocialProof: undefined;
  AllSet: undefined;
  Generating: undefined;
  PlanReveal: undefined;
  SaveProgress: undefined;
  Paywall: undefined;
  Success: undefined;
};

export type CreatePlanStackParamList = {
  Login: undefined;
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

