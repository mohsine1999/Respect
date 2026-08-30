import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Button, Text, XStack, YStack } from 'tamagui';
import { CalendarDays, ChartNoAxesColumnIncreasing, ListChecks, Settings, Sun } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons = {
  Today: Sun,
  Plan: ListChecks,
  History: CalendarDays,
  Dashboard: ChartNoAxesColumnIncreasing,
  Settings,
};

export function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <XStack bg="$surfaceElevated" borderTopWidth={1} bc="$border" px="$sm" pb={Math.max(insets.bottom, 8)} pt="$sm">
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = icons[route.name as keyof typeof icons] ?? Sun;
        return (
          <Button
            unstyled
            key={route.key}
            f={1}
            ai="center"
            py="$xs"
            onPress={() => navigation.navigate(route.name)}
            pressStyle={{ opacity: 0.65 }}
          >
            <YStack ai="center" gap="$xs">
              <Icon size={20} color={focused ? '$accent' : '$textMuted'} />
              <Text fontSize="$caption" fw={focused ? '$semibold' : '$regular'} color={focused ? '$accent' : '$textMuted'}>
                {route.name === 'Dashboard' ? 'Change' : route.name}
              </Text>
            </YStack>
          </Button>
        );
      })}
    </XStack>
  );
}
