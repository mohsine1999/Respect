import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedRespectState } from '../domain/types';
import { createDefaultState, migratePersistedState } from './migrations';

export const STORAGE_KEY = 'respect-state-v2';
export const LEGACY_STORAGE_KEY = 'respect-state-v1';

export async function readPersistedState(): Promise<PersistedRespectState> {
  try {
    const raw = (await AsyncStorage.getItem(STORAGE_KEY)) ?? (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));
    return raw ? migratePersistedState(JSON.parse(raw)) : createDefaultState();
  } catch (error) {
    console.warn('Respect could not read local state.', error);
    return createDefaultState();
  }
}

export async function writePersistedState(state: PersistedRespectState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
}
