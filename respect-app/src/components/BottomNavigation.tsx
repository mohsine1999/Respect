import { Button, Text, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabName } from '../navigation/types';
import { CalendarIcon, ChartIcon, ListChecksIcon, SettingsIcon, SunIcon } from './Icons';

const icons = {
  Today: SunIcon,
  Plan: ListChecksIcon,
  History: CalendarIcon,
  Dashboard: ChartIcon,
  Settings: SettingsIcon,
};

const routes: TabName[] = ['Today', 'Plan', 'History', 'Dashboard', 'Settings'];

export function BottomNavigation({ activeRoute, onNavigate }: { activeRoute: TabName; onNavigate: (route: TabName) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <XStack bg="$surfaceElevated" borderTopWidth={1} bc="$border" px="$sm" pb={Math.max(insets.bottom, 8)} pt="$sm">
      {routes.map((route) => {
        const focused = activeRoute === route;
        const Icon = icons[route];
        return (
          <Button
            unstyled
            key={route}
            f={1}
            ai="center"
            py="$xs"
            onPress={() => onNavigate(route)}
            pressStyle={{ opacity: 0.65 }}
          >
            <YStack ai="center" gap="$xs">
              <Icon size={20} color={focused ? '$accent' : '$textMuted'} />
              <Text fontSize="$caption" fw={focused ? '$semibold' : '$regular'} color={focused ? '$accent' : '$textMuted'}>
                {route === 'Dashboard' ? 'Change' : route}
              </Text>
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
