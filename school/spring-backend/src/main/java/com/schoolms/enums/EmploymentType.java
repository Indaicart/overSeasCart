package com.schoolms.enums;

public enum EmploymentType {
    FULL_TIME("full_time"),
    PART_TIME("part_time"),
    CONTRACT("contract"),
    SUBSTITUTE("substitute");

    private final String value;

    EmploymentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EmploymentType fromValue(String value) {
        for (EmploymentType type : EmploymentType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown employment type: " + value);
    }
}

