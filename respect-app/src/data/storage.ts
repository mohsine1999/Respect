import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedRespectState } from '../domain/types';
import { createDefaultState, migratePersistedState } from './migrations';

export const STORAGE_KEY = 'respect-state-v3';
export const V2_STORAGE_KEY = 'respect-state-v2';
export const LEGACY_STORAGE_KEY = 'respect-state-v1';

function isPersistedStateCandidate(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return ['commitments', 'records', 'settings', 'profile'].some((key) => key in candidate);
}

export async function readPersistedState(): Promise<PersistedRespectState> {
  for (const key of [STORAGE_KEY, V2_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!isPersistedStateCandidate(parsed)) throw new Error('Stored Respect data has no recognized fields.');
        return migratePersistedState(parsed);
      }
    } catch (error) {
      console.warn(`Respect could not read ${key}; trying an older local backup.`, error);
    }
  }
  return createDefaultState();
}

export async function writePersistedState(state: PersistedRespectState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, V2_STORAGE_KEY, LEGACY_STORAGE_KEY]);
}
