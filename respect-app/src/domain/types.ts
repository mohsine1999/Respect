export type WeekdayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Commitment {
  id: string;
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

export interface DayRecord {
  date: string;
  recoveryDay: boolean;
  reflection: string;
  completions: Record<string, boolean>;
  scheduledCommitmentIds: string[];
}

export interface RespectSettings {
  strongDayThreshold: number;
  theme: 'light' | 'dark';
  notifications: boolean;
  exportEnabled: boolean;
}

export interface PersistedRespectState {
  commitments: Commitment[];
  records: Record<string, DayRecord>;
  settings: RespectSettings;
}
