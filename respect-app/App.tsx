import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TamaguiProvider, Theme } from 'tamagui';
import config from './tamagui.config';
import { TodayScreen } from './src/screens/TodayScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Theme name="light">
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Today"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Today" component={TodayScreen} />
            <Stack.Screen name="Plan" component={PlanScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Theme>
    </TamaguiProvider>
  );
}
