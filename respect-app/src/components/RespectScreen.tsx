import type { ReactNode } from 'react';
import { ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RespectScreen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? 16 : width >= 768 ? 32 : 20;
  const content = (
    <YStack
      width="100%"
      maxWidth={720}
      alignSelf="center"
      px={horizontalPadding}
      pt="$lg"
      pb="$5xl"
      gap="$2xl"
      minHeight="100%"
    >
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
  leading,
  action,
}: {
  title: string;
  eyebrow?: string;
  leading?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <XStack ai="flex-start" jc="space-between" gap="$lg">
      {leading}
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
        letterSpacing={0.2}
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
