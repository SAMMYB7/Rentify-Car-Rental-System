package com.carrental.sdp.carrental.controller;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Book a car
    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto dto,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        BookingResponseDto response = bookingService.createBooking(userId, dto);
        return ResponseEntity.ok(response);
    }

    // Modify a booking
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDto> modifyBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequestDto dto,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        BookingResponseDto response = bookingService.modifyBooking(id, userId, dto);
        return ResponseEntity.ok(response);
    }

    // Cancel a booking
    @DeleteMapping("/{id}")
    
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        bookingService.cancelBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    // Get all bookings for the logged-in user
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDto>> getUserBookings(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // Get all bookings (ADMIN only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
