<%@ page import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,com.shop.utility.*" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page session="true" %>
<html>
<head>
    <title>Checkout</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
<body style="background-color:#E6F9E6;">

<jsp:include page="header.jsp" />


<%
    UserBean user = (UserBean) request.getAttribute("user");
	if (user == null) {
		System.out.println("In checkout.jsp, moving to login page");
		response.sendRedirect("login.jsp?message=Session Expired, Login Again!!"); // or show an error message
	    return;
	}
	AddressServiceImpl addressDao = new AddressServiceImpl();
    AddressBean address = addressDao.getAddressByEmail(user.getEmail());
    String amount = (String) request.getAttribute("amount");
    String weight = (String) request.getAttribute("weight");
    String shipmentCharge = (String) request.getAttribute("shipmentCharge");
    String orderTotal = (String) request.getAttribute("orderTotal");
%>

<div class="container">
    <h2 class="text-center" style="color: green;">Checkout Page</h2>
    <div class="row" style="margin-top: 20px;">

        <!-- Left side: User details -->
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading"><strong>Your Details</strong></div>
                <div class="panel-body">
                    <p><strong>Name:</strong> <%= user.getName() %></p>
                    <p><strong>Email:</strong> <%= user.getEmail() %></p>
                    <p><strong>Mobile:</strong> <%= user.getMobile() %></p>
                    <p><strong>Flat/House no: </Strong> <%= address.getFlat() %></p>
                    <p><strong>Area: </Strong> <%= address.getStreet() %></p>
                    <p><strong>Landmark: </Strong> <%= address.getLandmark() %></p>
                    <p><strong>City: </Strong> <%= address.getCity() %></p>
                    <p><strong>State: </Strong> <%= StateUtil.getStateName(address.getState()) %></p>
                    <p><strong>Zip: </Strong> <%= address.getPincode() %></p>

                    <!-- Update button -->
                    <button class="btn btn-primary" data-toggle="modal" data-target="#editModal">Update Details</button>
                </div>
            </div>
        </div>

        <!-- Right side: Amount and Checkout -->
        <div class="col-md-6">
            <div class="panel panel-default">
                <div class="panel-heading"><strong>Order Summary</strong></div>
                <div class="panel-body">
                    <p><strong>Cart Total:</strong> ₹ <%= amount %></p>
                    <p><strong>Weight:</strong> <%= weight%> kg </p>
                    <p><strong>Shipment Charges:</strong> ₹ <%= shipmentCharge%> </p>
                    <p><strong>Order Total:</strong> ₹ <%= orderTotal%></p>
                    <input type="checkbox" id="in_dollar" name="in_dollar">
					<label for="in_dollar"> Want to pay in $</label><br>
                    <form action="CreateOrderServlet" method="post">
                        <input type="hidden" name="amount" value="<%= orderTotal %>"/>
                        <button class="btn btn-success btn-lg" type="submit">Pay Now</button>
                    </form>
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
          <h4 class="modal-title" id="editModalLabel">Edit Your Details</h4>
        </div>
        <div class="modal-body">
            <input type="hidden" name="email" value="<%= user.getEmail() %>"/>
            <input type="hidden" name="amount" value="<%= amount %>" />
            <input type="hidden" name="isProfile" value= "false" />

            <!-- Name field -->
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" name="name" class="form-control" value="<%= user.getName() %>" required>
            </div>

            <!-- Mobile field -->
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
