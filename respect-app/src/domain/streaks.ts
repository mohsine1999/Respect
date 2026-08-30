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
  return streakDayStatus(commitments, date, record, strongThreshold) === 'continues';
}

type StreakDayStatus = 'continues' | 'breaks' | 'neutral';

function streakDayStatus(
  commitments: Commitment[],
  date: Date,
  record: DayRecord | undefined,
  strongThreshold: number,
): StreakDayStatus {
  if (record?.recoveryDay) return 'continues';
  const schedule = resolveDaySchedule(commitments, date, record);
  if (!schedule.length) return 'neutral';
  if (minimumDayIsSatisfied(record, schedule)) return 'continues';
  return calculateDailyScore(commitments, date, record) >= strongThreshold ? 'continues' : 'breaks';
}

export function calculateStreak(
  commitments: Commitment[],
  records: Record<string, DayRecord>,
  anchorDate: Date,
  strongThreshold: number,
): number {
  let streak = 0;
  let scannedDays = 0;
  let current = new Date(anchorDate);
  let anchorIsOpen = true;
  while (scannedDays <= 3660) {
    const record = records[toDateKey(current)];
    const status = streakDayStatus(commitments, current, record, strongThreshold);
    if (status === 'breaks') {
      if (!anchorIsOpen) break;
    } else if (status === 'continues') {
      streak += 1;
    }
    anchorIsOpen = false;
    scannedDays += 1;
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
    const status = streakDayStatus(commitments, current, record, strongThreshold);
    if (status === 'continues') {
      running += 1;
      best = Math.max(best, running);
    } else if (status === 'breaks') {
      running = 0;
    }
    current = addDays(current, 1);
  }
  return best;
}
