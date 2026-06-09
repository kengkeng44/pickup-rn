# Pickup-RN PoC

React Native + Expo PoC 驗證:
1. native ScrollView 是不是真的比 PWA 順
2. RN 上的 蜿蜒 paw nodes layout 可行
3. 章節 sticky book cover 行為 OK

## 怎麼跑 (Windows + 你的手機)

### 1. 手機裝 Expo Go (一次就好)
- iOS: App Store 搜 "Expo Go" 裝
- Android: Play Store 同名

### 2. Windows 啟動 dev server

```powershell
cd C:\Users\acer\Desktop\pickup-rn
npx expo start
```

跑起來後 terminal 會顯示 QR code.

### 3. 手機掃 QR

- iOS: 開內建相機 app 掃 QR, 點通知開啟 Expo Go
- Android: 開 Expo Go app 內建 scanner 掃 QR

### 4. 看效果

地圖會 load, 你滑動 Ch1 24 lessons 看:
- scroll 是不是順 (應該完全不跳/不閃, native scroll 沒 WebView 那套問題)
- 滑到 Ch2 (lesson idx > 24) 看書封是否平順切換
- 點 paw node 看 console.log (Expo terminal 會印)

## 跟 web Pickup 對比

| 維度 | Web (wordwar) | RN PoC (此 repo) |
|---|---|---|
| Scroll 流暢 | 12 patch 仍會跳 | native, 預期 0 patch |
| Bundle | 175KB gzip | RN runtime ~50MB but native |
| 動畫 | CSS transition (iOS 卡) | React Native Reanimated |
| 音訊 | Web Speech 不穩 | expo-speech / expo-av native |
| Mascot | CSS @keyframes | Rive native runtime |

## 下一步 (若 PoC 通過)

1. 加 Lesson screen (renderer 9 種題型 port)
2. 音訊接 expo-speech / OpenAI TTS
3. Mascot 動畫接 Rive
4. 28 章 lesson JSON 全 port
5. EAS Build → TestFlight

## 不做的 (PoC 範圍)

- 不接 OpenAI TTS
- 不做 BGM
- 不接 Capacitor Codemagic CI (太早)
- 不做 ChapterIntro / Profile / Tasks etc

PoC 唯一目標: **scroll 在 native 是不是真的順**.
