package com.schoolms.enums;

public enum TeacherStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    ON_LEAVE("on_leave"),
    TERMINATED("terminated");

    private final String value;

    TeacherStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TeacherStatus fromValue(String value) {
        for (TeacherStatus status : TeacherStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown teacher status: " + value);
    }
}

