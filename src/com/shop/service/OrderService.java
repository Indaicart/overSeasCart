package com.shop.service;

import java.util.List;

import com.shop.beans.OrderBean;
import com.shop.beans.OrderDetails;
import com.shop.beans.TransactionBean;

public interface OrderService {

	public String paymentSuccess(String userName, double paidAmount, String currency);

	public boolean addOrder(OrderBean order);

	public boolean addTransaction(TransactionBean transaction);

	public int countSoldItem(String prodId);

	public List<OrderBean> getAllOrders();

	public List<OrderBean> getOrdersByUserId(String emailId);

	public List<OrderDetails> getAllOrderDetails(String userEmailId);

	public String shipNow(String orderId, String prodId);
}
