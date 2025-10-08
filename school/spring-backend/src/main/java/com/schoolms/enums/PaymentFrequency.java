package com.schoolms.enums;

public enum PaymentFrequency {
    MONTHLY("monthly"),
    WEEKLY("weekly"),
    BI_WEEKLY("bi_weekly"),
    QUARTERLY("quarterly");

    private final String value;

    PaymentFrequency(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentFrequency fromValue(String value) {
        for (PaymentFrequency frequency : PaymentFrequency.values()) {
            if (frequency.value.equalsIgnoreCase(value)) {
                return frequency;
            }
        }
        throw new IllegalArgumentException("Unknown payment frequency: " + value);
    }
}

