package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me - Get current user profile
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    // GET /api/users/bookings - Get rental history for current user
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDto>> getUserBookings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserBookings(user));
    }

    // GET /api/users/summary - Get current user profile with bookings
    @GetMapping("/summary")
    public ResponseEntity<UserSummaryWithBookingsDto> getUserSummaryWithBookings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserSummaryWithBookings(user));
    }

    // GET /api/users - Admin: view all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
