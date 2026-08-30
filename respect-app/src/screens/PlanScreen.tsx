import { YStack, XStack, Text, Button, Theme } from 'tamagui';
import { DEFAULT_COMMITMENTS } from '../domain/commitments';

export function PlanScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$lg" paddingTop="$3xl" gap="$lg">
        <Text fontSize={28} fontWeight="600" color="$color">Plan</Text>

        {DEFAULT_COMMITMENTS.map((commitment) => (
          <YStack key={commitment.id} backgroundColor="$surface" borderRadius="$md" borderWidth={1} borderColor="$border" padding="$md" gap="$sm">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={18} fontWeight="600" color="$color">{commitment.title}</Text>
              <Button backgroundColor="$accentSoft" borderRadius="$sm">
                <Button.Text color="$accent">Edit</Button.Text>
              </Button>
            </XStack>

            <Text fontSize={12} color="$colorMuted">{commitment.minimumTarget}</Text>
            <Text fontSize={12} color="$colorMuted">
              {commitment.weekdays.filter(Boolean).length} active days • {commitment.points} points
            </Text>
          </YStack>
        ))}

        <Button theme="accent" backgroundColor="$accent" borderRadius="$md" height={48}>
          <Button.Text color="$color">Add commitment</Button.Text>
        </Button>
      </YStack>
    </Theme>
  );
}
