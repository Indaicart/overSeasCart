package com.shop.srv;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import com.shop.service.impl.ProductServiceImpl;
import com.shop.utility.DBConstantsUtil;

/**
 * Servlet implementation class AddProductSrv
 */
@WebServlet("/AddProductSrv")
@MultipartConfig(maxFileSize = 16177215)
public class AddProductSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		HttpSession session = request.getSession();
		String userType = (String) session.getAttribute("usertype");
		String userName = (String) session.getAttribute("username");
		String password = (String) session.getAttribute("password");

		if (userType == null || !userType.equals("admin")) {

			response.sendRedirect("login.jsp?message=Access Denied!");

		}

		else if (userName == null || password == null) {

			response.sendRedirect("login.jsp?message=Session Expired, Login Again to Continue!");
		}

		String status = "Product Registration Failed!";
		String prodName = request.getParameter("name");
		String prodType = request.getParameter("type");
		String prodInfo = request.getParameter("info");
		int prodWeight = Integer.parseInt(request.getParameter("weight"));
		double prodPrice = Double.parseDouble(request.getParameter("price"));
		prodPrice = prodPrice / (Double.parseDouble(DBConstantsUtil.getValueFromDB("USD_INR")));
		int prodQuantity = Integer.parseInt(request.getParameter("quantity"));
		

		// round to 2 decimal places
		prodPrice = Math.round(prodPrice * 100.0) / 100.0;

		Collection<Part> parts = request.getParts();
		List<byte[]> imageBytesList = new ArrayList<>();
		byte[] firstImageBytes = null;

		for (Part part : parts) {
			if (part.getName().equals("images") && part.getSize() > 0) {
				byte[] imgBytes = toByteArray(part.getInputStream());

				if (firstImageBytes == null) {
					firstImageBytes = imgBytes; // product table
				}
				imageBytesList.add(imgBytes);   // product_images table
			}
		}

// then later
		InputStream firstImage = new ByteArrayInputStream(Objects.requireNonNull(firstImageBytes));
		List<InputStream> allImages = new ArrayList<>();
		for (byte[] imgBytes : imageBytesList) {
			allImages.add(new ByteArrayInputStream(imgBytes));
		}

		ProductServiceImpl product = new ProductServiceImpl();

		status = product.addProduct(prodName, prodType, prodInfo, prodWeight, prodPrice, prodQuantity, firstImage, allImages);

		RequestDispatcher rd = request.getRequestDispatcher("addProduct.jsp?message=" + status);
		rd.forward(request, response);

	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}

	private byte[] toByteArray(InputStream input) throws IOException {
		ByteArrayOutputStream buffer = new ByteArrayOutputStream();
		byte[] data = new byte[8192];
		int nRead;
		while ((nRead = input.read(data, 0, data.length)) != -1) {
			buffer.write(data, 0, nRead);
		}
		return buffer.toByteArray();
	}


}
