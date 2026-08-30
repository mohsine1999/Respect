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
    kind: id === 'reflection' ? 'reflection' : 'standard',
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

export interface StarterCommitmentTemplate {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  minimumTarget: string;
}

export const STARTER_COMMITMENT_TEMPLATES: StarterCommitmentTemplate[] = [
  {
    id: 'focus',
    title: 'Focused work',
    description: 'One distraction-free block',
    points: 30,
    category: 'Focus',
    minimumTarget: '10 focused minutes',
  },
  {
    id: 'movement',
    title: 'Move your body',
    description: '20 minutes of movement',
    points: 20,
    category: 'Health',
    minimumTarget: 'A 5 minute walk',
  },
  {
    id: 'learning',
    title: 'Learn something',
    description: 'Read, study, or practise',
    points: 20,
    category: 'Growth',
    minimumTarget: '5 focused minutes',
  },
  {
    id: 'sleep',
    title: 'Protect your sleep',
    description: 'Keep your sleep window',
    points: 20,
    category: 'Recovery',
    minimumTarget: 'Prepare for bed on time',
  },
  {
    id: 'reflection',
    title: 'Check in',
    description: 'Write one honest sentence',
    points: 10,
    category: 'Mind',
    minimumTarget: 'One sentence',
  },
];

export const DEFAULT_STARTER_IDS = ['focus', 'movement', 'reflection'];

export function createStarterCommitments(ids: string[]): Commitment[] {
  const selected = new Set(ids);
  return STARTER_COMMITMENT_TEMPLATES.filter((template) => selected.has(template.id)).map((template) =>
    defaultCommitment(
      template.id,
      template.title,
      template.description,
      template.points,
      template.category,
      template.minimumTarget,
    ),
  );
}

/** A generic fallback for legacy or corrupt data. New installs build their plan during onboarding. */
export function createDefaultCommitments(): Commitment[] {
  return createStarterCommitments(DEFAULT_STARTER_IDS);
}

export function normalizeWeekdays(days: (number | WeekdayKey)[]): boolean[] {
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
    kind: input.kind === 'reflection' || input.id === 'reflection' ? 'reflection' : 'standard',
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
