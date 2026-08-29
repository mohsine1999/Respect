package com.respect.app.model;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class DayRecord {
    private String date;
    private boolean recoveryDay;
    private String reflection = "";
    private LinkedHashMap<String, Boolean> completions = new LinkedHashMap<>();
    private TreeSet<String> scheduledCommitmentIds = new TreeSet<>();

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isRecoveryDay() {
        return recoveryDay;
    }

    public void setRecoveryDay(boolean recoveryDay) {
        this.recoveryDay = recoveryDay;
    }

    public String getReflection() {
        return reflection == null ? "" : reflection;
    }

    public void setReflection(String reflection) {
        this.reflection = reflection == null ? "" : reflection;
    }

    public Map<String, Boolean> getCompletions() {
        return new LinkedHashMap<>(completions);
    }

    public void setCompletions(Map<String, Boolean> completions) {
        this.completions = new LinkedHashMap<>();
        if (completions != null) {
            for (Map.Entry<String, Boolean> entry : completions.entrySet()) {
                this.completions.put(entry.getKey(), entry.getValue());
            }
        }
    }

    public boolean isCompleted(String commitmentId) {
        Boolean value = completions.get(commitmentId);
        return value != null && value;
    }

    public void setCompleted(String commitmentId, boolean completed) {
        if (commitmentId == null) return;
        completions.put(commitmentId, completed);
    }

    public Set<String> getScheduledCommitmentIds() {
        return new TreeSet<>(scheduledCommitmentIds);
    }

    public void setScheduledCommitmentIds(Set<String> scheduledCommitmentIds) {
        this.scheduledCommitmentIds = new TreeSet<>();
        if (scheduledCommitmentIds != null) {
            this.scheduledCommitmentIds.addAll(scheduledCommitmentIds);
        }
    }

    public boolean hasScheduleSnapshot() {
        return scheduledCommitmentIds != null && !scheduledCommitmentIds.isEmpty();
    }
}
