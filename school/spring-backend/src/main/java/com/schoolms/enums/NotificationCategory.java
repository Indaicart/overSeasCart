package com.schoolms.enums;

public enum NotificationCategory {
    ATTENDANCE("attendance"),
    GRADES("grades"),
    FEES("fees"),
    GENERAL("general"),
    EMERGENCY("emergency"),
    EVENT("event"),
    ANNOUNCEMENT("announcement");

    private final String value;

    NotificationCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static NotificationCategory fromValue(String value) {
        for (NotificationCategory category : NotificationCategory.values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown notification category: " + value);
    }
}

