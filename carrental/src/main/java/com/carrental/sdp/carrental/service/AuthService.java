package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.RegisterRequest;
import com.carrental.sdp.carrental.dto.LoginRequest;
import com.carrental.sdp.carrental.dto.AuthResponse;
import com.carrental.sdp.carrental.dto.AdminRegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse registerAdmin(AdminRegisterRequest request);
}
