# Pickup-RN Conventions

## 🔘 Button Pattern (MUST 遵守)

**所有可點按鈕一律用 `SquishButton`** (`src/components/SquishButton.tsx`).

### 為什麼

User: 「所有按鈕可以再做高一點 按下去立體感要不見 被壓成平面 而且壓下去的速度可以快一點 寫入規則 不要換個圖檔就不見」

換圖檔 / 改 bg 顏色 / 換 icon 都不會影響 press effect, 因為 effect 來自 SquishButton 的 **outer/inner double-layer 結構**, 不是 button bg 自帶的 shadow.

### 用法

```tsx
import { SquishButton } from '../components/SquishButton';

// MC option
<SquishButton
  shadowColor="#b07a2a"           // outer 暗一階 (Duolingo darken 22%)
  borderRadius={14}
  liftHeight={6}                  // 預設 6, paw node 用 8 厚一點
  style={{ backgroundColor: '#e7a44a', padding: 18 }}
  onPress={() => navigate(...)}
>
  <Text>...</Text>
</SquishButton>
```

### 規則(違反 = revert)

⚠️ **不要對 SquishButton inner 加 shadow* style** — 由 outer layer 提供.
⚠️ **不要加 marginBottom / 自己的 translateY** — 衝突 press 動畫.
⚠️ **shadowColor 必須提供** — 沒 outer 就沒 3D 立體感.
⚠️ **不要用 TouchableOpacity / Pressable / TouchableHighlight 直接做按鈕** — 全走 SquishButton.

### 各 surface 用什麼 shadowColor

| Surface | inner bg | shadowColor |
|---|---|---|
| MC option (default) | `#fff` | `#c8a878` (oatmeal dark) |
| MC option correct | `#eaf6d5` | `#5d7a30` |
| MC option wrong | `#fde2e2` | `#8a2e21` |
| Map paw node | `#e7a44a` | `#b07a2a` |
| Map paw node done | `#7d9a4f` | `#5d7a30` |
| Chest (🎁) | `#e7a44a` | `#b07a2a` |
| Book cover | `meta.accent` | `darken(meta.accent, 0.28)` |
| CTA 綠 → | `#7d9a4f` | `#5d7a30` |
| CTA 紅 知道了 | `#c84a3a` | `#8a2e21` |

### 觸感 / 速度 / 抬升

- press in: 30ms timing(快, user 要求)
- press out: spring tension 220 / friction 8(~150ms 回彈)
- liftHeight: 預設 6, 大按鈕用 8
- Haptic: Medium impact (Expo Go 內建 expo-haptics 即可)

### 為什麼不用 Reanimated 4 / Skia / fast-confetti

Expo Go SDK 54 沒內建 Skia native module, fast-confetti 載入直接白屏.
Reanimated 4 跟 babel-preset-expo 互動有 trap (worklets plugin 雙重註冊).
退回 100% built-in Animated API, 跑 useNativeDriver:true 的 transform 仍 GPU 加速.
之後若要升 Reanimated/Skia, 走 EAS dev-client build (留 backlog).
