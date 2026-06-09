/**
 * SquishButton v4 — Duolingo 3D press, 按下保留 minShadow 不全平.
 *
 * 結構: Pressable > [outer bg=shadowColor paddingBottom=liftHeight] > [inner translateY]
 *
 * Default: inner 在 top, outer paddingBottom=6 露出 shadow color → 看起來 raised 6px
 * Pressed: inner translateY = (liftHeight - minShadow) → 留 minShadow px shadow 不全平
 *          (user 「按下去變平面就不會有任何陰影」→ 留 2px 質感)
 *
 * Speed: 30ms 壓下 / 80ms spring back (user 要求快)
 * Haptic: Medium impact
 *
 * ───── 規則 (CONVENTIONS.md) ─────
 * 所有可點按鈕一律用 SquishButton.
 * shadowColor MUST 提供 (比 inner bg 暗一階, Duolingo darken 22%).
 * 不要對 inner style 加 shadow* / marginBottom / 自己的 translateY.
 */
import { ReactNode, useRef } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  shadowColor: string;
  borderRadius?: number;
  /** 抬起高度. Default 6. paw node 用 8. */
  liftHeight?: number;
  /** 按下後保留的陰影 px. Default 2. 設 0 = 完全壓平 (不建議). */
  minShadow?: number;
  children?: ReactNode;
  noHaptic?: boolean;
}

export function SquishButton({
  onPress, style, shadowColor, borderRadius = 14,
  liftHeight = 6, minShadow = 2,
  children, disabled, noHaptic, ...rest
}: Props) {
  const ty = useRef(new Animated.Value(0)).current;
  const pressedY = Math.max(0, liftHeight - minShadow); // 留 minShadow px shadow

  const pressIn = () => {
    Animated.timing(ty, { toValue: pressedY, duration: 30, useNativeDriver: true }).start();
    if (!noHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  };
  const pressOut = () => {
    Animated.spring(ty, { toValue: 0, useNativeDriver: true, tension: 220, friction: 8 }).start();
  };

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <View
        style={{
          backgroundColor: shadowColor,
          borderRadius,
          paddingBottom: liftHeight,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <Animated.View
          style={[
            { borderRadius },
            style,
            { transform: [{ translateY: ty }] },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}
