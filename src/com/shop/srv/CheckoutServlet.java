
package com.shop.srv;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.beans.UserBean;
import com.shop.service.impl.UserServiceImpl;
import com.shop.utility.DBConstantsUtil;


@WebServlet("/CheckoutServlet")
public class CheckoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    	String userName = (String) request.getSession().getAttribute("username");
		String password = (String) request.getSession().getAttribute("password");
		
		System.out.println("In CheckoutServlet, User Name: " + userName);
//		System.out.println("In CheckoutServlet, Password: " + password);

        if (userName == null) {
        	System.out.println("In CheckoutServlet, moving to login page : ");
            response.sendRedirect("login.jsp?message=Session Expired, Login Again!!");
            return;
        }

        String amount = request.getParameter("amount");
        String weight = request.getParameter("weight");

        // You can fetch user details from database if needed
        UserServiceImpl userService = new UserServiceImpl();
        UserBean user = userService.getUserDetails(userName, password);

        request.setAttribute("user", user);
        request.setAttribute("amount", amount);
        request.setAttribute("weight", weight);
        
        String shipmentChargePerKg = DBConstantsUtil.getValueFromDB("ship_charge");
        String conversionRate = DBConstantsUtil.getValueFromDB("USD_INR");
        System.out.println("In CheckoutServlet, shipmentChargePerKg: " + shipmentChargePerKg);
        String shipmentCharge = (Double.parseDouble(shipmentChargePerKg) * Math.ceil(Double.parseDouble(weight))) + "";
        request.setAttribute("shipmentCharge", shipmentCharge);
        
        double orderTotal = (Double.parseDouble(shipmentCharge) + Double.parseDouble(amount));
        double forexCharge = orderTotal * 0.03;
        String orderTotalStr = Double.toString(orderTotal);
        String forexChargeStr = Double.toString(forexCharge);
        
        request.setAttribute("orderTotal", orderTotalStr);
        request.setAttribute("forexCharge", forexChargeStr);
        request.setAttribute("conversionRate", conversionRate);
        request.getRequestDispatcher("checkout.jsp").forward(request, response);
    }
}