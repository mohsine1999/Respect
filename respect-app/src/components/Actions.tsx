import type { ReactNode } from 'react';
import { Button, Text, XStack } from 'tamagui';

interface ActionProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ children, onPress, disabled }: ActionProps) {
  return (
    <Button
      h="$control"
      bg="$accent"
      br="$md"
      bw={0}
      opacity={disabled ? 0.5 : 1}
      disabled={disabled}
      onPress={onPress}
      pressStyle={{ opacity: 0.86, scale: 0.99 }}
    >
      <Text fontSize="$bodyStrong" fw="$semibold" color="$accentContrast">
        {children}
      </Text>
    </Button>
  );
}

export function SecondaryButton({ children, onPress, disabled }: ActionProps) {
  return (
    <Button
      h="$control"
      bg="$surface"
      br="$md"
      bw={1}
      bc="$border"
      opacity={disabled ? 0.5 : 1}
      disabled={disabled}
      onPress={onPress}
      pressStyle={{ backgroundColor: '$surfacePressed', scale: 0.99 }}
    >
      <Text fontSize="$bodyStrong" fw="$medium" color="$textPrimary">
        {children}
      </Text>
    </Button>
  );
}

export function IconButton({ icon, label, onPress }: { icon: ReactNode; label: string; onPress?: () => void }) {
  return (
    <Button
      unstyled
      accessibilityLabel={label}
      w="$icon"
      h="$icon"
      br="$round"
      bg="$surface"
      ai="center"
      jc="center"
      onPress={onPress}
      pressStyle={{ backgroundColor: '$surfacePressed', scale: 0.96 }}
    >
      {icon}
    </Button>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Button
      unstyled
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      br="$sm"
      bg={selected ? '$accentSoft' : '$surface'}
      bc={selected ? '$accent' : '$border'}
      bw={1}
      px="$md"
      py="$sm"
      minHeight={44}
      ai="center"
      jc="center"
      pressStyle={{ backgroundColor: '$surfacePressed' }}
    >
      <Text fontSize="$label" fw="$medium" color={selected ? '$accent' : '$textSecondary'}>
        {label}
      </Text>
    </Button>
  );
}

export function StatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const color = tone === 'success' ? '$success' : tone === 'warning' ? '$warning' : tone === 'danger' ? '$danger' : '$textMuted';
  return (
    <XStack ai="center" gap="$xs">
      <XStack w="$dot" h="$dot" br="$round" bg={color} />
      <Text fontSize="$caption" fw="$medium" color={color}>
        {label}
      </Text>
    </XStack>
  );
}
