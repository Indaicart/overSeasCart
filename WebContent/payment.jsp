<%@ page import="java.util.*" %>
<%
    String razorpayKey = (String) request.getAttribute("razorpayKey");
    String orderId = (String) request.getAttribute("orderId");
    String currency = (String) request.getAttribute("currency");
    double amount = (Double) request.getAttribute("amount"); // in rupees
%>

<html>
<head>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>

<h3>Redirecting to payment...</h3>

<script>
    var options = {
        "key": "<%= razorpayKey %>",
        "amount": "<%= amount * 100 %>", // in paise
        "currency": "<%= currency %>",
        "name": "Your Company",
        "description": "Test Transaction",
        "order_id": "<%= orderId %>",
        "callback_url": "http://localhost:8080/shopping-cart/PaymentCallback",
        "prefill": {
            "name": "Customer Name",
            "email": "customer@example.com"
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
</script>

</body>
</html>
