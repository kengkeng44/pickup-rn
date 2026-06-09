/**
 * CardsScreen — 圖鑑 pokedex (31 章 collectible).
 * Port 自 wordwar/src/react-app/pages/ChaptersPage.tsx 簡化版.
 */
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CHAPTER_META, lessonsForChapter } from '../data/lessons';
import { useRunStore } from '../store/runStore';
import type { RootNav } from '../navigation';

const CHAPTER_EMOJI: Record<number, string> = {
  1: '📖', 2: '🍑', 3: '🦢', 4: '🐢', 5: '🐪', 6: '🏚️', 7: '🦢', 8: '👠',
  9: '👗', 10: '🌙', 11: '☀️', 12: '🪄', 13: '🐺', 14: '🐢', 15: '👑', 16: '🏯',
  17: '🦢', 18: '🌾', 19: '🐊', 20: '🥕', 21: '🕷️', 22: '🏠', 23: '🪨', 24: '🍐',
  25: '⛰️', 26: '🛁', 27: '🐒', 28: '🏯', 29: '⛵', 30: '🦁', 31: '🏹',
};

export default function CardsScreen() {
  const navigation = useNavigation<RootNav>();
  const { completedByChapter } = useRunStore();
  const totalCollected = Object.keys(CHAPTER_META)
    .map(Number)
    .filter(ch => (completedByChapter[ch] ?? []).length >= lessonsForChapter(ch).length).length;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.hero}>
        <Text style={styles.heroValue}>{totalCollected} / 31</Text>
        <Text style={styles.heroLabel}>Stories Collected</Text>
      </View>

      <View style={styles.grid}>
        {Object.entries(CHAPTER_META).map(([ch, meta]) => {
          const cn = Number(ch);
          const done = (completedByChapter[cn] ?? []).length;
          const total = lessonsForChapter(cn).length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const collected = done >= total && total > 0;
          return (
            <Pressable
              key={ch}
              onPress={() => navigation.navigate('Map')}
              style={[styles.card, collected && styles.cardCollected]}
            >
              <Text style={styles.cardNum}>#{ch}</Text>
              <Text style={styles.cardEmoji}>{CHAPTER_EMOJI[cn] ?? '📖'}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>{meta.titleZh}</Text>
              <Text style={styles.cardPct}>{collected ? '✅' : `${pct}%`}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 50, paddingBottom: 100, backgroundColor: '#f1ebe1' },
  hero: { backgroundColor: '#d68a52', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 16,
    // @ts-ignore
    boxShadow: '0 5px 0 0 #8b5a32' },
  heroValue: { fontSize: 36, fontWeight: '900', color: '#fff' },
  heroLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    flexBasis: '23%', backgroundColor: '#fff', borderRadius: 12, padding: 8,
    alignItems: 'center', borderWidth: 2, borderColor: '#ead9bb',
  },
  cardCollected: { borderColor: '#7d9a4f', backgroundColor: '#eaf6d5' },
  cardNum: { fontSize: 9, fontWeight: '700', color: '#8b6f4a' },
  cardEmoji: { fontSize: 32, marginVertical: 2 },
  cardTitle: { fontSize: 10, fontWeight: '700', color: '#3c2a1c', textAlign: 'center' },
  cardPct: { fontSize: 10, fontWeight: '900', color: '#7d9a4f', marginTop: 2 },
});
