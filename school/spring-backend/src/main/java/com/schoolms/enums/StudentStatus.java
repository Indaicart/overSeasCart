package com.schoolms.enums;

public enum StudentStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    GRADUATED("graduated"),
    TRANSFERRED("transferred"),
    SUSPENDED("suspended");

    private final String value;

    StudentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static StudentStatus fromValue(String value) {
        for (StudentStatus status : StudentStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown student status: " + value);
    }
}

