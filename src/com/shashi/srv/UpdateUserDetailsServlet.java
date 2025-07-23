package com.shashi.srv;

import com.shashi.beans.UserBean;
import com.shashi.service.impl.UserServiceImpl;

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
        String address = request.getParameter("address");
        int pincode = Integer.parseInt(request.getParameter("pincode"));

        UserServiceImpl userService = new UserServiceImpl();
        boolean updated = userService.updateUserDetails(name, pincode, email, mobile, address);
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
        request.getRequestDispatcher("checkout.jsp").forward(request, response);
    }
}
