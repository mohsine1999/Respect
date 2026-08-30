import type { Commitment, DayRecord } from './types';
import { resolveDaySchedule } from './scheduling';

export function calculateDailyScore(
  commitments: Commitment[],
  date: Date,
  dayRecord?: DayRecord | null,
): number {
  const schedule = resolveDaySchedule(commitments, date, dayRecord);
  const scoredSchedule = schedule.filter(
    (commitment) => commitment.required || Boolean(dayRecord?.completions[commitment.id]),
  );
  const possible = scoredSchedule.reduce((total, commitment) => total + commitment.points, 0);
  if (!possible) return 0;
  const earned = scoredSchedule.reduce(
    (total, commitment) => total + (dayRecord?.completions[commitment.id] ? commitment.points : 0),
    0,
  );
  return Math.round((earned / possible) * 100);
}

export function calculatePossiblePoints(
  commitments: Commitment[],
  date: Date,
  dayRecord?: DayRecord | null,
): number {
  return resolveDaySchedule(commitments, date, dayRecord)
    .filter((commitment) => commitment.required || Boolean(dayRecord?.completions[commitment.id]))
    .reduce(
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
