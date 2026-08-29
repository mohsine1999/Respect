package com.respect.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class MainActivity extends Activity {
    private static final String PREFS = "respect";
    private static final String[] HABITS = {"learning", "movement", "sport", "snooker", "sleep", "reflection"};
    private static final LinkedHashMap<String, Integer> DEFAULT_POINTS = new LinkedHashMap<>();
    static {
        DEFAULT_POINTS.put("learning", 30);
        DEFAULT_POINTS.put("movement", 20);
        DEFAULT_POINTS.put("sport", 15);
        DEFAULT_POINTS.put("snooker", 15);
        DEFAULT_POINTS.put("sleep", 10);
        DEFAULT_POINTS.put("reflection", 10);
    }

    private SharedPreferences prefs;
    private LinearLayout root, content;
    private TextView scoreText, streakText;
    private String today;

    int dp(float n) {
        return (int) (n * getResources().getDisplayMetrics().density + 0.5f);
    }

    TextView tv(String text, float sp, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(text);
        v.setTextSize(sp);
        v.setTextColor(color);
        v.setIncludeFontPadding(false);
        v.setTypeface(Typeface.create("sans", bold ? Typeface.BOLD : Typeface.NORMAL));
        v.setPadding(0, 0, 0, 0);
        return v;
    }

    void addGap(int h) {
        Space s = new Space(this);
        s.setLayoutParams(new LinearLayout.LayoutParams(1, dp(h)));
        content.addView(s);
    }

    @Override
    public void onCreate(Bundle b) {
        super.onCreate(b);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        ensureDefaults();
        today = dayKey(new Date());
        buildShell();
        showToday();
    }

    private void ensureDefaults() {
        SharedPreferences.Editor e = prefs.edit();
        if (!prefs.contains("strong_day_threshold")) e.putInt("strong_day_threshold", 70);
        for (String key : DEFAULT_POINTS.keySet()) {
            if (!prefs.contains("plan_" + key + "_points")) {
                e.putInt("plan_" + key + "_points", DEFAULT_POINTS.get(key));
            }
            if (!prefs.contains("plan_" + key + "_enabled")) {
                e.putBoolean("plan_" + key + "_enabled", true);
            }
        }
        e.apply();
    }

    String dayKey(Date d) {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(d);
    }

    String humanDate(Date d) {
        return new SimpleDateFormat("EEEE, d MMMM", Locale.US).format(d);
    }

    boolean get(String day, String h) {
        return prefs.getBoolean(day + "_" + h, false);
    }

    void set(String day, String h, boolean v) {
        prefs.edit().putBoolean(day + "_" + h, v).apply();
    }

    int getHabitPoints(String key) {
        return prefs.getInt("plan_" + key + "_points", DEFAULT_POINTS.getOrDefault(key, 0));
    }

    void setHabitPoints(String key, int value) {
        prefs.edit().putInt("plan_" + key + "_points", value).apply();
    }

    boolean isHabitEnabled(String key) {
        return prefs.getBoolean("plan_" + key + "_enabled", true);
    }

    void setHabitEnabled(String key, boolean enabled) {
        prefs.edit().putBoolean("plan_" + key + "_enabled", enabled).apply();
    }

    int getThreshold() {
        return prefs.getInt("strong_day_threshold", 70);
    }

    int score(String day) {
        int s = 0;
        for (String key : HABITS) {
            if (isHabitEnabled(key) && get(day, key)) {
                s += getHabitPoints(key);
            }
        }
        return s;
    }

    int streak() {
        int n = 0;
        Calendar c = Calendar.getInstance();
        while (true) {
            String d = dayKey(c.getTime());
            if (score(d) >= getThreshold()) {
                n++;
                c.add(Calendar.DAY_OF_MONTH, -1);
            } else {
                break;
            }
            if (n > 365) break;
        }
        return n;
    }

    void buildShell() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(245, 241, 234));
        root.setPadding(dp(18), dp(16), dp(18), dp(8));
        setContentView(root);

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = tv("Respect", 28, Color.rgb(30, 27, 23), true);
        header.addView(title, new LinearLayout.LayoutParams(0, dp(40), 1));
        streakText = tv("", 14, Color.rgb(91, 82, 76), true);
        header.addView(streakText);
        root.addView(header);

        LinearLayout nav = new LinearLayout(this);
        nav.setOrientation(LinearLayout.HORIZONTAL);
        nav.setGravity(Gravity.CENTER);
        nav.setPadding(0, dp(8), 0, dp(8));
        nav.setBackgroundColor(Color.argb(0, 0, 0, 0));

        Button todayBtn = navBtn("Today");
        Button planBtn = navBtn("Plan");
        Button historyBtn = navBtn("History");
        Button settingsBtn = navBtn("Settings");

        todayBtn.setOnClickListener(v -> showToday());
        planBtn.setOnClickListener(v -> showPlan());
        historyBtn.setOnClickListener(v -> showHistory());
        settingsBtn.setOnClickListener(v -> showSettings());

        nav.addView(todayBtn, new LinearLayout.LayoutParams(0, dp(44), 1));
        nav.addView(planBtn, new LinearLayout.LayoutParams(0, dp(44), 1));
        nav.addView(historyBtn, new LinearLayout.LayoutParams(0, dp(44), 1));
        nav.addView(settingsBtn, new LinearLayout.LayoutParams(0, dp(44), 1));
        root.addView(nav);

        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(0, dp(6), 0, dp(12));

        ScrollView sv = new ScrollView(this);
        sv.setFillViewport(true);
        sv.addView(content);
        root.addView(sv, new LinearLayout.LayoutParams(-1, 0, 1));
    }

    Button navBtn(String s) {
        Button b = new Button(this);
        b.setText(s);
        b.setTextSize(12);
        b.setAllCaps(false);
        b.setTextColor(Color.rgb(30, 27, 23));
        b.setBackgroundColor(Color.TRANSPARENT);
        return b;
    }

    Button button(String text, boolean primary) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(14);
        b.setAllCaps(false);
        b.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        b.setTextColor(primary ? Color.rgb(255, 255, 255) : Color.rgb(30, 27, 23));
        b.setBackgroundResource(primary ? R.drawable.bg_button : R.drawable.bg_secondary_button);
        return b;
    }

    TextView section(String h) {
        TextView x = tv(h, 18, Color.rgb(245, 247, 255), true);
        x.setPadding(0, dp(4), 0, dp(8));
        content.addView(x);
        return x;
    }

    LinearLayout card() {
        LinearLayout c = new LinearLayout(this);
        c.setOrientation(LinearLayout.VERTICAL);
        c.setBackgroundResource(R.drawable.bg_card);
        c.setPadding(dp(16), dp(14), dp(16), dp(14));
        content.addView(c, new LinearLayout.LayoutParams(-1, -2));
        return c;
    }

    void showToday() {
        content.removeAllViews();
        streakText.setText(streak() + " day streak");

        TextView date = tv(humanDate(new Date()), 14, Color.rgb(91, 82, 76), false);
        content.addView(date);
        addGap(12);

        LinearLayout hero = card();
        hero.setPadding(dp(18), dp(18), dp(18), dp(18));
        LinearLayout summaryRow = new LinearLayout(this);
        summaryRow.setGravity(Gravity.CENTER_VERTICAL);
        summaryRow.setOrientation(LinearLayout.HORIZONTAL);

        scoreText = tv(score(today) + "%", 42, Color.rgb(30, 27, 23), true);
        summaryRow.addView(scoreText, new LinearLayout.LayoutParams(0, -2, 1));

        LinearLayout statusCol = new LinearLayout(this);
        statusCol.setOrientation(LinearLayout.VERTICAL);
        TextView headline = tv("Respect today", 13, Color.rgb(91, 82, 76), true);
        TextView status = tv(message(score(today)), 18, Color.rgb(30, 27, 23), true);
        statusCol.addView(headline);
        statusCol.addView(status);
        summaryRow.addView(statusCol);
        hero.addView(summaryRow);

        addGap(12);
        TextView progressLabel = tv("Progress", 12, Color.rgb(91, 82, 76), true);
        hero.addView(progressLabel);
        LinearLayout progressBar = new LinearLayout(this);
        progressBar.setBackgroundColor(Color.rgb(231, 224, 216));
        progressBar.setPadding(0, 0, 0, 0);
        int possible = possiblePointsToday();
        int current = score(today);
        int width = possible > 0 ? Math.min(100, (current * 100) / possible) : 0;
        TextView progressFill = tv(" ", 1, Color.rgb(92, 107, 143), false);
        progressFill.setBackgroundColor(Color.rgb(92, 107, 143));
        progressBar.addView(progressFill, new LinearLayout.LayoutParams(0, dp(10), width));
        progressBar.addView(new Space(this), new LinearLayout.LayoutParams(0, dp(10), 100 - width));
        hero.addView(progressBar, new LinearLayout.LayoutParams(-1, dp(10)));

        TextView detail = tv((possible > 0 ? (possible - current) + " points left" : "Nothing scheduled today"), 13, Color.rgb(91, 82, 76), false);
        detail.setPadding(0, dp(8), 0, 0);
        hero.addView(detail);

        addGap(16);
        section("Today");

        int shown = 0;
        for (String key : HABITS) {
            if (isHabitEnabled(key)) {
                addHabit(key, habitLabel(key), getHabitPoints(key));
                shown++;
            }
        }

        if (shown == 0) {
            addGap(8);
            TextView nudge = tv("Nothing is scheduled yet. Use Plan to build your week.", 14, Color.rgb(91, 82, 76), false);
            content.addView(nudge);
        }

        addGap(12);
        Button review = button("Write reflection", false);
        review.setOnClickListener(v -> reflectionDialog());
        content.addView(review, new LinearLayout.LayoutParams(-1, dp(48)));
    }

    int possiblePointsToday() {
        int possible = 0;
        for (String key : HABITS) {
            if (isHabitEnabled(key)) {
                possible += getHabitPoints(key);
            }
        }
        return possible;
    }

    String habitLabel(String key) {
        switch (key) {
            case "learning": return "Learning — focused practice";
            case "movement": return "Movement — 20+ minutes";
            case "sport": return "Sport — real session";
            case "snooker": return "Snooker — within the plan";
            case "sleep": return "Sleep — target window";
            case "reflection": return "Reflection — one honest sentence";
            default: return key;
        }
    }

    String message(int s) {
        if (s >= getThreshold()) return "Strong day. You kept the standard you set for yourself.";
        if (s >= getThreshold() - 15) return "Solid day. A few more check-ins and the rhythm grows.";
        if (s >= 40) return "You are moving. Protect the next right action.";
        if (s > 0) return "Consistency beats intensity. Keep the chain alive.";
        return "Start with the smallest version of the plan and build from there.";
    }

    void addHabit(String key, String label, int pts) {
        LinearLayout c = card();
        c.setPadding(dp(14), dp(12), dp(14), dp(12));
        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setMinimumHeight(dp(56));

        CheckBox cb = new CheckBox(this);
        cb.setChecked(get(today, key));
        cb.setButtonTintList(android.content.res.ColorStateList.valueOf(Color.rgb(92, 107, 143)));
        row.addView(cb, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout tx = new LinearLayout(this);
        tx.setOrientation(LinearLayout.VERTICAL);
        TextView a = tv(label, 16, Color.rgb(30, 27, 23), true);
        TextView p = tv("+" + pts + " points", 12, Color.rgb(91, 82, 76), false);
        tx.addView(a);
        tx.addView(p);
        row.addView(tx, new LinearLayout.LayoutParams(0, -2, 1));

        TextView value = tv(get(today, key) ? "Done" : "Open", 12, get(today, key) ? Color.rgb(79, 140, 119) : Color.rgb(91, 82, 76), true);
        row.addView(value, new LinearLayout.LayoutParams(-2, -2));

        c.addView(row);
        cb.setOnCheckedChangeListener((v, is) -> {
            set(today, key, is);
            refreshToday();
            showToday();
        });
    }

    void refreshToday() {
        int s = score(today);
        if (scoreText != null) scoreText.setText(s + "%");
        streakText.setText(streak() + " day streak");
    }

    void reflectionDialog() {
        final EditText input = new EditText(this);
        input.setHint("What went well? What is the next right move?");
        input.setText(prefs.getString(today + "_note", ""));
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(Color.rgb(157, 168, 195));
        input.setMinLines(3);
        input.setGravity(Gravity.TOP);

        LinearLayout box = new LinearLayout(this);
        box.setPadding(dp(16), dp(8), dp(16), 0);
        box.addView(input, new LinearLayout.LayoutParams(-1, -2));

        new AlertDialog.Builder(this)
            .setTitle("One honest sentence")
            .setView(box)
            .setPositiveButton("Save", (d, w) -> {
                String note = input.getText().toString().trim();
                prefs.edit().putString(today + "_note", note).apply();
                set(today, "reflection", !note.isEmpty());
                refreshToday();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    void showPlan() {
        content.removeAllViews();
        streakText.setText(streak() + " day streak");
        section("Plan editor");

        for (String key : HABITS) {
            LinearLayout cardLayout = card();
            LinearLayout row = new LinearLayout(this);
            row.setGravity(Gravity.CENTER_VERTICAL);

            LinearLayout info = new LinearLayout(this);
            info.setOrientation(LinearLayout.VERTICAL);
            TextView label = tv(habitLabel(key), 16, Color.rgb(245, 247, 255), true);
            TextView value = tv(getHabitPoints(key) + " points", 12, Color.rgb(157, 168, 195), false);
            info.addView(label);
            info.addView(value);
            row.addView(info, new LinearLayout.LayoutParams(0, -2, 1));

            Button minus = button("−", false);
            minus.setTextSize(18);
            minus.setOnClickListener(v -> {
                int next = Math.max(0, getHabitPoints(key) - 5);
                setHabitPoints(key, next);
                showPlan();
            });

            Button plus = button("+", false);
            plus.setTextSize(18);
            plus.setOnClickListener(v -> {
                int next = Math.min(50, getHabitPoints(key) + 5);
                setHabitPoints(key, next);
                showPlan();
            });

            Button enable = button(isHabitEnabled(key) ? "On" : "Off", true);
            enable.setOnClickListener(v -> {
                setHabitEnabled(key, !isHabitEnabled(key));
                showPlan();
            });

            LinearLayout actions = new LinearLayout(this);
            actions.setOrientation(LinearLayout.HORIZONTAL);
            actions.addView(minus, new LinearLayout.LayoutParams(dp(48), dp(42)));
            actions.addView(plus, new LinearLayout.LayoutParams(dp(48), dp(42)));
            actions.addView(enable, new LinearLayout.LayoutParams(dp(72), dp(42)));

            row.addView(actions);
            cardLayout.addView(row);
        }
    }

    void showHistory() {
        content.removeAllViews();
        streakText.setText(streak() + " day streak");
        section("14-day history");

        LinearLayout summary = card();
        int total = 0;
        int strongDays = 0;
        Calendar c = Calendar.getInstance();
        for (int i = 0; i < 14; i++) {
            String d = dayKey(c.getTime());
            int s = score(d);
            total += s;
            if (s >= getThreshold()) strongDays++;
            c.add(Calendar.DAY_OF_MONTH, -1);
        }
        int avg = total / 14;
        TextView avgText = tv(avg + "%", 34, Color.rgb(142, 167, 255), true);
        summary.addView(avgText);
        summary.addView(tv("Average score • " + strongDays + " strong days", 14, Color.rgb(157, 168, 195), false));

        addGap(10);
        Calendar cal = Calendar.getInstance();
        for (int i = 0; i < 14; i++) {
            String d = dayKey(cal.getTime());
            int s = score(d);
            LinearLayout row = new LinearLayout(this);
            row.setBackgroundResource(R.drawable.bg_card);
            row.setPadding(dp(14), dp(12), dp(14), dp(12));
            row.setGravity(Gravity.CENTER_VERTICAL);

            TextView date = tv(new SimpleDateFormat("EEE d", Locale.US).format(cal.getTime()), 14, Color.rgb(245, 247, 255), true);
            row.addView(date, new LinearLayout.LayoutParams(0, -2, 1));
            TextView value = tv(s + "%", 16, s >= getThreshold() ? Color.rgb(88, 214, 162) : Color.rgb(245, 247, 255), true);
            row.addView(value);
            content.addView(row, new LinearLayout.LayoutParams(-1, -2));
            addGap(6);
            cal.add(Calendar.DAY_OF_MONTH, -1);
        }
    }

    void showSettings() {
        content.removeAllViews();
        streakText.setText(streak() + " day streak");
        section("Settings");

        LinearLayout thresholdCard = card();
        thresholdCard.addView(tv("Strong-day threshold", 15, Color.rgb(245, 247, 255), true));
        addGap(8);
        LinearLayout thresholdBar = new LinearLayout(this);
        thresholdBar.setOrientation(LinearLayout.HORIZONTAL);

        for (int v : new int[]{60, 70, 80}) {
            Button option = button(v + "%", getThreshold() == v);
            option.setOnClickListener(x -> {
                prefs.edit().putInt("strong_day_threshold", v).apply();
                showSettings();
            });
            thresholdBar.addView(option, new LinearLayout.LayoutParams(0, dp(42), 1));
        }
        thresholdCard.addView(thresholdBar);

        addGap(10);
        LinearLayout recovery = card();
        recovery.addView(tv("Recovery day", 15, Color.rgb(245, 247, 255), true));
        recovery.addView(tv("A lower-effort day still counts as a successful reset instead of a failure.", 13, Color.rgb(157, 168, 195), false));
        Button toggle = button("Enable recovery day", false);
        toggle.setOnClickListener(v -> Toast.makeText(this, "Recovery day mode ready for next update.", Toast.LENGTH_SHORT).show());
        recovery.addView(toggle);

        addGap(10);
        Button resetAll = button("Reset all data", false);
        resetAll.setOnClickListener(v -> confirmFullReset());
        content.addView(resetAll, new LinearLayout.LayoutParams(-1, dp(50)));
    }

    void confirmFullReset() {
        new AlertDialog.Builder(this)
            .setTitle("Reset all Respect data?")
            .setMessage("This clears all check-ins and settings for this device.")
            .setPositiveButton("Reset", (d, w) -> {
                SharedPreferences.Editor e = prefs.edit();
                e.clear();
                e.apply();
                ensureDefaults();
                showToday();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    String weeklyMessage(int total, int wins) {
        int avg = total / 7;
        if (wins >= 6) return "This is becoming a real habit. Protect the routine, not the mood.";
        if (wins >= 4) return "Good momentum. Make the next week easier by scheduling sport first.";
        if (avg >= 50) return "You are showing up. The next step is consistency, not intensity.";
        return "Start with the smallest version of the plan and build from there.";
    }

    void confirmReset() {
        new AlertDialog.Builder(this)
            .setTitle("Reset weekly habit checks?")
            .setMessage("This clears the last 7 days of check-ins. Your reflections stay private on your phone only.")
            .setPositiveButton("Reset", (d, w) -> {
                Calendar c = Calendar.getInstance();
                SharedPreferences.Editor e = prefs.edit();
                for (int i = 0; i < 7; i++) {
                    String day = dayKey(c.getTime());
                    for (String h : HABITS) e.remove(day + "_" + h);
                    e.remove(day + "_note");
                    c.add(Calendar.DAY_OF_MONTH, -1);
                }
                e.apply();
                showHistory();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }
}
