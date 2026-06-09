/**
 * Pickup-RN BGM manager — port from web wordwar/src/audio/bgm.ts.
 *
 * 用 expo-av Audio.Sound loop peace.mp3 (3:50 piano).
 * mute setting 從 runStore 讀 (web 跟 RN 都同邏輯).
 */
import { Audio } from 'expo-av';

let bgmSound: Audio.Sound | null = null;
let started = false;

export async function startBgm(muted: boolean): Promise<void> {
  if (started) return;
  started = true;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/peace.mp3'),
      { isLooping: true, volume: muted ? 0 : 0.4 },
    );
    bgmSound = sound;
    await sound.playAsync();
  } catch (e) {
    console.warn('BGM start failed', e);
  }
}

export async function setBgmMuted(muted: boolean): Promise<void> {
  if (!bgmSound) return;
  try { await bgmSound.setVolumeAsync(muted ? 0 : 0.4); } catch {}
}

export async function stopBgm(): Promise<void> {
  if (!bgmSound) return;
  try { await bgmSound.stopAsync(); await bgmSound.unloadAsync(); } catch {}
  bgmSound = null;
  started = false;
}
