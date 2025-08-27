
package com.shop.srv;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.utility.DBConstantsUtil;


@WebServlet("/UpdateUSDValueSrv")
public class UpdateUSDValueSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		response.setContentType("text/html");
		String usdStr = request.getParameter("usd");
		
		if (usdStr == null || usdStr.trim().isEmpty()) {
            response.sendRedirect("updateUSDValue.jsp?message=Please enter a valid exchange rate");
            return;
        }
		try {
            double updatedUSDValue = Double.parseDouble(usdStr.trim());
            if (updatedUSDValue <= 0) {
                response.sendRedirect("updateUSDValue.jsp?message=Exchange rate must be greater than 0");
                return;
            }

            // Get the current stored value (assuming this util method accepts a key)
            String currentUSDValue = DBConstantsUtil.getValueFromDB("USD_INR");

            // Update price in DB (better if updateProductPrice accepts double)
            DBConstantsUtil.updateProductPrice(usdStr, currentUSDValue);

            response.sendRedirect("updateUSDValue.jsp?message=USD value updated successfully!!");

        } catch (NumberFormatException e) {
            response.sendRedirect("updateUSDValue.jsp?message=Invalid number format for exchange rate");
        }

	}
	

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}
}
