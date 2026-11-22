package com.carrental.sdp.carrental.service;

import java.util.UUID;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.CancellationResultDto;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(UUID userId, BookingRequestDto dto);

    /** Change the dates of an unpaid booking (paid bookings must be cancelled and rebooked). */
    BookingResponseDto modifyBooking(UUID bookingId, UUID userId, BookingRequestDto dto);

    /** Cancel a booking; paid bookings are refunded through Razorpay per {@link CancellationPolicy}. */
    CancellationResultDto cancelBooking(UUID bookingId, UUID userId);

    boolean isCarAvailable(UUID carId, java.time.LocalDate start, java.time.LocalDate end);
    List<BookingResponseDto> getUserBookings(UUID userId);
    List<BookingResponseDto> getAllBookings();
}
