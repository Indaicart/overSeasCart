package com.shop.DAO;

import com.shop.utility.DBUtil;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

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
}