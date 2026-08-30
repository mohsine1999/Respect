import { YStack, XStack, Text, Theme, Switch } from 'tamagui';

export function SettingsScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$lg" paddingTop="$3xl" gap="$lg">
        <Text fontSize={28} fontWeight="600" color="$color">Settings</Text>

        {[
          ['Plan', 'Commitments and schedule'],
          ['Scoring', 'Strong-day threshold and points'],
          ['Appearance', 'Light and dark themes'],
          ['Notifications', 'Daily prompts'],
        ].map(([label, value]) => (
          <XStack key={label} justifyContent="space-between" alignItems="center" backgroundColor="$surface" borderRadius="$md" borderWidth={1} borderColor="$border" padding="$md">
            <YStack>
              <Text fontSize={16} fontWeight="600" color="$color">{label}</Text>
              <Text fontSize={12} color="$colorMuted">{value}</Text>
            </YStack>
            <Switch defaultChecked={label === 'Notifications'} size="$2" />
          </XStack>
        ))}
      </YStack>
    </Theme>
  );
}
