/**
 * Pickup-RN lesson loader — 全 31 章 + 章節 metadata.
 *
 * Port 自 wordwar/src/react-app/pages/MapPage.tsx CHAPTER_META.
 * 設計: lessons import 在 build time (Metro bundle), 不走 fetch — RN bundle 沒有 fetch
 * 同步 model 的需求, 直接 import JSON 最簡單最快.
 */

// 全 31 章 import (Metro bundler 處理 JSON)
import ch1 from '../../lessons-ch1.json';
import ch2 from '../../lessons-ch2.json';
import ch3 from '../../lessons-ch3.json';
import ch4 from '../../lessons-ch4.json';
import ch5 from '../../lessons-ch5.json';
import ch6 from '../../lessons-ch6.json';
import ch7 from '../../lessons-ch7.json';
import ch8 from '../../lessons-ch8.json';
import ch9 from '../../lessons-ch9.json';
import ch10 from '../../lessons-ch10.json';
import ch11 from '../../lessons-ch11.json';
import ch12 from '../../lessons-ch12.json';
import ch13 from '../../lessons-ch13.json';
import ch14 from '../../lessons-ch14.json';
import ch15 from '../../lessons-ch15.json';
import ch16 from '../../lessons-ch16.json';
import ch17 from '../../lessons-ch17.json';
import ch18 from '../../lessons-ch18.json';
import ch19 from '../../lessons-ch19.json';
import ch20 from '../../lessons-ch20.json';
import ch21 from '../../lessons-ch21.json';
import ch22 from '../../lessons-ch22.json';
import ch23 from '../../lessons-ch23.json';
import ch24 from '../../lessons-ch24.json';
import ch25 from '../../lessons-ch25.json';
import ch26 from '../../lessons-ch26.json';
import ch27 from '../../lessons-ch27.json';
import ch28 from '../../lessons-ch28.json';
import ch29 from '../../lessons-ch29.json';
import ch30 from '../../lessons-ch30.json';
import ch31 from '../../lessons-ch31.json';

export interface Question {
  id: string;
  type: string;
  sentence?: string;
  question?: string;     // listen-mc / emoji-pick / listen-comprehension 提示句 (EN)
  questionEn?: string;   // listen-tf 用這個欄位
  options?: string[];
  optionsZh?: string[];
  correctIndex?: number;
  explanationZh?: string;
  speaker?: string;
  pairs?: Array<{ left: string; right: string }>;
  subSkill?: string;
}

export interface Lesson {
  id: string;
  chapter: number;
  lessonInChapter: number;
  storyBeat?: string;
  questions: Question[];
}

const CHAPTER_BUCKETS: Lesson[][] = [
  ch1 as Lesson[], ch2 as Lesson[], ch3 as Lesson[], ch4 as Lesson[], ch5 as Lesson[],
  ch6 as Lesson[], ch7 as Lesson[], ch8 as Lesson[], ch9 as Lesson[], ch10 as Lesson[],
  ch11 as Lesson[], ch12 as Lesson[], ch13 as Lesson[], ch14 as Lesson[], ch15 as Lesson[],
  ch16 as Lesson[], ch17 as Lesson[], ch18 as Lesson[], ch19 as Lesson[], ch20 as Lesson[],
  ch21 as Lesson[], ch22 as Lesson[], ch23 as Lesson[], ch24 as Lesson[], ch25 as Lesson[],
  ch26 as Lesson[], ch27 as Lesson[], ch28 as Lesson[], ch29 as Lesson[], ch30 as Lesson[],
  ch31 as Lesson[],
];

// Stable hash 給 question id (deterministic 抽樣)
function hashStable(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * 平均替換: 把 ~33% 的 narration (with English sentence) 改成 sentence-builder.
 * 用 hash % 3 deterministic, 同一 id 永遠變/不變一致. 跨 reload state 穩定.
 */
function maybeConvertToSentenceBuilder(q: Question): Question {
  if (q.type !== 'narration' || !q.sentence) return q;
  // 至少 3 個 word + 純英文 (排除 narrator 旁白以中文為主的)
  const tokens = q.sentence.split(/\s+/).filter(Boolean);
  if (tokens.length < 3 || tokens.length > 10) return q;
  if (hashStable(q.id) % 3 !== 0) return q;
  return { ...q, type: 'sentence-builder' };
}

/** All lessons in chapter order — Ch1 → Ch31, lessonInChapter 1..N within. */
export const ALL_LESSONS: Lesson[] = CHAPTER_BUCKETS.flatMap((ls, chIdx) =>
  ls.map((l, i) => ({
    ...l,
    chapter: l.chapter ?? chIdx + 1,
    lessonInChapter: l.lessonInChapter ?? i + 1,
    questions: l.questions.map(maybeConvertToSentenceBuilder),
  })),
);

export function lessonsForChapter(chapter: number): Lesson[] {
  return ALL_LESSONS.filter((l) => l.chapter === chapter);
}

export function findLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/** Port 自 wordwar MapPage.tsx CHAPTER_META — 31 章 metadata. */
export const CHAPTER_META: Record<number, { titleZh: string; titleEn: string; accent: string }> = {
  1: { titleZh: '院子裡的第一個故事', titleEn: 'A Story in the Yard', accent: '#d68a52' },
  2: { titleZh: '桃太郎', titleEn: 'Momotaro', accent: '#e7a44a' },
  3: { titleZh: '醜小鴨', titleEn: 'The Ugly Duckling', accent: '#e7659c' },
  4: { titleZh: '龜兔賽跑', titleEn: 'Tortoise and Hare', accent: '#6e7d5a' },
  5: { titleZh: '駱駝為什麼有駝峰', titleEn: 'How the Camel Got Its Hump', accent: '#e7a44a' },
  6: { titleZh: 'Baba Yaga 雞腳屋', titleEn: 'Baba Yaga', accent: '#6a7d8f' },
  7: { titleZh: '六隻天鵝', titleEn: 'The Six Swans', accent: '#8a6ea8' },
  8: { titleZh: '葉限', titleEn: 'Ye Xian', accent: '#6a7d8f' },
  9: { titleZh: '灰姑娘', titleEn: 'Cinderella', accent: '#e7659c' },
  10: { titleZh: '嫦娥奔月', titleEn: 'Chang E Flies to the Moon', accent: '#8a6ea8' },
  11: { titleZh: '后羿射日', titleEn: 'Hou Yi Shoots the Suns', accent: '#e7a44a' },
  12: { titleZh: '牛郎織女', titleEn: 'The Cowherd and the Weaver Girl', accent: '#6a7d8f' },
  13: { titleZh: '小紅帽', titleEn: 'Little Red Riding Hood', accent: '#c84a3a' },
  14: { titleZh: '浦島太郎', titleEn: 'Urashima Taro', accent: '#6a7d8f' },
  15: { titleZh: '國王的新衣', titleEn: "The Emperor's New Clothes", accent: '#d68a52' },
  16: { titleZh: '一寸法師', titleEn: 'Issun-boshi', accent: '#e7a44a' },
  17: { titleZh: '鶴的報恩', titleEn: "The Crane's Return", accent: '#6e7d5a' },
  18: { titleZh: '興夫和孬夫', titleEn: 'Heungbu and Nolbu', accent: '#e7a44a' },
  19: { titleZh: 'Sang Kancil 與鱷魚', titleEn: 'Sang Kancil', accent: '#6e7d5a' },
  20: { titleZh: '蘿蔔大冒險', titleEn: 'The Enormous Turnip', accent: '#c84a3a' },
  21: { titleZh: 'Anansi 蜘蛛', titleEn: 'Anansi the Spider', accent: '#3c2a1c' },
  22: { titleZh: '孟母三遷', titleEn: "Mencius's Mother", accent: '#d68a52' },
  23: { titleZh: '司馬光砸缸', titleEn: 'Sima Guang Smashes the Vat', accent: '#6a7d8f' },
  24: { titleZh: '孔融讓梨', titleEn: 'Kong Rong Gives Up the Pear', accent: '#6e7d5a' },
  25: { titleZh: '愚公移山', titleEn: 'The Foolish Old Man Moves Mountains', accent: '#8a6ea8' },
  26: { titleZh: 'Archimedes 尤里卡', titleEn: 'Archimedes Eureka', accent: '#e7a44a' },
  27: { titleZh: '西遊記·取經出發', titleEn: 'Journey to the West', accent: '#d68a52' },
  28: { titleZh: '諸葛亮·三顧茅廬', titleEn: "Zhuge Liang's Strategems", accent: '#6a7d8f' },
  29: { titleZh: '奧德賽·出航回家', titleEn: 'The Odyssey', accent: '#8a6ea8' },
  30: { titleZh: '赫拉克勒斯·尼米亞獅子', titleEn: 'Heracles vs Nemean Lion', accent: '#c84a3a' },
  31: { titleZh: 'Robin Hood·Sherwood 森林', titleEn: 'Robin Hood', accent: '#6e7d5a' },
};

export type ChapterId = keyof typeof CHAPTER_META;
