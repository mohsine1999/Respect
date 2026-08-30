import { getTokens, Text, useTheme, XStack, YStack } from 'tamagui';
import Svg, { Circle } from 'react-native-svg';

export function ScoreRing({ score, progress }: { score: number; progress: number }) {
  const theme = useTheme();
  const tokens = getTokens();
  const size = Number(tokens.size.scoreRing.val);
  const stroke = Number(tokens.size.ringStroke.val);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(progress, 100)) / 100);

  return (
    <YStack w="$scoreRing" h="$scoreRing" ai="center" jc="center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border.val}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.accent.val}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <YStack position="absolute" ai="center">
        <Text fontSize="$metric" lineHeight="$metric" fw="$semibold" color="$textPrimary">
          {score}
        </Text>
        <Text fontSize="$caption" color="$textMuted">
          score
        </Text>
      </YStack>
    </YStack>
  );
}

export function Metric({ value, label, detail }: { value: string | number; label: string; detail?: string }) {
  return (
    <YStack gap="$xs">
      <Text fontSize="$metric" lineHeight="$metric" fw="$semibold" color="$textPrimary">
        {value}
      </Text>
      <Text fontSize="$label" fw="$medium" color="$textSecondary">
        {label}
      </Text>
      {detail ? (
        <Text fontSize="$caption" color="$textMuted">
          {detail}
        </Text>
      ) : null}
    </YStack>
  );
}

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <YStack f={1} gap="$xs" py="$sm">
      <Text fontSize="$title" lineHeight="$title" fw="$semibold" color="$textPrimary">
        {value}
      </Text>
      <Text fontSize="$caption" color="$textMuted">
        {label}
      </Text>
    </YStack>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = `${Math.max(0, Math.min(value, 100))}%` as `${number}%`;
  return (
    <YStack h="$progress" br="$round" bg="$surfacePressed" overflow="hidden">
      <YStack h="$progress" w={width} br="$round" bg="$accent" />
    </YStack>
  );
}

export function TrendChart({ points }: { points: Array<{ label: string; value: number; recovery?: boolean }> }) {
  return (
    <XStack h="$scoreRing" ai="flex-end" gap="$xs" pt="$sm">
      {points.map((point, index) => {
        const height = `${Math.max(6, Math.min(point.value, 100))}%` as `${number}%`;
        return (
          <YStack key={`${point.label}-${index}`} f={1} h="100%" jc="flex-end" ai="center" gap="$xs">
            <YStack
              w="100%"
              h={height}
              br="$xs"
              bg={point.recovery ? '$warning' : '$accent'}
              opacity={point.value || point.recovery ? 1 : 0.18}
            />
            <Text fontSize="$caption" color="$textMuted">
              {point.label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
}
