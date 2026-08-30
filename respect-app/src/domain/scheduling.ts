import type { Commitment, CommitmentSnapshot, DayRecord } from './types';
import { weekdayIndex } from '../utils/dates';

export function commitmentAppliesOn(commitment: Commitment, date: Date): boolean {
  return Boolean(commitment.enabled && commitment.weekdays[weekdayIndex(date)]);
}

export function getScheduledCommitments(commitments: Commitment[], date: Date): Commitment[] {
  return commitments.filter((commitment) => commitmentAppliesOn(commitment, date));
}

export function toSnapshot(commitment: Commitment): CommitmentSnapshot {
  return {
    id: commitment.id,
    title: commitment.title,
    description: commitment.description,
    points: commitment.points,
    required: commitment.required,
    category: commitment.category,
    minimumTarget: commitment.minimumTarget,
  };
}

export function captureSchedule(commitments: Commitment[], date: Date): CommitmentSnapshot[] {
  return getScheduledCommitments(commitments, date).map(toSnapshot);
}

export function resolveDaySchedule(
  commitments: Commitment[],
  date: Date,
  record?: DayRecord | null,
): CommitmentSnapshot[] {
  if (record?.scheduledCommitments !== undefined) {
    return record.scheduledCommitments.map((snapshot) => ({ ...snapshot }));
  }
  return captureSchedule(commitments, date);
}

export function scheduleLabel(weekdays: boolean[]): string {
  const active = weekdays.reduce<number[]>((days, enabled, index) => {
    if (enabled) days.push(index);
    return days;
  }, []);
  if (active.length === 7) return 'Every day';
  if (active.join(',') === '0,1,2,3,4') return 'Weekdays';
  if (active.join(',') === '5,6') return 'Weekends';
  return active.map((index) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]).join(', ');
}
