package com.shop.service;

import java.util.List;

public interface ProductImagesService {
    public List<Integer> getAllImagesByPid(String pid);

    public byte[] getImageById(int imgId);
}
