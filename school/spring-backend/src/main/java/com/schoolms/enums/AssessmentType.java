package com.schoolms.enums;

public enum AssessmentType {
    EXAM("exam"),
    QUIZ("quiz"),
    ASSIGNMENT("assignment"),
    PROJECT("project"),
    PRACTICAL("practical"),
    TEST("test"),
    MIDTERM("midterm"),
    FINAL("final");

    private final String value;

    AssessmentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AssessmentType fromValue(String value) {
        for (AssessmentType type : AssessmentType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown assessment type: " + value);
    }
}

