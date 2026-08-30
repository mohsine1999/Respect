import type { Commitment, DayRecord } from './types';
import { calculateDailyScore } from './scoring';
import { minimumDayIsSatisfied } from './minimumDay';
import { resolveDaySchedule } from './scheduling';
import { addDays, fromDateKey, toDateKey } from '../utils/dates';

export function dayContinuesStreak(
  commitments: Commitment[],
  date: Date,
  record: DayRecord | undefined,
  strongThreshold: number,
): boolean {
  if (record?.recoveryDay) return true;
  const schedule = resolveDaySchedule(commitments, date, record);
  if (!schedule.length) return false;
  if (minimumDayIsSatisfied(record, schedule)) return true;
  return calculateDailyScore(commitments, date, record) >= strongThreshold;
}

export function calculateStreak(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  anchorDate: Date,
  strongThreshold: number,
): number {
  let streak = 0;
  let current = new Date(anchorDate);
  while (streak <= 3660) {
    const record = records[toDateKey(current)];
    if (!dayContinuesStreak(commitments, current, record, strongThreshold)) break;
    streak += 1;
    current = addDays(current, -1);
  }
  return streak;
}

export function calculateBestStreak(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  strongThreshold: number,
): number {
  const keys = Object.keys(records).sort();
  if (!keys.length) return 0;
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return 0;
  let current = fromDateKey(first);
  const end = fromDateKey(last);
  let running = 0;
  let best = 0;
  while (current <= end) {
    const record = records[toDateKey(current)];
    if (dayContinuesStreak(commitments, current, record, strongThreshold)) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
    current = addDays(current, 1);
  }
  return best;
}
