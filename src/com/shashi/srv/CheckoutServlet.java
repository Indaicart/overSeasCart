
package com.shashi.srv;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shashi.beans.UserBean;
import com.shashi.service.impl.UserServiceImpl;


@WebServlet("/CheckoutServlet")
public class CheckoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    	String userName = (String) request.getSession().getAttribute("username");
		String password = (String) request.getSession().getAttribute("password");
		
		System.out.println("User Name : " + userName);
		System.out.println("Password : " + password);

        if (userName == null) {
            response.sendRedirect("login.jsp?message=Session Expired, Login Again!!");
            return;
        }

        String amount = request.getParameter("amount");

        // You can fetch user details from database if needed
        UserServiceImpl userService = new UserServiceImpl();
        UserBean user = userService.getUserDetails(userName, password);

        request.setAttribute("user", user);
        request.setAttribute("amount", amount);
        request.getRequestDispatcher("checkout.jsp").forward(request, response);
    }
}
