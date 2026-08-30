import { createCommitment, createDefaultCommitments } from '../domain/commitments';
import { captureSchedule } from '../domain/scheduling';
import type {
  Commitment,
  CommitmentSnapshot,
  DayRecord,
  PersistedRespectState,
  RespectProfile,
  RespectSettings,
} from '../domain/types';
import { fromDateKey } from '../utils/dates';

export const defaultSettings: RespectSettings = {
  strongDayThreshold: 70,
  theme: 'system',
  notifications: false,
  minimumDayEnabled: true,
};

export const defaultProfile: RespectProfile = {
  displayName: '',
  onboardingCompleted: false,
  onboardingVersion: 1,
  planCoachmarkSeen: false,
  gettingStartedDismissed: false,
};

export function createDefaultState(): PersistedRespectState {
  return {
    version: 3,
    profile: { ...defaultProfile },
    commitments: [],
    records: {},
    settings: { ...defaultSettings },
  };
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function migrateCommitments(value: unknown): Commitment[] {
  if (!Array.isArray(value)) return createDefaultCommitments();
  const migrated = value.map((entry, index) => {
    const raw = object(entry);
    return createCommitment({
      id: typeof raw.id === 'string' ? raw.id : `legacy-${index}`,
      kind: raw.kind === 'reflection' || raw.id === 'reflection' ? 'reflection' : 'standard',
      title: typeof raw.title === 'string' ? raw.title : `Commitment ${index + 1}`,
      description: typeof raw.description === 'string' ? raw.description : '',
      points: typeof raw.points === 'number' ? raw.points : 0,
      enabled: typeof raw.enabled === 'boolean' ? raw.enabled : true,
      required: typeof raw.required === 'boolean' ? raw.required : true,
      category: typeof raw.category === 'string' ? raw.category : '',
      minimumTarget: typeof raw.minimumTarget === 'string' ? raw.minimumTarget : '',
      weekdays:
        Array.isArray(raw.weekdays) && raw.weekdays.length === 7
          ? raw.weekdays.map(Boolean)
          : Array.from({ length: 7 }, () => true),
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
      updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    });
  });
  return migrated;
}

function migrateRecords(value: unknown, commitments: Commitment[]): Record<string, DayRecord> {
  const entries = Object.entries(object(value));
  return Object.fromEntries(
    entries.map(([date, entry]) => {
      const raw = object(entry);
      const completions = Object.fromEntries(
        Object.entries(object(raw.completions)).map(([id, completed]) => [id, Boolean(completed)]),
      );
      const providedSnapshots: CommitmentSnapshot[] | undefined = Array.isArray(raw.scheduledCommitments)
        ? raw.scheduledCommitments.map(object).map((snapshot) => ({
            id: String(snapshot.id ?? ''),
            kind: snapshot.kind === 'reflection' || snapshot.id === 'reflection' ? 'reflection' : 'standard',
            title: String(snapshot.title ?? ''),
            description: String(snapshot.description ?? ''),
            points: Number(snapshot.points ?? 0),
            required: snapshot.required !== false,
            category: String(snapshot.category ?? ''),
            minimumTarget: String(snapshot.minimumTarget ?? ''),
          }))
        : undefined;
      // v1's scheduledCommitmentIds contained only completed IDs, not the full plan.
      // Rebuild the applicable schedule when an immutable v2+ snapshot is unavailable.
      const legacySnapshots = captureSchedule(commitments, fromDateKey(date));
      return [
        date,
        {
          date,
          recoveryDay: Boolean(raw.recoveryDay),
          minimumDay: Boolean(raw.minimumDay),
          reflection: typeof raw.reflection === 'string' ? raw.reflection : '',
          completions,
          scheduledCommitments: providedSnapshots ?? legacySnapshots,
        },
      ];
    }),
  );
}

export function migratePersistedState(value: unknown): PersistedRespectState {
  const raw = object(value);
  const commitments = migrateCommitments(raw.commitments);
  const rawSettings = object(raw.settings);
  const rawProfile = object(raw.profile);
  const isExistingV3User = raw.version === 3;
  return {
    version: 3,
    profile: {
      displayName: typeof rawProfile.displayName === 'string' ? rawProfile.displayName : '',
      onboardingCompleted: isExistingV3User ? rawProfile.onboardingCompleted === true : true,
      onboardingVersion:
        typeof rawProfile.onboardingVersion === 'number' ? rawProfile.onboardingVersion : defaultProfile.onboardingVersion,
      onboardingCompletedAt:
        typeof rawProfile.onboardingCompletedAt === 'string' ? rawProfile.onboardingCompletedAt : undefined,
      planCoachmarkSeen: isExistingV3User ? rawProfile.planCoachmarkSeen === true : false,
      gettingStartedDismissed: isExistingV3User ? rawProfile.gettingStartedDismissed === true : true,
    },
    commitments,
    records: migrateRecords(raw.records, commitments),
    settings: {
      strongDayThreshold:
        typeof rawSettings.strongDayThreshold === 'number' ? rawSettings.strongDayThreshold : defaultSettings.strongDayThreshold,
      theme: rawSettings.theme === 'dark' || rawSettings.theme === 'light' ? rawSettings.theme : 'system',
      notifications:
        typeof rawSettings.notifications === 'boolean' ? rawSettings.notifications : defaultSettings.notifications,
      minimumDayEnabled:
        typeof rawSettings.minimumDayEnabled === 'boolean'
          ? rawSettings.minimumDayEnabled
          : defaultSettings.minimumDayEnabled,
    },
  };
}
