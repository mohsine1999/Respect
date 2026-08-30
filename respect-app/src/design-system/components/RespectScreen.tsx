import { YStack, XStack, Theme, ScrollView, Text, View } from 'tamagui';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RespectScreen({
  children,
  title,
  action,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Theme name="light">
      <View flex={1} backgroundColor="$background" paddingTop={insets.top}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack paddingHorizontal="$lg" paddingBottom="$4xl" gap="$lg">
            {(title || action) && (
              <XStack justifyContent="space-between" alignItems="center" paddingTop="$lg">
                {title ? <Text fontSize={20} fontWeight="600" color="$color">{title}</Text> : <View />}
                {action}
              </XStack>
            )}
            {children}
          </YStack>
        </ScrollView>
      </View>
    </Theme>
  );
}
