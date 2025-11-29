package com.carrental.sdp.carrental.service;

import com.carrental.sdp.carrental.dto.UserResponseDto;
import com.carrental.sdp.carrental.dto.BookingResponseDto;
import com.carrental.sdp.carrental.dto.UserSummaryWithBookingsDto;
import com.carrental.sdp.carrental.model.User;
import com.carrental.sdp.carrental.model.Booking;
import com.carrental.sdp.carrental.repository.UserRepository;
import com.carrental.sdp.carrental.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    public UserResponseDto getCurrentUser(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    @Override
    public List<BookingResponseDto> getUserBookings(User user) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
        return bookings.stream().map(b -> {
            BookingResponseDto dto = new BookingResponseDto();
            dto.setId(b.getId());
            dto.setUserId(b.getUser().getId());
            dto.setCarId(b.getCar().getId());
            dto.setCarModel(b.getCar().getModel());
            dto.setStartDate(b.getStartDate());
            dto.setEndDate(b.getEndDate());
            dto.setStatus(b.getStatus());
            dto.setCreatedAt(b.getCreatedAt());
            dto.setUpdatedAt(b.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserResponseDto dto = new UserResponseDto();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setRole(user.getRole());
                    dto.setCreatedAt(user.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public UserSummaryWithBookingsDto getUserSummaryWithBookings(User user) {
        UserSummaryWithBookingsDto dto = new UserSummaryWithBookingsDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setBookings(getUserBookings(user));
        return dto;
    }
}
