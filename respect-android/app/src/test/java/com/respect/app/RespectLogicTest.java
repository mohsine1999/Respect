package com.respect.app;

import com.respect.app.model.Commitment;
import com.respect.app.model.DayRecord;
import com.respect.app.model.RespectCalculator;

import org.junit.Test;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class RespectLogicTest {

    private Commitment createCommitment(String id, String title, int points, int weekdayIndex) {
        Commitment c = new Commitment();
        c.setId(id);
        c.setTitle(title);
        c.setPoints(points);
        c.setEnabled(true);
        boolean[] weekdays = new boolean[7];
        weekdays[weekdayIndex] = true;
        c.setWeekdays(weekdays);
        return c;
    }

    @Test
    public void testScoreUsesScheduledCommitmentsOnly() {
        List<Commitment> commitments = new ArrayList<>();
        commitments.add(createCommitment("a", "Learning", 30, 0));
        commitments.add(createCommitment("b", "Movement", 20, 1));

        Calendar cal = Calendar.getInstance();
        cal.set(2026, Calendar.AUGUST, 3); // Monday
        Date monday = cal.getTime();

        DayRecord record = new DayRecord();
        record.setDate(RespectCalculator.dayKey(monday));
        record.setCompleted("a", true);

        int score = RespectCalculator.calculateDailyScore(commitments, monday, record);
        assertEquals(30, score);
    }

    @Test
    public void testStrongDayThresholdUsesConfiguredValue() {
        assertTrue(RespectCalculator.isStrongDay(70, 70));
        assertFalse(RespectCalculator.isStrongDay(69, 70));
    }

    @Test
    public void testWeekdayScheduling() {
        Commitment daily = createCommitment("daily", "Daily", 10, 0);
        boolean[] weekdays = new boolean[7];
        for (int i = 0; i < 7; i++) weekdays[i] = true;
        daily.setWeekdays(weekdays);

        Calendar cal = Calendar.getInstance();
        cal.set(2026, Calendar.AUGUST, 3); // Monday -> index 0
        List<Commitment> scheduled = RespectCalculator.getScheduledCommitments(java.util.Collections.singletonList(daily), cal.getTime());
        assertEquals(1, scheduled.size());

        cal.set(2026, Calendar.AUGUST, 4); // Tuesday
        scheduled = RespectCalculator.getScheduledCommitments(java.util.Collections.singletonList(daily), cal.getTime());
        assertEquals(1, scheduled.size());
    }

    @Test
    public void testRecoveryDayDoesNotBreakStreak() {
        List<Commitment> commitments = new ArrayList<>();
        commitments.add(createCommitment("a", "Learning", 100, 0));

        Map<String, DayRecord> records = new HashMap<>();
        Calendar cal = Calendar.getInstance();
        Calendar anchor = Calendar.getInstance();

        cal.set(2026, Calendar.AUGUST, 3);
        anchor.set(2026, Calendar.AUGUST, 3);

        String today = RespectCalculator.dayKey(cal.getTime());
        DayRecord strong = new DayRecord();
        strong.setDate(today);
        strong.setCompleted("a", true);
        records.put(today, strong);

        cal.add(Calendar.DAY_OF_MONTH, -1);
        String yesterday = RespectCalculator.dayKey(cal.getTime());
        DayRecord recovery = new DayRecord();
        recovery.setDate(yesterday);
        recovery.setRecoveryDay(true);
        records.put(yesterday, recovery);

        int streak = RespectCalculator.calculateStreak(commitments, records, anchor.getTime(), 70);
        assertEquals(2, streak);
    }

    @Test
    public void testEmptyDataProducesZero() {
        List<Commitment> empty = new ArrayList<>();
        DayRecord record = new DayRecord();
        Calendar cal = Calendar.getInstance();
        int score = RespectCalculator.calculateDailyScore(empty, cal.getTime(), record);
        assertEquals(0, score);
    }

    @Test
    public void testInvalidCommitmentTitleIsRejected() {
        Commitment c = new Commitment();
        c.setTitle(" ");
        c.setPoints(10);
        assertFalse(c.isValid());
    }

    @Test
    public void testInvalidNegativePointsAreRejected() {
        Commitment c = new Commitment();
        c.setTitle("Spanish");
        c.setPoints(-5);
        assertFalse(c.isValid());
    }

    @Test
    public void testRecoveryDayIsStoredAndRecognized() {
        DayRecord record = new DayRecord();
        record.setRecoveryDay(true);
        assertTrue(record.isRecoveryDay());
    }
}
