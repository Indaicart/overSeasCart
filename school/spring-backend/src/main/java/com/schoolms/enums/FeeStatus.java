package com.schoolms.enums;

public enum FeeStatus {
    PENDING("pending"),
    PAID("paid"),
    OVERDUE("overdue"),
    WAIVED("waived"),
    PARTIAL("partial");

    private final String value;

    FeeStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static FeeStatus fromValue(String value) {
        for (FeeStatus status : FeeStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown fee status: " + value);
    }
}

