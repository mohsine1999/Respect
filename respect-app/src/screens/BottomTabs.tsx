import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from './TodayScreen';
import { PlanScreen } from './PlanScreen';
import { HistoryScreen } from './HistoryScreen';
import { DashboardScreen } from './DashboardScreen';
import { SettingsScreen } from './SettingsScreen';

const Tab = createBottomTabNavigator();

export function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
