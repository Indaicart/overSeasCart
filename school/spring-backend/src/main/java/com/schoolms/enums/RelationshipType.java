package com.schoolms.enums;

public enum RelationshipType {
    FATHER("father"),
    MOTHER("mother"),
    GUARDIAN("guardian"),
    GRANDFATHER("grandfather"),
    GRANDMOTHER("grandmother"),
    UNCLE("uncle"),
    AUNT("aunt"),
    OTHER("other");

    private final String value;

    RelationshipType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RelationshipType fromValue(String value) {
        for (RelationshipType type : RelationshipType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown relationship type: " + value);
    }
}

