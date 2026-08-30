import type { Commitment, DayRecord } from './types';
import { captureSchedule } from './scheduling';
import { toDateKey } from '../utils/dates';

export function createDayRecord(commitments: Commitment[], date: Date): DayRecord {
  return {
    date: toDateKey(date),
    recoveryDay: false,
    minimumDay: false,
    reflection: '',
    completions: {},
    scheduledCommitments: captureSchedule(commitments, date),
  };
}

export function ensureDayRecord(commitments: Commitment[], date: Date, existing?: DayRecord): DayRecord {
  if (!existing) return createDayRecord(commitments, date);
  if (existing.scheduledCommitments !== undefined) return existing;
  return { ...existing, scheduledCommitments: captureSchedule(commitments, date) };
}

export function setReflection(record: DayRecord, reflection: string): DayRecord {
  const nextReflection = reflection.trim();
  const reflectionCommitment = record.scheduledCommitments?.find((commitment) => commitment.id === 'reflection');
  return {
    ...record,
    reflection: nextReflection,
    completions: reflectionCommitment
      ? { ...record.completions, reflection: Boolean(nextReflection) }
      : record.completions,
  };
}

export function setCompleted(record: DayRecord, commitmentId: string, completed: boolean): DayRecord {
  return { ...record, completions: { ...record.completions, [commitmentId]: completed } };
}

export function setRecoveryDay(record: DayRecord, recoveryDay: boolean): DayRecord {
  return { ...record, recoveryDay, minimumDay: recoveryDay ? false : record.minimumDay };
}

export function setMinimumDay(record: DayRecord, minimumDay: boolean): DayRecord {
  return { ...record, minimumDay, recoveryDay: minimumDay ? false : record.recoveryDay };
}
