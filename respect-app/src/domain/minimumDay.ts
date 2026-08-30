import type { CommitmentSnapshot, DayRecord } from './types';

export function minimumDayIsSatisfied(record: DayRecord | undefined, schedule: CommitmentSnapshot[]): boolean {
  if (!record?.minimumDay) return false;
  const required = schedule.filter((commitment) => commitment.required);
  return required.length > 0 && required.every((commitment) => Boolean(record.completions[commitment.id]));
}
