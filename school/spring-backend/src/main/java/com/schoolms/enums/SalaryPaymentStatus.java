package com.schoolms.enums;

public enum SalaryPaymentStatus {
    PENDING("pending"),
    PARTIAL("partial"),
    PAID("paid"),
    FAILED("failed"),
    CANCELLED("cancelled");

    private final String value;

    SalaryPaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SalaryPaymentStatus fromValue(String value) {
        for (SalaryPaymentStatus status : SalaryPaymentStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown salary payment status: " + value);
    }
}

