<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <title>Payment Cancelled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f8f9fa;
            text-align: center;
            padding: 50px;
        }
        .container {
            max-width: 500px;
            margin: auto;
            background: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
        }
        .icon {
            font-size: 70px;
            color: #dc3545;
        }
        h2 {
            color: #333;
            margin: 20px 0 10px;
        }
        p {
            color: #555;
            margin-bottom: 25px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 8px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            transition: 0.3s;
        }
        .btn-cart {
            background: #6c757d;
            color: #fff;
        }
        .btn-cart:hover {
            background: #5a6268;
        }
        .btn-retry {
            background: #007bff;
            color: #fff;
        }
        .btn-retry:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="icon">✖</div>
    <h2>Payment Cancelled</h2>
    <p>It looks like you cancelled your payment. Don’t worry — your cart is still safe.</p>

    <a href="cartDetails.jsp" class="btn btn-cart">Back to Cart</a>
</div>
</body>
</html>
