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


