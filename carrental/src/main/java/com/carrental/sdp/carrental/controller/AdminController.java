package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.AdminRegisterRequest;
import com.carrental.sdp.carrental.dto.AuthResponse;
import com.carrental.sdp.carrental.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<AuthResponse> createAdmin(@RequestBody AdminRegisterRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }
}
