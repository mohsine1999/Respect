import type { DayRecord } from './types';

export function createDayRecord(
  date: string,
  completions: Record<string, boolean> = {},
  recoveryDay = false,
  reflection = '',
): DayRecord {
  return {
    date,
    recoveryDay,
    reflection,
    completions: { ...completions },
    scheduledCommitmentIds: Object.keys(completions).filter((id) => completions[id]),
  };
}

export function setReflection(record: DayRecord, reflection: string): DayRecord {
  return {
    ...record,
    reflection,
  };
}

export function setCompleted(record: DayRecord, commitmentId: string, completed: boolean): DayRecord {
  const nextCompletions = {
    ...record.completions,
    [commitmentId]: completed,
  };

  return {
    ...record,
    completions: nextCompletions,
    scheduledCommitmentIds: Object.keys(nextCompletions).filter((id) => nextCompletions[id]),
  };
}
