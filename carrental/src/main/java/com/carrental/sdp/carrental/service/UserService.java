package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.model.User;

import java.util.List;

public interface UserService {
    UserResponseDto getCurrentUser(User user);
    List<BookingResponseDto> getUserBookings(User user);
    List<UserResponseDto> getAllUsers();
    UserSummaryWithBookingsDto getUserSummaryWithBookings(User user);
}
