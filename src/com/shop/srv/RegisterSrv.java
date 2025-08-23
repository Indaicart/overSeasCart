package com.shop.srv;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.beans.UserBean;
import com.shop.service.impl.UserServiceImpl;

/**
 * Servlet implementation class RegisterSrv
 */
@WebServlet("/RegisterSrv")
public class RegisterSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");
		String name = request.getParameter("name");
		Long mobile = Long.parseLong(request.getParameter("mobile"));
		String email = request.getParameter("email");
		String address = request.getParameter("address");
		int pincode = Integer.parseInt(request.getParameter("pincode"));
		String password = request.getParameter("password");
		String confirmPassword = request.getParameter("confirmPassword");
		String status = "";

		if (password != null && password.equals(confirmPassword)) {
			
			UserBean user = new UserBean(name, mobile, email, address, pincode, password);

			UserServiceImpl dao = new UserServiceImpl();

			status = dao.registerUser(user);
		} else {
			status = "Your password and confirmation password do not match!";
		}

		if (status.equals("User Registered Successfully!")) {
			RequestDispatcher rd = request.getRequestDispatcher("login.jsp?message=" + status);
			rd.forward(request, response);
		}
		else {
			request.setAttribute("name", name);
			request.setAttribute("mobile", mobile);
			request.setAttribute("address", address);
			request.setAttribute("pincode", pincode);
			request.setAttribute("emailPrefilled", email);
			RequestDispatcher rd = request.getRequestDispatcher("register.jsp?message=" + status);
			rd.forward(request, response);
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}

}
