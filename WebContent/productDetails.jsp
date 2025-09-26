<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ page import="com.shop.service.impl.*, com.shop.beans.*,java.util.*" %>
<!DOCTYPE html>
<html>
<head>
<title>Product Details</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" href="images/logo.png">
<link rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
<style>
    body {
        background-color: #f5f7fa !important;
        font-family: 'Segoe UI', Arial, sans-serif;
    }
    .container {
        margin-top: 36px;
        margin-bottom: 36px;
        background: #fff;
        padding: 24px 30px 24px 30px;
        border-radius: 14px;
        box-shadow: 0 4px 28px rgba(60,105,80,0.10);
    }
    h2.product-title {
        font-size: 2.8rem;
        font-weight: 700;
        color: #184D1A; /* Dark green, crisp */
        margin-bottom: 16px;
        letter-spacing: 0.2px;
    }
    .product-info-list {
        font-size: 1.5rem;
        color: #444;
        margin-bottom: 20px;
    }
    .product-info-list b {
        color: #228b22;
    }
    .product-price {
        font-size: 2.2rem;
        color: #0b0a12;
        font-weight: 700;
        margin-bottom: 23px;
    }
    .btn-success {
        background-color: #34c759;
        color: #fff;
        font-weight: 500;
        border-radius: 7px;
        padding: 9px 28px;
        border: none;
        margin-right: 10px;
        transition: background 0.16s;
        box-shadow: 0 1px 3px rgba(64,184,34,0.10);
    }
    .btn-success:hover {
        background-color: #184D1A;
    }
    .btn-primary {
        background-color: #0066cc;
        color: #fff;
        font-weight: 500;
        border-radius: 7px;
        padding: 9px 28px;
        border: none;
        transition: background 0.16s;
        box-shadow: 0 1px 3px rgba(52,114,244,0.10);
    }
    .btn-primary:hover {
        background-color: #004488;
    }
    /* Carousel styling */
    #productCarousel {
        background: #f0f5ee;
        border-radius: 10px;
        box-shadow: 0 2px 14px rgba(28,76,50,0.09);
        margin-bottom: 0;
    }
    #productCarousel .carousel-inner {
        min-height: 400px;
        align-items: center;
        text-align: center;
        justify-content: center;
    }
    #productCarousel img {
        max-height: 370px;
        object-fit: contain;
        margin: 0 auto;
        border-radius: 7px;
        background: #fafafc;
    }
    .carousel-control.left,
    .carousel-control.right {
        background: none;
        color: #228b22;
        font-size: 28px;
        width: 34px;
    }
    @media (max-width: 850px) {
        .container {
            padding: 11px 7px;
        }
        .col-md-6 {
            width: 100%;
            float: none;
            margin-bottom: 26px;
        }
        h2.product-title { font-size: 1.22rem; }
    }
</style>
</head>
<body>
<%
    request.setAttribute("hideSearchBar", false);
%>
<jsp:include page="header.jsp" />

<%
    String pid = request.getParameter("pid");
    ProductServiceImpl prodDao = new ProductServiceImpl();
    ProductBean product = prodDao.getProductDetails(pid);

    ProductImagesServiceImpl imgDao = new ProductImagesServiceImpl();
    List<Integer> images = imgDao.getAllImagesByPid(pid);
%>

<div class="container">
    <div class="row">
        <!-- Left: Images -->
        <div class="col-md-6">
            <!-- Bootstrap Carousel for multiple images -->
            <div id="productCarousel" class="carousel slide" data-ride="carousel">
                <div class="carousel-inner">
                    <%
                    int index = 0;
                    for(Integer imgId : images){
                    %>
                    <div class="item <%= (index==0 ? "active" : "") %>">
                        <img src="./ShowImagesById?imgId=<%=imgId%>"
                             class="d-block w-100"
                             style="width:auto;max-width:98%;max-height:370px;">
                    </div>
                    <%
                        index++;
                    }
                    %>
                </div>
                <a class="left carousel-control" href="#productCarousel" data-slide="prev">
                    <span class="glyphicon glyphicon-chevron-left"></span>
                </a>
                <a class="right carousel-control" href="#productCarousel" data-slide="next">
                    <span class="glyphicon glyphicon-chevron-right"></span>
                </a>
            </div>
        </div>
        <!-- Right: Product Info -->
        <div class="col-md-6">
            <h2 class="product-title"><%=product.getProdName()%></h2>
            <div class="product-info-list">
                <b>Description:</b> <%=product.getProdInfo()%><br>
                <b>Weight:</b> <%=product.getProdWeight()%> grams
            </div>
            <div class="product-price">
                $ <%=product.getProdPrice()%>
            </div>
            <form method="post">
                <button type="submit"
                    formaction="./AddtoCart?uid=<%=session.getAttribute("username")%>&pid=<%=product.getProdId()%>&pqty=1"
                    class="btn btn-success">Add to Cart</button>
                <button type="submit"
                    formaction="./AddtoCart?uid=<%=session.getAttribute("username")%>&pid=<%=product.getProdId()%>&pqty=1"
                    class="btn btn-primary">Buy Now</button>
            </form>
        </div>
    </div>
</div>


</body>
</html>
