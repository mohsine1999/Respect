import { useMemo, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import {
  Calendar,
  CommitmentList,
  EmptyState,
  Metric,
  ModalSheet,
  RespectScreen,
  ScreenHeader,
  SectionHeader,
  StatusBadge,
} from '../components';
import { useRespect } from '../data/RespectProvider';
import { calculateDailyScore } from '../domain/scoring';
import { useDay } from '../hooks/useDay';
import { formatLongDate, formatMonthYear, fromDateKey, recentDateKeys, toDateKey } from '../utils/dates';

export function HistoryScreen() {
  const { state } = useRespect();
  const dates = useMemo(() => recentDateKeys(28), []);
  const [selected, setSelected] = useState(toDateKey(new Date()));
  const [detailOpen, setDetailOpen] = useState(false);
  const day = useDay(selected);
  const scores = useMemo(
    () =>
      Object.fromEntries(
        dates.map((date) => {
          const record = state.records[date];
          return [
            date,
            {
              score: calculateDailyScore(state.commitments, fromDateKey(date), record),
              recovery: record?.recoveryDay,
            },
          ];
        }),
      ),
    [dates, state],
  );

  const selectDate = (date: string) => {
    setSelected(date);
    setDetailOpen(true);
  };

  return (
    <RespectScreen>
      <ScreenHeader eyebrow="Your record, not a verdict" title="History" />

      <YStack gap="$md">
        <SectionHeader title={formatMonthYear(fromDateKey(selected))} detail="Last 28 days" />
        <Calendar
          dates={dates}
          scores={scores}
          selected={selected}
          threshold={state.settings.strongDayThreshold}
          onSelect={selectDate}
        />
        <XStack gap="$xl">
          <StatusBadge label="Strong" tone="success" />
          <StatusBadge label="Recovery" tone="warning" />
          <StatusBadge label="Open" />
        </XStack>
      </YStack>

      <YStack gap="$sm">
        <SectionHeader title="Recent days" />
        {[...dates].reverse().slice(0, 7).map((date) => {
          const item = scores[date];
          return (
            <XStack key={date} py="$md" ai="center" borderBottomWidth={1} bc="$border" onPress={() => selectDate(date)}>
              <Text f={1} fontSize="$body" color="$textPrimary">
                {formatLongDate(fromDateKey(date))}
              </Text>
              <Text fontSize="$bodyStrong" fw="$semibold" color={item?.recovery ? '$warning' : '$textPrimary'}>
                {item?.recovery ? 'Recovery' : `${item?.score ?? 0}`}
              </Text>
            </XStack>
          );
        })}
      </YStack>

      <ModalSheet open={detailOpen} onOpenChange={setDetailOpen} title={formatLongDate(day.date)}>
        <YStack gap="$xl" pb="$4xl">
          <XStack ai="flex-end" jc="space-between">
            <Metric value={day.score} label="Respect score" detail={`${day.completed} of ${day.schedule.length} completed`} />
            {day.record?.recoveryDay ? (
              <StatusBadge label="Recovery day" tone="warning" />
            ) : day.score >= state.settings.strongDayThreshold ? (
              <StatusBadge label="Strong day" tone="success" />
            ) : (
              <StatusBadge label="Open day" />
            )}
          </XStack>

          {day.record ? (
            <YStack gap="$sm">
              <SectionHeader title="Plan snapshot" detail={`${day.possible} points`} />
              <CommitmentList
                commitments={day.schedule}
                completions={day.record.completions}
                mode="history"
              />
            </YStack>
          ) : (
            <EmptyState title="Nothing logged" detail="This day has no check-ins or reflection." />
          )}

          {day.record?.reflection ? (
            <YStack gap="$sm">
              <SectionHeader title="Reflection" />
              <Text fontSize="$body" color="$textSecondary">
                {day.record.reflection}
              </Text>
            </YStack>
          ) : null}
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
