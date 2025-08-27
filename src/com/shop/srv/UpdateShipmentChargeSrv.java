
package com.shop.srv;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.utility.DBConstantsUtil;


@WebServlet("/UpdateShipmentChargeSrv")
public class UpdateShipmentChargeSrv extends HttpServlet {
	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		response.setContentType("text/html");
		String shipChargeStr = request.getParameter("shipCharge");
		
		if (shipChargeStr == null || shipChargeStr.trim().isEmpty()) {
            response.sendRedirect("updateShipmentCharge.jsp?message=Please enter a valid Value");
            return;
        }
		double shipCharge;
		try {
            shipCharge = Double.parseDouble(shipChargeStr.trim());
            if (shipCharge <= 0) {
                response.sendRedirect("updateShipmentCharge.jsp?message=Shipment Charge must be greater than 0");
                return;
            }

            // Update Shipment Charge in DB
            shipCharge = shipCharge / Double.parseDouble(DBConstantsUtil.getValueFromDB("USD_INR"));
            shipCharge = Math.round(shipCharge * 100.0) / 100.0;
            DBConstantsUtil.addOrUpdateConstant("ship_charge", String.valueOf(shipCharge));

            response.sendRedirect("updateShipmentCharge.jsp?message=Shipment Charge updated successfully!!");

        } catch (NumberFormatException e) {
            response.sendRedirect("updateShipmentCharge.jsp?message=Invalid number format");
        }

	}
	

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}
}
