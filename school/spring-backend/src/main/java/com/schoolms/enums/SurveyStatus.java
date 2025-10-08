package com.schoolms.enums;

public enum SurveyStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    CLOSED("closed");

    private final String value;

    SurveyStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SurveyStatus fromValue(String value) {
        for (SurveyStatus status : SurveyStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown survey status: " + value);
    }
}

