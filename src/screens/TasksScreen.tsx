import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRunStore } from '../store/runStore';

export default function TasksScreen() {
  const { streak, freezes, visitStreak, xp } = useRunStore();
  const dailyGoal = 30; // 30 xp per day
  const todayXp = Math.min(xp, dailyGoal); // simple: 用 total xp 近似今日 (PoC)

  return (
    <ScrollView contentContainerStyle={styles.body}>
      {/* Streak hero card */}
      <View style={styles.hero}>
        <Text style={styles.heroFlame}>🔥</Text>
        <Text style={styles.heroValue}>{streak}</Text>
        <Text style={styles.heroLabel}>day streak</Text>
        <Text style={styles.heroSub}>連續完成 lesson {streak} 天</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧊 Streak Freeze</Text>
        <Text style={styles.cardValue}>{freezes}</Text>
        <Text style={styles.cardSub}>沒完成那天自動消耗 1 個保 streak</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🐾 Visit Streak</Text>
        <Text style={styles.cardValue}>{visitStreak} day</Text>
        <Text style={styles.cardSub}>連續打開 app {visitStreak} 天</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Today's XP</Text>
        <View style={styles.progress}>
          <View style={[styles.progressFill, { width: `${(todayXp / dailyGoal) * 100}%` }]} />
        </View>
        <Text style={styles.cardSub}>{todayXp} / {dailyGoal} XP</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 50, paddingBottom: 100, backgroundColor: '#f1ebe1' },
  hero: {
    backgroundColor: '#ff7a3a', borderRadius: 18, padding: 24, alignItems: 'center', marginBottom: 16,
    // @ts-ignore
    boxShadow: '0 6px 0 0 #b34f1f',
  },
  heroFlame: { fontSize: 56 },
  heroValue: { fontSize: 56, fontWeight: '900', color: '#fff', marginTop: -8 },
  heroLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 6 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 2, borderColor: '#ead9bb',
  },
  cardTitle: { fontSize: 13, fontWeight: '900', color: '#8b6f4a', marginBottom: 6 },
  cardValue: { fontSize: 28, fontWeight: '900', color: '#3c2a1c' },
  cardSub: { fontSize: 12, color: '#8b6f4a', marginTop: 4 },
  progress: { height: 14, backgroundColor: '#ead8c4', borderRadius: 999, overflow: 'hidden', marginVertical: 6 },
  progressFill: { height: '100%', backgroundColor: '#7d9a4f', borderRadius: 999 },
});
