package com.schoolms.enums;

public enum DayOfWeek {
    MONDAY("monday"),
    TUESDAY("tuesday"),
    WEDNESDAY("wednesday"),
    THURSDAY("thursday"),
    FRIDAY("friday"),
    SATURDAY("saturday"),
    SUNDAY("sunday");

    private final String value;

    DayOfWeek(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static DayOfWeek fromValue(String value) {
        for (DayOfWeek day : DayOfWeek.values()) {
            if (day.value.equalsIgnoreCase(value)) {
                return day;
            }
        }
        throw new IllegalArgumentException("Unknown day of week: " + value);
    }
}

