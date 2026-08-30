import { useEffect, useMemo, useState } from 'react';
import { AppState, useWindowDimensions } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import {
  Calendar,
  CommitmentList,
  EmptyState,
  IconButton,
  Metric,
  ModalSheet,
  ProgressBar,
  RespectScreen,
  ScreenHeader,
  SectionHeader,
  Stat,
  StatusBadge,
  TrendChart,
} from '../components';
import { SettingsIcon } from '../components/Icons';
import { useRespect } from '../data/RespectProvider';
import { calculateDailyScore } from '../domain/scoring';
import { dayRecordHasActivity } from '../domain/history';
import { commitmentConsistency, dashboardMetrics } from '../domain/statistics';
import { useDay } from '../hooks/useDay';
import { AdSlot } from '../monetization';
import { formatLongDate, fromDateKey, recentDateKeys, toDateKey } from '../utils/dates';

export function ProgressScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state } = useRespect();
  const { width } = useWindowDimensions();
  const [anchor, setAnchor] = useState(() => new Date());
  const dates = useMemo(() => recentDateKeys(28, anchor), [anchor]);
  const [selected, setSelected] = useState(toDateKey(anchor));
  const [detailOpen, setDetailOpen] = useState(false);
  const day = useDay(selected);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        const current = new Date();
        setAnchor(current);
        setSelected(toDateKey(current));
      }
    });
    return () => subscription.remove();
  }, []);

  const scores = useMemo(
    () =>
      Object.fromEntries(
        dates.map((date) => {
          const record = state.records[date];
          return [
            date,
            {
              score: calculateDailyScore(state.commitments, fromDateKey(date), record),
              recorded: dayRecordHasActivity(record),
              recovery: record?.recoveryDay,
            },
          ];
        }),
      ),
    [dates, state.commitments, state.records],
  );
  const recordedDates = useMemo(
    () => dates.filter((date) => dayRecordHasActivity(state.records[date])),
    [dates, state.records],
  );
  const metrics = useMemo(
    () => dashboardMetrics(state.commitments, state.records, state.settings.strongDayThreshold, anchor),
    [anchor, state.commitments, state.records, state.settings.strongDayThreshold],
  );
  const consistency = useMemo(
    () =>
      state.commitments
        .filter((commitment) => commitment.enabled)
        .map((commitment) => ({
          commitment,
          value: commitmentConsistency(commitment, state.commitments, state.records, 14, anchor),
        }))
        .sort((a, b) => b.value - a.value),
    [anchor, state.commitments, state.records],
  );

  const checkIns = recordedDates.length;
  const insightUnlocked = checkIns >= 3;
  const selectedHasActivity = dayRecordHasActivity(day.record);
  const selectDate = (date: string) => {
    setSelected(date);
    setDetailOpen(true);
  };

  return (
    <RespectScreen>
      <ScreenHeader
        eyebrow="Patterns, not judgment"
        title="Progress"
        action={
          <IconButton
            label="Open settings"
            icon={<SettingsIcon size={20} color="$textSecondary" />}
            onPress={onOpenSettings}
          />
        }
      />

      {!insightUnlocked ? (
        <YStack p="$xl" br="$xl" bg="$surfaceElevated" bw={1} bc="$border" gap="$lg">
          <YStack gap="$xs">
            <Text fontSize="$title" fw="$semibold" color="$textPrimary">
              Your first useful insight is close.
            </Text>
            <Text fontSize="$body" lineHeight={23} color="$textSecondary">
              Check in on three days before Respect compares your rhythm. Empty days are not treated as failures.
            </Text>
          </YStack>
          <ProgressBar value={(checkIns / 3) * 100} />
          <Text fontSize="$caption" fw="$semibold" color="$accent">
            {checkIns} of 3 check-in days
          </Text>
        </YStack>
      ) : (
        <>
          <YStack p="$xl" br="$xl" bg="$surfaceElevated" bw={1} bc="$border" gap="$lg">
            <SectionHeader title="Your rhythm" detail="Recorded days only" />
            <XStack flexWrap="wrap" gap="$xl">
              <Stat minWidth={width < 380 ? 120 : 80} value={`${metrics.currentStreak}d`} label="Current streak" />
              <Stat minWidth={width < 380 ? 120 : 80} value={`${metrics.sevenDayAverage}`} label="Average score" />
              <Stat minWidth={width < 380 ? 120 : 80} value={metrics.strongDays} label="Strong days" />
            </XStack>
          </YStack>

          <YStack gap="$md">
            <SectionHeader title="Recent scores" detail="Last 7 days" />
            <TrendChart
              points={metrics.trend.slice(-7).map((point) => ({
                label: new Intl.DateTimeFormat('en', { weekday: 'narrow' }).format(fromDateKey(point.date)),
                value: point.score,
                recovery: point.recovery,
              }))}
            />
          </YStack>

          <AdSlot placement="progress-inline" />
        </>
      )}

      <YStack gap="$md">
        <SectionHeader title="Your days" detail="Tap a day for details" />
        <Calendar
          dates={dates}
          scores={scores}
          selected={selected}
          threshold={state.settings.strongDayThreshold}
          onSelect={selectDate}
        />
        <XStack flexWrap="wrap" gap="$xl">
          <StatusBadge label="Strong" tone="success" />
          <StatusBadge label="Recovery" tone="warning" />
          <StatusBadge label="Checked in" />
        </XStack>
      </YStack>

      {insightUnlocked && checkIns >= 7 ? (
        <YStack gap="$lg">
          <SectionHeader title="What feels sustainable" detail="Last 14 days" />
          {consistency.slice(0, 4).map(({ commitment, value }) => (
            <YStack key={commitment.id} gap="$sm">
              <XStack jc="space-between" gap="$md">
                <Text f={1} fontSize="$body" fw="$medium" color="$textPrimary">
                  {commitment.title}
                </Text>
                <Text fontSize="$label" fw="$semibold" color="$textSecondary">
                  {value}%
                </Text>
              </XStack>
              <ProgressBar value={value} />
            </YStack>
          ))}
        </YStack>
      ) : null}

      {recordedDates.length ? (
        <YStack gap="$sm">
          <SectionHeader title="Recent check-ins" />
          {[...recordedDates].reverse().slice(0, 5).map((date) => {
            const item = scores[date];
            return (
              <XStack
                key={date}
                p="$lg"
                ai="center"
                br="$lg"
                bg="$surface"
                bw={1}
                bc="$border"
                gap="$md"
                onPress={() => selectDate(date)}
                pressStyle={{ backgroundColor: '$surfacePressed' }}
              >
                <Text f={1} fontSize="$body" color="$textPrimary">
                  {formatLongDate(fromDateKey(date))}
                </Text>
                <Text fontSize="$bodyStrong" fw="$semibold" color={item?.recovery ? '$warning' : '$accent'}>
                  {item?.recovery ? 'Recovery' : item?.score ?? 0}
                </Text>
              </XStack>
            );
          })}
        </YStack>
      ) : (
        <EmptyState title="No check-ins yet" detail="Complete one promise on Today and your record will begin here." />
      )}

      <ModalSheet open={detailOpen} onOpenChange={setDetailOpen} title={formatLongDate(day.date)}>
        <YStack gap="$xl" pb="$4xl">
          <XStack ai="flex-end" jc="space-between" gap="$lg">
            <Metric value={day.score} label="Daily score" detail={`${day.completed} promises kept`} />
            {day.record?.recoveryDay ? (
              <StatusBadge label="Recovery day" tone="warning" />
            ) : selectedHasActivity && day.score >= state.settings.strongDayThreshold ? (
              <StatusBadge label="Strong day" tone="success" />
            ) : selectedHasActivity ? (
              <StatusBadge label="Checked in" />
            ) : null}
          </XStack>

          {selectedHasActivity && day.record ? (
            <YStack gap="$sm">
              <SectionHeader title="Plan that day" />
              <CommitmentList
                commitments={day.schedule}
                completions={day.record.completions}
                minimumMode={Boolean(day.record.minimumDay)}
                mode="history"
              />
            </YStack>
          ) : (
            <EmptyState title="Nothing logged" detail="This day has no check-ins or note." />
          )}

          {day.record?.reflection ? (
            <YStack p="$lg" br="$lg" bg="$backgroundSubtle" gap="$sm">
              <SectionHeader title="Note" />
              <Text fontSize="$body" lineHeight={23} color="$textSecondary">
                {day.record.reflection}
              </Text>
            </YStack>
          ) : null}
        </YStack>
      </ModalSheet>
    </RespectScreen>
  );
}
