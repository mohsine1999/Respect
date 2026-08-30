import { useEffect, useRef, useState } from 'react';
import type { Commitment, CommitmentSnapshot } from '../domain/types';
import { Animated } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { scheduleLabel } from '../domain/scheduling';
import { StatusBadge } from './Actions';
import { CheckIcon, ChevronRightIcon, CircleIcon } from './Icons';

export function CommitmentRow({
  commitment,
  completed,
  onToggle,
  onPress,
  minimumMode = false,
  mode = 'today',
}: {
  commitment: Commitment | CommitmentSnapshot;
  completed?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  minimumMode?: boolean;
  mode?: 'today' | 'plan' | 'history';
}) {
  const target = minimumMode
    ? commitment.minimumTarget || commitment.description
    : commitment.description || commitment.minimumTarget;
  const weekdays = 'weekdays' in commitment ? scheduleLabel(commitment.weekdays) : undefined;
  const importance = commitment.points >= 25 ? 'Priority' : commitment.points <= 15 ? 'Light' : 'Standard';
  const opensReflection = mode === 'today' && commitment.kind === 'reflection';
  const [checkScale] = useState(() => new Animated.Value(1));
  const previousCompleted = useRef(completed);

  useEffect(() => {
    if (completed && completed !== previousCompleted.current) {
      checkScale.setValue(0.78);
      Animated.spring(checkScale, {
        toValue: 1,
        damping: 12,
        stiffness: 220,
        mass: 0.6,
        useNativeDriver: true,
      }).start();
    }
    previousCompleted.current = completed;
  }, [checkScale, completed]);

  return (
    <Button
      unstyled
      onPress={onToggle ?? onPress}
      accessibilityRole={opensReflection ? 'button' : mode === 'today' ? 'checkbox' : mode === 'plan' ? 'button' : 'text'}
      accessibilityLabel={`${commitment.title}${target ? `. ${target}` : ''}${opensReflection ? (completed ? '. Note saved. Opens note editor' : '. Opens note editor') : mode === 'today' ? (completed ? '. Completed' : '. Not completed') : ''}`}
      accessibilityState={mode === 'today' && !opensReflection ? { checked: Boolean(completed) } : undefined}
      p="$lg"
      bw={1}
      br="$lg"
      bg={completed ? '$accentSoft' : '$surface'}
      bc={completed ? '$accent' : '$border'}
      opacity={'enabled' in commitment && !commitment.enabled ? 0.62 : 1}
      pressStyle={mode === 'history' ? undefined : { backgroundColor: '$surfacePressed', scale: 0.99 }}
    >
      <XStack ai="center" gap="$md">
        {mode === 'today' || mode === 'history' ? (
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <YStack
              w="$icon"
              h="$icon"
              br="$round"
              ai="center"
              jc="center"
              bg={completed ? '$success' : '$backgroundSubtle'}
              bw={completed ? 0 : 1}
              bc="$border"
            >
              {completed ? <CheckIcon size={20} color="$successContrast" /> : <CircleIcon size={19} color="$textMuted" />}
            </YStack>
          </Animated.View>
        ) : null}
        <YStack f={1} gap="$xs">
          <XStack ai="center" gap="$sm">
            <Text
              f={1}
              minWidth={0}
              numberOfLines={2}
              fontSize="$bodyStrong"
              fw="$semibold"
              color="$textPrimary"
            >
              {commitment.title}
            </Text>
            {mode === 'plan' ? (
              <StatusBadge
                label={'enabled' in commitment && commitment.enabled ? 'Active' : 'Paused'}
                tone={'enabled' in commitment && commitment.enabled ? 'success' : 'neutral'}
              />
            ) : null}
            {mode !== 'plan' && !commitment.required ? <StatusBadge label="Optional" /> : null}
          </XStack>
          {target ? (
            <Text fontSize="$caption" color="$textSecondary">
              {target}
            </Text>
          ) : null}
          {mode === 'plan' ? (
            <Text fontSize="$caption" color="$textMuted">
              {weekdays} · {importance} importance{commitment.required ? '' : ' · Optional'}
            </Text>
          ) : null}
        </YStack>
        <YStack ai="flex-end" gap="$xs">
          {mode === 'plan' ? <ChevronRightIcon size={16} color="$textMuted" /> : null}
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
  minimumMode = false,
  mode = 'today',
}: {
  commitments: (Commitment | CommitmentSnapshot)[];
  completions?: Record<string, boolean>;
  onToggle?: (id: string) => void;
  onPress?: (commitment: Commitment | CommitmentSnapshot) => void;
  minimumMode?: boolean;
  mode?: 'today' | 'plan' | 'history';
}) {
  return (
    <YStack gap="$sm">
      {commitments.map((commitment) => (
        <CommitmentRow
          key={commitment.id}
          commitment={commitment}
          completed={Boolean(completions[commitment.id])}
          onToggle={onToggle ? () => onToggle(commitment.id) : undefined}
          onPress={onPress ? () => onPress(commitment) : undefined}
          minimumMode={minimumMode}
          mode={mode}
        />
      ))}
    </YStack>
  );
}
