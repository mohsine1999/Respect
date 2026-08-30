import { YStack, XStack, Text, Button, Progress, Theme } from 'tamagui';
import { useMemo } from 'react';
import { DEFAULT_COMMITMENTS } from '../domain/commitments';
import { calculateDailyScore, calculatePossiblePoints, getScoreMessage, getScheduledCommitments, toDateKey } from '../domain/scoring';

export function TodayScreen() {
  const today = useMemo(() => new Date(), []);
  const commitments = DEFAULT_COMMITMENTS;
  const score = calculateDailyScore(commitments, today, {
    date: toDateKey(today),
    recoveryDay: false,
    reflection: '',
    completions: { learning: true, movement: true },
    scheduledCommitmentIds: ['learning', 'movement'],
  });
  const possible = calculatePossiblePoints(commitments, today);
  const scheduled = getScheduledCommitments(commitments, today);
  const progress = possible === 0 ? 0 : Math.min((score / possible) * 100, 100);

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="$background" paddingHorizontal="$lg" paddingTop="$3xl" gap="$lg">
        <Text fontSize={14} color="$colorMuted">Saturday, 29 August</Text>
        <Text fontSize={28} fontWeight="600" color="$color">Good evening</Text>

        <XStack alignItems="center" justifyContent="space-between" paddingVertical="$md">
          <YStack>
            <Text fontSize={52} fontWeight="600" color="$color">{score}</Text>
            <Text fontSize={14} color="$colorMuted">Respect score</Text>
          </YStack>
          <YStack width={90} height={90} borderRadius={45} backgroundColor="$accentSoft" alignItems="center" justifyContent="center">
            <Text fontSize={18} fontWeight="600" color="$accent">{Math.round(progress)}%</Text>
          </YStack>
        </XStack>

        <YStack gap="$xs">
          <Text fontSize={12} color="$colorMuted">{scheduled.length} of {commitments.length} completed</Text>
          <Progress value={progress} max={100} height={8} backgroundColor="$surfacePressed">
            <Progress.Indicator backgroundColor="$accent" />
          </Progress>
        </YStack>

        <Text fontSize={13} color="$colorMuted">{getScoreMessage(score)}</Text>

        <YStack gap="$md">
          <Text fontSize={12} letterSpacing={1.2} textTransform="uppercase" color="$colorMuted">Today</Text>
          {scheduled.map((commitment) => (
            <XStack key={commitment.id} justifyContent="space-between" alignItems="center" backgroundColor="$surface" borderRadius="$md" padding="$md" borderWidth={1} borderColor="$border">
              <YStack flex={1} gap={2}>
                <Text fontSize={16} fontWeight="600" color="$color">{commitment.title}</Text>
                <Text fontSize={12} color="$colorMuted">{commitment.description}</Text>
              </YStack>
              <Text fontSize={14} fontWeight="600" color="$accent">+{commitment.points}</Text>
            </XStack>
          ))}
        </YStack>

        <Button theme="accent" backgroundColor="$accent" borderRadius="$md" height={48}>
          <Button.Text color="$color">Log reflection</Button.Text>
        </Button>
      </YStack>
    </Theme>
  );
}
