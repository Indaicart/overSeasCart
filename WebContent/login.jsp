<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
  <head>
    <title>Sign In</title>
    <link rel="icon" type="image/png" href="images/logo.png">
    <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css"
    />
    <link rel="stylesheet" href="css/changes.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
     <!--Bootstrap Icons CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" />
    
	<script>
      function togglePassword() {
        const pwd = document.getElementById("password");
        const icon = document.getElementById("toggleIcon");
        if (pwd.type === "password") {
          pwd.type = "text";
          icon.classList.remove("bi-eye");
          icon.classList.add("bi-eye-slash");
        } else {
          pwd.type = "password";
          icon.classList.remove("bi-eye-slash");
          icon.classList.add("bi-eye");
        }
      }
      
      function setUserType() {
          const username = document.getElementById("username").value.trim();
          const password = document.getElementById("password").value.trim();
          return true; // allow form submission
        }
    </script>
  </head>
  <body style="background-color: #e6f9e6">
    <%@ include file="header.jsp"%> <% String message =
    request.getParameter("message"); %>
    <div class="container">
      <div
        class="row"
        style="margin-top: 5px; margin-left: 2px; margin-right: 2px"
      >
        <form
          action="./LoginSrv"
          method="post"
          class="col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2"
          style="
            border: 2px solid black;
            border-radius: 10px;
            background-color: #ffe5cc;
            padding: 10px;
          "
          onsubmit="return setUserType()"
        >
          <div style="font-weight: bold" class="text-center">
            <h2 style="color: green">Sign In</h2>
            <% if (message != null) { %>
            <p style="color: blue"><%=message%></p>
            <% } %>
          </div>
          <div></div>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="username">Username</label>
              <input
                type="email"
                placeholder="Enter Registered Email"
                name="username"
                class="form-control"
                id="username"
                required
              />
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 form-group">
              <label for="password">Password</label>
              <div class="input-group">
                <input
                  type="password"
                  placeholder="Enter Password"
                  name="password"
                  class="form-control"
                  id="password"
                  required
                />
                <span class="input-group-btn">
                  <button type="button" class="btn btn-default" onclick="togglePassword()">
                    <i class="bi bi-eye" id="toggleIcon"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <a
                href="sendOtp.jsp?forPasswordChange=true"
                style="color: #007bff"
                >Forgot Password?</a
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 text-center">
              <button type="submit" class="btn btn-success">Sign In</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <%@ include file="footer.html"%>
  </body>
</html>
