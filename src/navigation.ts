/**
 * RN Navigation type definitions.
 * stack: Map (default) → Lesson (push)
 */
import type { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Map: undefined;
  Lesson: { lessonId: string; chapter: number };
};

export type RootNav = NavigationProp<RootStackParamList>;
