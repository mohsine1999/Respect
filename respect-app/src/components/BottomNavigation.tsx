import { Button, Text, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabName } from '../navigation/types';
import { ChartIcon, ListChecksIcon, SunIcon } from './Icons';

const icons = {
  Today: SunIcon,
  Progress: ChartIcon,
  Plan: ListChecksIcon,
};

const routes: TabName[] = ['Today', 'Progress', 'Plan'];

export function BottomNavigation({ activeRoute, onNavigate }: { activeRoute: TabName; onNavigate: (route: TabName) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <YStack bg="$surfaceElevated" borderTopWidth={1} bc="$border" pb={Math.max(insets.bottom, 8)} pt="$sm">
      <XStack width="100%" maxWidth={720} alignSelf="center" px="$md">
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
              accessibilityRole="tab"
              accessibilityLabel={route}
              accessibilityState={{ selected: focused }}
              onPress={() => onNavigate(route)}
              pressStyle={{ opacity: 0.65, scale: 0.98 }}
            >
              <YStack ai="center" gap="$xs">
                <Icon size={21} color={focused ? '$accent' : '$textMuted'} />
                <Text
                  fontSize="$caption"
                  fw={focused ? '$semibold' : '$regular'}
                  color={focused ? '$accent' : '$textMuted'}
                >
                  {route}
                </Text>
              </YStack>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
