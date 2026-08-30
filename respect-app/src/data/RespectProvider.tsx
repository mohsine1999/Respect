import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Commitment, PersistedRespectState, RespectSettings } from '../domain/types';
import { createCommitment, removeCommitment, updateCommitment } from '../domain/commitments';
import { ensureDayRecord, setCompleted, setMinimumDay, setRecoveryDay, setReflection } from '../domain/history';
import { fromDateKey } from '../utils/dates';
import { clearPersistedState, readPersistedState, writePersistedState } from './storage';
import { createDefaultState } from './migrations';

interface RespectContextValue {
  state: PersistedRespectState;
  hydrated: boolean;
  toggleCompletion: (date: string, commitmentId: string) => void;
  updateReflection: (date: string, reflection: string) => void;
  updateRecoveryDay: (date: string, enabled: boolean) => void;
  updateMinimumDay: (date: string, enabled: boolean) => void;
  saveCommitment: (commitment: Commitment) => void;
  addCommitment: (input: Parameters<typeof createCommitment>[0]) => void;
  deleteCommitment: (commitmentId: string) => void;
  updateSettings: (settings: Partial<RespectSettings>) => void;
  resetAll: () => Promise<void>;
}

const RespectContext = createContext<RespectContextValue | null>(null);

export function RespectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedRespectState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    readPersistedState().then((stored) => {
      if (active) {
        setState(stored);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) writePersistedState(state).catch((error) => console.warn('Respect could not save state.', error));
  }, [hydrated, state]);

  const updateDay = useCallback(
    (dateKey: string, update: (record: ReturnType<typeof ensureDayRecord>) => ReturnType<typeof ensureDayRecord>) => {
      setState((current) => {
        const record = ensureDayRecord(current.commitments, fromDateKey(dateKey), current.records[dateKey]);
        return { ...current, records: { ...current.records, [dateKey]: update(record) } };
      });
    },
    [],
  );

  const value = useMemo<RespectContextValue>(
    () => ({
      state,
      hydrated,
      toggleCompletion: (date, commitmentId) =>
        updateDay(date, (record) => setCompleted(record, commitmentId, !record.completions[commitmentId])),
      updateReflection: (date, reflection) => updateDay(date, (record) => setReflection(record, reflection)),
      updateRecoveryDay: (date, enabled) => updateDay(date, (record) => setRecoveryDay(record, enabled)),
      updateMinimumDay: (date, enabled) => updateDay(date, (record) => setMinimumDay(record, enabled)),
      saveCommitment: (commitment) =>
        setState((current) => ({
          ...current,
          commitments: current.commitments.map((item) =>
            item.id === commitment.id ? updateCommitment(item, commitment) : item,
          ),
        })),
      addCommitment: (input) =>
        setState((current) => ({ ...current, commitments: [...current.commitments, createCommitment(input)] })),
      deleteCommitment: (commitmentId) =>
        setState((current) => ({ ...current, commitments: removeCommitment(current.commitments, commitmentId) })),
      updateSettings: (settings) =>
        setState((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
      resetAll: async () => {
        await clearPersistedState();
        setState(createDefaultState());
      },
    }),
    [hydrated, state, updateDay],
  );

  return <RespectContext.Provider value={value}>{children}</RespectContext.Provider>;
}

export function useRespect(): RespectContextValue {
  const context = useContext(RespectContext);
  if (!context) throw new Error('useRespect must be used inside RespectProvider.');
  return context;
}
