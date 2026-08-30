import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readPersistedState, STORAGE_KEY, V2_STORAGE_KEY } from './storage';

const asyncStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  multiRemove: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({ default: asyncStorage }));

describe('storage recovery', () => {
  beforeEach(() => {
    asyncStorage.getItem.mockReset();
  });

  it('falls back to valid v2 data when the newer local value is malformed', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    asyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEY) return '{not-json';
      if (key === V2_STORAGE_KEY) {
        return JSON.stringify({
          version: 2,
          commitments: [],
          records: {},
          settings: { theme: 'dark', strongDayThreshold: 80 },
        });
      }
      return null;
    });

    const state = await readPersistedState();

    expect(state.version).toBe(3);
    expect(state.profile.onboardingCompleted).toBe(true);
    expect(state.settings.theme).toBe('dark');
    expect(state.settings.strongDayThreshold).toBe(80);
    warning.mockRestore();
  });

  it('also skips parseable data that has no Respect state fields', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    asyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === STORAGE_KEY) return '{}';
      if (key === V2_STORAGE_KEY) {
        return JSON.stringify({ version: 2, commitments: [], records: {}, settings: { theme: 'light' } });
      }
      return null;
    });

    const state = await readPersistedState();

    expect(state.profile.onboardingCompleted).toBe(true);
    expect(state.settings.theme).toBe('light');
    warning.mockRestore();
  });
});
