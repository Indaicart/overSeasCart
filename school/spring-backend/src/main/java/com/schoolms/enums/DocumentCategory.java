package com.schoolms.enums;

public enum DocumentCategory {
    ACADEMIC("academic"),
    ADMINISTRATIVE("administrative"),
    STUDENT_RECORD("student_record"),
    TEACHER_RECORD("teacher_record"),
    GENERAL("general"),
    CERTIFICATE("certificate"),
    REPORT("report");

    private final String value;

    DocumentCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static DocumentCategory fromValue(String value) {
        for (DocumentCategory category : DocumentCategory.values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown document category: " + value);
    }
}

