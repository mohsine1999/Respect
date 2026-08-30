import { useMemo } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { ProgressBar, RespectScreen, ScreenHeader, SectionHeader, Stat, TrendChart } from '../components';
import { useRespect } from '../data/RespectProvider';
import { commitmentConsistency, dashboardMetrics } from '../domain/statistics';
import { fromDateKey } from '../utils/dates';

export function DashboardScreen() {
  const { state } = useRespect();
  const metrics = useMemo(
    () => dashboardMetrics(state.commitments, state.records, state.settings.strongDayThreshold),
    [state],
  );
  const consistency = useMemo(
    () =>
      state.commitments
        .filter((commitment) => commitment.enabled)
        .map((commitment) => ({
          commitment,
          value: commitmentConsistency(commitment, state.commitments, state.records, 14),
        })),
    [state],
  );

  return (
    <RespectScreen>
      <ScreenHeader eyebrow="Am I actually changing?" title="Change" />

      <YStack gap="$md">
        <SectionHeader title="Momentum" detail="Last 14 days" />
        <XStack gap="$2xl" borderBottomWidth={1} bc="$border" pb="$md">
          <Stat value={`${metrics.currentStreak}d`} label="Current streak" />
          <Stat value={`${metrics.bestStreak}d`} label="Best streak" />
          <Stat value={`${metrics.sevenDayAverage}`} label="7-day average" />
        </XStack>
        <XStack gap="$2xl">
          <Stat value={`${metrics.fourteenDayAverage}`} label="14-day average" />
          <Stat value={metrics.strongDays} label="Strong days" />
          <Stat value={metrics.recoveryDays} label="Recovery days" />
        </XStack>
      </YStack>

      <YStack gap="$md">
        <SectionHeader title="Score trend" />
        <TrendChart
          points={metrics.trend.map((point) => ({
            label: new Intl.DateTimeFormat('en', { weekday: 'narrow' }).format(fromDateKey(point.date)),
            value: point.score,
            recovery: point.recovery,
          }))}
        />
      </YStack>

      <YStack gap="$lg">
        <SectionHeader title="Commitment consistency" detail="14 days" />
        {consistency.map(({ commitment, value }) => (
          <YStack key={commitment.id} gap="$sm">
            <XStack jc="space-between">
              <Text fontSize="$body" fw="$medium" color="$textPrimary">
                {commitment.title}
              </Text>
              <Text fontSize="$label" color="$textSecondary">
                {value}%
              </Text>
            </XStack>
            <ProgressBar value={value} />
          </YStack>
        ))}
      </YStack>
    </RespectScreen>
  );
}
