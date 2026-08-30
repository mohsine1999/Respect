import { describe, expect, it } from 'vitest';
import { calculateDailyScore, calculateStreak, getScheduledCommitments, isStrongDay } from '../scoring';
import { commitmentIsValid, createCommitment, normalizeWeekdays } from '../commitments';
import type { Commitment } from '../types';
import { createDayRecord } from '../history';

describe('Respect domain logic', () => {
  it('scores only scheduled commitments for the day', () => {
    const commitments: Commitment[] = [
      createCommitment({ id: 'a', title: 'Learning', points: 30, weekdays: normalizeWeekdays([0]) }),
      createCommitment({ id: 'b', title: 'Movement', points: 20, weekdays: normalizeWeekdays([1]) }),
    ];

    const record = createDayRecord('2026-08-03', {
      a: true,
      b: false,
    });

    expect(calculateDailyScore(commitments, new Date('2026-08-03'), record)).toBe(30);
  });

  it('treats strong day threshold correctly', () => {
    expect(isStrongDay(70, 70)).toBe(true);
    expect(isStrongDay(69, 70)).toBe(false);
  });

  it('calculates streaks with recovery days', () => {
    const commitments: Commitment[] = [
      createCommitment({ id: 'a', title: 'Learning', points: 100, weekdays: normalizeWeekdays([0]) }),
    ];

    const records: Record<string, ReturnType<typeof createDayRecord>> = {
      '2026-08-03': createDayRecord('2026-08-03', { a: true }),
      '2026-08-02': createDayRecord('2026-08-02', {}, true),
    };

    expect(calculateStreak(commitments, records, new Date('2026-08-03'), 70)).toBe(2);
  });

  it('returns empty score when no commitments exist', () => {
    expect(calculateDailyScore([], new Date(), createDayRecord('2026-08-03', {}))).toBe(0);
  });

  it('rejects invalid commitments', () => {
    const invalid = createCommitment({ id: 'bad', title: ' ', points: -5, weekdays: normalizeWeekdays([0]) });
    expect(commitmentIsValid(invalid)).toBe(false);
  });

  it('schedules based on weekday', () => {
    const commitments: Commitment[] = [
      createCommitment({ id: 'daily', title: 'Daily', points: 10, weekdays: normalizeWeekdays([0, 1, 2, 3, 4, 5, 6]) }),
    ];

    expect(getScheduledCommitments(commitments, new Date('2026-08-03')).length).toBe(1);
  });
});
