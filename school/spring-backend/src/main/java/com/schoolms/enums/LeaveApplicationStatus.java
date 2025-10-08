package com.schoolms.enums;

public enum LeaveApplicationStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    CANCELLED("cancelled");

    private final String value;

    LeaveApplicationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static LeaveApplicationStatus fromValue(String value) {
        for (LeaveApplicationStatus status : LeaveApplicationStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown leave application status: " + value);
    }
}

