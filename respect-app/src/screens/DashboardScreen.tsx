import { YStack, XStack, Text, Theme, YGroup } from 'tamagui';

export function DashboardScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$lg" paddingTop="$3xl" gap="$lg">
        <Text fontSize={28} fontWeight="600" color="$color">Dashboard</Text>

        <XStack gap="$md">
          <YStack flex={1} backgroundColor="$surface" borderRadius="$md" borderWidth={1} borderColor="$border" padding="$md">
            <Text fontSize={12} color="$colorMuted">Current streak</Text>
            <Text fontSize={32} fontWeight="600" color="$color">7 days</Text>
          </YStack>
          <YStack flex={1} backgroundColor="$surface" borderRadius="$md" borderWidth={1} borderColor="$border" padding="$md">
            <Text fontSize={12} color="$colorMuted">7-day avg</Text>
            <Text fontSize={32} fontWeight="600" color="$color">82%</Text>
          </YStack>
        </XStack>

        <YStack backgroundColor="$surface" borderRadius="$lg" borderWidth={1} borderColor="$border" padding="$lg" gap="$md">
          <Text fontSize={14} color="$colorMuted">Commitment consistency</Text>
          {[
            ['Spanish', 86],
            ['Movement', 71],
            ['Sport', 64],
          ].map(([label, value]) => (
            <YStack key={label} gap={6}>
              <XStack justifyContent="space-between">
                <Text fontSize={12} color="$colorMuted">{label}</Text>
                <Text fontSize={12} color="$color">{value}%</Text>
              </XStack>
              <YGroup height={8} borderRadius={999} backgroundColor="$surfacePressed" overflow="hidden">
                <YGroup width={`${value}%`} height={8} backgroundColor="$accent" />
              </YGroup>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </Theme>
  );
}
