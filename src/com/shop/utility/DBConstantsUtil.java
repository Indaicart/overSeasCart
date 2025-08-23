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
}
