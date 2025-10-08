package com.schoolms.enums;

public enum LogAction {
    CREATE("create"),
    READ("read"),
    UPDATE("update"),
    DELETE("delete"),
    LOGIN("login"),
    LOGOUT("logout"),
    EXPORT("export"),
    IMPORT("import"),
    PAYMENT("payment"),
    APPROVAL("approval"),
    REJECTION("rejection");

    private final String value;

    LogAction(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static LogAction fromValue(String value) {
        for (LogAction action : LogAction.values()) {
            if (action.value.equalsIgnoreCase(value)) {
                return action;
            }
        }
        throw new IllegalArgumentException("Unknown log action: " + value);
    }
}

