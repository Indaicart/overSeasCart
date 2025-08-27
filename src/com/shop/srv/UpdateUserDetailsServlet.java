package com.shop.srv;

import com.shop.beans.AddressBean;
import com.shop.beans.UserBean;
import com.shop.service.impl.AddressServiceImpl;
import com.shop.service.impl.UserServiceImpl;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

@WebServlet("/UpdateUserDetailsServlet")
public class UpdateUserDetailsServlet extends HttpServlet {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String name = request.getParameter("name");
        String email = request.getParameter("email");
        Long mobile = Long.parseLong(request.getParameter("mobile"));

        String flat = request.getParameter("flat");
        String street = request.getParameter("street");
        String landmark = request.getParameter("landmark");
        String city = request.getParameter("city");
        String state = request.getParameter("state");
        int pincode = Integer.parseInt(request.getParameter("pincode"));

        UserServiceImpl userService = new UserServiceImpl();
        boolean updated = userService.updateUserDetails(name, email, mobile);

        AddressBean address = new AddressBean();
        address.setUserEmail(email);   // assuming Address table linked with user email
        address.setFlat(flat);
        address.setStreet(street);
        address.setLandmark(landmark);
        address.setCity(city);
        address.setState(state);
        address.setPincode(pincode);

        AddressServiceImpl addressDAO = new AddressServiceImpl();
        boolean addressUpdated = addressDAO.updateAddress(address);

        System.out.println("updated address : " + addressUpdated);
        System.out.println("updated : " + updated);
        if (updated) {
            UserBean user = userService.getUserDetails(email); 
            System.out.println("user : " + user.toString());

            if (user != null) {
                request.setAttribute("user", user);
            }
        }
        String amount = request.getParameter("amount");
        request.setAttribute("amount", amount);

        // Redirect back to checkout page
        boolean isProfile = Boolean.parseBoolean(request.getParameter("isProfile"));
        if(isProfile){
            request.getRequestDispatcher("userProfile.jsp").forward(request, response);
        }else {
            request.getRequestDispatcher("checkout.jsp").forward(request, response);
        }
    }
}
