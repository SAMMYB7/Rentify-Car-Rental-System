package com.carrental.sdp.carrental.dto;

import com.carrental.sdp.carrental.model.Role;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserSummaryWithBookingsDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private List<BookingResponseDto> bookings;
}
