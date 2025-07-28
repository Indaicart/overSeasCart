package com.shashi.srv;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/VerifyOtpSrv")
public class VerifyOtpSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Get user-entered OTP and email
		String enteredOtp = request.getParameter("otp");
		String email = request.getParameter("email");
		String forPasswordChange = request.getParameter("forPasswordChange");
		System.out.println("In VerifyOtpSrv, forPasswordChange: " + forPasswordChange);
		boolean isForPasswordChange = "true".equals(forPasswordChange);

		// Get session and stored OTP
		HttpSession session = request.getSession(false);
		String generatedOtp = (session != null) ? (String) session.getAttribute("generatedOtp") : null;

		String message;

		if (session == null || generatedOtp == null) {
			message = "Session expired or OTP not found. Please request a new OTP.";
			request.setAttribute("message", message);
			request.getRequestDispatcher("sendOtp.jsp").forward(request, response);
			return;
		}

		if (enteredOtp.equals(generatedOtp)) {
			// OTP matched – proceed to registration page
			request.setAttribute("emailPrefilled", email);
			if(isForPasswordChange) {
				request.getRequestDispatcher("changePassword.jsp").forward(request, response);
			}
			else {
				request.getRequestDispatcher("register.jsp").forward(request, response);
			}
		} else {
			// OTP didn't match
			message = "Invalid OTP. Please try again.";
			request.setAttribute("message", message);
			request.setAttribute("emailPrefilled", email); // To refill the form
			request.getRequestDispatcher("verifyOtp.jsp").forward(request, response);
		}
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}
}
