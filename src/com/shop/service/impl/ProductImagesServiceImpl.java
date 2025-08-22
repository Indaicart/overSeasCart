package com.shop.service.impl;

import com.shop.service.ProductImagesService;
import com.shop.utility.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ProductImagesServiceImpl implements ProductImagesService {

    private Connection getConnection() throws SQLException {
    return DBUtil.provideConnection();
}

    @Override
    public List<Integer> getAllImagesByPid(String pid) {
        List<Integer> imageIds = new ArrayList<>();
        String sql = "SELECT image_id FROM product_images WHERE pid = ? ORDER BY sort_order ASC";

        try (Connection con = getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, pid);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    imageIds.add(rs.getInt("image_id"));
                }
            }

            System.out.println("Fetched " + imageIds.size() + " images for product " + pid);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return imageIds;
    }

    @Override
    public byte[] getImageById(int imgId) {
        byte[] imageBytes = null;

        String sql = "SELECT image FROM product_images WHERE image_id = ?";

        try (Connection con = getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, imgId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    imageBytes = rs.getBytes("image");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return imageBytes;
    }
}