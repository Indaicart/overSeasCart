<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page
    import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,com.shop.utility.*,java.util.*,javax.servlet.ServletOutputStream,java.io.*"%>
<!DOCTYPE html>
<html>
<head>
<title>Profile Details</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="images/logo.png">
<link rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<script
    src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script
    src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
<link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<style>
body {
    background-color: #e6f9e6 !important;
    font-family: 'Segoe UI', Arial, sans-serif;
}
.breadcrumb {
    background: #f7faf8;
    border-radius: 8px;
    margin-bottom: 24px;
}
.profile-section {
    background: #f6fff9;
    border-radius: 15px;
    margin: 40px auto 30px auto;
    padding: 36px 36px 36px 36px;
    box-shadow: 0 4px 32px rgba(34,141,43,0.10);
    max-width: 970px;
}
.profile-photo-card {
    background: #fff;
    border-radius: 15px;
    padding: 30px 18px 14px 18px;
    box-shadow: 0 3px 12px rgba(52,118,38,0.06);
    margin-bottom: 18px;
}
.profile-photo-card img {
    width: 180px;         /* fixed width */
    height: 180px;        /* fixed height to keep square */
    object-fit: contain;  /* preserves image aspect ratio without cropping */
    border-radius: 12px;  /* subtle rounded corners for square shape */
    border: 6px solid #e6f9e6;
    margin-bottom: 18px;
    box-shadow: 0 4px 18px rgba(63,117,28,0.18);
}

.username-greet {
    font-size: 1.3rem;
    font-weight: 500;
    color: #26734d;
    margin-top: 6px;
}
.profile-title-button {
    margin: 5px 0 0 0;
    padding: 5px 0 5px 0;
    background: #f2faff;
    border-radius: 9px;
    text-align: center;
    font-size: 2.1rem;
    font-weight: 700;
    color: #2067c5;
    box-shadow: 0 2px 10px rgba(44,108,212,0.06);
    letter-spacing: 1px;
    border: none;
    outline: none;
}
.profile-details-card {
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 3px 19px rgba(40,94,96,0.07);
    padding: 26px 34px 26px 34px;
    margin-bottom: 18px;
}
.detail-row {
    padding: 12px 0;
    border-bottom: 1px solid #eef4eb;
    display: flex;
    align-items: center;
}
.detail-row:last-child {
    border-bottom: none;
}
.detail-label {
    font-size: 1.3rem;
    color: #228d2b;
    font-weight: 600;
    width: 28%;
    min-width: 120px;
}
.detail-value {
    font-size: 1.3rem;
    color: #454545;
    word-break: break-all;
}
@media (max-width: 991px) {
    .profile-section { padding: 20px 5px; }
    .profile-title-button { font-size: 1.25rem;}
    .detail-label, .detail-value { font-size: 1.02rem; }
}
@media (max-width: 700px) {
    .profile-photo-card img { width: 92px; height: 92px;}
    .profile-section {padding: 9px 2vw;}
    .profile-title-button {font-size: 1rem;}
}
</style>
</head>
<body>

    <%
    /* Checking the user credentials */
    String userName = (String) session.getAttribute("username");
    String password = (String) session.getAttribute("password");

    if (userName == null || password == null) {
       response.sendRedirect("login.jsp?message=Session Expired, Sign In Again!!");
    }

    UserService dao = new UserServiceImpl();
    UserBean user = dao.getUserDetails(userName, password);

    AddressServiceImpl addressDao = new AddressServiceImpl();
    AddressBean address = addressDao.getAddressByEmail(user.getEmail());
    %>

    <jsp:include page="header.jsp" />

    <div class="profile-section container">
    <!-- Top Header for My Profile -->
       <div class="row">
          <div class="col-xs-12">
             <div class="profile-title-button" style="max-width: 350px; margin: 24px auto 32px auto;">
                 My Profile
             </div>
          </div>
       </div>

       <div class="row">
          <div class="col-lg-4 col-md-5 col-xs-12 text-center">
             <div class="profile-photo-card">
                <img src="images/logo.png" alt="Profile Photo" class="img-rounded">
                <div class="username-greet">
                  Hello <%=user.getName()%>!!
                </div>
             </div>
          </div>
          <div class="col-lg-8 col-md-7 col-xs-12">
             <div class="profile-details-card">
                <div class="detail-row">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value"><%=user.getName()%></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value"><%=user.getEmail()%></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value"><%=user.getMobile()%></div>
                </div>
                <!-- Address Details -->
                    <div class="detail-row">
                        <div class="detail-label">Address 1</div>
                        <div class="detail-value"><%=address.getFlat()%></div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Address 2</div>
                        <div class="detail-value"><%=address.getStreet()%></div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">City</div>
                        <div class="detail-value"><%=address.getCity()%></div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">State</div>
                        <div class="detail-value"><%=StateUtil.getStateName(address.getState())%></div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Zip/Postal Code</div>
                        <div class="detail-value"><%=address.getPincode()%></div>
                    </div>
                    <!-- Update button -->
                    <button class="btn btn-primary" data-toggle="modal" data-target="#editModal">Update Details</button>
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
                <input type="hidden" name="isProfile" value= "true" />


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

    <%@ include file="footer.html"%>
</body>
</html>
