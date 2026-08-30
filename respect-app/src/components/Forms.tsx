import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { BackHandler } from 'react-native';
import { Button, Input, Sheet, Text, TextArea, XStack, YStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './Actions';
import { ChevronRightIcon, XIcon } from './Icons';

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
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onOpenChange(false);
      return true;
    });
    return () => subscription.remove();
  }, [onOpenChange, open]);

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      moveOnKeyboardChange
      zIndex={100_000}
    >
      <Sheet.Overlay bg="$overlay" />
      <Sheet.Handle bg="$border" />
      <Sheet.Frame
        width="100%"
        maxWidth={720}
        alignSelf="center"
        bg="$surfaceElevated"
        br="$xl"
        px="$lg"
        pt="$xl"
        pb={Math.max(insets.bottom, 24)}
      >
        <XStack ai="center" jc="space-between" gap="$md" mb="$lg">
          <Text accessibilityRole="header" f={1} fontSize="$title" fw="$semibold" color="$textPrimary">
            {title}
          </Text>
          <IconButton
            label={`Close ${title}`}
            icon={<XIcon size={18} color="$textSecondary" />}
            onPress={() => onOpenChange(false)}
          />
        </XStack>
        <Sheet.ScrollView f={1} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </Sheet.ScrollView>
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
