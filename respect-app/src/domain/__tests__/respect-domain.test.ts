import { describe, expect, it } from 'vitest';
import {
  commitmentIsValid,
  createCommitment,
  normalizeWeekdays,
  removeCommitment,
  updateCommitment,
} from '../commitments';
import { createDayRecord, setCompleted, setMinimumDay, setReflection } from '../history';
import { minimumDayIsSatisfied } from '../minimumDay';
import { getScheduledCommitments, resolveDaySchedule } from '../scheduling';
import { calculateDailyScore, isStrongDay } from '../scoring';
import { calculateStreak } from '../streaks';
import type { Commitment, DayRecord } from '../types';
import { migratePersistedState } from '../../data/migrations';

const monday = new Date(2026, 7, 3);

function commitment(id: string, points: number, weekdays = normalizeWeekdays([0])): Commitment {
  return createCommitment(
    {
      id,
      title: id,
      points,
      minimumTarget: 'Small version',
      weekdays,
    },
    '2026-08-01T00:00:00.000Z',
  );
}

describe('scoring and scheduling', () => {
  it('scores only commitments scheduled for that weekday', () => {
    const commitments = [commitment('learning', 30, normalizeWeekdays([0])), commitment('movement', 20, normalizeWeekdays([1]))];
    const record = setCompleted(createDayRecord(commitments, monday), 'learning', true);
    expect(getScheduledCommitments(commitments, monday).map((item) => item.id)).toEqual(['learning']);
    expect(calculateDailyScore(commitments, monday, record)).toBe(30);
  });

  it('uses the configured strong-day boundary', () => {
    expect(isStrongDay(70, 70)).toBe(true);
    expect(isStrongDay(69, 70)).toBe(false);
  });
});

describe('streak behavior', () => {
  it('lets a recovery day continue a streak', () => {
    const commitments = [commitment('daily', 100, normalizeWeekdays([0, 1, 2, 3, 4, 5, 6]))];
    const strong = setCompleted(createDayRecord(commitments, monday), 'daily', true);
    const recovery: DayRecord = { ...createDayRecord(commitments, new Date(2026, 7, 2)), recoveryDay: true };
    expect(calculateStreak(commitments, { '2026-08-03': strong, '2026-08-02': recovery }, monday, 70)).toBe(2);
  });

  it('accepts a completed minimum day even below the strong threshold', () => {
    const commitments = [commitment('small', 10, normalizeWeekdays([0]))];
    const minimum = setMinimumDay(setCompleted(createDayRecord(commitments, monday), 'small', true), true);
    expect(minimumDayIsSatisfied(minimum, resolveDaySchedule(commitments, monday, minimum))).toBe(true);
    expect(calculateStreak(commitments, { '2026-08-03': minimum }, monday, 70)).toBe(1);
  });
});

describe('historical snapshots', () => {
  it('keeps an old score after the live plan points change', () => {
    const original = commitment('learning', 30);
    const record = setCompleted(createDayRecord([original], monday), original.id, true);
    const edited = updateCommitment(original, { points: 5 }, '2026-08-04T00:00:00.000Z');
    expect(calculateDailyScore([edited], monday, record)).toBe(30);
    expect(resolveDaySchedule([edited], monday, record)[0]?.points).toBe(30);
  });

  it('does not lose a snapshot when a commitment is deleted', () => {
    const original = commitment('learning', 30);
    const record = setCompleted(createDayRecord([original], monday), original.id, true);
    expect(calculateDailyScore([], monday, record)).toBe(30);
  });
});

describe('reflections', () => {
  it('completes the original reflection commitment when a reflection is saved', () => {
    const reflection = commitment('reflection', 10);
    const record = setReflection(createDayRecord([reflection], monday), 'One honest sentence.');
    expect(record.reflection).toBe('One honest sentence.');
    expect(record.completions.reflection).toBe(true);
  });
});

describe('commitment operations', () => {
  it('creates, edits, validates, and removes a commitment without mutating its identity', () => {
    const created = commitment('movement', 20);
    const edited = updateCommitment(created, { title: 'Daily movement', points: 25 }, '2026-08-02T00:00:00.000Z');
    expect(commitmentIsValid(edited)).toBe(true);
    expect(edited.id).toBe(created.id);
    expect(edited.title).toBe('Daily movement');
    expect(removeCommitment([edited], edited.id)).toEqual([]);
  });

  it('rejects a commitment with no active schedule', () => {
    expect(commitmentIsValid(commitment('empty', 10, normalizeWeekdays([])))).toBe(false);
  });
});

describe('persistence transformations', () => {
  it('migrates v1 records into versioned snapshots and keeps settings', () => {
    const migrated = migratePersistedState({
      commitments: [commitment('learning', 30)],
      records: {
        '2026-08-03': {
          date: '2026-08-03',
          recoveryDay: false,
          reflection: 'Kept the promise.',
          completions: { learning: true },
          scheduledCommitmentIds: ['learning'],
        },
      },
      settings: { strongDayThreshold: 80, theme: 'dark', notifications: true },
    });
    expect(migrated.version).toBe(2);
    expect(migrated.settings.strongDayThreshold).toBe(80);
    expect(migrated.records['2026-08-03']?.scheduledCommitments?.[0]?.points).toBe(30);
    expect(migrated.records['2026-08-03']?.reflection).toBe('Kept the promise.');
  });
});
