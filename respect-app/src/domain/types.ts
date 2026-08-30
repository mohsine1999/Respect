export type WeekdayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ThemePreference = 'system' | 'light' | 'dark';
export type CommitmentKind = 'standard' | 'reflection';

export interface Commitment {
  id: string;
  kind: CommitmentKind;
  title: string;
  description: string;
  points: number;
  enabled: boolean;
  required: boolean;
  category: string;
  minimumTarget: string;
  weekdays: boolean[];
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentSnapshot {
  id: string;
  kind: CommitmentKind;
  title: string;
  description: string;
  points: number;
  required: boolean;
  category: string;
  minimumTarget: string;
}

export interface DayRecord {
  date: string;
  recoveryDay: boolean;
  minimumDay: boolean;
  reflection: string;
  completions: Record<string, boolean>;
  /** Defined, including as an empty array, once that day's plan is captured. */
  scheduledCommitments?: CommitmentSnapshot[];
}

export interface RespectSettings {
  strongDayThreshold: number;
  theme: ThemePreference;
  notifications: boolean;
  minimumDayEnabled: boolean;
}

export interface RespectProfile {
  displayName: string;
  onboardingCompleted: boolean;
  onboardingVersion: number;
  onboardingCompletedAt?: string;
  planCoachmarkSeen: boolean;
  gettingStartedDismissed: boolean;
}

export interface PersistedRespectState {
  version: 3;
  profile: RespectProfile;
  commitments: Commitment[];
  records: Record<string, DayRecord>;
  settings: RespectSettings;
}

export type CommitmentInput = Pick<Commitment, 'title' | 'points'> & Partial<Omit<Commitment, 'title' | 'points'>>;
