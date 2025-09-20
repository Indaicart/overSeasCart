<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<title>Sign Up</title>
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

	<%@ include file="header.jsp"%>
	<%
	boolean forPasswordChange = "true".equals(request.getParameter("forPasswordChange"));
    request.setAttribute("forPasswordChange", forPasswordChange);
	String message = (String) request.getAttribute("message");
	%>
	<div class="container">
		<div class="row"
			style="margin-top: 5px; margin-left: 2px; margin-right: 2px;">

			<form action="./SendOtpSrv" method="post"
				class="col-md-4 col-md-offset-4"
				style="border: 2px solid black; border-radius: 10px; background-color: #FFE5CC; padding: 10px;">
				<div style="font-weight: bold;" class="text-center">
					<h2 style="color: green;"><%=forPasswordChange ? "Reset Password": "Sign Up"%></h2>
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
					<div class="form-group" style="max-width: 300px; margin: 0 auto;">
						<label for="email">Email</label> 
						<input type="email" id="email" name="email" placeholder="Enter Email" class="form-control" required>
					</div>
				</div>
				<div class="row" style="margin-top: 15px;">
					<div class="text-center">
						<button type="submit" class="btn btn-success">Send OTP</button>
					</div>
				</div>
				<!-- Hidden input to pass forPasswordChange flag -->
				<input type="hidden" name="forPasswordChange" value="<%= forPasswordChange %>" />
			</form>
		</div>
	</div>


	<%@ include file="footer.html"%>
</body>
</html>