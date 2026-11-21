package com.carrental.sdp.carrental.controller;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.ProfileUpdateResponse;
import com.carrental.sdp.carrental.dto.RoleUpdateRequest;
import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.dto.UserUpdateRequest;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me - current user profile
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    // PUT /api/users/me - update own name/email (returns a new token if the email changed)
    @PutMapping("/me")
    public ResponseEntity<ProfileUpdateResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    // GET /api/users/bookings - rental history for current user
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDto>> getUserBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserBookings(user));
    }

    // GET /api/users/summary - current user profile with bookings
    @GetMapping("/summary")
    public ResponseEntity<UserSummaryWithBookingsDto> getUserSummaryWithBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserSummaryWithBookings(user));
    }

    // GET /api/users - Admin: view all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // PUT /api/users/{id} - Admin: edit a user's name/email
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // PATCH /api/users/{id}/role - Admin: change a user's role
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(userService.updateRole(id, request.getRole(), admin));
    }

    // DELETE /api/users/{id} - Admin: delete a user (only if they have no bookings)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id, @AuthenticationPrincipal User admin) {
        userService.deleteUser(id, admin);
        return ResponseEntity.noContent().build();
    }
}
