<%@ page import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,com.shop.utility.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page session="true" %>
<%
    UserBean user = (UserBean) request.getAttribute("user");
    if (user == null) {
       System.out.println("In checkout.jsp, moving to Sign In page");
       response.sendRedirect("login.jsp?message=Session Expired, Sign In Again!!");
       return;
    }
    AddressServiceImpl addressDao = new AddressServiceImpl();
    AddressBean address = addressDao.getAddressByEmail(user.getEmail());
    String cartAmount = (String) request.getAttribute("amount");
    String weight = (String) request.getAttribute("weight");
    String shipmentCharge = (String) request.getAttribute("shipmentCharge");
    String forexCharge = (String) request.getAttribute("forexCharge");
    String conversionRate = (String) request.getAttribute("conversionRate");

    // Safely parse values for JS usage
    double cartAmt = cartAmount != null && !cartAmount.isEmpty() ? Double.parseDouble(cartAmount) : 0.0;
    double ship = shipmentCharge != null && !shipmentCharge.isEmpty() ? Double.parseDouble(shipmentCharge) : 0.0;
    double forex = forexCharge != null && !forexCharge.isEmpty() ? Double.parseDouble(forexCharge) : 0.0;
    double convRate = conversionRate != null && !conversionRate.isEmpty() ? Double.parseDouble(conversionRate) : 1.0;
    double total = cartAmt + ship + forex;
%>
<html>
<head>
    <title>Checkout</title>
    <link rel="icon" type="image/png" href="images/logo.png">
    <link href="https://fonts.googleapis.com/css?family=Poppins:400,500,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
    <style>
        body { background-color: #E6F9E6; font-family: 'Poppins', Arial, sans-serif; }
        h2, .panel-heading { font-weight: 600; color: #24943A !important; letter-spacing: 1px; }
        .panel { box-shadow: 0 4px 15px rgba(36,148,58, 0.10), 0 1.5px 3px rgba(0,0,0,0.02); border-radius: 14px; border: none; }
        .user-actions { display: flex; justify-content: center; gap: 18px; margin-top: 28px; margin-bottom: 10px; }
        .btn-primary { width: 160px; height: 48px; font-size: 18px; border-radius: 25px; font-weight: 500; }
        .modal-content { border-radius: 10px; font-family: 'Poppins', Arial, sans-serif; }
        label { font-weight: 500; color: #24943A; }
        .form-control { border-radius: 8px; font-size: 16px; }
        @media (max-width: 767px) {
            .user-actions { flex-direction: column; gap: 12px; align-items: center; }
            .btn-primary { width: 100%; font-size: 17px; }
        }
        .details-table {
            border-collapse: collapse;
            width: 100%;
            background: transparent;
        }
        .details-table td {
            border: none !important;
            padding: 6px 10px 6px 0;
            font-size: 16px;
            color: #333;
            vertical-align: top;
        }
        .details-table tr td:first-child {
            min-width: 120px;
            width: 35%;
            font-weight: 600;
            color: #24943A;
            padding-right: 15px;
        }
    </style>
    <script>
        var usdCartTotal      = <%= cartAmt %>;
        var usdShipmentCharge = <%= ship %>;
        var forexCharge       = <%= forex %>;
        var conversionRate    = <%= convRate %>;
        var usdOrderTotal     = <%= total %>;
        var isUSD = true;

        function formatINR(amount) {
            return "₹ " + (amount * conversionRate).toFixed(2);
        }
        function formatUSD(amount) {
            return "$ " + Number(amount).toFixed(2);
        }

        function toggleCurrency() {
            var cartTotalElem   = document.getElementById("cartTotal");
            var shipmentElem    = document.getElementById("shipmentCharge");
            var forexChargeElem = document.getElementById("forexCharge");
            var orderElem       = document.getElementById("orderTotal");
            var currencyBtn     = document.getElementById("currencyBtn");
            var payNowBtn       = document.getElementById("payNowBtn");
            var hiddenAmount    = document.getElementById("hiddenAmount");
            var currencyField   = document.getElementById("currencyField");
            var forexRow        = document.getElementById("forexRow");

            if (isUSD) {
                cartTotalElem.innerText   = formatINR(usdCartTotal);
                shipmentElem.innerText    = formatINR(usdShipmentCharge);
                orderElem.innerText       = formatINR((usdCartTotal + usdShipmentCharge));
                hiddenAmount.value        = ((usdCartTotal + usdShipmentCharge) * conversionRate).toFixed(2);
                currencyField.value       = "INR";

                forexRow.style.display    = "none";
                currencyBtn.innerText     = "Show in USD";
                payNowBtn.innerText       = "Pay in INR";
                isUSD = false;
            } else {
                cartTotalElem.innerText   = formatUSD(usdCartTotal);
                shipmentElem.innerText    = formatUSD(usdShipmentCharge);
                forexChargeElem.innerText = formatUSD(forexCharge);
                orderElem.innerText       = formatUSD((usdCartTotal + usdShipmentCharge + forexCharge));
                hiddenAmount.value        = (usdCartTotal + usdShipmentCharge + forexCharge).toFixed(2);
                currencyField.value       = "USD";

                forexRow.style.display    = "table-row";
                currencyBtn.innerText     = "Show in INR";
                payNowBtn.innerText       = "Pay in USD";
                isUSD = true;
            }
        }

        window.onload = function() {
            document.getElementById("cartTotal").innerText   = formatUSD(usdCartTotal);
            document.getElementById("shipmentCharge").innerText = formatUSD(usdShipmentCharge);
            document.getElementById("forexCharge").innerText = formatUSD(forexCharge);
            document.getElementById("orderTotal").innerText  = formatUSD(usdOrderTotal);
            document.getElementById("currencyBtn").innerText = "Show in INR";
            document.getElementById("payNowBtn").innerText   = "Pay in USD";
            document.getElementById("hiddenAmount").value    = usdOrderTotal.toFixed(2);
            document.getElementById("currencyField").value   = "USD";
            document.getElementById("forexRow").style.display = "table-row";
        }
    </script>
</head>
<body>
<jsp:include page="header.jsp" />

<div class="container">
    <h2 class="text-center" style="margin-bottom:25px;">Checkout Page</h2>
    <div class="row" style="margin-top: 16px;">

        <!-- Left side: User details -->
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading"><strong>Your Details</strong></div>
                <div class="panel-body">
                    <table class="details-table">
                        <tr><td><strong>Name:</strong></td><td><%= user.getName() %></td></tr>
                        <tr><td><strong>Email:</strong></td><td><%= user.getEmail() %></td></tr>
                        <tr><td><strong>Mobile:</strong></td><td><%= user.getMobile() %></td></tr>
                        <tr><td><strong>Flat/House no:</strong></td><td><%= address.getFlat() %></td></tr>
                        <tr><td><strong>Area:</strong></td><td><%= address.getStreet() %></td></tr>
                        <tr><td><strong>Landmark:</strong></td><td><%= address.getLandmark() %></td></tr>
                        <tr><td><strong>City:</strong></td><td><%= address.getCity() %></td></tr>
                        <tr><td><strong>State:</strong></td><td><%= StateUtil.getStateName(address.getState()) %></td></tr>
                        <tr><td><strong>Zip:</strong></td><td><%= address.getPincode() %></td></tr>
                    </table>
                    <div class="user-actions" style="margin-top:20px;">
                        <button class="btn btn-primary" data-toggle="modal" data-target="#editModal" type="button">Update Details</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right side: Amount and Checkout -->
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading"><strong>Order Summary</strong></div>
                <div class="panel-body">
                    <div style="margin-bottom:20px;">
                        <table class="details-table">
                            <tr>
                                <td><strong>Weight:</strong></td>
                                <td><%= weight != null ? weight : "0" %> kg</td>
                            </tr>
                        </table>
                    </div>

                    <table class="details-table">
                        <tr><td><strong>Cart Total:</strong></td><td><span id="cartTotal"></span></td></tr>
                        <tr><td><strong>Shipment Charges:</strong></td><td><span id="shipmentCharge"></span></td></tr>
                        <tr id="forexRow"><td><strong>Forex Charges(3%):</strong></td><td><span id="forexCharge"></span></td></tr>
                        <tr><td><strong>Order Total:</strong></td><td><span id="orderTotal"></span></td></tr>
                    </table>

                    <div class="user-actions">
                        <button class="btn btn-primary" id="currencyBtn" type="button" onclick="toggleCurrency()">Show in INR</button>
                        <form action="CreateOrderServlet" method="post" style="margin:0;">
                            <input type="hidden" id="hiddenAmount" name="amount" value="0"/>
                            <input type="hidden" id="currencyField" name="currency" value="USD"/>
                            <button class="btn btn-primary" id="payNowBtn" type="submit">Pay in USD</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- Modal for editing user details -->
<div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="editModalLabel">
  <div class="modal-dialog" role="document">
    <form action="UpdateUserDetailsServlet" method="post">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="editModalLabel" style="color:#24943A;">Edit Your Details</h4>
        </div>
        <div class="modal-body">
            <input type="hidden" name="email" value="<%= user.getEmail() %>"/>
            <input type="hidden" name="isProfile" value="false" />
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" name="name" class="form-control" value="<%= user.getName() %>" required>
            </div>
            <div class="form-group">
                <label for="mobile">Mobile</label>
                <input type="number" name="mobile" class="form-control" value="<%= user.getMobile() %>" required>
            </div>
            <div class="form-group">
                <label for="flat">Flat, House no., Building, Company, Apartment</label>
                <input type="text" name="flat" class="form-control" value="<%= address.getFlat() %>" required>
            </div>
            <div class="form-group">
                <label for="street">Area, Street, Sector, Village</label>
                <input type="text" name="street" class="form-control" value="<%= address.getStreet() %>" required>
            </div>
            <div class="form-group">
                <label for="landmark">Landmark</label>
                <input type="text" name="landmark" class="form-control" value="<%= address.getLandmark() %>" required>
            </div>
            <div class="form-group">
                <label for="city">Town/City</label>
                <input type="text" name="city" class="form-control" value="<%= address.getCity() %>" required>
            </div>
            <div class="form-group">
                <label for="state">State</label>
                <select name="state" class="form-control" required>
                    <%
                        String currentState = address.getState();
                        java.util.Map<String, String> states = StateUtil.getStates();
                        for (java.util.Map.Entry<String, String> entry : states.entrySet()) {
                            String code = entry.getKey();
                            String fullName = entry.getValue();
                            String selected = code.equals(currentState) ? "selected" : "";
                    %>
                        <option value="<%= code %>" <%= selected %>><%= fullName %></option>
                    <%
                        }
                    %>
                </select>
            </div>
            <div class="form-group">
                <label for="pincode">Zip code</label>
                <input type="number" name="pincode" class="form-control" value="<%= address.getPincode() %>" required>
            </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-success">Save Changes</button>
        </div>
      </div>
    </form>
  </div>
</div>

<%@ include file="footer.html" %>
</body>
</html>
