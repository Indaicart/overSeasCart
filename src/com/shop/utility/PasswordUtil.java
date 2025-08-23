package com.shop.utility;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {
    // Hash password
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(12));
    }

    // Verify password
    public static boolean checkPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
