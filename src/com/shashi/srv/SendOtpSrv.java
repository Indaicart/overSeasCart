package com.shashi.srv;

import java.io.IOException;
import java.security.SecureRandom;
import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.shashi.service.impl.UserServiceImpl;
import com.shashi.utility.MailMessage;

@WebServlet("/SendOtpSrv")
public class SendOtpSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");
		String email = request.getParameter("email");
		String forPasswordChange = request.getParameter("forPasswordChange");
		boolean isForPasswordChange = "true".equals(forPasswordChange);
		
		// Generate 6-digit OTP
		SecureRandom random = new SecureRandom();
		String otp = String.format("%06d", random.nextInt(1000000));
		String htmlMessage;
		String mailSubject;
		if (isForPasswordChange) {
			// Create HTML email content
			htmlMessage = "<html><body>" + "<h2 style='color:green;'>OTP for Password Reset</h2>"
			+ "<p>Your OTP is: <strong style='color:blue;'>" + otp + "</strong></p>" + "</body></html>";
			mailSubject = "Your OTP for Password Reset";
		}
		else {
			htmlMessage = "<html><body>" + "<h2 style='color:green;'>OTP for Registration</h2>"
					+ "<p>Your OTP is: <strong style='color:blue;'>" + otp + "</strong></p>" + "</body></html>";
			mailSubject = "Your OTP for Registration";
		}

		UserServiceImpl udao = new UserServiceImpl();
		boolean registred = udao.isRegistered(email);
		String message;
		
		if (registred && !isForPasswordChange) {
			message = "Email " + email + " is already registered.";
			request.setAttribute("message", message);
			request.getRequestDispatcher("sendOtp.jsp").forward(request, response);
		} else {
			// Store OTP in session
			HttpSession session = request.getSession();
			session.setAttribute("generatedOtp", otp);

			// Send mail
			String status = MailMessage.sendMessage(email, mailSubject, htmlMessage);
			System.out.println("OTP send status: " + status);

			if ("SUCCESS".equals(status)) {
				message = "OTP sent to " + email;
			} else {
				message = "Failed to send OTP. Please check email configuration.";
			}
			
			request.setAttribute("message", message);
			request.setAttribute("emailPrefilled", email);
			request.setAttribute("forPasswordChange", forPasswordChange);
			request.getRequestDispatcher("verifyOtp.jsp").forward(request, response);
		}
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}
}
