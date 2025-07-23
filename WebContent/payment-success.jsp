<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%
    String paymentId = (String) request.getAttribute("paymentId");
    String orderId = (String) request.getAttribute("orderId");
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #e9f5ec;
            text-align: center;
            padding-top: 100px;
        }

        .message-box {
            background-color: #ffffff;
            border: 2px solid #4CAF50;
            display: inline-block;
            padding: 30px 50px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px #ccc;
        }

        .message-box h2 {
            color: #4CAF50;
        }

        .message-box p {
            font-size: 16px;
            margin: 10px 0;
        }

        .btn-home {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 25px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            text-decoration: none;
        }

        .btn-home:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>

    <div class="message-box">
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment.</p>
        <p><strong>Payment ID:</strong> <%= paymentId != null ? paymentId : "N/A" %></p>
        <p><strong>Order ID:</strong> <%= orderId != null ? orderId : "N/A" %></p>

        <form action="userHome.jsp" method="post">
            <button type="submit" class="btn-home">Go to Home</button>
        </form>
    </div>
<%@ include file="footer.html"%>
</body>
</html>
