import type { Commitment, DayRecord } from './types';
import { commitmentAppliesOn } from './commitments';

export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function getScheduledCommitments(commitments: Commitment[], date: Date): Commitment[] {
  return commitments.filter((commitment) => commitmentAppliesOn(commitment, date));
}

export function calculateDailyScore(
  commitments: Commitment[],
  date: Date,
  dayRecord?: DayRecord | null,
): number {
  const scheduled = getScheduledCommitments(commitments, date);
  if (!scheduled.length) return 0;

  let total = 0;
  for (const commitment of scheduled) {
    if (dayRecord?.completions?.[commitment.id]) total += commitment.points;
  }
  return total;
}

export function calculatePossiblePoints(commitments: Commitment[], date: Date): number {
  return getScheduledCommitments(commitments, date).reduce((sum, commitment) => sum + commitment.points, 0);
}

export function isStrongDay(score: number, strongThreshold: number): boolean {
  return score >= strongThreshold;
}

export function calculateStreak(
  commitments: Commitment[],
  dayRecords: Record<string, DayRecord>,
  anchorDate: Date,
  strongThreshold: number,
): number {
  const current = new Date(anchorDate);
  let streak = 0;

  while (true) {
    const key = toDateKey(current);
    const record = dayRecords[key];

    if (record?.recoveryDay) {
      streak += 1;
      current.setDate(current.getDate() - 1);
      continue;
    }

    const scheduled = getScheduledCommitments(commitments, current);
    if (!scheduled.length && !record) {
      break;
    }

    const score = calculateDailyScore(commitments, current, record);
    if (score >= strongThreshold) {
      streak += 1;
      current.setDate(current.getDate() - 1);
      continue;
    }

    break;
  }

  return streak;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getScoreMessage(score: number): string {
  if (score <= 39) return 'Start with one.';
  if (score <= 69) return "You're moving.";
  if (score <= 89) return "You're keeping the plan.";
  return 'Strong day.';
}

export function computeDashboardMetrics(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  strongThreshold: number,
  days = 7,
) {
  const entries: { date: string; score: number; strong: boolean }[] = [];
  const today = new Date();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = toDateKey(date);
    const record = records[key];
    const score = calculateDailyScore(commitments, date, record);
    entries.push({
      date: key,
      score,
      strong: isStrongDay(score, strongThreshold),
    });
  }

  const total = entries.reduce((sum, entry) => sum + entry.score, 0);
  const average = entries.length ? total / entries.length : 0;

  return {
    recent: entries.reverse(),
    average,
    strongDays: entries.filter((entry) => entry.strong).length,
    streak: calculateStreak(commitments, records, today, strongThreshold),
    best: Math.max(...entries.map((entry) => entry.score), 0),
  };
}
