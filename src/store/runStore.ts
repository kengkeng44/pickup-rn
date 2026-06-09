/**
 * Pickup-RN Zustand store — port from web wordwar/src/store + scattered helpers.
 *
 * State 全集 (對齊 web Pickup wordwar):
 *   - completedByChapter (per-chapter lesson set)
 *   - xp / coins / streak / freezes
 *   - visitStreak (連續登入)
 *   - catName (default 'Mochi') / dogName (default 'Hana')
 *   - settings (muted, lang)
 *   - SRS lite (答錯 lesson 列表)
 *
 * Persist via AsyncStorage (殺 app 不丟資料).
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RunState {
  // gameplay
  completedByChapter: Record<number, string[]>;
  xp: number;
  coins: number;
  streak: number;             // daily lesson streak (硬目標)
  freezes: number;            // streak freeze count
  visitStreak: number;        // soft visit streak (打 app 算數)
  lastVisitDate: string;      // YYYY-MM-DD
  lastLessonDate: string;     // YYYY-MM-DD
  // characters
  catName: string;
  dogName: string;
  // settings
  muted: boolean;
  // SRS lite: 答錯 lesson queue
  srsWrongIds: string[];
  // actions
  markLessonComplete: (chapter: number, lessonId: string) => void;
  recordWrong: (lessonId: string) => void;
  recordVisitToday: () => boolean;
  recordLessonToday: () => void;
  addXp: (n: number) => void;
  addCoins: (n: number) => void;
  addFreeze: (n: number) => void;
  setCatName: (s: string) => void;
  setDogName: (s: string) => void;
  toggleMuted: () => void;
  reset: () => void;
}

const todayStr = (): string => new Date().toISOString().slice(0, 10);

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      completedByChapter: {},
      xp: 0,
      coins: 0,
      streak: 0,
      freezes: 2,
      visitStreak: 0,
      lastVisitDate: '',
      lastLessonDate: '',
      catName: 'Mochi',
      dogName: 'Hana',
      muted: false,
      srsWrongIds: [],

      markLessonComplete: (chapter, lessonId) => set((s) => {
        const cur = s.completedByChapter[chapter] ?? [];
        if (cur.includes(lessonId)) return s;
        return { completedByChapter: { ...s.completedByChapter, [chapter]: [...cur, lessonId] } };
      }),

      recordWrong: (lessonId) => set((s) => ({
        srsWrongIds: s.srsWrongIds.includes(lessonId) ? s.srsWrongIds : [...s.srsWrongIds, lessonId],
      })),

      recordVisitToday: () => {
        const today = todayStr();
        const s = get();
        if (s.lastVisitDate === today) return false;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = s.lastVisitDate === yesterday ? s.visitStreak + 1 : 1;
        set({ lastVisitDate: today, visitStreak: newStreak });
        return true;
      },

      recordLessonToday: () => {
        const today = todayStr();
        const s = get();
        if (s.lastLessonDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = s.lastLessonDate === yesterday ? s.streak + 1 : 1;
        set({ lastLessonDate: today, streak: newStreak });
      },

      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      addFreeze: (n) => set((s) => ({ freezes: Math.max(0, s.freezes + n) })),
      setCatName: (s) => set({ catName: s }),
      setDogName: (s) => set({ dogName: s }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      reset: () => set({
        completedByChapter: {}, xp: 0, coins: 0, streak: 0, freezes: 2,
        visitStreak: 0, lastVisitDate: '', lastLessonDate: '',
        catName: 'Mochi', dogName: 'Hana', muted: false, srsWrongIds: [],
      }),
    }),
    {
      name: 'pickup-run-state',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// helper: derive current node idx (第一個 not done)
export const currentLessonIdx = (
  lessons: Array<{ id: string; chapter: number }>,
  state: RunState,
): number => {
  for (let i = 0; i < lessons.length; i++) {
    const done = (state.completedByChapter[lessons[i].chapter] ?? []).includes(lessons[i].id);
    if (!done) return i;
  }
  return -1;
};

export function levelForXp(xp: number): number {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 200) return 3;
  if (xp >= 50) return 2;
  return 1;
}
