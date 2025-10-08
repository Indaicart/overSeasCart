package com.schoolms.enums;

public enum AttendanceStatus {
    PRESENT("present"),
    ABSENT("absent"),
    LATE("late"),
    EXCUSED("excused"),
    HALF_DAY("half_day");

    private final String value;

    AttendanceStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AttendanceStatus fromValue(String value) {
        for (AttendanceStatus status : AttendanceStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown attendance status: " + value);
    }
}

