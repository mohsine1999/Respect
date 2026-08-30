import type { Commitment, CommitmentSnapshot } from '../domain/types';
import { Button, Text, XStack, YStack } from 'tamagui';
import { Check, Circle, ChevronRight } from '@tamagui/lucide-icons';
import { scheduleLabel } from '../domain/scheduling';
import { StatusBadge } from './Actions';

export function CommitmentRow({
  commitment,
  completed,
  onToggle,
  onPress,
  mode = 'today',
}: {
  commitment: Commitment | CommitmentSnapshot;
  completed?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  mode?: 'today' | 'plan' | 'history';
}) {
  const target = commitment.description || commitment.minimumTarget;
  const weekdays = 'weekdays' in commitment ? scheduleLabel(commitment.weekdays) : undefined;
  return (
    <Button
      unstyled
      onPress={onToggle ?? onPress}
      py="$md"
      bw={0}
      borderBottomWidth={1}
      bc="$border"
      pressStyle={{ backgroundColor: '$backgroundSubtle' }}
    >
      <XStack ai="center" gap="$md">
        {mode === 'today' || mode === 'history' ? (
          <YStack w="$icon" h="$icon" ai="center" jc="center">
            {completed ? <Check size={20} color="$success" /> : <Circle size={20} color="$textMuted" />}
          </YStack>
        ) : null}
        <YStack f={1} gap="$xs">
          <XStack ai="center" gap="$sm">
            <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
              {commitment.title}
            </Text>
            {mode === 'plan' ? (
              <StatusBadge
                label={'enabled' in commitment && commitment.enabled ? 'Active' : 'Paused'}
                tone={'enabled' in commitment && commitment.enabled ? 'success' : 'neutral'}
              />
            ) : null}
          </XStack>
          {target ? (
            <Text fontSize="$caption" color="$textSecondary">
              {target}
            </Text>
          ) : null}
          {mode === 'plan' ? (
            <Text fontSize="$caption" color="$textMuted">
              {weekdays} · Minimum: {commitment.minimumTarget || 'Not set'}
            </Text>
          ) : null}
        </YStack>
        <YStack ai="flex-end" gap="$xs">
          <Text fontSize="$label" fw="$semibold" color={completed ? '$success' : '$accent'}>
            +{commitment.points}
          </Text>
          {mode === 'plan' ? <ChevronRight size={16} color="$textMuted" /> : null}
        </YStack>
      </XStack>
    </Button>
  );
}

export function CommitmentList({
  commitments,
  completions = {},
  onToggle,
  onPress,
  mode = 'today',
}: {
  commitments: Array<Commitment | CommitmentSnapshot>;
  completions?: Record<string, boolean>;
  onToggle?: (id: string) => void;
  onPress?: (commitment: Commitment | CommitmentSnapshot) => void;
  mode?: 'today' | 'plan' | 'history';
}) {
  return (
    <YStack>
      {commitments.map((commitment) => (
        <CommitmentRow
          key={commitment.id}
          commitment={commitment}
          completed={Boolean(completions[commitment.id])}
          onToggle={onToggle ? () => onToggle(commitment.id) : undefined}
          onPress={onPress ? () => onPress(commitment) : undefined}
          mode={mode}
        />
      ))}
    </YStack>
  );
}
