package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.*;
import com.carrental.sdp.carrental.exception.ApiException;
import com.carrental.sdp.carrental.model.*;
import com.carrental.sdp.carrental.repository.UserRepository;
import com.carrental.sdp.carrental.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String INVALID_LOGIN = "Incorrect email or password.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER) 
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isEmpty()) {
            throw ApiException.badRequest("Please enter your email and password.");
        }
        // Same message for "no such email" and "wrong password", so the login form can't be used
        // to find out which emails are registered.
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> ApiException.unauthorized(INVALID_LOGIN));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw ApiException.unauthorized(INVALID_LOGIN);
        }

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .build();
    }

    @Override
    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .build();
    }
}
