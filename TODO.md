# Pickup-RN TODO

## ⏳ 一到電腦做的事(EAS dev-client build)

電腦終端跑 5 行,等 15-20 min 雲端 build,手機裝 Pickup-RN(脫離 Expo Go):

```bash
cd C:\Users\acer\Desktop\pickup-rn

# 1. (一次性) 註冊 Expo 帳號: https://expo.dev/signup

# 2. EAS CLI login
npx eas-cli@latest login

# 3. Configure project (一路 Yes)
npx eas-cli@latest init

# 4. Trigger iOS dev build
npx eas-cli@latest build --profile development --platform ios
#    中間:
#    - Apple ID email
#    - 2FA code (iCloud 手機通知)
#    - Register UDID (EAS 給 URL, 手機 Safari 開 → Install Profile)

# 5. 等 15-20 min, 收 install URL → 手機 Safari 開 → Install
#    → Pickup-RN icon 出現桌面, 跟 Expo Go 解耦
```

之後 code 改動 5 秒 OTA push(不用重 build .ipa):
```bash
npx eas-cli@latest update --branch development
```

## Constraints

- 免費 Apple ID: cert 7 天過期 (重 build 即可)
- 付費 Apple Developer $99/yr: cert 1 年 + TestFlight + App Store submit
- PoC 階段免費足夠

## 之前已完成 (disk preserved)

- ✅ 31 章 lessons inline (217 lessons, 32 JSON 全在 bundle)
- ✅ Multi-renderer LessonScreen: narration / listen-mc / listen-tf / emoji-pick / 
      tap-pairs / listen-comprehension / sentence-builder (自動 33% narration 轉)
- ✅ Bottom tabs: Map / Tasks / Cards / Alerts / Profile
- ✅ Zustand store + AsyncStorage persist (XP/coins/streak/freezes/cat-dog name)
- ✅ SquishButton v4: 30ms 按下 + minShadow 2px (不全平)
- ✅ Confetti emoji burst on correct
- ✅ Auto-speak via expo-speech
- ✅ BGM peace.mp3 loop via expo-av
- ✅ Haptic Medium 配 press
- ✅ MapScreen 31 章 paw nodes + chest +10 coins + dynamic chapter header
- ✅ app.json: Mochi icon + cream splash + bundleIdentifier com.kengkeng.pickup
- ✅ metro.config.js inlineRequires (dev load 快 25%)
- ✅ expo-splash-screen plugin + App.tsx preventAutoHide gating
- ✅ CONVENTIONS.md: 按鈕一律 SquishButton (含 shadowColor)
- ✅ eas.json: development / preview / production 3 profile
- ✅ expo-dev-client 6.0.21

## 之後 wordwar 還沒 port 的 (backlog when RN 穩定後)

- Modals: KeySentencesSheet / NextStoryPicker / OnboardingPicker / ShareModal / WardrobeView
- ChapterIntroPage (奶奶 narration intro)
- OpenAI MP3 fallback TTS (expo-speech only 改)
- 100+ Grandma MP3 預錄
- Streak Freeze deeper integration
- Notification scheduler (expo-notifications)
- IAP / RevenueCat

## Performance backlog

- P0: lazy lesson load (dynamic import per chapter) — agent 報告 P1-1
- P0: production EAS build (Hermes bytecode → dev → prod 快 5-10x)
- P1: image lazy load (RN FastImage if needed)
- P2: SDK 55 upgrade (Hermes V1, bundle ~25% smaller)
