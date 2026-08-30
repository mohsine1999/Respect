import type { Commitment, CommitmentInput, WeekdayKey } from './types';

const allWeekdays = () => Array.from({ length: 7 }, () => true);
const now = () => new Date().toISOString();

function defaultCommitment(
  id: string,
  title: string,
  description: string,
  points: number,
  category: string,
  minimumTarget: string,
): Commitment {
  const timestamp = now();
  return {
    id,
    title,
    description,
    points,
    enabled: true,
    required: true,
    category,
    minimumTarget,
    weekdays: allWeekdays(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Mirrors the six commitments and 100-point weighting in the Java application. */
export function createDefaultCommitments(): Commitment[] {
  return [
    defaultCommitment('learning', 'Learning', 'Focused practice', 30, 'Growth', '10 focused minutes'),
    defaultCommitment('movement', 'Movement', '20+ minutes', 20, 'Health', 'A 5 minute walk'),
    defaultCommitment('sport', 'Sport', 'Gym / pool / walk', 15, 'Health', '10 minutes of movement'),
    defaultCommitment('snooker', 'Snooker', 'Within the plan', 15, 'Craft', 'One deliberate frame'),
    defaultCommitment('sleep', 'Sleep', 'Target window', 10, 'Recovery', 'Protect bedtime'),
    defaultCommitment('reflection', 'Reflection', 'One honest sentence', 10, 'Mind', 'Write one sentence'),
  ];
}

export const DEFAULT_COMMITMENTS = createDefaultCommitments();

export function normalizeWeekdays(days: Array<number | WeekdayKey>): boolean[] {
  const normalized = Array.from({ length: 7 }, () => false);
  for (const day of days) {
    const index = Number(day);
    if (index >= 0 && index < 7) normalized[index] = true;
  }
  return normalized;
}

export function createCommitment(input: CommitmentInput, timestamp = now()): Commitment {
  return {
    id: input.id ?? `commitment-${timestamp}-${Math.random().toString(16).slice(2)}`,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    points: Math.max(0, Math.round(input.points)),
    enabled: input.enabled ?? true,
    required: input.required ?? true,
    category: input.category?.trim() ?? '',
    minimumTarget: input.minimumTarget?.trim() ?? '',
    weekdays: input.weekdays?.length === 7 ? [...input.weekdays] : allWeekdays(),
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
  };
}

export function updateCommitment(
  commitment: Commitment,
  changes: Partial<Commitment>,
  timestamp = now(),
): Commitment {
  return createCommitment(
    {
      ...commitment,
      ...changes,
      id: commitment.id,
      createdAt: commitment.createdAt,
      updatedAt: timestamp,
    },
    timestamp,
  );
}

export function removeCommitment(commitments: Commitment[], commitmentId: string): Commitment[] {
  return commitments.filter((commitment) => commitment.id !== commitmentId);
}

export function cloneCommitment(commitment: Commitment): Commitment {
  return { ...commitment, weekdays: [...commitment.weekdays] };
}

export function commitmentIsValid(commitment: Commitment): boolean {
  return Boolean(
    commitment.title.trim() &&
      Number.isFinite(commitment.points) &&
      commitment.points >= 0 &&
      commitment.weekdays.length === 7 &&
      commitment.weekdays.some(Boolean),
  );
}
