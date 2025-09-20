<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ page
	import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,java.util.*,javax.servlet.ServletOutputStream,java.io.*"%>
<!DOCTYPE html>
<html>
<head>
<title>Update USD value</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="images/logo.png">
<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<link rel="stylesheet" href="css/changes.css">
<script
	src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script
	src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
<body style="background-color: #E6F9E6;">

	<jsp:include page="header.jsp" />
	<%
	String message = request.getParameter("message");
	%>

	<div class="container">
		<div class="row"
			style="margin-top: 5px; margin-left: 2px; margin-right: 2px">
			<form action="./UpdateShipmentChargeSrv" method="post"
				class="col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2"
				style="border: 2px solid black; border-radius: 10px; background-color: #ffe5cc; padding: 10px;"
				onsubmit="return setUserType()">
				<div style="font-weight: bold" class="text-center">
					<%
					if (message != null) {
					%>
					<p style="color: blue"><%=message%></p>
					<%
					}
					%>
				</div>
				<div class="row">
					<div class="col-md-12 form-group">
						<label for="username">Enter current Shipment Charge in INR:</label> 
						<input type="number" name="shipCharge" class="form-control" placeholder="Enter only numbers" id="shipCharge" required />
					</div>
				</div>

				<div class="row">
					<div class="col-md-12 text-center">
						<button type="submit" class="btn btn-success">Update</button>
					</div>
				</div>
			</form>
		</div>
	</div>

	<%@ include file="footer.html"%>
</body>
</html>