package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(UUID userId, BookingRequestDto dto);
    BookingResponseDto modifyBooking(UUID bookingId, UUID userId, BookingRequestDto dto);
    void cancelBooking(UUID bookingId, UUID userId);
    boolean isCarAvailable(UUID carId, java.time.LocalDate start, java.time.LocalDate end);
    List<BookingResponseDto> getUserBookings(UUID userId);
    List<BookingResponseDto> getAllBookings();
}
