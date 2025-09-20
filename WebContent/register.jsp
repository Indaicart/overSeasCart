<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<title>Sign Up</title>
<link rel="icon" type="image/png" href="images/logo.png">
<!-- Bootstrap CSS -->
<link rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

<!-- Custom styling for beautified form -->
<style>
body {
    background-color: #E6F9E6;
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
}

/* Form Container */
form {
    background-color: #fff2e5 !important;
    border: 2px solid #0a0a0a;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(44,182,125,0.10);
    padding: 24px 32px;
    color: #294e38;
    margin-top: 24px;
}

/* Form Headings */
h2 {
    color: #218c5b !important;
    font-weight: 700;
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    letter-spacing: 1px;
}

/* Labels */
label {
    color: #0a0a0a !important;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 5px;
    font-family: inherit;
}

/* Inputs and Selects */
.form-control {
    border: 1.5px solid #35ac73;
    border-radius: 6px;
    font-size: 15px;
    font-family: inherit;
    color: #183f20;
    background-color: #FFFFF9;
    transition: border-color 0.2s;
}

.form-control:focus {
    border-color: #218c5b;
    box-shadow: 0 0 5px #218c5b22;
}

/* Eye icon button (show/hide password) */
.input-group-btn .btn-default {
    background-color: #e8fbe8;
    border-color: #35ac73;
    color: #218c5b;
}

/* Help text */
.form-text, small.text-muted {
    color: #698b66 !important;
    font-size: 13px;
}

/* Buttons */
.btn-success {
    background-color: #37c77d;
    border-color: #35ac73;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.5px;
    transition: background 0.2s;
}

.btn-success:hover {
    background-color: #218c5b;
}

.btn-danger {
    background-color: #f44e3b;
    border-color: #d43f3a;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
}

/* Responsive Spacing Adjustments */
@media (max-width: 600px) {
    form {
        padding: 12px 5px;
    }
    .form-group, .col-md-6 {
        padding-right: 0 !important;
        padding-left: 0 !important;
    }
}

/* Prefill Message */
p[style*="color: blue"] {
    color: #1491b3 !important;
    font-weight: 700;
}
</style>

<!-- jQuery and Bootstrap JS -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script
    src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>

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
</script>
</head>
<body>

    <%@ include file="header.jsp"%>
    <%
    String message = request.getParameter("message");
    %>
    <div class="container">
        <div class="row"
            style="margin-top: 5px; margin-left: 2px; margin-right: 2px;">

            <form action="./RegisterSrv" method="post"
                class="col-md-6 col-md-offset-3">

                <div style="font-weight: bold;" class="text-center">
                    <h2>Sign Up</h2>
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
                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="name">Name</label>
                        <input type="text" name="name" class="form-control" id="name" required
                        value="<%= request.getAttribute("name") != null ? request.getAttribute("name") : "" %>">
                    </div>
                    <div class="col-md-6 form-group">
                        <label for="email">Email</label>
                        <input type="email" name="email" class="form-control" id="email"
                        value="<%= request.getAttribute("emailPrefilled") != null ? request.getAttribute("emailPrefilled") : "" %>"
                        readonly>
                    </div>
                </div>

                <div class="form-group">
                  <label for="address1">Address 1</label>
                  <input type="text" name="flat" class="form-control" id="flat" required
                         value="<%= request.getAttribute("flat") != null ? request.getAttribute("flat") : "" %>">
                </div>

                <div class="form-group">
                  <label for="address2">Address 2</label>
                  <input type="text" name="street" class="form-control" id="street"
                         value="<%= request.getAttribute("street") != null ? request.getAttribute("street") : "" %>">
                </div>

                <div class="row">
                  <div class="col-md-6 form-group">
                    <label for="city">City</label>
                    <input type="text" name="city" class="form-control" id="city" required
                           value="<%= request.getAttribute("city") != null ? request.getAttribute("city") : "" %>">
                </div>
                  <div class="col-md-6 form-group">
                    <label for="state">State/Province</label>
                    <select name="state" id="state" class="form-control" required>
                      <option value="">Select State</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                  </div>
                </div>

                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="mobile">Mobile</label>
                        <input type="number" name="mobile" class="form-control" id="mobile" required
                        value="<%= request.getAttribute("mobile") != null ? request.getAttribute("mobile") : "" %>">
                    </div>
                    <div class="col-md-6 form-group">
                        <label for="last_name">Zip/Postal Code</label>
                        <input type="number" name="pincode" class="form-control" id="pincode" required
                        value="<%= request.getAttribute("pincode") != null ? request.getAttribute("pincode") : "" %>">
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="password" class="form-label">Password</label>
                        <div class="input-group">
                            <input type="password" name="password" class="form-control"
                                id="password" required minlength="8" maxlength="20"
                                pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}"
                                title="Password must be 8-20 characters, include uppercase, lowercase, and a number">
                            <span class="input-group-btn">
                                <button type="button" class="btn btn-default" onclick="togglePassword()">
                                    <i class="bi bi-eye" id="toggleIcon"></i>
                                </button>
                            </span>
                        </div>
                        <small class="form-text text-muted">
                            Must be 8-20 characters, with at least one uppercase, one lowercase, and one number.
                        </small>
                    </div>
                    <div class="col-md-6 form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" name="confirmPassword" class="form-control" id="confirmPassword" required>
                    </div>
                </div>
                <div class="row text-center">
                    <div class="col-md-6" style="margin-bottom: 2px;">
                        <button type="Reset" class="btn btn-danger">Reset</button>
                    </div>
                    <div class="col-md-6">
                        <button type="submit" class="btn btn-success">Register</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <%@ include file="footer.html"%>
</body>
</html>
