package com.schoolms.enums;

public enum FeeType {
    TUITION("tuition"),
    TRANSPORT("transport"),
    LIBRARY("library"),
    LAB("lab"),
    EXAM("exam"),
    ADMISSION("admission"),
    ANNUAL("annual"),
    SPORTS("sports"),
    OTHER("other");

    private final String value;

    FeeType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static FeeType fromValue(String value) {
        for (FeeType type : FeeType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown fee type: " + value);
    }
}

