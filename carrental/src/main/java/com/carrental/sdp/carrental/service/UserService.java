package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.ProfileUpdateResponse;
import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.dto.UserUpdateRequest;
import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;

import java.util.List;

public interface UserService {
    UserResponseDto getCurrentUser(User user);
    List<BookingResponseDto> getUserBookings(User user);
    List<UserResponseDto> getAllUsers();
    UserSummaryWithBookingsDto getUserSummaryWithBookings(User user);

    /** Current user edits their own name/email. */
    ProfileUpdateResponse updateProfile(User currentUser, UserUpdateRequest request);

    /** Admin edits another user's name/email. */
    UserResponseDto updateUser(Long userId, UserUpdateRequest request);

    /** Admin changes another user's role. */
    UserResponseDto updateRole(Long userId, Role role, User admin);

    /** Admin deletes a user without bookings. */
    void deleteUser(Long userId, User admin);
}
