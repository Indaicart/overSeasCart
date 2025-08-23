package com.shop.service.impl;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.shop.beans.UserBean;
import com.shop.constants.IUserConstants;
import com.shop.service.UserService;
import com.shop.utility.DBUtil;
import com.shop.utility.MailMessage;
import com.shop.utility.PasswordUtil;

public class UserServiceImpl implements UserService {

	@Override
	public String registerUser(String userName, Long mobileNo, String emailId, String address, int pinCode,
			String password) {

		UserBean user = new UserBean(userName, mobileNo, emailId, address, pinCode, password);

		String status = registerUser(user);

		return status;
	}

	@Override
	public String registerUser(UserBean user) {

		String status = "User Registration Failed!";

//		boolean isRegtd = isRegistered(user.getEmail());
//
//		if (isRegtd) {
//			status = "Email Id Already Registered!";
//			return status;
//		}
		Connection conn = DBUtil.provideConnection();
		PreparedStatement ps = null;
		if (conn != null) {
			System.out.println("Connected Successfully!");
		}

		try {

			ps = conn.prepareStatement("insert into " + IUserConstants.TABLE_USER + " values(?,?,?,?,?,?)");

			ps.setString(1, user.getEmail());
			ps.setString(2, user.getName());
			ps.setLong(3, user.getMobile());
			ps.setString(4, user.getAddress());
			ps.setInt(5, user.getPinCode());
			ps.setString(6, PasswordUtil.hashPassword(user.getPassword()));

			int k = ps.executeUpdate();

			if (k > 0) {
				status = "User Registered Successfully!";
				MailMessage.registrationSuccess(user.getEmail(), user.getName().split(" ")[0]);
			}

		} catch (SQLException e) {
			status = "Error: " + e.getMessage();
			e.printStackTrace();
		}

		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(ps);

		return status;
	}

	@Override
	public boolean isRegistered(String emailId) {
		boolean flag = false;

		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement("select * from user where email=?");

			ps.setString(1, emailId);

			rs = ps.executeQuery();

			if (rs.next())
				flag = true;

		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(rs);

		return flag;
	}

	@Override
	public String isValidCredential(String emailId, String password) {
		String status = "Login Denied! Incorrect Username or Password";

		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;

		try {

			ps = con.prepareStatement("select * from user where email=?");
			ps.setString(1, emailId);
			rs = ps.executeQuery();

			if (rs.next()) {
			    String dbPassword = rs.getString("password"); // hashed password from DB

			    // Verify using BCrypt
			    if (PasswordUtil.checkPassword(password, dbPassword)) {
			        status = "valid";
			    } else {
			        status = "invalid";
			    }
			} else {
			    status = "invalid"; // no user found
			}

		} catch (SQLException e) {
			status = "Error: " + e.getMessage();
			e.printStackTrace();
		}

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(rs);
		return status;
	}

	@Override
	public UserBean getUserDetails(String emailId, String password) {

		UserBean user = null;

		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement("select * from user where email=?");
			ps.setString(1, emailId);
			rs = ps.executeQuery();

			if (rs.next()) {
			    String dbPassword = rs.getString("password"); // hashed password from DB

			    // Verify using BCrypt
			    if (PasswordUtil.checkPassword(password, dbPassword)) {
			    	user = new UserBean();
					user.setName(rs.getString("name"));
					user.setMobile(rs.getLong("mobile"));
					user.setEmail(rs.getString("email"));
					user.setAddress(rs.getString("address"));
					user.setPinCode(rs.getInt("pincode"));
					user.setPassword(rs.getString("password"));

					return user;
			    }
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(rs);

		return user;
	}

	@Override
	public String getFName(String emailId) {
		String fname = "";

		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement("select name from user where email=?");
			ps.setString(1, emailId);

			rs = ps.executeQuery();

			if (rs.next()) {
				fname = rs.getString(1);

				fname = fname.split(" ")[0];

			}

		} catch (SQLException e) {

			e.printStackTrace();
		}

		return fname;
	}

	@Override
	public String getUserAddr(String userId) {
		String userAddr = "";

		Connection con = DBUtil.provideConnection();
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement("select address from user where email=?");

			ps.setString(1, userId);

			rs = ps.executeQuery();

			if (rs.next())
				userAddr = rs.getString(1);

		} catch (SQLException e) {

			e.printStackTrace();
		}

		return userAddr;
	}
	
	@Override
	public boolean updateUserDetails(String name, int pincode, String email, Long mobile, String address) {
	    boolean success = false;
	    System.out.println("email : " + email + "mobile :" + mobile + "address :" + address);

	    try (Connection con = DBUtil.provideConnection()) {
	        String sql = "UPDATE user SET mobile = ?, address = ?, name = ?, pincode = ? WHERE email = ?";
	        PreparedStatement ps = con.prepareStatement(sql);
	        ps.setLong(1, mobile);
	        ps.setString(2, address);
	        ps.setString(3, name);
	        ps.setInt(4, pincode);
	        ps.setString(5, email);

	        int rows = ps.executeUpdate();
	        success = rows > 0;

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return success;
	}
	
	@Override
	public UserBean getUserDetails(String emailId) {

		UserBean user = null;

		Connection con = DBUtil.provideConnection();

		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement("select * from user where email=?");
			ps.setString(1, emailId);
			rs = ps.executeQuery();

			if (rs.next()) {
				user = new UserBean();
				user.setName(rs.getString("name"));
				user.setMobile(rs.getLong("mobile"));
				user.setEmail(rs.getString("email"));
				user.setAddress(rs.getString("address"));
				user.setPinCode(rs.getInt("pincode"));

				return user;
			}

		} catch (SQLException e) {
			e.printStackTrace();
		}

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		DBUtil.closeConnection(rs);

		return user;
	}



	@Override
	public boolean updatePassword(String email, String password) {
	    boolean isUpdated = false;
	    Connection con = DBUtil.provideConnection();
	    PreparedStatement ps = null;

	    try {
	        ps = con.prepareStatement("UPDATE user SET password = ? WHERE email = ?");
	        ps.setString(1, PasswordUtil.hashPassword(password));
	        ps.setString(2, email);

	        int rowsAffected = ps.executeUpdate();
	        isUpdated = (rowsAffected > 0);

	    } catch (SQLException e) {
	        e.printStackTrace();
	    } finally {
	        try {
	            if (ps != null) ps.close();
	            if (con != null) con.close();
	        } catch (SQLException e) {
	            e.printStackTrace();
	        }
	    }

		DBUtil.closeConnection(con);
		DBUtil.closeConnection(ps);
		
	    return isUpdated;
	}
}
