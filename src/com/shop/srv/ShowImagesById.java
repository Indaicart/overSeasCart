package com.shop.srv;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.shop.service.impl.ProductImagesServiceImpl;

@WebServlet("/ShowImagesById")
public class ShowImagesById extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public ShowImagesById() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String imgId = request.getParameter("imgId");

        ProductImagesServiceImpl dao = new ProductImagesServiceImpl();

        byte[] image = null;

        try {
            if (imgId != null) {
                image = dao.getImageById(Integer.parseInt(imgId));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (image == null) {
            // Fallback to noimage.jpg
            File fnew = new File(request.getServletContext().getRealPath("images/noimage.jpg"));
            BufferedImage originalImage = ImageIO.read(fnew);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(originalImage, "jpg", baos);
            image = baos.toByteArray();
        }

        response.setContentType("image/jpeg"); // Always sending jpg
        ServletOutputStream sos = response.getOutputStream();
        sos.write(image);
        sos.close();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
