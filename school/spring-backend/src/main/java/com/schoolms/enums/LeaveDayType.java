package com.schoolms.enums;

public enum LeaveDayType {
    FULL_DAY("full_day"),
    FIRST_HALF("first_half"),
    SECOND_HALF("second_half");

    private final String value;

    LeaveDayType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static LeaveDayType fromValue(String value) {
        for (LeaveDayType type : LeaveDayType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown leave day type: " + value);
    }
}

