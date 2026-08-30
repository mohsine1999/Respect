import type { Commitment, WeekdayKey } from './types';

export const DEFAULT_COMMITMENTS: Commitment[] = [
  {
    id: 'learning',
    title: 'Spanish',
    description: '45 min focused practice',
    points: 30,
    enabled: true,
    required: true,
    category: 'Learning',
    minimumTarget: '45 min',
    weekdays: [true, true, true, true, true, false, false],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'movement',
    title: 'Movement',
    description: '20+ minutes',
    points: 20,
    enabled: true,
    required: true,
    category: 'Health',
    minimumTarget: '20 min',
    weekdays: [true, true, true, true, true, true, true],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sport',
    title: 'Sport',
    description: 'Gym / pool / walk',
    points: 15,
    enabled: true,
    required: false,
    category: 'Health',
    minimumTarget: '30 min',
    weekdays: [false, true, false, true, false, true, true],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function normalizeWeekdays(days: Array<number | WeekdayKey>): boolean[] {
  const normalized = Array.from({ length: 7 }, () => false);
  for (const day of days) {
    const index = Number(day);
    if (index >= 0 && index < 7) normalized[index] = true;
  }
  return normalized;
}

export function createCommitment(input: Partial<Commitment> & { title: string; points: number }): Commitment {
  return {
    id: input.id ?? `commitment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: input.title ?? '',
    description: input.description ?? '',
    points: Math.max(0, input.points ?? 0),
    enabled: input.enabled ?? true,
    required: input.required ?? true,
    category: input.category ?? '',
    minimumTarget: input.minimumTarget ?? '',
    weekdays: input.weekdays ?? Array.from({ length: 7 }, () => true),
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export function cloneCommitment(commitment: Commitment): Commitment {
  return {
    ...commitment,
    weekdays: [...commitment.weekdays],
  };
}

export function commitmentIsValid(commitment: Commitment): boolean {
  return Boolean(
    commitment &&
      commitment.title.trim().length > 0 &&
      Number.isFinite(commitment.points) &&
      commitment.points >= 0 &&
      commitment.weekdays.length === 7,
  );
}

export function commitmentAppliesOn(commitment: Commitment, date: Date): boolean {
  const dayIndex = (date.getDay() + 6) % 7;
  return commitment.enabled && commitment.weekdays[dayIndex];
}
