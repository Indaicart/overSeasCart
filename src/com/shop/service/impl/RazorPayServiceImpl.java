package com.shop.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shop.service.RazorPayService;

import java.util.ResourceBundle;


import org.json.JSONObject;

public class RazorPayServiceImpl implements RazorPayService {
	ResourceBundle rb = ResourceBundle.getBundle("application");

	String apiKey = rb.getString("razorpay.api.key");
	String apiSecret = rb.getString("razorpay.api.secret");
    
    @Override
    public Order createOrder(double amount , String currency , String receiptId) throws RazorpayException {
        RazorpayClient razorpayClient = new RazorpayClient(apiKey,apiSecret);
        JSONObject orderRequest  = new JSONObject();
        orderRequest.put("amount", amount *100);
        orderRequest.put("currency",currency);
        orderRequest.put("receipt", receiptId);

        Order order = razorpayClient.orders.create(orderRequest);
        return order;
    }

}