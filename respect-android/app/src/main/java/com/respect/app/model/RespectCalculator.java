package com.respect.app.model;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class RespectCalculator {
    private RespectCalculator() {
    }

    public static String dayKey(Date date) {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(date);
    }

    public static int weekdayIndex(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        int raw = calendar.get(Calendar.DAY_OF_WEEK);
        return (raw + 5) % 7;
    }

    public static List<Commitment> getScheduledCommitments(List<Commitment> commitments, Date date) {
        List<Commitment> scheduled = new ArrayList<>();
        int index = weekdayIndex(date);
        if (commitments == null) {
            return scheduled;
        }
        for (Commitment commitment : commitments) {
            if (commitment != null && commitment.isEnabled() && commitment.appliesOn(index)) {
                scheduled.add(commitment);
            }
        }
        return scheduled;
    }

    public static int calculateDailyScore(List<Commitment> commitments, Date date, DayRecord dayRecord) {
        List<Commitment> scheduled = getScheduledCommitments(commitments, date);
        if (scheduled.isEmpty()) {
            return 0;
        }
        int total = 0;
        for (Commitment commitment : scheduled) {
            if (dayRecord != null && dayRecord.isCompleted(commitment.getId())) {
                total += commitment.getPoints();
            }
        }
        return total;
    }

    public static int calculatePossiblePoints(List<Commitment> commitments, Date date) {
        List<Commitment> scheduled = getScheduledCommitments(commitments, date);
        int total = 0;
        for (Commitment commitment : scheduled) {
            total += commitment.getPoints();
        }
        return total;
    }

    public static boolean isStrongDay(int score, int strongThreshold) {
        return score >= strongThreshold;
    }

    public static int calculateStreak(List<Commitment> commitments,
                                    Map<String, DayRecord> dayRecords,
                                    Date anchorDate,
                                    int strongThreshold) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(anchorDate);

        int streak = 0;
        while (true) {
            String key = dayKey(calendar.getTime());
            DayRecord record = dayRecords == null ? null : dayRecords.get(key);

            boolean recoveryDay = record != null && record.isRecoveryDay();
            if (record != null && record.isRecoveryDay()) {
                streak++;
                calendar.add(Calendar.DAY_OF_MONTH, -1);
                continue;
            }

            if (record == null) {
                List<Commitment> scheduled = getScheduledCommitments(commitments, calendar.getTime());
                if (scheduled.isEmpty()) {
                    break;
                }
            }

            int score = calculateDailyScore(commitments, calendar.getTime(), record);
            if (score >= strongThreshold) {
                streak++;
            } else {
                break;
            }

            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
        return streak;
    }

    public static Map<String, Integer> computeLastNDays(List<Commitment> commitments,
                                                       Map<String, DayRecord> dayRecords,
                                                       int days,
                                                       int strongThreshold) {
        Map<String, Integer> scores = new HashMap<>();
        Calendar calendar = Calendar.getInstance();
        for (int i = 0; i < days; i++) {
            String key = dayKey(calendar.getTime());
            DayRecord record = dayRecords == null ? null : dayRecords.get(key);
            int score = calculateDailyScore(commitments, calendar.getTime(), record);
            scores.put(key, score);
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
        return scores;
    }
}
