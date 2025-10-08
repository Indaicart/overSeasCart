package com.schoolms.enums;

public enum EventType {
    SPORTS_DAY("sports_day"),
    ANNUAL_DAY("annual_day"),
    CULTURAL_FEST("cultural_fest"),
    INDEPENDENCE_DAY("independence_day"),
    REPUBLIC_DAY("republic_day"),
    FESTIVAL("festival"),
    WORKSHOP("workshop"),
    OTHER("other");

    private final String value;

    EventType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EventType fromValue(String value) {
        for (EventType type : EventType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown event type: " + value);
    }
}

