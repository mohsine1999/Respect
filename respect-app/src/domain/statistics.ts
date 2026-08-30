import type { Commitment, DayRecord } from './types';
import { calculateDailyScore, isStrongDay } from './scoring';
import { resolveDaySchedule } from './scheduling';
import { calculateBestStreak, calculateStreak } from './streaks';
import { fromDateKey, recentDateKeys } from '../utils/dates';

export interface TrendPoint {
  date: string;
  score: number;
  recovery: boolean;
  strong: boolean;
}

export function trendForDays(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  threshold: number,
  days: number,
  anchor = new Date(),
): TrendPoint[] {
  return recentDateKeys(days, anchor).map((date) => {
    const record = records[date];
    const score = calculateDailyScore(commitments, fromDateKey(date), record);
    return { date, score, recovery: Boolean(record?.recoveryDay), strong: isStrongDay(score, threshold) };
  });
}

export function averageScore(points: TrendPoint[]): number {
  return points.length ? Math.round(points.reduce((sum, point) => sum + point.score, 0) / points.length) : 0;
}

export function commitmentConsistency(
  commitment: Commitment,
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  days: number,
  anchor = new Date(),
): number {
  let scheduled = 0;
  let completed = 0;
  for (const key of recentDateKeys(days, anchor)) {
    const record = records[key];
    const schedule = resolveDaySchedule(commitments, fromDateKey(key), record);
    if (schedule.some((item) => item.id === commitment.id)) {
      scheduled += 1;
      if (record?.completions[commitment.id]) completed += 1;
    }
  }
  return scheduled ? Math.round((completed / scheduled) * 100) : 0;
}

export function dashboardMetrics(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  threshold: number,
  anchor = new Date(),
) {
  const seven = trendForDays(commitments, records, threshold, 7, anchor);
  const fourteen = trendForDays(commitments, records, threshold, 14, anchor);
  return {
    currentStreak: calculateStreak(commitments, records, anchor, threshold),
    bestStreak: calculateBestStreak(commitments, records, threshold),
    sevenDayAverage: averageScore(seven),
    fourteenDayAverage: averageScore(fourteen),
    strongDays: fourteen.filter((point) => point.strong).length,
    recoveryDays: fourteen.filter((point) => point.recovery).length,
    trend: fourteen,
  };
}
