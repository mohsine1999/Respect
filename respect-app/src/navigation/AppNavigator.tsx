import { useState } from 'react';
import { YStack } from 'tamagui';
import { BottomNavigation } from '../components';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import type { TabName } from './types';

export function AppNavigator() {
  const [activeRoute, setActiveRoute] = useState<TabName>('Today');

  const screen = {
    Today: <TodayScreen />,
    Plan: <PlanScreen />,
    History: <HistoryScreen />,
    Dashboard: <DashboardScreen />,
    Settings: <SettingsScreen onOpenPlan={() => setActiveRoute('Plan')} />,
  }[activeRoute];

  return (
    <YStack f={1}>
      <YStack f={1}>{screen}</YStack>
      <BottomNavigation activeRoute={activeRoute} onNavigate={setActiveRoute} />
    </YStack>
  );
}
