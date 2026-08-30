import { describe, expect, it } from 'vitest';
import {
  commitmentIsValid,
  createCommitment,
  createStarterCommitments,
  DEFAULT_STARTER_IDS,
  normalizeWeekdays,
  removeCommitment,
  updateCommitment,
} from '../commitments';
import { createDayRecord, dayRecordHasActivity, setCompleted, setMinimumDay, setReflection } from '../history';
import { minimumDayIsSatisfied } from '../minimumDay';
import { getScheduledCommitments, resolveDaySchedule } from '../scheduling';
import { calculateDailyScore, isStrongDay } from '../scoring';
import { calculateBestStreak, calculateStreak } from '../streaks';
import { averageScore, commitmentConsistency, trendForDays } from '../statistics';
import type { Commitment, DayRecord } from '../types';
import { createDefaultState, migratePersistedState } from '../../data/migrations';

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
    expect(calculateDailyScore(commitments, monday, record)).toBe(100);
  });

  it('normalizes any custom point total to a 0–100 score', () => {
    const commitments = [commitment('priority', 30), commitment('light', 10)];
    const record = setCompleted(createDayRecord(commitments, monday), 'priority', true);
    expect(calculateDailyScore(commitments, monday, record)).toBe(75);
  });

  it('does not penalize an unfinished optional commitment', () => {
    const core = commitment('core', 20);
    const optional = createCommitment({ ...commitment('optional', 30), required: false });
    const record = setCompleted(createDayRecord([core, optional], monday), 'core', true);
    expect(calculateDailyScore([core, optional], monday, record)).toBe(100);
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

  it('requires every core promise on a minimum day even when no smaller target is set', () => {
    const core = createCommitment({
      id: 'core',
      title: 'Core promise',
      points: 20,
      minimumTarget: '',
      weekdays: normalizeWeekdays([0]),
    });
    const minimum = setMinimumDay(createDayRecord([core], monday), true);
    expect(minimumDayIsSatisfied(minimum, resolveDaySchedule([core], monday, minimum))).toBe(false);
  });

  it('skips scheduled off-days without breaking or inflating a streak', () => {
    const weekdays = [commitment('weekday', 20, normalizeWeekdays([0, 1, 2, 3, 4]))];
    const friday = new Date(2026, 7, 7);
    const nextMonday = new Date(2026, 7, 10);
    const fridayStrong = setCompleted(createDayRecord(weekdays, friday), 'weekday', true);
    const mondayStrong = setCompleted(createDayRecord(weekdays, nextMonday), 'weekday', true);
    const records = { '2026-08-07': fridayStrong, '2026-08-10': mondayStrong };
    expect(calculateStreak(weekdays, records, nextMonday, 70)).toBe(2);
    expect(calculateBestStreak(weekdays, records, 70)).toBe(2);
  });

  it('treats only the explicit anchor as an unfinished open day', () => {
    const weekdays = [commitment('weekday', 20, normalizeWeekdays([0, 1, 2, 3, 4]))];
    const friday = new Date(2026, 7, 7);
    const nextMonday = new Date(2026, 7, 10);
    const fridayStrong = setCompleted(createDayRecord(weekdays, friday), 'weekday', true);
    expect(calculateStreak(weekdays, { '2026-08-07': fridayStrong }, nextMonday, 70)).toBe(1);
  });
});

describe('historical snapshots', () => {
  it('keeps an old score after the live plan points change', () => {
    const original = commitment('learning', 30);
    const record = setCompleted(createDayRecord([original], monday), original.id, true);
    const edited = updateCommitment(original, { points: 5 }, '2026-08-04T00:00:00.000Z');
    expect(calculateDailyScore([edited], monday, record)).toBe(100);
    expect(resolveDaySchedule([edited], monday, record)[0]?.points).toBe(30);
  });

  it('does not lose a snapshot when a commitment is deleted', () => {
    const original = commitment('learning', 30);
    const record = setCompleted(createDayRecord([original], monday), original.id, true);
    expect(calculateDailyScore([], monday, record)).toBe(100);
  });
});

describe('reflections', () => {
  it('completes the original reflection commitment when a reflection is saved', () => {
    const reflection = commitment('reflection', 10);
    const record = setReflection(createDayRecord([reflection], monday), 'One honest sentence.');
    expect(record.reflection).toBe('One honest sentence.');
    expect(record.completions.reflection).toBe(true);
  });

  it('uses an explicit reflection kind instead of a hidden identifier', () => {
    const journal = createCommitment({
      id: 'evening-journal',
      kind: 'reflection',
      title: 'Evening journal',
      points: 10,
      weekdays: normalizeWeekdays([0]),
    });
    const record = setReflection(createDayRecord([journal], monday), 'Noticed what worked.');
    expect(record.completions['evening-journal']).toBe(true);
  });
});

describe('meaningful check-ins', () => {
  it('does not treat an untouched snapshot as a completed check-in day', () => {
    const empty = createDayRecord([commitment('core', 20)], monday);
    expect(dayRecordHasActivity(empty)).toBe(false);
    expect(dayRecordHasActivity(setCompleted(empty, 'core', true))).toBe(true);
  });

  it('excludes empty snapshots and recovery days from score averages and consistency', () => {
    const core = commitment('core', 20, normalizeWeekdays([0, 1, 2, 3, 4, 5, 6]));
    const anchor = new Date(2026, 7, 3);
    const empty = createDayRecord([core], new Date(2026, 7, 1));
    const recovery = { ...createDayRecord([core], new Date(2026, 7, 2)), recoveryDay: true };
    const complete = setCompleted(createDayRecord([core], anchor), 'core', true);
    const records = { '2026-08-01': empty, '2026-08-02': recovery, '2026-08-03': complete };
    const trend = trendForDays([core], records, 70, 3, anchor);
    expect(averageScore(trend)).toBe(100);
    expect(commitmentConsistency(core, [core], records, 3, anchor)).toBe(100);
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
    expect(migrated.version).toBe(3);
    expect(migrated.profile.onboardingCompleted).toBe(true);
    expect(migrated.settings.strongDayThreshold).toBe(80);
    expect(migrated.records['2026-08-03']?.scheduledCommitments?.[0]?.points).toBe(30);
    expect(migrated.records['2026-08-03']?.reflection).toBe('Kept the promise.');
  });

  it('rebuilds the full v1 schedule instead of mistaking completed IDs for the plan', () => {
    const first = commitment('first', 20);
    const second = commitment('second', 20);
    const migrated = migratePersistedState({
      commitments: [first, second],
      records: {
        '2026-08-03': {
          completions: { first: true, second: false },
          scheduledCommitmentIds: ['first'],
        },
      },
      settings: {},
    });
    const record = migrated.records['2026-08-03'];
    expect(record?.scheduledCommitments?.map((item) => item.id)).toEqual(['first', 'second']);
    expect(calculateDailyScore(migrated.commitments, monday, record)).toBe(50);
  });

  it('keeps v2 snapshots immutable while applying the normalized v3 score model', () => {
    const first = commitment('first', 30);
    const second = commitment('second', 40);
    const original = createDayRecord([first, second], monday);
    const migrated = migratePersistedState({
      version: 2,
      commitments: [first, second],
      records: {
        '2026-08-03': setCompleted(original, 'first', true),
      },
      settings: { strongDayThreshold: 70 },
    });
    expect(calculateDailyScore(migrated.commitments, monday, migrated.records['2026-08-03'])).toBe(43);
  });

  it('starts new installs empty and incomplete, ready for owned onboarding', () => {
    const state = createDefaultState();
    expect(state.version).toBe(3);
    expect(state.profile.onboardingCompleted).toBe(false);
    expect(state.commitments).toEqual([]);
  });

  it('preserves an intentionally empty plan during migration', () => {
    const migrated = migratePersistedState({ version: 2, commitments: [], records: {}, settings: {} });
    expect(migrated.commitments).toEqual([]);
    expect(migrated.profile.onboardingCompleted).toBe(true);
  });

  it('creates only the selected generic starter promises', () => {
    const starters = createStarterCommitments(DEFAULT_STARTER_IDS);
    expect(starters.map((item) => item.id)).toEqual(DEFAULT_STARTER_IDS);
    expect(starters.some((item) => item.title.toLowerCase().includes('snooker'))).toBe(false);
  });
});
