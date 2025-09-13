package com.shop.DAO;

import com.shop.utility.DBUtil;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

public class productImagesDAO {

    private Connection getConnection() throws SQLException {
    return DBUtil.provideConnection(); // your utility class for DB connection
}

    public boolean insertProductImage(String pid, InputStream image, boolean isPrimary, int sortOrder) {
        String sql = "INSERT INTO product_images (pid, image, is_primary, sort_order) VALUES (?, ?, ?, ?)";
        Connection con = null;
        PreparedStatement ps = null;

        try {
            con = getConnection();
            ps = con.prepareStatement(sql);

            ps.setString(1, pid);
            ps.setBlob(2, image);
            ps.setBoolean(3, isPrimary);
            ps.setInt(4, sortOrder);

            System.out.println("Inserting Image -> PID: " + pid
                    + ", isPrimary: " + isPrimary
                    + ", sortOrder: " + sortOrder);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("✅ Image inserted successfully for Product: " + pid);
                return true;
            } else {
                System.out.println("⚠️ No rows inserted for Product: " + pid);
                return false;
            }

        } catch (Exception e) {
            System.out.println("❌ Error inserting image for Product: " + pid);
            e.printStackTrace();
            return false;
        } finally {
            try {
                if (ps != null) ps.close();
                if (con != null) con.close();
                System.out.println("🔒 Connection closed for PID: " + pid);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public boolean deleteAllProductImages(String prodId) {
        boolean isDeleted = false;
        Connection con = DBUtil.provideConnection();
        PreparedStatement ps = null;
        try {
            ps = con.prepareStatement("DELETE FROM product_images WHERE pid = ?");
            ps.setString(1, prodId);
            int count = ps.executeUpdate();
            isDeleted = (count >= 0); // zero or more rows deleted means success
        } catch (SQLException e) {
            e.printStackTrace();
            isDeleted = false;
        } finally {
            DBUtil.closeConnection(ps);
            DBUtil.closeConnection(con);
        }
        return isDeleted;
    }

    public boolean addProductImages(String prodId, List<InputStream> imageStreams) {
        boolean isAdded = false;
        Connection con = DBUtil.provideConnection();
        PreparedStatement ps = null;
        try {
            ps = con.prepareStatement("INSERT INTO product_images (pid, image) VALUES (?, ?)");
            for (InputStream imageStream : imageStreams) {
                ps.setString(1, prodId);
                ps.setBinaryStream(2, imageStream);
                ps.addBatch();
            }
            ps.executeBatch();
            isAdded = true;
        } catch (SQLException e) {
            e.printStackTrace();
            isAdded = false;
        } finally {
            DBUtil.closeConnection(ps);
            DBUtil.closeConnection(con);
        }
        return isAdded;
    }
}