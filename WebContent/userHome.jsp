<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ page
    import="com.shop.service.impl.*, com.shop.service.*,com.shop.beans.*,java.util.*,javax.servlet.ServletOutputStream,java.io.*"%>
<!DOCTYPE html>
<html>
<head>
<title>Indian Cart</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<link rel="stylesheet" href="css/changes.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
<!-- Additional Custom Styles -->
<style>
    body {
        background-color: #E6F9E6 !important;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #212529;
    }
    .main-title {
        color: #228B22;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 1px;
        margin-top: 30px;
        margin-bottom: 10px;
    }
    .msg-bar {
        color: #222;
        background: #d4ffc4;
        padding: 12px 0;
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 18px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .row.text-center {
        margin: 0;
        padding-top: 15px;
    }

    .product-card1 {
        background: #fff;
        border-radius: 12px;
        padding: 22px 18px 16px 18px;
        margin-bottom: 28px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.07);
        transition: box-shadow .25s;
        min-height: 430px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .product-card1:hover {
        box-shadow: 0 8px 24px rgba(52,124,36,0.12);
    }
    .product-card1 img {
        height: 150px;
        max-width: 180px;
        object-fit: contain;
        margin-bottom: 16px;
        border-radius: 6px;
        background: #fcfcfc;
    }
    .productname1 {
        font-family: 'Arial', 'Roboto', sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: #262a3b;         /* Navy shade */
        margin-bottom: 8px;
        letter-spacing: 0.2px;
        text-align: center;
    }
    .productinfo1 {
        font-size: 15px;
        color: #555;
        margin-bottom: 9px;
        text-align: center;
        min-height: 34px;
    }
    .product-card1 .price1 {
        font-size: 22px;
        color: #ca2422;
        font-weight: bold;
        margin-bottom: 11px;
    }
    .product-card1 .prod-weight1, .product-card1 .prod-weight1 * {
        font-size: 16px !important;
        color: #1050d1 !important;
        font-weight: 500;
        margin-bottom: 7px;
    }
    form {
        margin-top: 10px;
        margin-bottom: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 15px;
    }
    .btn1 {
        font-size: 15px !important;
        border-radius: 7px;
        padding: 7px 21px;
        font-weight: 500;
        transition: background .18s, box-shadow .16s;
        box-shadow: 0 1px 3px rgba(30,40,30,0.06);
    }
    .btn1-success {
        background-color: #34c759;
        color: #fff;
        border: none;
    }
    .btn1-success:hover {
        background-color: #228B22;
        box-shadow: 0 2px 10px rgba(64,184,34,0.12);
    }
    .btn1-primary {
        background-color: #4285f4;
        color: #fff;
        border: none;
    }
    .btn1-primary:hover {
        background-color: #1755b7;
        box-shadow: 0 2px 10px rgba(66,133,244,0.17);
    }
    .btn1-danger {
        background-color: #ee4444;
        color: #fff;
        border: none;
    }
    .btn1-danger:hover {
        background-color: #c72323;
        box-shadow: 0 2px 10px rgba(238,68,68,0.15);
    }
    .product-flex-wrap {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .product-card1 {
      width: calc(33.333% - 20px);
      margin-bottom: 30px;
    }
    @media (max-width: 600px) {
        .product-card1 {
            width: 100%; /* stack on small screens */
          }
        .product-flex-wrap {
            gap: 18px 0;
        }
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

    ProductServiceImpl prodDao = new ProductServiceImpl();
    List<ProductBean> products = new ArrayList<ProductBean>();

    String search = request.getParameter("search");
    String type = request.getParameter("type");
    String message = "All Products";
    if (search != null) {
       products = prodDao.searchAllProducts(search);
       message = "Showing Results for '" + search + "'";
    } else if (type != null) {
       products = prodDao.getAllProductsByType(type);
       message = "Showing Results for '" + type + "'";
    } else {
       products = prodDao.getAllProducts();
    }
    if (products.isEmpty()) {
       message = "No items found for the search '" + (search != null ? search : type) + "'";
       products = prodDao.getAllProducts();
    }
    %>

    <jsp:include page="header.jsp" />

    <div class="container">
      <div class="msg-bar text-center"><%=message %></div>
      <div class="product-flex-wrap">
        <%
          for (ProductBean product : products) {
             int cartQty = new CartServiceImpl().getCartItemCount(userName, product.getProdId());
        %>
        <div class="product-card1">
          <a href="productDetails.jsp?pid=<%=product.getProdId()%>">
            <img src="./ShowImage?pid=<%=product.getProdId()%>" alt="Product">
          </a>
          <div class="productname1"><%=product.getProdName()%></div>
          <%
            String description = product.getProdInfo();
            description = description.substring(0, Math.min(description.length(), 100));
          %>
          <div class="productinfo1"><%=description%>..</div>
          <div class="prod-weight1"><%=product.getProdWeight()%> grams</div>
          <div class="price1">$ <%=product.getProdPrice()%></div>
          <form method="post">
            <%
               if (cartQty == 0) {
            %>
            <button type="submit"
                formaction="./AddtoCart?uid=<%=userName%>&pid=<%=product.getProdId()%>&pqty=1"
                class="btn1 btn1-success">Add to Cart</button>
            <button type="submit"
                formaction="./AddtoCart?uid=<%=userName%>&pid=<%=product.getProdId()%>&pqty=1"
                class="btn1 btn1-primary">Buy Now</button>
            <%
               } else {
            %>
            <button type="submit"
                formaction="./AddtoCart?uid=<%=userName%>&pid=<%=product.getProdId()%>&pqty=0"
                class="btn1 btn1-danger">Remove From Cart</button>
            <button type="submit" formaction="cartDetails.jsp"
                class="btn1 btn1-success">Go To Cart</button>
            <%
               }
            %>
          </form>
        </div>
        <%
          }
        %>
      </div>
    </div>


    <%@ include file="footer.html"%>

</body>
</html>
