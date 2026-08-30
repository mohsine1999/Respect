import { Button, Text, XStack, YStack } from 'tamagui';
import { fromDateKey, WEEKDAY_LABELS } from '../utils/dates';

export function DayCell({
  dateKey,
  score,
  recorded,
  recovery,
  selected,
  threshold,
  onPress,
}: {
  dateKey: string;
  score: number;
  recorded?: boolean;
  recovery?: boolean;
  selected?: boolean;
  threshold: number;
  onPress: () => void;
}) {
  const date = fromDateKey(dateKey);
  const weekday = (date.getDay() + 6) % 7;
  const tone = recovery ? '$warning' : score >= threshold ? '$success' : score > 0 ? '$accent' : '$border';
  const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  const resultLabel = recovery ? 'Recovery day' : recorded ? `Checked in, score ${score}` : 'No check-in';
  return (
    <Button
      unstyled
      f={1}
      ai="center"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel}. ${resultLabel}`}
      accessibilityState={{ selected: Boolean(selected) }}
      pressStyle={{ opacity: 0.7 }}
    >
      <YStack ai="center" gap="$sm" py="$sm">
        <Text fontSize="$caption" color="$textMuted">
          {WEEKDAY_LABELS[weekday]}
        </Text>
        <YStack
          w="$calendar"
          h="$calendar"
          br="$round"
          ai="center"
          jc="center"
          bg={selected ? '$accent' : '$surface'}
          bc={selected ? '$accent' : '$border'}
          bw={1}
        >
          <Text fontSize="$label" fw="$medium" color={selected ? '$accentContrast' : '$textPrimary'}>
            {date.getDate()}
          </Text>
        </YStack>
        <YStack w="$dot" h="$dot" br="$round" bg={tone} />
      </YStack>
    </Button>
  );
}

export function Calendar({
  dates,
  scores,
  selected,
  threshold,
  onSelect,
}: {
  dates: string[];
  scores: Record<string, { score: number; recorded?: boolean; recovery?: boolean }>;
  selected?: string;
  threshold: number;
  onSelect: (date: string) => void;
}) {
  const weeks = Array.from({ length: Math.ceil(dates.length / 7) }, (_, index) => dates.slice(index * 7, index * 7 + 7));
  return (
    <YStack gap="$sm">
      {weeks.map((week, index) => (
        <XStack key={`${week[0]}-${index}`}>
          {week.map((date) => (
            <DayCell
              key={date}
              dateKey={date}
              score={scores[date]?.score ?? 0}
              recorded={scores[date]?.recorded}
              recovery={scores[date]?.recovery}
              selected={selected === date}
              threshold={threshold}
              onPress={() => onSelect(date)}
            />
          ))}
        </XStack>
      ))}
    </YStack>
  );
}
