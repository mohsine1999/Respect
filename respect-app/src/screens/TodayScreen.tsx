import { useEffect, useMemo, useState } from 'react';
import { AppState, useWindowDimensions } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import * as Haptics from 'expo-haptics';
import {
  CommitmentList,
  EmptyState,
  IconButton,
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
import { CheckIcon, CircleIcon, SettingsIcon, XIcon } from '../components/Icons';
import { useRespect } from '../data/RespectProvider';
import { useDay } from '../hooks/useDay';
import { formatLongDate, getGreeting, toDateKey } from '../utils/dates';

export function TodayScreen({
  onOpenSettings,
  onOpenPlan,
}: {
  onOpenSettings: () => void;
  onOpenPlan: () => void;
}) {
  const [today, setToday] = useState(() => new Date());
  const dateKey = toDateKey(today);
  const day = useDay(dateKey);
  const { width } = useWindowDimensions();
  const {
    state,
    toggleCompletion,
    updateReflection,
    updateRecoveryDay,
    updateMinimumDay,
    updateProfile,
  } = useRespect();
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [dayOptionsOpen, setDayOptionsOpen] = useState(false);
  const [reflection, setReflectionDraft] = useState(day.record?.reflection ?? '');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') setToday(new Date());
    });
    return () => subscription.remove();
  }, []);

  const openReflection = () => {
    setReflectionDraft(day.record?.reflection ?? '');
    setDayOptionsOpen(false);
    setReflectionOpen(true);
  };

  const handleToggle = (commitmentId: string) => {
    void Haptics.selectionAsync();
    const commitment = day.schedule.find((item) => item.id === commitmentId);
    if (commitment?.kind === 'reflection') {
      openReflection();
      return;
    }
    toggleCompletion(dateKey, commitmentId);
  };

  const saveReflection = () => {
    updateReflection(dateKey, reflection);
    setReflectionOpen(false);
  };

  const setDayMode = (mode: 'standard' | 'minimum' | 'recovery') => {
    if (mode === 'recovery') updateRecoveryDay(dateKey, true);
    else if (mode === 'minimum') updateMinimumDay(dateKey, true);
    else if (day.record?.recoveryDay) updateRecoveryDay(dateKey, false);
    else if (day.record?.minimumDay) updateMinimumDay(dateKey, false);
    setDayOptionsOpen(false);
  };

  const greeting = state.profile.displayName
    ? `${getGreeting(today)}, ${state.profile.displayName}`
    : getGreeting(today);
  const hasAnyCheckIn = useMemo(
    () => Object.values(state.records).some((record) => Object.values(record.completions).some(Boolean)),
    [state.records],
  );
  const recordedDays = Object.values(state.records).filter((record) =>
    Object.values(record.completions).some(Boolean),
  ).length;
  const gettingStartedComplete = hasAnyCheckIn && state.profile.planCoachmarkSeen && recordedDays >= 2;
  const showGettingStarted = !state.profile.gettingStartedDismissed && !gettingStartedComplete;

  return (
    <RespectScreen>
      <ScreenHeader
        eyebrow={formatLongDate(today)}
        title={greeting}
        action={
          <IconButton
            label="Open settings"
            icon={<SettingsIcon size={20} color="$textSecondary" />}
            onPress={onOpenSettings}
          />
        }
      />

      <YStack
        p="$xl"
        br="$xl"
        bg="$surfaceElevated"
        bw={1}
        bc="$border"
        gap="$xl"
        flexDirection={width < 400 ? 'column' : 'row'}
        ai="center"
      >
        <ScoreRing score={day.score} progress={day.progress} />
        <YStack f={1} width={width < 400 ? '100%' : undefined} gap="$md">
          <YStack gap="$xs">
            <Text fontSize="$title" fw="$semibold" color="$textPrimary">
              {day.record?.recoveryDay
                ? 'Recovery is part of the plan.'
                : day.planComplete
                  ? 'You kept today’s plan.'
                  : day.message}
            </Text>
            <Text fontSize="$body" color="$textSecondary">
              {day.schedule.length
                ? `${day.completed} of ${day.schedule.length} promises kept`
                : 'Your day is open.'}
            </Text>
          </YStack>
          <ProgressBar value={day.progress} />
          <XStack jc="space-between" ai="center">
            <Text fontSize="$caption" color="$textMuted">
              {day.planComplete
                ? 'Complete'
                : day.required
                  ? `${day.remaining} core item${day.remaining === 1 ? '' : 's'} left`
                  : 'Optional plan'}
            </Text>
            {day.minimumSatisfied ? <StatusBadge label="Minimum met" tone="success" /> : null}
          </XStack>
        </YStack>
      </YStack>

      {showGettingStarted ? (
        <GettingStartedCard
          firstCheckInDone={hasAnyCheckIn}
          planSeen={state.profile.planCoachmarkSeen}
          returnDone={recordedDays >= 2}
          onOpenPlan={onOpenPlan}
          onDismiss={() => updateProfile({ gettingStartedDismissed: true })}
        />
      ) : null}

      <YStack gap="$md">
        <SectionHeader
          title="Your plan today"
          detail={day.schedule.length ? (day.planComplete ? 'Complete' : `${day.remaining} core remaining`) : undefined}
        />
        {day.schedule.length ? (
          <CommitmentList
            commitments={day.schedule}
            completions={day.record?.completions}
            minimumMode={Boolean(day.record?.minimumDay)}
            onToggle={handleToggle}
          />
        ) : (
          <EmptyState
            title="Shape your day"
            detail="Your plan is empty. Add two or three promises you can genuinely keep."
            action={<PrimaryButton onPress={onOpenPlan}>Open my plan</PrimaryButton>}
          />
        )}
      </YStack>

      {day.schedule.length ? (
        <YStack gap="$sm">
          <SecondaryButton onPress={openReflection}>
            {day.record?.reflection ? 'Edit today’s note' : 'Add today’s note'}
          </SecondaryButton>
          <Button unstyled py="$sm" onPress={() => setDayOptionsOpen(true)} pressStyle={{ opacity: 0.65 }}>
            <Text fontSize="$label" fw="$semibold" color="$accent" textAlign="center">
              Need a lighter day? Adjust today
            </Text>
          </Button>
        </YStack>
      ) : null}

      <ModalSheet open={dayOptionsOpen} onOpenChange={setDayOptionsOpen} title="Adjust today">
        <YStack gap="$xl" pb="$4xl">
          <Text fontSize="$body" color="$textSecondary">
            Plans should bend without breaking. This changes today only.
          </Text>
          <YStack gap="$sm">
            <DayModeRow
              title="Standard day"
              detail="Use your normal targets."
              selected={!day.record?.recoveryDay && !day.record?.minimumDay}
              onPress={() => setDayMode('standard')}
            />
            {state.settings.minimumDayEnabled ? (
              <DayModeRow
                title="Minimum day"
                detail="Keep the smallest honest version of each core promise."
                selected={Boolean(day.record?.minimumDay)}
                onPress={() => setDayMode('minimum')}
              />
            ) : null}
            <DayModeRow
              title="Recovery day"
              detail="Protect your streak while you deliberately recover."
              selected={Boolean(day.record?.recoveryDay)}
              onPress={() => setDayMode('recovery')}
            />
          </YStack>
          <SecondaryButton onPress={openReflection}>
            {day.record?.reflection ? 'Edit today’s note' : 'Add today’s note'}
          </SecondaryButton>
        </YStack>
      </ModalSheet>

      <ModalSheet open={reflectionOpen} onOpenChange={setReflectionOpen} title="Today’s note">
        <YStack gap="$xl" pb="$3xl">
          <ReflectionInput value={reflection} onChangeText={setReflectionDraft} />
          <PrimaryButton onPress={saveReflection}>Save note</PrimaryButton>
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}

function GettingStartedCard({
  firstCheckInDone,
  planSeen,
  returnDone,
  onOpenPlan,
  onDismiss,
}: {
  firstCheckInDone: boolean;
  planSeen: boolean;
  returnDone: boolean;
  onOpenPlan: () => void;
  onDismiss: () => void;
}) {
  const complete = [firstCheckInDone, planSeen, returnDone].filter(Boolean).length;
  return (
    <YStack p="$lg" br="$lg" bg="$accentSoft" gap="$md">
      <XStack ai="flex-start" jc="space-between" gap="$md">
        <YStack f={1} gap="$xs">
          <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
            Getting started · {complete}/3
          </Text>
          <Text fontSize="$caption" color="$textSecondary">
            Learn by using the real app.
          </Text>
        </YStack>
        <IconButton label="Dismiss getting started" icon={<XIcon size={17} color="$textMuted" />} onPress={onDismiss} />
      </XStack>
      <GettingStartedRow done={firstCheckInDone} label="Complete one check-in" />
      <GettingStartedRow done={planSeen} label="Open Plan and see what you can change" onPress={onOpenPlan} />
      <GettingStartedRow done={returnDone} label="Come back tomorrow" />
    </YStack>
  );
}

function GettingStartedRow({ done, label, onPress }: { done: boolean; label: string; onPress?: () => void }) {
  return (
    <Button unstyled disabled={!onPress} onPress={onPress} pressStyle={onPress ? { opacity: 0.65 } : undefined}>
      <XStack ai="center" gap="$sm">
        {done ? <CheckIcon size={18} color="$success" /> : <CircleIcon size={18} color="$textMuted" />}
        <Text
          f={1}
          fontSize="$label"
          color={done ? '$textMuted' : '$textPrimary'}
          textDecorationLine={done ? 'line-through' : 'none'}
        >
          {label}
        </Text>
      </XStack>
    </Button>
  );
}

function DayModeRow({
  title,
  detail,
  selected,
  onPress,
}: {
  title: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      unstyled
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      p="$lg"
      br="$lg"
      bg={selected ? '$accentSoft' : '$surface'}
      bw={1}
      bc={selected ? '$accent' : '$border'}
      pressStyle={{ backgroundColor: '$surfacePressed', scale: 0.99 }}
    >
      <XStack gap="$md" ai="center">
        {selected ? <CheckIcon size={20} color="$accent" /> : <CircleIcon size={20} color="$textMuted" />}
        <YStack f={1} gap="$xs">
          <Text fontSize="$bodyStrong" fw="$semibold" color="$textPrimary">
            {title}
          </Text>
          <Text fontSize="$caption" color="$textSecondary">
            {detail}
          </Text>
        </YStack>
      </XStack>
    </Button>
  );
}
