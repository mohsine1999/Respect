import { useMemo, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import {
  Chip,
  CommitmentList,
  EmptyState,
  ModalSheet,
  PrimaryButton,
  ProgressBar,
  ReflectionInput,
  RespectScreen,
  ScoreRing,
  ScreenHeader,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../components';
import { useRespect } from '../data/RespectProvider';
import { useDay } from '../hooks/useDay';
import { formatLongDate, getGreeting, toDateKey } from '../utils/dates';

export function TodayScreen() {
  const today = useMemo(() => new Date(), []);
  const dateKey = toDateKey(today);
  const day = useDay(dateKey);
  const { state, toggleCompletion, updateReflection, updateRecoveryDay, updateMinimumDay } = useRespect();
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflection, setReflectionDraft] = useState(day.record?.reflection ?? '');

  const handleToggle = (commitmentId: string) => {
    void Haptics.selectionAsync();
    toggleCompletion(dateKey, commitmentId);
  };

  const openReflection = () => {
    setReflectionDraft(day.record?.reflection ?? '');
    setReflectionOpen(true);
  };

  const saveReflection = () => {
    updateReflection(dateKey, reflection);
    setReflectionOpen(false);
  };

  return (
    <RespectScreen>
      <ScreenHeader eyebrow={formatLongDate(today)} title={getGreeting(today)} />

      <XStack ai="center" jc="space-between" gap="$2xl" py="$sm">
        <ScoreRing score={day.score} progress={day.progress} />
        <YStack f={1} gap="$md">
          <YStack gap="$xs">
            <Text fontSize="$title" fw="$semibold" color="$textPrimary">
              {day.message}
            </Text>
            <Text fontSize="$body" color="$textSecondary">
              {day.completed} of {day.schedule.length} completed
            </Text>
          </YStack>
          <ProgressBar value={day.progress} />
          <Text fontSize="$caption" color="$textMuted">
            {day.remaining === 0 ? 'Plan complete' : `${day.remaining} remaining`}
          </Text>
        </YStack>
      </XStack>

      <XStack flexWrap="wrap" gap="$sm">
        <Chip
          label={day.record?.recoveryDay ? 'Recovery active' : 'Recovery day'}
          selected={day.record?.recoveryDay}
          onPress={() => updateRecoveryDay(dateKey, !day.record?.recoveryDay)}
        />
        {state.settings.minimumDayEnabled ? (
          <Chip
            label={day.minimumSatisfied ? 'Minimum complete' : 'Minimum day'}
            selected={day.record?.minimumDay}
            onPress={() => updateMinimumDay(dateKey, !day.record?.minimumDay)}
          />
        ) : null}
      </XStack>

      <YStack gap="$sm">
        <SectionHeader title="Today" detail={`${day.possible} points available`} />
        {day.schedule.length ? (
          <CommitmentList
            commitments={day.schedule}
            completions={day.record?.completions}
            onToggle={handleToggle}
          />
        ) : (
          <EmptyState title="A clear day" detail="Nothing is scheduled. Use Plan to shape the day." />
        )}
      </YStack>

      <YStack gap="$md">
        {day.record?.reflection ? <StatusBadge label="Reflection saved" tone="success" /> : null}
        <SecondaryButton onPress={openReflection}>
          {day.record?.reflection ? 'Edit reflection' : 'Write reflection'}
        </SecondaryButton>
      </YStack>

      <ModalSheet open={reflectionOpen} onOpenChange={setReflectionOpen} title="Reflection">
        <YStack gap="$xl" pb="$3xl">
          <ReflectionInput value={reflection} onChangeText={setReflectionDraft} />
          <PrimaryButton onPress={saveReflection}>Save reflection</PrimaryButton>
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
