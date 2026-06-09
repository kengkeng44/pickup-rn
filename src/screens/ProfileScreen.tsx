import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useRunStore, levelForXp } from '../store/runStore';

export default function ProfileScreen() {
  const { xp, coins, streak, freezes, visitStreak, catName, dogName, muted,
          setCatName, setDogName, toggleMuted, reset } = useRunStore();
  const [tmpCat, setTmpCat] = useState(catName);
  const [tmpDog, setTmpDog] = useState(dogName);

  const level = levelForXp(xp);
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.hero}>
        <Image source={require('../../assets/mascots/calico-anchor.webp')} style={styles.heroImg} />
        <Text style={styles.heroName}>{catName}</Text>
        <Text style={styles.heroLevel}>Level {level}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Stat label="XP" value={xp} color="#c79410" />
        <Stat label="Coins" value={coins} color="#d68a52" />
        <Stat label="Streak" value={`${streak}d`} color="#ff7a3a" />
        <Stat label="Visit" value={`${visitStreak}d`} color="#7d9a4f" />
        <Stat label="Freeze" value={freezes} color="#5a8cc4" />
      </View>

      <Section title="Cat Name">
        <TextInput value={tmpCat} onChangeText={setTmpCat} style={styles.input} placeholder="Mochi" />
        <Pressable onPress={() => setCatName(tmpCat || 'Mochi')} style={styles.btn}>
          <Text style={styles.btnText}>Save</Text>
        </Pressable>
      </Section>

      <Section title="Dog Name">
        <TextInput value={tmpDog} onChangeText={setTmpDog} style={styles.input} placeholder="Hana" />
        <Pressable onPress={() => setDogName(tmpDog || 'Hana')} style={styles.btn}>
          <Text style={styles.btnText}>Save</Text>
        </Pressable>
      </Section>

      <Section title="Audio">
        <Pressable onPress={toggleMuted} style={[styles.btn, muted && styles.btnAlt]}>
          <Text style={styles.btnText}>{muted ? 'Unmute' : 'Mute'}</Text>
        </Pressable>
      </Section>

      <Section title="Danger Zone">
        <Pressable onPress={reset} style={[styles.btn, styles.btnDanger]}>
          <Text style={[styles.btnText, { color: '#fff' }]}>Reset all progress</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 50, paddingBottom: 100, backgroundColor: '#f1ebe1' },
  hero: { alignItems: 'center', marginBottom: 20 },
  heroImg: { width: 120, height: 120, borderRadius: 60 },
  heroName: { fontSize: 22, fontWeight: '900', color: '#3c2a1c', marginTop: 10 },
  heroLevel: { fontSize: 14, fontWeight: '700', color: '#8b6f4a' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: {
    flexBasis: '31%', backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 2, borderColor: '#ead9bb',
  },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#8b6f4a', marginTop: 2 },

  section: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 2, borderColor: '#ead9bb', gap: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#8b6f4a', letterSpacing: 1, textTransform: 'uppercase' },
  input: {
    backgroundColor: '#fff7e8', borderRadius: 10, padding: 12,
    borderWidth: 2, borderColor: '#ead9bb', fontSize: 15,
  },
  btn: {
    backgroundColor: '#7d9a4f', borderRadius: 10, padding: 12, alignItems: 'center',
    // @ts-ignore
    boxShadow: '0 3px 0 0 #5d7a30',
  },
  btnAlt: {
    backgroundColor: '#d68a52',
    // @ts-ignore
    boxShadow: '0 3px 0 0 #8b5a32',
  },
  btnDanger: {
    backgroundColor: '#c84a3a',
    // @ts-ignore
    boxShadow: '0 3px 0 0 #8a2e21',
  },
  btnText: { color: '#fff', fontWeight: '900' },
});
