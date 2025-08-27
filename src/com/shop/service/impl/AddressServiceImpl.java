package com.shop.service.impl;

import com.shop.beans.AddressBean;
import com.shop.service.AddressService;
import com.shop.utility.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AddressServiceImpl implements AddressService {
    @Override
    public String saveAddress(AddressBean address) {String status = "Failed to save address!";
        String sql = "INSERT INTO address (user_email, flat, street, landmark, city, state, pincode) VALUES (?,?,?,?,?,?,?)";

        try (Connection conn = DBUtil.provideConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, address.getUserEmail());
            ps.setString(2, address.getFlat());
            ps.setString(3, address.getStreet());
            ps.setString(4, address.getLandmark());
            ps.setString(5, address.getCity());
            ps.setString(6, address.getState());
            ps.setInt(7, address.getPincode());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                status = "Address Saved Successfully!";
            }

        } catch (SQLException e) {
            e.printStackTrace();
            status = "Error saving address: " + e.getMessage();
        }
        return status;
    }

    @Override
    public AddressBean getAddressByEmail(String email) {
        AddressBean address = null;
        String sql = "SELECT * FROM address WHERE user_email=?";

        try (Connection conn = DBUtil.provideConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                address = new AddressBean();
                address.setAddressId(rs.getInt("address_id"));
                address.setUserEmail(rs.getString("user_email"));
                address.setFlat(rs.getString("flat"));
                address.setStreet(rs.getString("street"));
                address.setLandmark(rs.getString("landmark"));
                address.setCity(rs.getString("city"));
                address.setState(rs.getString("state"));
                address.setPincode(rs.getInt("pincode"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return address;
    }

    public boolean updateAddress(AddressBean address) {
        boolean status = false;
        try (Connection con = DBUtil.provideConnection()) {
            String sql = "UPDATE address SET flat=?, street=?, landmark=?, city=?, state=?, pincode=? WHERE user_email=?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, address.getFlat());
            ps.setString(2, address.getStreet());
            ps.setString(3, address.getLandmark());
            ps.setString(4, address.getCity());
            ps.setString(5, address.getState());
            ps.setInt(6, address.getPincode());
            ps.setString(7, address.getUserEmail());

            int rows = ps.executeUpdate();
            status = rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status;
    }
}
