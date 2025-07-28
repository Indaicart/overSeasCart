<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<title>Login</title>
<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<link rel="stylesheet" href="css/changes.css">
<script
	src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script
	src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
<body style="background-color: #E6F9E6;">

	<%@ include file="header.jsp"%>

	<%
	String message = (String) request.getAttribute("message");
	%>
	<div class="container">
		<div class="row"
			style="margin-top: 5px; margin-left: 2px; margin-right: 2px;">
			<form action="./ChangePasswordSrv" method="post"
				class="col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2"
				style="border: 2px solid black; border-radius: 10px; background-color: #FFE5CC; padding: 10px;">
				<div style="font-weight: bold;" class="text-center">
					<h2 style="color: green;">Reset Password</h2>
					<%
					if (message != null) {
					%>
					<p style="color: blue;">
						<%=message%>
					</p>
					<%
					}
					%>
				</div>
				<div></div>
				<div class="row">
					<div class="col-md-12 form-group">
						<label for="password">Password</label> 
						<input type="text" placeholder="Enter Passowrd" name="password" class="form-control" id="password" required>
					</div>
				</div>
				<div class="row">
					<div class="col-md-12 form-group">
						<label for="cpassword">Confirm Password</label>
						<input type="text" placeholder="Confirm Password" name="cpassword" class="form-control" id="cpassword" required>
					</div>
				</div>
				<input type="hidden" name="email" value="<%= request.getAttribute("emailPrefilled") != null ? request.getAttribute("emailPrefilled") : "" %>" />
				<div class="row">
					<div class="col-md-12 text-center">
						<button type="submit" class="btn btn-success">Submit</button>
					</div>
				</div>
			</form>

		</div>
	</div>

	<%@ include file="footer.html"%>

</body>
</html>