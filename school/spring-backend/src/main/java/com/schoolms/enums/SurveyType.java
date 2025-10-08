package com.schoolms.enums;

public enum SurveyType {
    SURVEY("survey"),
    QUIZ("quiz");

    private final String value;

    SurveyType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SurveyType fromValue(String value) {
        for (SurveyType type : SurveyType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown survey type: " + value);
    }
}

