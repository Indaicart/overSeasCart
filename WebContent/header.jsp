<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page import="com.shop.service.impl.*, com.shop.service.*"%>

<!DOCTYPE html>
<html>
<head>
<title>Logout Header</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<link rel="stylesheet" href="css/changes.css">
<script
    src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script
    src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
<link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<style>
body {
    font-family: 'Segoe UI', Arial, Roboto, sans-serif !important;
}
.header-bar {
    margin-top: 54px;
    background-color: #87769c;
    color: #fff;
    padding: 22px 0 30px 0;
    border-radius: 0 0 32px 32px;
    box-shadow: 0 2px 16px rgba(100,180,110,0.12);
}
.header-bar h2 {
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 1.2px;
    margin-bottom: 2px;
}
.header-bar h6 {
    font-size: 1.1rem;
    color: #eafbe6;
    margin-bottom: 22px;
    font-weight: 400;
}
.form-inline .form-control {
    border-radius: 8px 0 0 8px;
    font-size: 1.4rem;
    padding: 9px 18px;
    border: 1px solid #ddd;
    box-shadow: none;
    width: 320px;
}
.input-group-btn .btn-danger {
    background-color: #ff4562;
    color: #fff;
    border-radius: 0 8px 8px 0;
    font-size: 1.15rem;
    font-weight: 500;
    padding: 9px 20px;
    border: none;
    transition: background .18s;
}
.input-group-btn .btn-danger:hover {
    background-color: #d10c32;
}
#message {
    color: #186de0 !important;
    font-weight: 600;
    font-size: 1rem;
    margin-top: 11px;
    margin-bottom: 1px;
}

.navbar {
    background-color: #172347 !important;
    border: none;
    box-shadow: 0 3px 14px rgba(30,50,130,0.07);
    font-size: 1.07rem;
}
.navbar-brand, .navbar-nav > li > a {
    color: #fff !important;
    font-weight: 500;
    letter-spacing: 0.5px;
    font-size: 1.38rem;
    padding-left: 18px !important;
    padding-right: 18px !important;
    transition: color .15s;
}
.navbar-brand:hover, .navbar-nav > li > a:hover {
    color: #1dffb2 !important;
    background:none !important;
}
.navbar .glyphicon, .navbar .fa {
    margin-right: 6px;
}
.dropdown-menu {
    background-color: #f6fff9;
    border-radius: 0 0 7px 7px;
    min-width: 145px;
    border: 1px solid #e7eff5;
}
.dropdown-menu > li > a {
    color: #238d2b !important;
    font-weight: 500;
    font-size: 1.34rem;
    padding: 7px 18px;
}
.dropdown-menu > li > a:hover {
    background-color: #97ffad !important;
    color: #172347 !important;
}
@media (max-width: 700px) {
    .header-bar h2 { font-size: 1.16rem; }
    .form-inline .form-control { width: 68vw; font-size: 0.92rem;}
}
</style>

</head>
<body style="background-color: #E6F9E6;">
    <!--Company Header Starting  -->
    <div class="header-bar text-center">
       <h1>Bharat Bazaar</h1>
       <h4>We specialize in Indian local products</h4>
       <form class="form-inline" action="index.jsp" method="get"
             style="display:inline-block; margin-bottom:0;">
          <div class="input-group">
             <input type="text" class="form-control" name="search"
                    placeholder="Search Items" required>
             <div class="input-group-btn">
                <input type="submit" class="btn btn-danger" value="Search" />
             </div>
          </div>
       </form>
       <p id="message"></p>
    </div>
    <!-- Company Header Ending -->

    <%
    /* Checking the user credentials */
    String userType = (String) session.getAttribute("usertype");
    if (userType == null) { //LOGGED OUT
    %>

    <!-- Starting Navigation Bar -->
    <nav class="navbar navbar-default navbar-fixed-top">
       <div class="container-fluid">
          <div class="navbar-header">
             <button type="button" class="navbar-toggle" data-toggle="collapse"
                data-target="#myNavbar">
                <span class="icon-bar"></span> <span class="icon-bar"></span> <span
                   class="icon-bar"></span>
             </button>
             <a class="navbar-brand" href="index.jsp"><span
                class="glyphicon glyphicon-home">&nbsp;</span>Bharat Bazaar</a>
          </div>
          <div class="collapse navbar-collapse" id="myNavbar">
             <ul class="nav navbar-nav navbar-right">
                <li><a href="login.jsp">Login</a></li>
                <li><a href="sendOtp.jsp">Register</a></li>
                <li><a href="index.jsp">Products</a></li>
                <li class="dropdown"><a class="dropdown-toggle"
                   data-toggle="dropdown" href="#">Category <span class="caret"></span>
                </a>
                   <ul class="dropdown-menu">
                      <li><a href="index.jsp?type=mobile">Mobiles</a></li>
                      <li><a href="index.jsp?type=tv">TVs</a></li>
                      <li><a href="index.jsp?type=laptop">Laptops</a></li>
                      <li><a href="index.jsp?type=camera">Camera</a></li>
                      <li><a href="index.jsp?type=speaker">Speakers</a></li>
                      <li><a href="index.jsp?type=tablet">Tablets</a></li>
                   </ul></li>
             </ul>
          </div>
       </div>
    </nav>
    <%
    } else if ("customer".equalsIgnoreCase(userType)) { //CUSTOMER HEADER

    int notf = new CartServiceImpl().getCartCount((String) session.getAttribute("username"));
    %>
    <nav class="navbar navbar-default navbar-fixed-top">

       <div class="container-fluid">
          <div class="navbar-header">
             <button type="button" class="navbar-toggle" data-toggle="collapse"
                data-target="#myNavbar">
                <span class="icon-bar"></span> <span class="icon-bar"></span> <span
                   class="icon-bar"></span>
             </button>
             <a class="navbar-brand" href="userHome.jsp"><span
                class="glyphicon glyphicon-home">&nbsp;</span>Bharat Bazaar</a>
          </div>

          <div class="collapse navbar-collapse" id="myNavbar">
             <ul class="nav navbar-nav navbar-right">
                <li><a href="userHome.jsp">Products</a></li>
                <li class="dropdown"><a class="dropdown-toggle"
                   data-toggle="dropdown" href="#">Category <span class="caret"></span>
                </a>
                   <ul class="dropdown-menu">
                      <li><a href="userHome.jsp?type=mobile">Mobiles</a></li>
                      <li><a href="userHome.jsp?type=tv">TVs</a></li>
                      <li><a href="userHome.jsp?type=laptop">Laptops</a></li>
                      <li><a href="userHome.jsp?type=camera">Camera</a></li>
                      <li><a href="userHome.jsp?type=speaker">Speakers</a></li>
                      <li><a href="userHome.jsp?type=tablet">Tablets</a></li>
                   </ul></li>
                <%
                if (notf == 0) {
                %>
                <li><a href="cartDetails.jsp"> <span
                      class="glyphicon glyphicon-shopping-cart"></span>Cart
                </a></li>

                <%
                } else {
                %>
                <li><a href="cartDetails.jsp"
                   style="margin: 0px; padding: 0px;" id="mycart"><i
                      data-count="<%=notf%>"
                      class="fa fa-shopping-cart fa-3x icon-white badge"
                      style="background-color: #333; margin: 0px; padding: 0px; padding-bottom: 0px; padding-top: 5px;">
                   </i></a></li>
                <%
                }
                %>
                <li><a href="orderDetails.jsp">Orders</a></li>
                <li><a href="userProfile.jsp">Profile</a></li>
                <li><a href="./LogoutSrv">Logout</a></li>
             </ul>
          </div>
       </div>
    </nav>
    <%
    } else { //ADMIN HEADER
    %>
    <nav class="navbar navbar-default navbar-fixed-top">
       <div class="container-fluid">
          <div class="navbar-header">
             <button type="button" class="navbar-toggle" data-toggle="collapse"
                data-target="#myNavbar">
                <span class="icon-bar"></span> <span class="icon-bar"></span> <span
                   class="icon-bar"></span>
             </button>
             <a class="navbar-brand" href="adminViewProduct.jsp"><span
                class="glyphicon glyphicon-home">&nbsp;</span>Bharat Bazaar</a>
          </div>
          <div class="collapse navbar-collapse" id="myNavbar">
             <ul class="nav navbar-nav navbar-right">
                <li><a href="adminViewProduct.jsp">Products</a></li>
                <li class="dropdown"><a class="dropdown-toggle"
                   data-toggle="dropdown" href="#">Category <span class="caret"></span>
                </a>
                   <ul class="dropdown-menu">
                      <li><a href="adminViewProduct.jsp?type=mobile">Mobiles</a></li>
                      <li><a href="adminViewProduct.jsp?type=tv">TVs</a></li>
                      <li><a href="adminViewProduct.jsp?type=laptop">Laptops</a></li>
                      <li><a href="adminViewProduct.jsp?type=camera">Camera</a></li>
                      <li><a href="adminViewProduct.jsp?type=speaker">Speakers</a></li>
                      <li><a href="adminViewProduct.jsp?type=tablet">Tablets</a></li>
                   </ul></li>
                <li><a href="adminStock.jsp">Stock</a></li>
                <li><a href="shippedItems.jsp">Shipped</a></li>
                <li><a href="unshippedItems.jsp">Orders</a></li>
                <!-- <li><a href=""> <span class="glyphicon glyphicon-shopping-cart"></span>&nbsp;Cart</a></li> -->
                <li class="dropdown"><a class="dropdown-toggle"
                   data-toggle="dropdown" href="#">Update Items <span
                      class="caret"></span>
                </a>
                   <ul class="dropdown-menu">
                      <li><a href="addProduct.jsp">Add Product</a></li>
                      <li><a href="removeProduct.jsp">Remove Product</a></li>
                      <li><a href="updateProductById.jsp">Update Product</a></li>
                   </ul></li>
                <li><a href="./LogoutSrv">Logout</a></li>

             </ul>
          </div>
       </div>
    </nav>
    <%
    }
    %>
    <!-- End of Navigation Bar -->
</body>
</html>
