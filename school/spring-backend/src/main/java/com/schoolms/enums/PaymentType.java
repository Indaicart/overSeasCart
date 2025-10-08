package com.schoolms.enums;

public enum PaymentType {
    SCHOOL_SUBSCRIPTION("school_subscription"),
    STUDENT_FEE("student_fee"),
    ADMISSION_FEE("admission_fee"),
    STAFF_SALARY("staff_salary"),
    OTHER("other");

    private final String value;

    PaymentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentType fromValue(String value) {
        for (PaymentType type : PaymentType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown payment type: " + value);
    }
}

