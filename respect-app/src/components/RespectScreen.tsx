import type { ReactNode } from 'react';
import { ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RespectScreen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const content = (
    <YStack px="$lg" pt="$lg" pb="$5xl" gap="$xl" minHeight="100%">
      {children}
    </YStack>
  );

  return (
    <View f={1} bg="$background" pt={insets.top}>
      {scroll ? <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
    </View>
  );
}

export function ScreenHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <XStack ai="flex-start" jc="space-between" gap="$lg">
      <YStack f={1} gap="$xs">
        {eyebrow ? (
          <Text fontSize="$caption" color="$textMuted">
            {eyebrow}
          </Text>
        ) : null}
        <Text fontFamily="$heading" fontSize="$headline" lineHeight="$headline" fw="$semibold" color="$textPrimary">
          {title}
        </Text>
      </YStack>
      {action}
    </XStack>
  );
}

export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <XStack ai="center" jc="space-between" gap="$md">
      <Text
        fontSize="$sectionTitle"
        lineHeight="$sectionTitle"
        fw="$semibold"
        letterSpacing={1.2}
        textTransform="uppercase"
        color="$textSecondary"
      >
        {title}
      </Text>
      {detail ? (
        <Text fontSize="$caption" color="$textMuted">
          {detail}
        </Text>
      ) : null}
    </XStack>
  );
}
