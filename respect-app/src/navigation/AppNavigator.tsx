import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { View, YStack } from 'tamagui';
import { BottomNavigation } from '../components';
import { PlanScreen } from '../screens/PlanScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import type { TabName } from './types';

export function AppNavigator() {
  const [activeRoute, setActiveRoute] = useState<TabName>('Today');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (settingsOpen) {
        setSettingsOpen(false);
        return true;
      }
      if (activeRoute !== 'Today') {
        setActiveRoute('Today');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [activeRoute, settingsOpen]);

  if (settingsOpen) {
    return (
      <SettingsScreen
        onBack={() => setSettingsOpen(false)}
        onOpenPlan={() => {
          setActiveRoute('Plan');
          setSettingsOpen(false);
        }}
      />
    );
  }

  const openSettings = () => setSettingsOpen(true);
  const openPlan = () => setActiveRoute('Plan');

  return (
    <YStack f={1}>
      <View
        f={1}
        display={activeRoute === 'Today' ? 'flex' : 'none'}
        accessibilityElementsHidden={activeRoute !== 'Today'}
        importantForAccessibility={activeRoute === 'Today' ? 'auto' : 'no-hide-descendants'}
      >
        <TodayScreen onOpenSettings={openSettings} onOpenPlan={openPlan} />
      </View>
      <View
        f={1}
        display={activeRoute === 'Progress' ? 'flex' : 'none'}
        accessibilityElementsHidden={activeRoute !== 'Progress'}
        importantForAccessibility={activeRoute === 'Progress' ? 'auto' : 'no-hide-descendants'}
      >
        <ProgressScreen onOpenSettings={openSettings} />
      </View>
      <View
        f={1}
        display={activeRoute === 'Plan' ? 'flex' : 'none'}
        accessibilityElementsHidden={activeRoute !== 'Plan'}
        importantForAccessibility={activeRoute === 'Plan' ? 'auto' : 'no-hide-descendants'}
      >
        <PlanScreen onOpenSettings={openSettings} active={activeRoute === 'Plan'} />
      </View>
      <BottomNavigation activeRoute={activeRoute} onNavigate={setActiveRoute} />
    </YStack>
  );
}
