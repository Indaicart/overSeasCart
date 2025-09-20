package com.shop.srv;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.shop.beans.UserBean;
import com.shop.service.impl.UserServiceImpl;

/**
 * Servlet implementation class LoginSrv
 */
@WebServlet("/LoginSrv")
public class LoginSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	public LoginSrv() {
		super();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String userName = request.getParameter("username");
		String password = request.getParameter("password");
		String userType;
		response.setContentType("text/html");

		UserServiceImpl udao = new UserServiceImpl();
		String status = udao.isValidCredential(userName, password);
		HttpSession session = request.getSession();
		RequestDispatcher rd;
		
		
		if (status.equalsIgnoreCase("valid")) {
			// valid user
			if(userName.equals("my.official.bharat.bazaar@gmail.com")) {
				userType = "admin";
				System.out.println("Admin Signed in");
				rd = request.getRequestDispatcher("adminViewProduct.jsp");
			}
			else {
				userType = "customer";
				UserBean user = udao.getUserDetails(userName, password);
				session.setAttribute("userdata", user);
				rd = request.getRequestDispatcher("userHome.jsp");
			}
			
			session.setAttribute("username", userName);
			session.setAttribute("password", password);
			session.setAttribute("usertype", userType);

			rd.forward(request, response);
			System.out.println("Sign In successfull!!!");
		} else {
			// invalid user;
			session.setAttribute("username", userName);
			status = "Sign In Denied! Invalid Username or password.";
			System.out.println("Sign In unsuccessfull!!!");
			rd = request.getRequestDispatcher("login.jsp?message=" + status);
			rd.forward(request, response);
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}

}
