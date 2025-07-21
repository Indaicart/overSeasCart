package com.shashi.srv;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import org.json.JSONObject;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shashi.service.CartService;
import com.shashi.service.impl.CartServiceImpl;

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
            Order order = razorpayClient.orders.fetch(razorpayOrderId);
            String receipt = order.get("receipt");   // Contains your embedded userId
            String[] parts = receipt.split("_");
            String userId = parts[1]; 

            // Now you have userId → clear their cart
            System.out.println();
            System.out.println("Order : " + order);
            System.out.println("User ID : " + userId);
            CartServiceImpl cart = new CartServiceImpl();
            cart.removeAllProductsFromCart("laxmikanthchougale2@gmail.com");

            // Redirect to success page
            

        } catch (RazorpayException e) {
            e.printStackTrace();
            response.sendRedirect("error.jsp");
        }

        // Redirect to success page
        request.getRequestDispatcher("payment-success.jsp").forward(request, response);
    }
}
