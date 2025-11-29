package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.AuthResponse;
import com.carrental.sdp.carrental.dto.ForgotPasswordRequestDTO;
import com.carrental.sdp.carrental.dto.LoginRequest;
import com.carrental.sdp.carrental.dto.RegisterRequest;
import com.carrental.sdp.carrental.dto.ResetPasswordRequestDTO;
import com.carrental.sdp.carrental.service.AuthService;
import com.carrental.sdp.carrental.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO dto) {
        forgotPasswordService.processForgotPassword(dto.getEmail());
        return ResponseEntity.ok("Password reset link sent to your email if it exists in our system.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        forgotPasswordService.resetPassword(dto.getToken(), dto.getNewPassword());
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
