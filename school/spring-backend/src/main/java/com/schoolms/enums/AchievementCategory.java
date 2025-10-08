package com.schoolms.enums;

public enum AchievementCategory {
    ACADEMIC("academic"),
    SPORTS("sports"),
    CULTURAL("cultural"),
    SOCIAL("social"),
    OTHER("other");

    private final String value;

    AchievementCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AchievementCategory fromValue(String value) {
        for (AchievementCategory category : AchievementCategory.values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown achievement category: " + value);
    }
}

