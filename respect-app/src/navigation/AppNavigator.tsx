import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from '../components';
import { DashboardScreen } from '../screens/DashboardScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TodayScreen } from '../screens/TodayScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, lazy: true }} tabBar={(props) => <BottomNavigation {...props} />}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
