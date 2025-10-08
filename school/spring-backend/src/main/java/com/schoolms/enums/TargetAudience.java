package com.schoolms.enums;

public enum TargetAudience {
    TEACHERS("teachers"),
    STUDENTS("students"),
    BOTH("both"),
    PARENTS("parents");

    private final String value;

    TargetAudience(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TargetAudience fromValue(String value) {
        for (TargetAudience audience : TargetAudience.values()) {
            if (audience.value.equalsIgnoreCase(value)) {
                return audience;
            }
        }
        throw new IllegalArgumentException("Unknown target audience: " + value);
    }
}

