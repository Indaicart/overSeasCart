package com.schoolms.enums;

public enum UserRole {
    ADMIN("admin"),
    TEACHER("teacher"),
    STUDENT("student"),
    PARENT("parent"),
    STAFF("staff"),
    SUPER_ADMIN("super_admin");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        for (UserRole role : UserRole.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown user role: " + value);
    }
}

