/**
 * Pickup-RN MapScreen — 全 31 章 蜿蜒 paw nodes (~217 lessons).
 *
 * 所有可點按鈕一律走 SquishButton (per CONVENTIONS.md):
 *   - paw node (lesson) → SquishButton shadowColor=#b07a2a (done #5d7a30)
 *   - chest 🎁         → SquishButton shadowColor=#b07a2a + reward
 *   - book cover       → SquishButton shadowColor=darken(meta.accent)
 *
 * 換 image / 顏色 都不影響 press effect, 因為 effect 在 SquishButton 結構不在 child.
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { ALL_LESSONS, CHAPTER_META } from '../data/lessons';
import { useRunStore, currentLessonIdx, levelForXp } from '../store/runStore';
import { SquishButton } from '../components/SquishButton';
import type { RootNav } from '../navigation';

const SLOT_DX = [-60, -20, 20, 60, 20, -20, -60, -20];
const NODE_PITCH = 96;        // 高一點 (per user 「按鈕做高一點」), 84 → 96
const NODE_SIZE = 88;
const NODE_HEIGHT = 76;       // 64 → 76 (更厚)
const CHEST_EVERY = 5;

type StreamItem = { kind: 'lesson'; lessonIdx: number } | { kind: 'chest'; chestIdx: number };

// 簡易 darken (no need to import from lessons)
function darken(hex: string, amount = 0.28): string {
  if (!hex.startsWith('#') || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const m = (c: number) => Math.round(c * (1 - amount));
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

export default function MapScreen() {
  const navigation = useNavigation<RootNav>();
  const lessons = ALL_LESSONS;
  const completedByChapter = useRunStore((s) => s.completedByChapter);
  const addXp = useRunStore((s) => s.addXp);
  const addCoins = useRunStore((s) => s.addCoins);
  const xp = useRunStore((s) => s.xp);
  const coins = useRunStore((s) => s.coins);
  const level = levelForXp(xp);
  const [openedChests, setOpenedChests] = useState<Set<number>>(new Set());

  const currentIdx = useMemo(
    () => currentLessonIdx(lessons, useRunStore.getState()),
    [lessons, completedByChapter],
  );

  const stream = useMemo<StreamItem[]>(() => {
    const out: StreamItem[] = [];
    let chestI = 0;
    lessons.forEach((_, i) => {
      out.push({ kind: 'lesson', lessonIdx: i });
      if ((i + 1) % CHEST_EVERY === 0) out.push({ kind: 'chest', chestIdx: chestI++ });
    });
    return out;
  }, [lessons]);

  const [activeChapter, setActiveChapter] = useState<number>(1);
  const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = e.nativeEvent.contentOffset.y;
    const streamIdx = Math.floor(y / NODE_PITCH);
    const item = stream[Math.min(streamIdx, stream.length - 1)];
    if (item && item.kind === 'lesson') {
      const ch = lessons[item.lessonIdx]?.chapter;
      if (ch && ch !== activeChapter) setActiveChapter(ch);
    }
  };

  const meta = CHAPTER_META[activeChapter] ?? CHAPTER_META[1];

  const openChest = (chestIdx: number) => {
    if (openedChests.has(chestIdx)) return;
    setOpenedChests((s) => new Set(s).add(chestIdx));
    addCoins(10);
  };

  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <Text style={styles.hudItem}>🏳️ EN</Text>
        <Text style={styles.hudItem}>👑 L{level}</Text>
        <Text style={styles.hudItem}>🪙 {coins}</Text>
        <Text style={styles.hudItem}>🔥 0</Text>
      </View>

      {/* Book cover — SquishButton 一致 3D press (tap 念 chapter title) */}
      <View style={{ marginHorizontal: 14, marginBottom: 12 }}>
        <SquishButton
          shadowColor={darken(meta.accent, 0.28)}
          borderRadius={14}
          liftHeight={6}
          style={{ backgroundColor: meta.accent, padding: 18 }}
          onPress={() => Speech.speak(meta.titleEn, { language: 'en-US', rate: 0.85 })}
        >
          <Text style={styles.bookCoverChapter}>CH {activeChapter}</Text>
          <Text style={styles.bookCoverTitleEn} numberOfLines={1}>{meta.titleEn}</Text>
          <Text style={styles.bookCoverTitleZh} numberOfLines={1}>{meta.titleZh}</Text>
        </SquishButton>
      </View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mascots}>
          <Image source={require('../../assets/mascots/iso-grandma.webp')} style={styles.grandma} resizeMode="contain" />
          <Image source={require('../../assets/mascots/iso-shiba.webp')} style={styles.shiba} resizeMode="contain" />
        </View>

        {stream.map((item, i) => {
          const dx = SLOT_DX[i % SLOT_DX.length];

          if (item.kind === 'chest') {
            const opened = openedChests.has(item.chestIdx);
            return (
              <View key={`c-${item.chestIdx}`} style={[styles.nodeRow, { transform: [{ translateX: dx }] }]}>
                <SquishButton
                  shadowColor={opened ? '#8b6f4a' : '#b07a2a'}
                  borderRadius={NODE_SIZE / 2}
                  liftHeight={8}
                  style={{
                    width: NODE_SIZE, height: NODE_HEIGHT,
                    backgroundColor: opened ? '#d4c4a0' : '#e7a44a',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                  onPress={() => openChest(item.chestIdx)}
                  disabled={opened}
                >
                  <Text style={styles.chestEmoji}>{opened ? '✨' : '🎁'}</Text>
                </SquishButton>
              </View>
            );
          }

          const l = lessons[item.lessonIdx];
          const done = (completedByChapter[l.chapter] ?? []).includes(l.id);
          const isCurrent = item.lessonIdx === currentIdx;
          return (
            <View key={l.id} style={[styles.nodeRow, { transform: [{ translateX: dx }] }]}>
              <SquishButton
                shadowColor={done ? '#5d7a30' : '#b07a2a'}
                borderRadius={NODE_SIZE / 2}
                liftHeight={8}
                style={{
                  width: NODE_SIZE, height: NODE_HEIGHT,
                  backgroundColor: done ? '#7d9a4f' : isCurrent ? '#f5be6a' : '#e7a44a',
                  alignItems: 'center', justifyContent: 'center',
                  // current = bg 偏亮(highlight 不靠 border, 避免 antialiasing 黑暈)
                }}
                onPress={() => navigation.navigate('Lesson', { lessonId: l.id, chapter: l.chapter })}
              >
                <Image
                  source={done
                    ? require('../../assets/mascots/node-star.webp')
                    : require('../../assets/mascots/node-paw.webp')}
                  style={styles.nodeIconImg}
                  resizeMode="contain"
                />
              </SquishButton>
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1ebe1' },

  hud: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingTop: 50, paddingBottom: 8, backgroundColor: '#f1ebe1',
  },
  hudItem: { fontSize: 14, fontWeight: '800', color: '#3c2a1c' },

  bookCoverChapter: {
    fontSize: 10, fontWeight: '900', letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.82)', textTransform: 'uppercase', marginBottom: 2,
  },
  bookCoverTitleEn: { fontSize: 19, fontWeight: '900', color: '#fff' },
  bookCoverTitleZh: { fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  scrollContent: { paddingTop: 20, paddingBottom: 100, alignItems: 'center' },
  nodeRow: { width: NODE_SIZE + 4, height: NODE_PITCH, alignItems: 'center', justifyContent: 'center' },
  nodeIconImg: { width: 44, height: 44 },

  mascots: { width: 320, height: 130, position: 'relative', marginBottom: 8 },
  grandma: { position: 'absolute', left: 10, bottom: 0, width: 100, height: 110 },
  shiba: { position: 'absolute', right: 10, bottom: 0, width: 80, height: 90 },

  chestEmoji: { fontSize: 48 },
});
