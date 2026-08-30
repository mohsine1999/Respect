import type { Commitment, DayRecord } from './types';
import { resolveDaySchedule } from './scheduling';

export function calculateDailyScore(
  commitments: Commitment[],
  date: Date,
  dayRecord?: DayRecord | null,
): number {
  return resolveDaySchedule(commitments, date, dayRecord).reduce(
    (total, commitment) => total + (dayRecord?.completions[commitment.id] ? commitment.points : 0),
    0,
  );
}

export function calculatePossiblePoints(
  commitments: Commitment[],
  date: Date,
  dayRecord?: DayRecord | null,
): number {
  return resolveDaySchedule(commitments, date, dayRecord).reduce(
    (total, commitment) => total + commitment.points,
    0,
  );
}

export function isStrongDay(score: number, strongThreshold: number): boolean {
  return score >= strongThreshold;
}

export function getScoreMessage(score: number): string {
  if (score <= 39) return 'Start with one.';
  if (score <= 69) return "You're moving.";
  if (score <= 89) return "You're keeping the plan.";
  return 'Strong day.';
}
