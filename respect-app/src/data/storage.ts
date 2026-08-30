import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COMMITMENTS } from '../domain/commitments';
import type { PersistedRespectState, RespectSettings } from '../domain/types';

export const STORAGE_KEY = 'respect-state-v1';

export const defaultSettings: RespectSettings = {
  strongDayThreshold: 70,
  theme: 'light',
  notifications: true,
  exportEnabled: false,
};

export const defaultPersistedState: PersistedRespectState = {
  commitments: DEFAULT_COMMITMENTS,
  records: {},
  settings: defaultSettings,
};

export async function readPersistedState(): Promise<PersistedRespectState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPersistedState;

    const parsed = JSON.parse(raw) as Partial<PersistedRespectState>;
    return {
      commitments: Array.isArray(parsed.commitments) ? parsed.commitments : defaultPersistedState.commitments,
      records: parsed.records ?? {},
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
    };
  } catch (error) {
    console.warn('Failed to read state', error);
    return defaultPersistedState;
  }
}

export async function writePersistedState(state: PersistedRespectState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
