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
    const required = schedule.filter((commitment) => commitment.required).length;
    const remaining = schedule.filter(
      (commitment) => commitment.required && !record?.completions[commitment.id],
    ).length;
    return {
      date,
      record,
      schedule,
      score,
      possible,
      completed,
      required,
      remaining,
      planComplete:
        schedule.length > 0 &&
        remaining === 0 &&
        (required > 0 || completed === schedule.length),
      progress: score,
      message: record?.recoveryDay ? 'Recovery day.' : getScoreMessage(score),
      minimumSatisfied: minimumDayIsSatisfied(record, schedule),
    };
  }, [dateKey, state]);
}
