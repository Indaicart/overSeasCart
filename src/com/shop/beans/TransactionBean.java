package com.shop.beans;

import java.io.Serializable;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import com.shop.utility.IDUtil;

@SuppressWarnings("serial")
public class TransactionBean implements Serializable {

	private String transactionId;

	private String userName;

	private Timestamp transDateTime;

	private double totalCartValue;
	private double totalWeight;
	private double shipmentCharges;
	private int currency;

	private double transAmount;

	public TransactionBean() {
		super();
		this.transactionId = IDUtil.generateTransId();

		SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD hh:mm:ss");

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		sdf.format(timestamp);

		this.transDateTime = timestamp;
	}

	public TransactionBean(String userName, double transAmount, String transactionId, double totalCartValue, double totalWeight, double shipmentCharges,
						   int currency) {
		super();
		this.userName = userName;
		this.transAmount = transAmount;

		this.transactionId = transactionId;
		this.totalCartValue = totalCartValue;
		this.totalWeight = totalWeight;
		this.shipmentCharges = shipmentCharges;
		this.currency = currency;

		SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD hh:mm:ss");

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		sdf.format(timestamp);

		this.transDateTime = timestamp;

	}

	public TransactionBean(String transactionId, String userName, double transAmount, double totalCartValue, double totalWeight,
						   double shipmentCharges, int currency) {
		super();
		this.transactionId = transactionId;
		this.userName = userName;
		this.transAmount = transAmount;
		this.totalCartValue = totalCartValue;
		this.totalWeight = totalWeight;
		this.shipmentCharges = shipmentCharges;
		this.currency = currency;

		SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD hh:mm:ss");

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		sdf.format(timestamp);

		this.transDateTime = timestamp;
	}

	public TransactionBean(String userName, Timestamp transDateTime, double transAmount) {
		super();
		this.userName = userName;
		this.transDateTime = transDateTime;
		this.transactionId = IDUtil.generateTransId();
		this.transAmount = transAmount;
	}

	public TransactionBean(String transactionId, String userName, Timestamp transDateTime, double transAmount) {
		super();
		this.transactionId = transactionId;
		this.userName = userName;
		this.transDateTime = transDateTime;
		this.transAmount = transAmount;

	}

	public String getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public Timestamp getTransDateTime() {
		return transDateTime;
	}

	public void setTransDateTime(Timestamp transDateTime) {
		this.transDateTime = transDateTime;
	}

	public double getTransAmount() {
		return transAmount;
	}

	public void setTransAmount(double transAmount) {
		this.transAmount = transAmount;
	}

	public double getTotalCartValue() {
		return totalCartValue;
	}

	public void setTotalCartValue(double totalCartValue) {
		this.totalCartValue = totalCartValue;
	}

	public double getTotalWeight() {
		return totalWeight;
	}

	public void setTotalWeight(double totalWeight) {
		this.totalWeight = totalWeight;
	}

	public double getShipmentCharges() {
		return shipmentCharges;
	}

	public void setShipmentCharges(double shipmentCharges) {
		this.shipmentCharges = shipmentCharges;
	}

	public int getCurrency() {
		return currency;
	}

	public void setCurrency(int currency) {
		this.currency = currency;
	}
}
