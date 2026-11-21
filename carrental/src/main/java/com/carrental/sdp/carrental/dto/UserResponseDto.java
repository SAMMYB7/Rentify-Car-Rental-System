package com.carrental.sdp.carrental.dto;

import java.util.UUID;

import com.carrental.sdp.carrental.model.Role;
import com.carrental.sdp.carrental.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    private UUID id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;

    public static UserResponseDto from(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
