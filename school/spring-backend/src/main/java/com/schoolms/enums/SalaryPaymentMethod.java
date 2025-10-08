package com.schoolms.enums;

public enum SalaryPaymentMethod {
    OFFLINE_CASH("offline_cash"),
    ONLINE_TRANSFER("online_transfer"),
    CHEQUE("cheque"),
    BANK_TRANSFER("bank_transfer");

    private final String value;

    SalaryPaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SalaryPaymentMethod fromValue(String value) {
        for (SalaryPaymentMethod method : SalaryPaymentMethod.values()) {
            if (method.value.equalsIgnoreCase(value)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unknown salary payment method: " + value);
    }
}

