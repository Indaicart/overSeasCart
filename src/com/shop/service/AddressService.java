package com.shop.service;

import com.shop.beans.AddressBean;

public interface AddressService {

    public String saveAddress(AddressBean address);

    public AddressBean getAddressByEmail(String email);
}
