package com.shop.utility;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DBConstantsUtil {

	public static String getValueFromDB(String key) {
		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;
		String value = null;

		try {
			ps = con.prepareStatement("select * from constants where `key`=?");
			ps.setString(1, key);
			rs = ps.executeQuery();

			if(rs.next()) {
				value = rs.getString("value");
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(rs);
		
		return value;
	}
	
	/**
	 * Adds a new key-value pair to the constants table or updates the value if the key already exists
	 * @param key The key to add or update
	 * @param value The value to set for the key
	 * @return true if the operation was successful, false otherwise
	 */
	public static boolean addOrUpdateConstant(String key, String value) {
		Connection con = DBUtil.provideConnection();
		PreparedStatement ps = null;
		boolean success = false;
		
		try {
			// Use INSERT ... ON DUPLICATE KEY UPDATE for efficient upsert operation
			ps = con.prepareStatement(
				"INSERT INTO constants (`key`, `value`) VALUES (?, ?) " +
				"ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)"
			);
			ps.setString(1, key);
			ps.setString(2, value);
			
			int rowsAffected = ps.executeUpdate();
			success = rowsAffected > 0;
			
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			DBUtil.closeConnection(ps);
			DBUtil.closeConnection(con);
		}
		
		return success;
	}
	
	/**
	 * Updates all product prices by multiplying them with the USD value in INR
	 * @param usdValueInInr The USD value in INR to multiply with existing prices
	 * @return true if the operation was successful, false otherwise
	 */
	public static boolean updateProductPrice(String newUsdValueInInr, String oldUsdValueInInr) {
		Connection con = DBUtil.provideConnection();
		PreparedStatement ps = null;
		boolean success = false;
		
		try {
			// Parse the USD value in INR to double
			double newUsdValue = Double.parseDouble(newUsdValueInInr);
			double oldUsdValue = Double.parseDouble(oldUsdValueInInr);
			
			// Update all product prices by multiplying with the USD value
			ps = con.prepareStatement("UPDATE product SET pprice = pprice * ?");
			ps.setDouble(1, oldUsdValue/newUsdValue);
			
			int rowsAffected = ps.executeUpdate();
			success = rowsAffected > 0;
			
			addOrUpdateConstant("USD_INR", newUsdValueInInr);
			
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (NumberFormatException e) {
			System.err.println("Invalid USD value format newUsdValueInInr: " + newUsdValueInInr + " and oldUsdValueInInr" + oldUsdValueInInr);
			e.printStackTrace();
		} finally {
			DBUtil.closeConnection(ps);
			DBUtil.closeConnection(con);
		}
		
		return success;
	}
}
