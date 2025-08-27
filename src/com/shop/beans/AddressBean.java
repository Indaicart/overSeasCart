package com.shop.beans;

public class AddressBean {private int addressId;
    private String userEmail;
    private String flat;       // Flat/House No/Building
    private String street;     // Area/Street/Sector
    private String landmark;   // Landmark
    private String city;
    private String state;
    private int pincode;

    // Constructors
    public AddressBean() {}

    public AddressBean(int addressId, String userEmail, String flat, String street,
                   String landmark, String city, String state, int pincode) {
        this.addressId = addressId;
        this.userEmail = userEmail;
        this.flat = flat;
        this.street = street;
        this.landmark = landmark;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
    }

    // Getters and Setters
    public int getAddressId() {
        return addressId;
    }
    public void setAddressId(int addressId) {
        this.addressId = addressId;
    }

    public String getUserEmail() {
        return userEmail;
    }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFlat() {
        return flat;
    }
    public void setFlat(String flat) {
        this.flat = flat;
    }

    public String getStreet() {
        return street;
    }
    public void setStreet(String street) {
        this.street = street;
    }

    public String getLandmark() {
        return landmark;
    }
    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }
    public void setState(String state) {
        this.state = state;
    }

    public int getPincode() {
        return pincode;
    }
    public void setPincode(int pincode) {
        this.pincode = pincode;
    }
}