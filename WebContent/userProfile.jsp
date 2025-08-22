<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page
    import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,java.util.*,javax.servlet.ServletOutputStream,java.io.*"%>
<!DOCTYPE html>
<html>
<head>
<title>Profile Details</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
       response.sendRedirect("login.jsp?message=Session Expired, Login Again!!");
    }

    UserService dao = new UserServiceImpl();
    UserBean user = dao.getUserDetails(userName, password);
    if (user == null)
       user = new UserBean("Test User", 98765498765L, "test@gmail.com", "ABC colony, Patna, bihar", 87659, "lksdjf");
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
                  Hello <%=user.getName()%> here!!
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
                <div class="detail-row">
                    <div class="detail-label">Address</div>
                    <div class="detail-value"><%=user.getAddress()%></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">PinCode</div>
                    <div class="detail-value"><%=user.getPinCode()%></div>
                </div>
             </div>
          </div>
       </div>
    </div>

    <%@ include file="footer.html"%>
</body>
</html>
