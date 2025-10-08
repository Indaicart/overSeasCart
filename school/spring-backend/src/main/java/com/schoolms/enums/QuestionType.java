package com.schoolms.enums;

public enum QuestionType {
    MULTIPLE_CHOICE("multiple_choice"),
    TRUE_FALSE("true_false"),
    SHORT_ANSWER("short_answer"),
    ESSAY("essay"),
    RATING("rating");

    private final String value;

    QuestionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static QuestionType fromValue(String value) {
        for (QuestionType type : QuestionType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown question type: " + value);
    }
}

