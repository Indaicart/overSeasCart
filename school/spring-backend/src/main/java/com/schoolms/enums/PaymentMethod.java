package com.schoolms.enums;

public enum PaymentMethod {
    CARD("card"),
    NETBANKING("netbanking"),
    UPI("upi"),
    WALLET("wallet"),
    CASH("cash"),
    CHEQUE("cheque"),
    BANK_TRANSFER("bank_transfer");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentMethod fromValue(String value) {
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.value.equalsIgnoreCase(value)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unknown payment method: " + value);
    }
}

