package com.shop.srv;

import java.io.IOException;
import java.util.ResourceBundle;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.service.impl.UserServiceImpl;
import com.shop.utility.MailMessage;

@WebServlet("/ChangePasswordSrv")
public class ChangePasswordSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String email = request.getParameter("email");
		String password = request.getParameter("password");
		String confirmPassword = request.getParameter("cpassword");
		
		request.setAttribute("emailPrefilled", email);
		if (email == null || email.isEmpty()) {
			request.setAttribute("message", "Failed to update password. Please try again.");
		    request.getRequestDispatcher("changePassword.jsp").forward(request, response);
		    return;
		}
		else if (!password.equals(confirmPassword)) {
			request.setAttribute("message", "Passwords do not match!");
		    request.getRequestDispatcher("changePassword.jsp").forward(request, response);
		    return;
		}
		UserServiceImpl userService = new UserServiceImpl();
		boolean isUpdated = userService.updatePassword(email, password);
		ResourceBundle rb = ResourceBundle.getBundle("application");
		String supportEmail = rb.getString("mailer.email");

		if (isUpdated) {
			// Send mail
			String htmlMessage = "<html><body>" +
		              "<h2 style='color:green;'>Your Password is changed</h2>" +
		              "<p>Your password was changed successfully. You can now log in with your new credentials.</p>" +
		              "<p>If this wasn't you, please contact " + supportEmail + " immediately.</p>" +
		              "</body></html>";
			String mailSubject = "Password Reset Successfull";
			String status = MailMessage.sendMessage(email, mailSubject, htmlMessage);
			System.out.println("Password update mail sent status" + status);
			// Redirect to login with success message
			response.sendRedirect("login.jsp?message=Password updated successfully. Please login.");
		} else {
			// Stay on change password page with error
			request.setAttribute("message", "Failed to update password. Please try again.");
			request.getRequestDispatcher("changePassword.jsp").forward(request, response);
		}
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}
}
