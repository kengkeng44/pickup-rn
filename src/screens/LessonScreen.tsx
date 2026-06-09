/**
 * Pickup-RN LessonScreen — multi-type renderer + Duolingo 特效集.
 *
 * 題型支援:
 *   narration / listen-mc / listen-tf / listen-comprehension / emoji-pick / tap-pairs /
 *   sentence-builder (新, 由 narration 平均 33% 自動 convert)
 *
 * 特效:
 *   - Pressable scale + translateY 按壓回饋 (Duolingo press)
 *   - Confetti emoji burst on correct
 *   - 2-strike 答錯 reveal pattern (1st = 紅 shake retry, 2nd = 知道了 CTA reveal)
 *   - Auto-speak on q change (250ms delay)
 *   - 砍 MC question prompt (per user: 「選擇題不用問題」)
 */
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { findLesson, type Question } from '../data/lessons';
import { useRunStore } from '../store/runStore';
import { SquishButton } from '../components/SquishButton';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ route, navigation }: Props) {
  const lesson = findLesson(route.params.lessonId);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [matched, setMatched] = useState<number[]>([]);
  const [pickedLeft, setPickedLeft] = useState<number | null>(null);
  const [pickedRight, setPickedRight] = useState<number | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const markComplete = useRunStore((s) => s.markLessonComplete);
  const addXp = useRunStore((s) => s.addXp);
  const addCoins = useRunStore((s) => s.addCoins);
  const recordWrong = useRunStore((s) => s.recordWrong);
  const muted = useRunStore((s) => s.muted);

  if (!lesson) {
    return <View style={styles.center}><Text style={styles.muted}>Lesson not found</Text></View>;
  }

  const q = lesson.questions[qIdx];
  const isLast = qIdx >= lesson.questions.length - 1;
  const isNarration = q.type === 'narration';
  const isTapPairs = q.type === 'tap-pairs';
  const isSentenceBuilder = q.type === 'sentence-builder';
  const isMc = !!q.options && !isTapPairs && !isSentenceBuilder;

  useEffect(() => {
    if (muted || !q.sentence) return;
    const t = setTimeout(() => Speech.speak(q.sentence ?? '', { language: 'en-US', rate: 0.85 }), 250);
    return () => { clearTimeout(t); Speech.stop(); };
  }, [q.id, muted]);

  const resetQ = () => {
    setSelected(null); setRevealed(false); setWrongCount(0);
    setMatched([]); setPickedLeft(null); setPickedRight(null);
  };

  const onAdvance = () => {
    resetQ();
    if (isLast) {
      markComplete(lesson.chapter, lesson.id);
      navigation.goBack();
    } else {
      setQIdx((i) => i + 1);
    }
  };

  const triggerCorrect = (xp: number, coins: number) => {
    addXp(xp); addCoins(coins);
    setRevealed(true);
    setConfettiTrigger((c) => c + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const onPickOption = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    const correct = idx === (q.correctIndex ?? 0);
    if (correct) {
      triggerCorrect(5, 2);
    } else {
      // 2-strike: 1st wrong = stay retry, 2nd wrong = reveal + 知道了
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      recordWrong(lesson.id);
      if (newWrong >= 2) setRevealed(true);
      setTimeout(() => setSelected(null), 500);
    }
  };

  const onTapPair = (side: 'left' | 'right', idx: number) => {
    if (matched.includes(idx) && side === 'left') return;
    if (side === 'left') setPickedLeft(idx); else setPickedRight(idx);
    const lp = side === 'left' ? idx : pickedLeft;
    const rp = side === 'right' ? idx : pickedRight;
    if (lp !== null && rp !== null) {
      if (lp === rp) {
        setMatched((m) => [...m, lp]);
        setPickedLeft(null); setPickedRight(null);
        addCoins(1);
        if (q.pairs && matched.length + 1 === q.pairs.length) {
          triggerCorrect(10, 0);
        }
      } else {
        setTimeout(() => { setPickedLeft(null); setPickedRight(null); }, 500);
      }
    }
  };

  const canAdvance = revealed || isNarration;
  const showKnowIt = revealed && wrongCount >= 2; // 答錯 reveal → 知道了 紅 CTA
  const advanceLabel = showKnowIt ? '知道了' : '→';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(4, ((qIdx + 1) / lesson.questions.length) * 100)}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {q.speaker && (
          <Text style={styles.speakerBadge}>
            {q.speaker === 'narrator' ? '🎙 Narrator' : `🗣 ${q.speaker}`}
          </Text>
        )}

        {/* Sentence card — narration / listen-* / tap-pairs intro 都顯示 */}
        {q.sentence && !isSentenceBuilder && (
          <View style={styles.sentenceCard}>
            <Text style={styles.sentence}>{q.sentence}</Text>
            <SquishButton shadowColor="#b07a2a" onPress={() => Speech.speak(q.sentence ?? '', { language: 'en-US', rate: 0.85 })} style={styles.speakerBtn}>
              <Image source={require('../../assets/mascots/icon-speaker.webp')} style={styles.speakerImg} />
            </SquishButton>
          </View>
        )}

        {/* sentence-builder: 翻譯/復原句子 */}
        {isSentenceBuilder && q.sentence && (
          <SentenceBuilder
            sentence={q.sentence}
            revealed={revealed}
            onCorrect={() => triggerCorrect(8, 3)}
            onWrong={() => {
              const w = wrongCount + 1;
              setWrongCount(w);
              recordWrong(lesson.id);
              if (w >= 2) setRevealed(true);
            }}
          />
        )}

        {/* MC options — 砍 question prompt (per user: 「選擇題不用問題」) */}
        {isMc && q.options && (
          <View style={styles.options}>
            {q.options.map((opt, i) => {
              const isSelected = i === selected;
              const isCorrect = i === (q.correctIndex ?? 0);
              const showCorrect = revealed && isCorrect;
              const showWrong = isSelected && !isCorrect && !revealed;
              return (
                <SquishButton shadowColor="#b07a2a"
                  key={i}
                  onPress={() => { Speech.speak(opt, { language: 'en-US', rate: 0.85 }); onPickOption(i); }}
                  style={[styles.option, showCorrect && styles.optionCorrect, showWrong && styles.optionWrong]}
                >
                  <Text style={styles.optionEn}>{opt}</Text>
                  {q.optionsZh?.[i] && <Text style={styles.optionZh}>{q.optionsZh[i]}</Text>}
                </SquishButton>
              );
            })}
          </View>
        )}

        {/* tap-pairs */}
        {isTapPairs && q.pairs && (
          <View style={styles.pairsLayout}>
            <View style={styles.pairsCol}>
              {q.pairs.map((p, i) => {
                const isMatched = matched.includes(i);
                const isPicked = pickedLeft === i;
                return (
                  <SquishButton shadowColor="#b07a2a"
                    key={`L${i}`}
                    onPress={() => onTapPair('left', i)}
                    style={[styles.pairCard, isMatched && styles.pairCardDone, isPicked && styles.pairCardPicked]}
                  >
                    <Text style={[styles.pairText, isMatched && styles.pairTextDone]}>{p.left}</Text>
                  </SquishButton>
                );
              })}
            </View>
            <View style={styles.pairsCol}>
              {q.pairs.map((p, i) => {
                const isMatched = matched.includes(i);
                const isPicked = pickedRight === i;
                return (
                  <SquishButton shadowColor="#b07a2a"
                    key={`R${i}`}
                    onPress={() => { Speech.speak(p.right, { language: 'en-US', rate: 0.85 }); onTapPair('right', i); }}
                    style={[styles.pairCard, isMatched && styles.pairCardDone, isPicked && styles.pairCardPicked]}
                  >
                    <Text style={[styles.pairText, isMatched && styles.pairTextDone]}>{p.right}</Text>
                  </SquishButton>
                );
              })}
            </View>
          </View>
        )}

        {/* Wrong-reveal banner (Duolingo 紅 "正確答案" pattern) */}
        {revealed && wrongCount >= 2 && (
          <View style={styles.wrongBanner}>
            <Text style={styles.wrongTitle}>❌ 不正確</Text>
            <Text style={styles.wrongLabel}>正確答案:</Text>
            <Text style={styles.wrongAnswer}>
              {q.options ? q.options[q.correctIndex ?? 0] : q.sentence}
            </Text>
          </View>
        )}

        {/* Reveal explanation (only when fully revealed + has explanation) */}
        {revealed && q.explanationZh && wrongCount < 2 && (
          <View style={styles.explainCard}>
            <Text style={styles.explainText}>{q.explanationZh}</Text>
          </View>
        )}

        {isNarration && (
          <Text style={[styles.muted, { marginTop: 12, textAlign: 'center' }]}>Tap → to continue</Text>
        )}
      </ScrollView>

      {/* Confetti — 手刻 Animated (built-in, Expo Go 直接跑, 不需 Skia/dev-client) */}
      <EmojiConfetti trigger={confettiTrigger} />

      <View style={styles.footer}>
        <SquishButton shadowColor="#b07a2a"
          onPress={onAdvance}
          disabled={!canAdvance}
          style={[
            styles.cta,
            showKnowIt && styles.ctaKnowIt,
            !canAdvance && styles.ctaDisabled,
          ]}
        >
          <Text style={styles.ctaText}>{advanceLabel}</Text>
        </SquishButton>
      </View>
    </View>
  );
}

// (SquishButton 在 src/components/SquishButton.tsx — RN built-in Animated + Haptics)

// ─── EmojiConfetti: 手刻 Animated 粒子 burst (Expo Go safe) ────────────────
function EmojiConfetti({ trigger }: { trigger: number }) {
  const anims = useRef(Array.from({ length: 12 }, () => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const opacities = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  const emojis = ['⭐', '🎉', '✨', '🐾', '💫', '🌟', '🎊', '⭐', '🎉', '✨', '🐾', '💫'];

  useEffect(() => {
    if (trigger === 0) return;
    anims.forEach((a, i) => {
      a.setValue({ x: 0, y: 0 });
      opacities[i].setValue(1);
      const angle = (i / anims.length) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 150 + Math.random() * 100;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 120;
      Animated.parallel([
        Animated.timing(a, { toValue: { x: dx, y: dy }, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacities[i], { toValue: 0, duration: 1000, delay: 300, useNativeDriver: true }),
      ]).start();
    });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {anims.map((a, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confettiEmoji,
            { transform: [{ translateX: a.x }, { translateY: a.y }], opacity: opacities[i] },
          ]}
        >
          {emojis[i]}
        </Animated.Text>
      ))}
    </View>
  );
}

// ─── SentenceBuilder: Duolingo 翻譯這句話 tile picker ────────────────────
function SentenceBuilder({
  sentence, revealed, onCorrect, onWrong,
}: {
  sentence: string;
  revealed: boolean;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  // tokens (按空白拆) + index map 給 stable key
  const tokens = useMemo(() => sentence.split(/\s+/).filter(Boolean), [sentence]);
  const correctOrder = useMemo(() => tokens.map((_, i) => i), [tokens]);
  const shuffled = useMemo(
    () => correctOrder.slice().sort(() => Math.random() - 0.5),
    [tokens.length],
  );
  const [bank, setBank] = useState<number[]>(shuffled);
  const [slot, setSlot] = useState<number[]>([]);

  useEffect(() => { setBank(shuffled); setSlot([]); }, [shuffled]);

  const placeTile = (origIdx: number) => {
    if (revealed) return;
    setBank((b) => b.filter((i) => i !== origIdx));
    setSlot((s) => [...s, origIdx]);
  };
  const removeTile = (slotIdx: number) => {
    if (revealed) return;
    const origIdx = slot[slotIdx];
    setSlot((s) => s.filter((_, i) => i !== slotIdx));
    setBank((b) => [...b, origIdx]);
  };

  const canCheck = slot.length === tokens.length;
  const check = () => {
    const userOrder = slot.map((i) => tokens[i]).join(' ');
    const correct = userOrder === tokens.join(' ');
    if (correct) onCorrect();
    else onWrong();
  };

  return (
    <View style={builderStyles.root}>
      <Text style={builderStyles.prompt}>翻譯這句話 · Build the sentence</Text>

      {/* Slot row (上方放好的 tiles) */}
      <View style={builderStyles.slotRow}>
        {slot.length === 0 ? (
          <Text style={builderStyles.slotEmpty}>Tap tiles below</Text>
        ) : (
          slot.map((origIdx, i) => (
            <SquishButton shadowColor="#b07a2a" key={`s${i}`} onPress={() => removeTile(i)} style={builderStyles.tilePlaced}>
              <Text style={builderStyles.tileText}>{tokens[origIdx]}</Text>
            </SquishButton>
          ))
        )}
      </View>
      {/* dashed underline */}
      <View style={builderStyles.underline} />

      {/* Bank (下方可選 tiles) */}
      <View style={builderStyles.bank}>
        {bank.map((origIdx) => (
          <SquishButton shadowColor="#b07a2a" key={`b${origIdx}`} onPress={() => placeTile(origIdx)} style={builderStyles.tile}>
            <Text style={builderStyles.tileText}>{tokens[origIdx]}</Text>
          </SquishButton>
        ))}
      </View>

      <SquishButton shadowColor="#b07a2a"
        onPress={check}
        disabled={!canCheck || revealed}
        style={[builderStyles.checkBtn, (!canCheck || revealed) && builderStyles.checkBtnOff]}
      >
        <Text style={builderStyles.checkText}>查看 Check</Text>
      </SquishButton>
    </View>
  );
}

const builderStyles = StyleSheet.create({
  root: { marginVertical: 12 },
  prompt: { fontSize: 22, fontWeight: '900', color: '#3c2a1c', marginBottom: 18 },
  slotRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 64,
    paddingVertical: 10, alignItems: 'center',
  },
  slotEmpty: { color: '#8b6f4a', fontStyle: 'italic' },
  underline: { borderBottomWidth: 2, borderBottomColor: '#c8a878', borderStyle: 'dashed', marginBottom: 18 },
  bank: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18,
  },
  tile: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, borderColor: '#c8a878',
    shadowColor: '#b07a2a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 3,
  },
  tilePlaced: {
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, borderColor: '#ead9bb',
  },
  tileText: { fontSize: 16, fontWeight: '700', color: '#3c2a1c' },
  checkBtn: {
    backgroundColor: '#7d9a4f', borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: '#5d7a30', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 5,
  },
  checkBtnOff: { backgroundColor: '#c2b08c', shadowColor: '#8a7a5c' },
  checkText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1ebe1' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#8b6f4a', fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingHorizontal: 14, paddingBottom: 12,
  },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 22, color: '#8b6f4a', fontWeight: '800' },
  progressTrack: { flex: 1, height: 14, backgroundColor: '#ead8c4', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7d9a4f', borderRadius: 999 },

  body: { padding: 16, paddingBottom: 100 },
  speakerBadge: {
    fontSize: 11, fontWeight: '700', color: '#8b6f4a',
    backgroundColor: '#fff7e8', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    marginBottom: 12,
  },
  sentenceCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#ead9bb',
    marginBottom: 18,
    shadowColor: '#c8a878', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 4,
  },
  sentence: { flex: 1, fontSize: 18, fontWeight: '700', color: '#3c2a1c', lineHeight: 26 },
  speakerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  speakerImg: { width: 30, height: 30 },

  options: { gap: 10 },
  option: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 2, borderColor: '#c8a878',
    shadowColor: '#b07a2a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 4,
  },
  optionCorrect: { backgroundColor: '#eaf6d5', borderColor: '#7d9a4f', shadowColor: '#5d7a30' },
  optionWrong: { backgroundColor: '#fde2e2', borderColor: '#c84a3a', shadowColor: '#8a2e21' },
  optionEn: { fontSize: 16, fontWeight: '800', color: '#3c2a1c' },
  optionZh: { fontSize: 13, fontWeight: '600', color: '#8b6f4a', marginTop: 4 },

  pairsLayout: { flexDirection: 'row', gap: 10 },
  pairsCol: { flex: 1, gap: 8 },
  pairCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 2, borderColor: '#c8a878', minHeight: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#b07a2a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 3,
  },
  pairCardPicked: { backgroundColor: '#fef3c7' },
  pairCardDone: { backgroundColor: '#eaf6d5', borderColor: '#7d9a4f' },
  pairText: { fontSize: 16, fontWeight: '800', color: '#3c2a1c' },
  pairTextDone: { color: '#5d7a30' },

  explainCard: {
    marginTop: 18, padding: 14,
    backgroundColor: '#fff7e8', borderRadius: 12,
    borderWidth: 1, borderColor: '#ead9bb',
  },
  explainText: { fontSize: 14, color: '#3c2a1c', lineHeight: 20 },

  wrongBanner: {
    marginTop: 18, padding: 16,
    backgroundColor: '#fde2e2', borderRadius: 14,
    borderWidth: 2, borderColor: '#c84a3a',
  },
  wrongTitle: { fontSize: 16, fontWeight: '900', color: '#c84a3a', marginBottom: 6 },
  wrongLabel: { fontSize: 12, fontWeight: '700', color: '#8a2e21' },
  wrongAnswer: { fontSize: 16, fontWeight: '900', color: '#3c2a1c', marginTop: 4 },

  footer: { padding: 16, backgroundColor: '#f1ebe1', borderTopWidth: 1, borderTopColor: '#ead9bb' },
  cta: {
    backgroundColor: '#7d9a4f', borderRadius: 14,
    padding: 16, alignItems: 'center',
    shadowColor: '#5d7a30', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 5,
  },
  ctaKnowIt: { backgroundColor: '#c84a3a', shadowColor: '#8a2e21' },
  ctaDisabled: { backgroundColor: '#c2b08c', shadowColor: '#8a7a5c' },
  ctaText: { fontSize: 18, fontWeight: '900', color: '#fff' },

  confettiLayer: {
    position: 'absolute', top: '40%', left: '50%', width: 0, height: 0,
    pointerEvents: 'none', zIndex: 999,
  },
  confettiEmoji: {
    position: 'absolute', fontSize: 32,
  },
});
