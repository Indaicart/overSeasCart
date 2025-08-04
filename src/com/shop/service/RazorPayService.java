package com.shop.service;

import com.razorpay.Order;
import com.razorpay.RazorpayException;

public interface RazorPayService {

	public Order createOrder(double amount , String currency , String receiptId)throws RazorpayException;
}
