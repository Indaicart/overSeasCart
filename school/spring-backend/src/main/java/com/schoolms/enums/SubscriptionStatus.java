package com.schoolms.enums;

public enum SubscriptionStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    SUSPENDED("suspended"),
    CANCELLED("cancelled"),
    TRIAL("trial");

    private final String value;

    SubscriptionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SubscriptionStatus fromValue(String value) {
        for (SubscriptionStatus status : SubscriptionStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown subscription status: " + value);
    }
}

