package com.respect.app.model;

import java.util.Arrays;
import java.util.UUID;

public class Commitment {
    private String id;
    private String title;
    private String description;
    private int points;
    private boolean enabled = true;
    private boolean required = true;
    private String category = "";
    private String minimumTarget = "";
    private boolean[] weekdays = new boolean[7];

    public Commitment() {
        this.id = UUID.randomUUID().toString();
        Arrays.fill(weekdays, true);
    }

    public Commitment(String title, int points) {
        this();
        this.title = title;
        this.points = points;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title == null ? "" : title.trim();
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description == null ? "" : description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getCategory() {
        return category == null ? "" : category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMinimumTarget() {
        return minimumTarget == null ? "" : minimumTarget;
    }

    public void setMinimumTarget(String minimumTarget) {
        this.minimumTarget = minimumTarget;
    }

    public boolean[] getWeekdays() {
        return weekdays == null ? new boolean[7] : weekdays.clone();
    }

    public void setWeekdays(boolean[] weekdays) {
        if (weekdays == null || weekdays.length != 7) {
            this.weekdays = new boolean[7];
            Arrays.fill(this.weekdays, true);
            return;
        }
        this.weekdays = weekdays.clone();
    }

    public boolean appliesOn(int dayIndexZeroBased) {
        if (dayIndexZeroBased < 0 || dayIndexZeroBased >= 7) {
            return false;
        }
        return enabled && weekdays[dayIndexZeroBased];
    }

    public boolean isValid() {
        return id != null && !getTitle().isEmpty() && points >= 0 && weekdays != null && weekdays.length == 7;
    }

    public Commitment copy() {
        Commitment copy = new Commitment();
        copy.setId(this.id);
        copy.setTitle(this.title);
        copy.setDescription(this.description);
        copy.setPoints(this.points);
        copy.setEnabled(this.enabled);
        copy.setRequired(this.required);
        copy.setCategory(this.category);
        copy.setMinimumTarget(this.minimumTarget);
        copy.setWeekdays(this.weekdays);
        return copy;
    }
}
