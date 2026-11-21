package com.carrental.sdp.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Response for PUT /api/users/me. The login token identifies the user by email, so when the
 * email changes a fresh token is returned (otherwise null) and the frontend must store it.
 */
@Getter
@AllArgsConstructor
public class ProfileUpdateResponse {
    private UserResponseDto user;
    private String token;
}
