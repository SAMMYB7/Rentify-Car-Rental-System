package com.carrental.sdp.carrental.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123"; 
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("BCrypt hash for 'admin123': " + encodedPassword);
    }
}