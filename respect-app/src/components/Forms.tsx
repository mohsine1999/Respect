import type { ComponentProps, ReactNode } from 'react';
import { Button, Input, ScrollView, Sheet, Text, TextArea, XStack, YStack } from 'tamagui';
import { ChevronRightIcon } from './Icons';

export function ModalSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[88]} dismissOnSnapToBottom>
      <Sheet.Overlay bg="$overlay" />
      <Sheet.Handle bg="$border" />
      <Sheet.Frame bg="$surfaceElevated" br="$xl" px="$lg" pt="$xl" pb="$3xl">
        <Text fontSize="$title" fw="$semibold" color="$textPrimary" mb="$lg">
          {title}
        </Text>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

export function FormField({ label, hint, ...props }: ComponentProps<typeof Input> & { label: string; hint?: string }) {
  return (
    <YStack gap="$sm">
      <Text fontSize="$label" fw="$medium" color="$textSecondary">
        {label}
      </Text>
      <Input
        h="$control"
        bg="$surface"
        bc="$border"
        br="$md"
        color="$textPrimary"
        placeholderTextColor="$textMuted"
        focusStyle={{ borderColor: '$accent' }}
        {...props}
      />
      {hint ? (
        <Text fontSize="$caption" color="$textMuted">
          {hint}
        </Text>
      ) : null}
    </YStack>
  );
}

export function ReflectionInput({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) {
  return (
    <YStack gap="$sm">
      <Text fontSize="$label" fw="$medium" color="$textSecondary">
        One honest sentence
      </Text>
      <TextArea
        value={value}
        onChangeText={onChangeText}
        minHeight="$scoreRing"
        bg="$surface"
        bc="$border"
        br="$md"
        color="$textPrimary"
        placeholder="What went well? What is the next right move?"
        placeholderTextColor="$textMuted"
        focusStyle={{ borderColor: '$accent' }}
      />
    </YStack>
  );
}

export function SettingRow({
  label,
  detail,
  value,
  control,
  onPress,
  danger = false,
}: {
  label: string;
  detail?: string;
  value?: string;
  control?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Button
      unstyled
      onPress={onPress}
      py="$md"
      borderBottomWidth={1}
      bc="$border"
      pressStyle={onPress ? { backgroundColor: '$backgroundSubtle' } : undefined}
    >
      <XStack ai="center" gap="$md">
        <YStack f={1} gap="$xs">
          <Text fontSize="$bodyStrong" fw="$medium" color={danger ? '$danger' : '$textPrimary'}>
            {label}
          </Text>
          {detail ? (
            <Text fontSize="$caption" color="$textMuted">
              {detail}
            </Text>
          ) : null}
        </YStack>
        {value ? (
          <Text fontSize="$label" color="$textSecondary">
            {value}
          </Text>
        ) : null}
        {control}
        {onPress && !control ? <ChevronRightIcon size={17} color="$textMuted" /> : null}
      </XStack>
    </Button>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <YStack ai="center" gap="$sm" py="$4xl">
      <Text fontSize="$title" fw="$semibold" color="$textPrimary" textAlign="center">
        {title}
      </Text>
      <Text fontSize="$body" color="$textSecondary" textAlign="center">
        {detail}
      </Text>
      {action ? <YStack mt="$md">{action}</YStack> : null}
    </YStack>
  );
}
