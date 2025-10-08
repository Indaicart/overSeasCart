package com.schoolms.enums;

public enum BillingCycle {
    MONTHLY("monthly"),
    ANNUAL("annual"),
    QUARTERLY("quarterly");

    private final String value;

    BillingCycle(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static BillingCycle fromValue(String value) {
        for (BillingCycle cycle : BillingCycle.values()) {
            if (cycle.value.equalsIgnoreCase(value)) {
                return cycle;
            }
        }
        throw new IllegalArgumentException("Unknown billing cycle: " + value);
    }
}

