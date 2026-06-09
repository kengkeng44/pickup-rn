import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRunStore } from '../store/runStore';

interface Badge {
  id: string; emoji: string; title: string; need: string; check: (s: ReturnType<typeof useRunStore.getState>) => boolean;
}

const BADGES: Badge[] = [
  { id: 'first',     emoji: '🐾', title: 'First Step',   need: '完成 1 個 lesson',    check: (s) => Object.values(s.completedByChapter).flat().length >= 1 },
  { id: 'streak3',   emoji: '🔥', title: 'On Fire',      need: '3 天 streak',          check: (s) => s.streak >= 3 },
  { id: 'streak7',   emoji: '⚡',  title: 'Week Warrior', need: '7 天 streak',          check: (s) => s.streak >= 7 },
  { id: 'streak30',  emoji: '🌟', title: 'Month Master', need: '30 天 streak',         check: (s) => s.streak >= 30 },
  { id: 'xp200',     emoji: '👑', title: 'Crown Gold',   need: 'XP 200',               check: (s) => s.xp >= 200 },
  { id: 'xp500',     emoji: '💎', title: 'Crown Diamond',need: 'XP 500',               check: (s) => s.xp >= 500 },
  { id: 'ch1',       emoji: '📖', title: 'Story One',    need: 'Ch1 全完成',           check: (s) => (s.completedByChapter[1] ?? []).length >= 24 },
  { id: 'ch8',       emoji: '🏆', title: 'Eight Tales',  need: 'Ch1-8 全完成',         check: (s) => Array.from({length:8},(_,i)=>i+1).every(c=>(s.completedByChapter[c]??[]).length>0) },
];

export default function AlertsScreen() {
  const state = useRunStore();
  const unlocked = BADGES.filter(b => b.check(state)).length;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.hero}>
        <Text style={styles.heroValue}>{unlocked} / {BADGES.length}</Text>
        <Text style={styles.heroLabel}>Achievements</Text>
      </View>

      <View style={styles.grid}>
        {BADGES.map(b => {
          const got = b.check(state);
          return (
            <View key={b.id} style={[styles.badge, got && styles.badgeGot]}>
              <Text style={[styles.badgeEmoji, !got && { opacity: 0.25 }]}>{b.emoji}</Text>
              <Text style={[styles.badgeTitle, !got && styles.badgeTitleLocked]}>{b.title}</Text>
              <Text style={styles.badgeNeed}>{b.need}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 50, paddingBottom: 100, backgroundColor: '#f1ebe1' },
  hero: { backgroundColor: '#e7a44a', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 16,
    // @ts-ignore
    boxShadow: '0 5px 0 0 #b07a2a' },
  heroValue: { fontSize: 36, fontWeight: '900', color: '#fff' },
  heroLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexBasis: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: '#ead9bb' },
  badgeGot: { borderColor: '#7d9a4f', backgroundColor: '#eaf6d5' },
  badgeEmoji: { fontSize: 48 },
  badgeTitle: { fontSize: 13, fontWeight: '900', color: '#3c2a1c', marginTop: 6, textAlign: 'center' },
  badgeTitleLocked: { color: '#8b6f4a' },
  badgeNeed: { fontSize: 10, color: '#8b6f4a', textAlign: 'center', marginTop: 2 },
});
