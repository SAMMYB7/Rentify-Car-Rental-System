package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.BookingRequestDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;

import java.util.List;

public interface BookingService {
    BookingResponseDto createBooking(Long userId, BookingRequestDto dto);
    BookingResponseDto modifyBooking(Long bookingId, Long userId, BookingRequestDto dto);
    void cancelBooking(Long bookingId, Long userId);
    boolean isCarAvailable(Long carId, java.time.LocalDate start, java.time.LocalDate end);
    List<BookingResponseDto> getUserBookings(Long userId);
    List<BookingResponseDto> getAllBookings();
}
