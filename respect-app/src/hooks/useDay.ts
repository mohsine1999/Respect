import { useMemo } from 'react';
import { calculateDailyScore, calculatePossiblePoints, getScoreMessage } from '../domain/scoring';
import { resolveDaySchedule } from '../domain/scheduling';
import { minimumDayIsSatisfied } from '../domain/minimumDay';
import { useRespect } from '../data/RespectProvider';
import { fromDateKey } from '../utils/dates';

export function useDay(dateKey: string) {
  const { state } = useRespect();
  return useMemo(() => {
    const date = fromDateKey(dateKey);
    const record = state.records[dateKey];
    const schedule = resolveDaySchedule(state.commitments, date, record);
    const score = calculateDailyScore(state.commitments, date, record);
    const possible = calculatePossiblePoints(state.commitments, date, record);
    const completed = schedule.filter((commitment) => record?.completions[commitment.id]).length;
    return {
      date,
      record,
      schedule,
      score,
      possible,
      completed,
      remaining: Math.max(schedule.length - completed, 0),
      progress: possible ? Math.min((score / possible) * 100, 100) : 0,
      message: record?.recoveryDay ? 'Recovery day.' : getScoreMessage(score),
      minimumSatisfied: minimumDayIsSatisfied(record, schedule),
    };
  }, [dateKey, state]);
}
