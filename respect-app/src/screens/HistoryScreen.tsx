import { YStack, XStack, Text, Theme, YGroup } from 'tamagui';

export function HistoryScreen() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dots = [1, 1, 1, 0, 1, 0, 0];

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$lg" paddingTop="$3xl" gap="$lg">
        <Text fontSize={28} fontWeight="600" color="$color">History</Text>

        <YStack backgroundColor="$surface" borderRadius="$lg" borderWidth={1} borderColor="$border" padding="$lg">
          <Text fontSize={14} color="$colorMuted" marginBottom="$md">August 2026</Text>
          <XStack justifyContent="space-between">
            {days.map((day, index) => (
              <YStack key={day + index} alignItems="center" gap="$sm">
                <Text fontSize={12} color="$colorMuted">{day}</Text>
                <YGroup width={12} height={12} borderRadius={12} backgroundColor={dots[index] ? '$success' : '$surfacePressed'} />
              </YStack>
            ))}
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  );
}
