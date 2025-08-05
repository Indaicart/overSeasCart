<%@ page import="com.shop.beans.UserBean" %>
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
	    response.sendRedirect("login.jsp"); // or show an error message
	    return;
	}
    String amount = (String) request.getAttribute("amount");
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
                    <p><strong>Address:</strong> <%= user.getAddress() %></p>
                    <p><strong>Pincode:</strong> <%= user.getPinCode() %></p>

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
                    <p><strong>Total Amount:</strong> ₹ <%= amount %></p>
                    <form action="CreateOrderServlet" method="post">
                        <input type="hidden" name="amount" value="<%= amount %>"/>
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

            <!-- Name field -->
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" name="name" class="form-control" value="<%= user.getName() %>" required>
            </div>
            <div class="form-group">
                <label for="pincode">Pin code</label>
                <input type="number" name="pincode" class="form-control" value="<%= user.getPinCode() %>" required>
            </div>

            <!-- Mobile field -->
            <div class="form-group">
                <label for="mobile">Mobile</label>
                <input type="number" name="mobile" class="form-control" value="<%= user.getMobile() %>" required>
            </div>

            <!-- Address field -->
            <div class="form-group">
                <label for="address">Address</label>
                <textarea name="address" class="form-control" required><%= user.getAddress() %></textarea>
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
