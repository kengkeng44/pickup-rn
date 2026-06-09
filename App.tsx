/**
 * Pickup-RN App entry — Bottom tabs + Map → Lesson nested stack.
 *
 * Tab layout (對齊 web wordwar BottomNav):
 *   Map / Tasks / Cards / Alerts / Profile (5)
 */
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// 攔截 Expo Go 自動 hide splash, 等我們預載完再 hide
SplashScreen.preventAutoHideAsync().catch(() => {});
import MapScreen from './src/screens/MapScreen';
import LessonScreen from './src/screens/LessonScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TasksScreen from './src/screens/TasksScreen';
import CardsScreen from './src/screens/CardsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import { useRunStore } from './src/store/runStore';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 30 : 26, opacity: focused ? 1 : 0.55 }}>{label}</Text>;
}

import { startBgm, setBgmMuted } from './src/audio/bgm';

export default function App() {
  const recordVisit = useRunStore((s) => s.recordVisitToday);
  const muted = useRunStore((s) => s.muted);
  const [ready, setReady] = useState(false);
  useEffect(() => { recordVisit(); }, []);
  useEffect(() => { startBgm(muted); }, []);
  useEffect(() => { setBgmMuted(muted); }, [muted]);
  // Splash hide 直到 main UI 真的 mount, 用戶看到的「載入感」短很多
  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 100);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { backgroundColor: '#fff7e8', borderTopWidth: 3, borderTopColor: '#c8a878', height: 70 },
            tabBarIcon: ({ focused }) => {
              const map: Record<string, string> = {
                MapTab: '🐾', TasksTab: '⭐', CardsTab: '📒', AlertsTab: '🔥', ProfileTab: '🐱',
              };
              return <TabIcon label={map[route.name] ?? '?'} focused={focused} />;
            },
          })}
        >
          <Tab.Screen name="MapTab" component={MapStack} />
          <Tab.Screen name="TasksTab" component={TasksScreen} />
          <Tab.Screen name="CardsTab" component={CardsScreen} />
          <Tab.Screen name="AlertsTab" component={AlertsScreen} />
          <Tab.Screen name="ProfileTab" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
