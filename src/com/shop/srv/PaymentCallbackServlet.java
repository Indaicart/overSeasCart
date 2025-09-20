package com.shop.srv;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.razorpay.Payment;
import com.shop.service.impl.OrderServiceImpl;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import java.io.IOException;
import java.util.ResourceBundle;

@WebServlet("/PaymentCallback")
public class PaymentCallbackServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    ResourceBundle rb = ResourceBundle.getBundle("application");
    String apiKey = rb.getString("razorpay.api.key");
	String apiSecret = rb.getString("razorpay.api.secret");

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        String userName = (String) session.getAttribute("username");
        String password = (String) session.getAttribute("password");

        if(userName == null || password == null) {

            response.sendRedirect("login.jsp?message=Session Expired, Sign In Again!!");
        }
        String razorpayPaymentId = request.getParameter("razorpay_payment_id");
        String razorpayOrderId = request.getParameter("razorpay_order_id");
        String razorpaySignature = request.getParameter("razorpay_signature");


        // ✅ Optional: Validate signature here using HMAC SHA256

        // ✅ Save payment details to DB or perform business logic
        System.out.println();
        System.out.println("Payment ID: " + razorpayPaymentId);
        System.out.println("Order ID: " + razorpayOrderId);
        System.out.println("Signature: " + razorpaySignature);

        // Optionally store in session or redirect with query params
        request.setAttribute("paymentId", razorpayPaymentId);
        request.setAttribute("orderId", razorpayOrderId);
        request.setAttribute("signature", razorpaySignature);
        try {
            // Fetch order using RazorpayOrderId
        	RazorpayClient razorpayClient = new RazorpayClient(apiKey,apiSecret);
            Payment payment = razorpayClient.payments.fetch(razorpayPaymentId);
            System.out.println("Payment details : " + payment.toString());
            System.out.println("------------------------------------------");
            System.out.println("Currency : " + payment.get("currency"));
            System.out.println("------------------------------------------");
            System.out.println("Amount : " + payment.get("amount"));
            int amountInPaise = (int) payment.get("amount");
            double amountInRupees = amountInPaise / 100.0;

            String status = new OrderServiceImpl().paymentSuccess(userName, amountInRupees, payment.get("currency"));

            // Redirect to success page
            

        } catch (RazorpayException e) {
            e.printStackTrace();
            response.sendRedirect("error.jsp");
        }

        // Redirect to success page
        request.getRequestDispatcher("payment-success.jsp").forward(request, response);
    }
}
