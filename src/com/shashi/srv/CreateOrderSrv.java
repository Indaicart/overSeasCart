package com.shashi.srv;

import com.razorpay.Order;
import com.shashi.service.impl.RazorPayServiceImpl;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.ResourceBundle;

@WebServlet("/CreateOrderServlet")
public class CreateOrderSrv extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
		ResourceBundle rb = ResourceBundle.getBundle("application");

		String apiKey = rb.getString("razorpay.api.key");
        double amount = Double.parseDouble(request.getParameter("amount")); 

        try {
            RazorPayServiceImpl razorPayService = new RazorPayServiceImpl();
            String receiptId = "rcpt_" + System.currentTimeMillis();
            String currency = "INR";

            Order order = razorPayService.createOrder(amount, currency, receiptId);
            System.out.print("Order details : " + order);
            request.setAttribute("orderId", order.get("id"));  // e.g., "order_Mh0zLhE2..."
            request.setAttribute("amount", amount);
            request.setAttribute("currency", "INR");
            request.setAttribute("razorpayKey", apiKey); // pass public key

            request.getRequestDispatcher("payment.jsp").forward(request, response);
        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("error", "Payment initiation failed: " + e.getMessage());
            request.getRequestDispatcher("error.jsp").forward(request, response);
        }
    }
}